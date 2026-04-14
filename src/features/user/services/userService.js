import api from '@/services/api'
import { PROFILE_MESSAGES } from '@/constants/messages'

const PROFILE_ENDPOINT_TEMPLATES = [
  '/profile/:userId',
  '/profile/user/:userId',
]

let resolvedProfileEndpointTemplate = null
const unavailableProfileTemplates = new Set()

const toProfileEndpoint = (template, userId) =>
  template.replace(':userId', encodeURIComponent(String(userId)))

/**
 * User Service – API layer xử lý người dùng.
 * Gọi các endpoint: /users/*, /profile/me
 */
const userService = {
  // Tìm kiếm người dùng theo tên
  searchUsers: ({ q, page = 1, limit = 10 }) =>
    api.get('/users/search', {
      params: {
        q,
        page,
        limit,
      },
    }),

  // Alias cũ để tương thích code đang dùng
  search: (query) => api.get('/users/search', { params: { q: query } }),

  // Lấy profile của user đang đăng nhập
  getMyProfile: () => api.get('/profile/me'),

  // Cập nhật profile của user đang đăng nhập
  updateMyProfile: (data) => api.put('/profile/me', data),

  // Upload avatar của user đang đăng nhập
  uploadMyAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)

    return api.patch('/profile/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Lấy profile user theo ID
  // Ho tro fallback endpoint de tuong thich nhieu backend route khac nhau.
  getProfile: async (userId) => {
    const normalizedUserId = userId ? String(userId) : ''
    if (!normalizedUserId) {
      throw new Error(PROFILE_MESSAGES.missingUserIdForProfile)
    }

    const orderedTemplates = [
      ...(resolvedProfileEndpointTemplate ? [resolvedProfileEndpointTemplate] : []),
      ...PROFILE_ENDPOINT_TEMPLATES.filter((template) => template !== resolvedProfileEndpointTemplate),
    ]

    let lastError = null

    for (const template of orderedTemplates) {
      if (unavailableProfileTemplates.has(template)) continue

      const endpoint = toProfileEndpoint(template, normalizedUserId)

      try {
        const response = await api.get(endpoint)
        resolvedProfileEndpointTemplate = template
        return response
      } catch (error) {
        lastError = error

        const shouldTryNext = [400, 404, 405].includes(error?.status)
        if (!shouldTryNext) {
          throw error
        }

        unavailableProfileTemplates.add(template)
      }
    }

    throw lastError || new Error(PROFILE_MESSAGES.fallbackLoadUserProfileFailed)
  },

  // Follow / Unfollow (Toggle)
  toggleFollow: (userId) => api.put(`/users/${userId}/follow`),

  // Lấy danh sách Followers
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),

  // Lấy danh sách Following
  getFollowing: (userId) => api.get(`/users/${userId}/following`),

  // Gợi ý bạn bè
  getSuggestions: () => api.get('/users/suggestions'),

  // Lấy trạng thái hoạt động của 1 user
  getPresenceByUserId: (userId) => api.get(`/users/presence/${encodeURIComponent(String(userId))}`),

  // Lấy trạng thái hoạt động của nhiều user: ids=id1,id2,id3
  getPresenceByUserIds: (userIds = []) => api.get('/users/presence', {
    params: {
      ids: userIds
        .map((id) => String(id || '').trim())
        .filter(Boolean)
        .join(','),
    },
  }),
}

export default userService
