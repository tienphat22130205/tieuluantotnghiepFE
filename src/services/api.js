import axios from 'axios'
import { getAuthToken, removeAuthToken, removeStoredAuthUser } from '@/utils/authStorage'
import { getCookie } from '@/utils/cookieUtils'

let isHandlingForcedLogout = false
const FORCED_LOGOUT_NOTICE_KEY = 'auth_forced_logout_notice'

const normalizeBaseUrl = (url) => {
  if (!url) return '/api'
  return `${url.replace(/\/$/, '')}/api`
}

/**
 * Axios instance cấu hình sẵn baseURL & interceptors.
 * Tất cả service đều import instance này để gọi API.
 */
const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

const formatBanUntil = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const buildForcedLogoutMessage = (responseData) => {
  const data = responseData?.error && typeof responseData.error === 'object'
    ? responseData.error
    : responseData || {}

  const code = String(data?.code || responseData?.code || '').toUpperCase()
  const reason = data?.reason || responseData?.reason || ''
  const banUntil = data?.banUntil || responseData?.banUntil || null
  const defaultMessage = data?.message || responseData?.message || 'Phiên đăng nhập không còn hợp lệ.'

  if (code === 'ACCOUNT_BANNED') {
    const lines = [
      `Tài khoản của bạn đã bị khóa${reason ? ` vì: ${reason}` : '.'}`,
    ]

    const formattedBanUntil = formatBanUntil(banUntil)
    if (formattedBanUntil) {
      lines.push(`Thời gian mở khóa dự kiến: ${formattedBanUntil}`)
    }

    lines.push('Bạn sẽ được đăng xuất để đảm bảo an toàn.')
    return lines.join('\n')
  }

  if (code === 'ACCOUNT_DISABLED') {
    return 'Tài khoản của bạn hiện đang bị vô hiệu hóa. Bạn sẽ được đăng xuất.'
  }

  return defaultMessage
}

const handleForcedLogout = (responseData) => {
  if (isHandlingForcedLogout) return
  isHandlingForcedLogout = true

  const message = buildForcedLogoutMessage(responseData)

  try {
    window.sessionStorage.setItem(
      FORCED_LOGOUT_NOTICE_KEY,
      JSON.stringify({
        message,
        createdAt: Date.now(),
      })
    )
  } catch {
    // Ignore session storage failures.
  }

  removeAuthToken()
  removeStoredAuthUser()
  window.location.href = '/login'
}

// ──── Request Interceptor ────
// Đọc tệp tin cookie của trình duyệt để lấy token (Firebase JWT) và userId (UID)
// Nếu tồn tại token, tự động thêm header Authorization: Bearer <token>
// Nếu tồn tại userId, tự động thêm header x-user-uid: <userId>
api.interceptors.request.use(
  (config) => {
    const token = getCookie('token') || getCookie('firebase_token') || getAuthToken()
    const userId = getCookie('userId') || getCookie('uid') || getCookie('x-user-uid')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (userId) {
      config.headers['x-user-uid'] = userId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ──── Response Interceptor ────
// Xử lý lỗi chung (401 → redirect login, 500 → log)
api.interceptors.response.use(
  (response) => response.data, // Trả thẳng data, bỏ wrapper axios
  (error) => {
    const status = error.response?.status
    const responseData = error.response?.data
    const requestUrl = String(error?.config?.url || '').toLowerCase()
    const isLoginRequest = requestUrl.includes('/auth/login')
    const forceLogout = Boolean(
      responseData?.forceLogout
      || responseData?.error?.forceLogout
    )

    if (forceLogout && !isLoginRequest) {
      handleForcedLogout(responseData)
    }

    if (status === 401) {
      removeAuthToken()
      removeStoredAuthUser()
      window.location.href = '/login'
    }

    const normalizedError = {
      status,
      code: responseData?.code || responseData?.error?.code || null,
      forceLogout,
      reason: responseData?.reason || responseData?.error?.reason || null,
      banUntil: responseData?.banUntil || responseData?.error?.banUntil || null,
      message:
        responseData?.message ||
        responseData?.error ||
        error.message ||
        'Đã xảy ra lỗi khi gọi API',
      details: responseData,
    }

    return Promise.reject(normalizedError)
  }
)

export default api
