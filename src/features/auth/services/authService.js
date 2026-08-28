import api from '@/services/api'

const unwrapResponse = (response) => response?.data || response

/**
 * Auth Service – API layer xử lý xác thực.
 * Gọi các endpoint: /auth/register, /auth/login, /auth/verify-email, /auth/suggest-username, /auth/set-username, /profile/me
 */
const authService = {
  // Đăng ký tài khoản mới (Bước 1)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return unwrapResponse(response)
  },

  // Kiểm tra trạng thái xác thực của user
  checkStatus: async (userId) => {
    const response = await api.get(`/auth/check-status/${userId}`)
    return unwrapResponse(response)
  },

  // Đăng nhập, trả về { token, user }
  login: async (credentials) => {
    const payload = {
      email: credentials?.email?.trim(),
      password: credentials?.password,
    }

    const response = await api.post('/auth/login', payload)
    return unwrapResponse(response)
  },

  // Xác thực email (hỗ trợ cả query param và path param)
  verifyEmail: async (token) => {
    try {
      return await api.get('/auth/verify-email', {
        params: { token },
      })
    } catch (error) {
      // Một số backend dùng route /auth/verify-email/:token thay vì query ?token=
      if (error?.status === 404) {
        return api.get(`/auth/verify-email/${encodeURIComponent(token)}`)
      }

      throw error
    }
  },

  // Gợi ý username dựa vào firstName và lastName (Bước 3)
  suggestUsername: async (data) => {
    const response = await api.post('/auth/suggest-username', data)
    return unwrapResponse(response)
  },

  // Set username sau khi xác thực email (Bước 3)
  setUsername: async (data) => {
    const response = await api.post('/auth/set-username', data)
    return unwrapResponse(response)
  },

  // Lấy thông tin profile hiện tại (dùng token trong header)
  getMe: async () => {
    const response = await api.get('/profile/me')
    return unwrapResponse(response)
  },

  // Cập nhật thông tin cá nhân
  updateProfile: (data) => api.put('/profile/me', data),

  // Quên mật khẩu - gửi link reset về email
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email: email?.trim() })
    return unwrapResponse(response)
  },

  // Đặt lại mật khẩu mới với token
  resetPassword: async ({ token, email, newPassword, confirmPassword }) => {
    const response = await api.post('/auth/reset-password', {
      token,
      email: email?.trim(),
      newPassword,
      confirmPassword,
    })
    return unwrapResponse(response)
  },

  // Đổi mật khẩu
  changePassword: (data) => api.put('/auth/change-password', data),

  // Upload avatar
  uploadAvatar: (formData) =>
    api.patch('/profile/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // User gửi yêu cầu mở khóa tài khoản khi bị khóa vĩnh viễn
  createUnbanRequest: async (payload) => {
    const body = {
      email: payload?.email?.trim(),
      reason: payload?.reason?.trim(),
    }

    const response = await api.post('/auth/unban-requests', body)
    return unwrapResponse(response)
  },

  // User xem lịch sử yêu cầu mở khóa theo email
  getUnbanRequestHistory: async ({ email, page = 1, limit = 10 } = {}) => {
    const response = await api.get('/auth/unban-requests/history', {
      params: {
        email: email?.trim(),
        page,
        limit,
      },
    })

    return unwrapResponse(response)
  },

  // Đăng nhập Google, nhận idToken
  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google-login', { idToken })
    return unwrapResponse(response)
  },

  // Kiểm tra role của user hiện tại
  checkRole: async () => {
    const response = await api.get('/auth/role-check')
    return unwrapResponse(response)
  },
}

export default authService
