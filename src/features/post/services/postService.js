import api from '@/services/api'

/**
 * Post Service – API layer xử lý bài viết.
 * Gọi các endpoint: /posts/*
 */
const postService = {
  // Lấy danh sách bài viết (Newsfeed) – có phân trang
  getFeed: (page = 1, limit = 10) =>
    api.get('/posts/feed', { params: { page, limit } }),

  // Lấy bài viết theo ID
  getById: (postId) => api.get(`/posts/${postId}`),

  // Lấy bài viết của 1 user cụ thể
  getByUser: (userId, page = 1) =>
    api.get(`/posts/user/${userId}`, { params: { page } }),

  // Tạo bài viết mới (có ảnh → dùng FormData)
  create: (formData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Cập nhật bài viết
  update: (postId, data) => api.put(`/posts/${postId}`, data),

  // Xóa bài viết
  delete: (postId) => api.delete(`/posts/${postId}`),

  // Like / Unlike bài viết (Toggle)
  toggleLike: (postId) => api.put(`/posts/${postId}/like`),

  // Lấy danh sách comment của bài viết
  getComments: (postId) => api.get(`/posts/${postId}/comments`),

  // Thêm comment
  addComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),

  // Xóa comment
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}`),

  // ──── AI Feature ────
  // Gửi ảnh để AI sinh caption & hashtag
  generateCaption: (formData) =>
    api.post('/ai/generate-caption', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Lưu / Bỏ lưu bài viết (Bookmark)
  toggleSave: (postId) => api.put(`/posts/${postId}/save`),

  // Lấy danh sách bài viết đã lưu
  getSaved: () => api.get('/posts/saved'),
}

export default postService
