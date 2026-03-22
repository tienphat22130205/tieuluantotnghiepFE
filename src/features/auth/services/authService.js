import api from '@/services/api'

const unwrapResponse = (response) => response?.data || response

/**
 * Auth Service – API layer xử lý xác thực.
 * Gọi các endpoint: /auth/register, /auth/login, /auth/me
 */
const authService = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
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

  // Xác thực email bằng token từ query string
  verifyEmail: (token) =>
    api.get('/auth/verify-email', {
      params: { token },
    }),

  // Lấy thông tin user hiện tại (dùng token trong header)
  getMe: () => api.get('/auth/me'),

  // Cập nhật thông tin cá nhân
  updateProfile: (data) => api.put('/auth/profile', data),

  // Đổi mật khẩu
  changePassword: (data) => api.put('/auth/change-password', data),

  // Upload avatar
  uploadAvatar: (formData) =>
    api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default authService
