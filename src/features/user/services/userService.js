import api from '@/services/api'

/**
 * User Service – API layer xử lý người dùng.
 * Gọi các endpoint: /users/*
 */
const userService = {
  // Tìm kiếm người dùng theo tên
  search: (query) => api.get('/users/search', { params: { q: query } }),

  // Lấy profile user theo ID
  getProfile: (userId) => api.get(`/users/${userId}`),

  // Follow / Unfollow (Toggle)
  toggleFollow: (userId) => api.put(`/users/${userId}/follow`),

  // Lấy danh sách Followers
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),

  // Lấy danh sách Following
  getFollowing: (userId) => api.get(`/users/${userId}/following`),

  // Gợi ý bạn bè
  getSuggestions: () => api.get('/users/suggestions'),
}

export default userService
