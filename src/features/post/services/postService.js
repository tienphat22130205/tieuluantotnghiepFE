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

const unwrapDataPayload = (payload) => payload?.data || payload

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

  // Soft delete bài viết (backend sẽ xóa cứng theo lịch)
  softDelete: (postId) => api.delete(`/posts/${postId}`),

  // Chia sẻ lại bài viết
  sharePost: (postId, payload = {}) =>
    api.post(`/posts/${postId}/share`, {
      content: payload?.content || '',
      visibility: payload?.visibility || 'public',
      hashtags: Array.isArray(payload?.hashtags) ? payload.hashtags : [],
    }),

  // Like bài viết
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`)
    const data = unwrapDataPayload(response)
    return {
      postId: data?.postId || postId,
      likeCount: data?.likeCount,
      liked: data?.liked ?? true,
    }
  },

  // Bỏ like bài viết
  unlikePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}/like`)
    const data = unwrapDataPayload(response)
    return {
      postId: data?.postId || postId,
      likeCount: data?.likeCount,
      liked: data?.liked ?? false,
    }
  },

  // Toggle like theo trạng thái hiện tại
  toggleLike: (postId, isLiked) => (isLiked ? postService.unlikePost(postId) : postService.likePost(postId)),

  // Lấy danh sách comment của bài viết
  getComments: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`)
      const data = unwrapDataPayload(response)
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.comments)) return data.comments
      if (data?.data && Array.isArray(data.data)) return data.data
      if (data?.data?.comments && Array.isArray(data.data.comments)) return data.data.comments
      return []
    } catch (error) {
      if (error?.status === 404) {
        // Fallback: Nếu không có endpoint GET comments riêng, lấy post detail và trích xuất comments
        try {
          const postResponse = await api.get(`/posts/${postId}`)
          const postData = unwrapDataPayload(postResponse) || postResponse
          const fromPost = postData?.comments || postData?.post?.comments
          if (Array.isArray(fromPost)) return fromPost
          return []
        } catch (_innerErr) {
          // Backend may not expose both endpoints; keep silent and return empty comments.
        }
      }
      throw error
    }
  },

  // Thêm comment
  addComment: async (postId, content, replyTo = null) => {
    const response = await api.post(`/posts/${postId}/comments`, { content, replyTo })
    const data = unwrapDataPayload(response)
    return {
      postId: data?.postId || postId,
      comment: data?.comment || null,
      commentCount: data?.commentCount,
    }
  },

  // Xóa comment
  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`)
    const data = unwrapDataPayload(response)
    return {
      postId: data?.postId || postId,
      commentId,
      commentCount: data?.commentCount,
    }
  },

  // ──── AI Feature ────
  // Gửi ảnh để AI sinh caption & hashtag
  generateContentUpload: async (formData) => {
    const aiTimeout = Number(import.meta.env.VITE_AI_TIMEOUT_MS || 90000)
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: aiTimeout,
    }

    try {
      return await api.post('/ai/generate-content-upload', formData, config)
    } catch (error) {
      if (error?.status === 404) {
        return api.post('/generate-content-upload', formData, config)
      }
      throw error
    }
  },

  // Alias giữ tương thích ngược với code cũ
  generateCaption: (formData) => postService.generateContentUpload(formData),

  // Lưu / Bỏ lưu bài viết (Bookmark)
  toggleSave: (postId) => api.put(`/posts/${postId}/save`),

  // Lấy danh sách bài viết đã lưu
  getSaved: () => api.get('/posts/saved'),
}

export default postService
