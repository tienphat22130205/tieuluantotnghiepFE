import api from '@/services/api'

const FEED_ENDPOINT = import.meta.env.VITE_POST_FEED_ENDPOINT || '/posts/feed'
const USER_POSTS_ENDPOINT_TEMPLATE = import.meta.env.VITE_POST_USER_ENDPOINT || '/posts/user/:userId'

const buildUserPostsEndpoint = (userId) =>
  USER_POSTS_ENDPOINT_TEMPLATE.replace(':userId', encodeURIComponent(String(userId)))

const resolvedEndpoints = {
  feed: null,
  byUser: null,
}

const unavailableEndpoints = {
  feed: false,
  byUser: false,
}

const tryGetWithCachedFallback = async (key, candidateFactory) => {
  if (unavailableEndpoints[key]) {
    return []
  }

  const cachedCandidate = resolvedEndpoints[key] || candidateFactory

  if (cachedCandidate) {
    try {
      return await cachedCandidate()
    } catch (error) {
      if (error?.status === 404) {
        unavailableEndpoints[key] = true
        resolvedEndpoints[key] = null
        return []
      }

      if (error?.status !== 404) {
        throw error
      }
      resolvedEndpoints[key] = null
    }
  }

  return []
}

/**
 * Post Service – API layer xử lý bài viết.
 * Gọi các endpoint: /posts/*
 */
const postService = {
  // Lấy danh sách bài viết (Newsfeed) – có phân trang
  getFeed: async (page = 1, limit = 10) =>
    tryGetWithCachedFallback('feed', () => api.get(FEED_ENDPOINT, { params: { page, limit } })),

  // Lấy bài viết theo ID
  getById: (postId) => api.get(`/posts/${postId}`),

  // Lấy bài viết của 1 user cụ thể
  getByUser: async (userId, page = 1) => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      return []
    }

    return tryGetWithCachedFallback(
      'byUser',
      () => api.get(buildUserPostsEndpoint(userId), { params: { page } })
    )
  },

  // Đăng status (không ảnh)
  createStatus: ({ content, hashtags = [], visibility = 'public' }) =>
    api.post('/posts/status', {
      content,
      hashtags,
      visibility,
    }),

  // Đăng bài có ảnh
  createImages: (formData) =>
    api.post('/posts/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Tạo bài viết theo loại payload
  create: (payload) => {
    if (payload instanceof FormData) {
      return postService.createImages(payload)
    }

    return postService.createStatus(payload)
  },

  // Cập nhật bài viết
  update: (postId, data) => api.patch(`/posts/${postId}`, data),

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
