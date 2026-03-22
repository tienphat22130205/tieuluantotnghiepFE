import axios from 'axios'

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

// ──── Request Interceptor ────
// Tự động gắn token vào header mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    const responseData = error.response?.data
    const normalizedError = {
      status,
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
