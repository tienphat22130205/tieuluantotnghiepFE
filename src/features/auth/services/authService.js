import api from '@/services/api'

/**
 * Auth Service – API layer xử lý xác thực.
 * Gọi các endpoint: /auth/register, /auth/login, /auth/me
 */
const authService = {
  // Đăng ký tài khoản mới
  register: (userData) => api.post('/auth/register', userData),

  // Đăng nhập, trả về { token, user }
  login: (credentials) => api.post('/auth/login', credentials),

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
