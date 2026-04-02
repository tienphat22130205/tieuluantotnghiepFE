import api from '@/services/api'
import { FRIEND_MESSAGES } from '@/constants/messages'

const RETRYABLE_STATUSES = [400, 404, 405]

const isRetryable = (error) => RETRYABLE_STATUSES.includes(error?.status)

const tryRequestCandidates = async (candidates) => {
  let lastError = null

  for (const request of candidates) {
    try {
      return await request()
    } catch (error) {
      lastError = error
      if (!isRetryable(error)) {
        throw error
      }
    }
  }

  throw lastError
}

/**
 * Friend Service – API layer cho chức năng bạn bè và follow.
 * Các endpoint bám theo backend /api/friends/*.
 */
const friendService = {
  // 1) Gửi lời mời kết bạn
  sendRequest: async (receiverId) => {
    const userId = receiverId ? String(receiverId).trim() : ''

    if (!userId) {
      throw { message: FRIEND_MESSAGES.requiredUserId }
    }

    // Backend contract: POST /api/friends/requests with body { toUserId }
    return api.post('/friends/requests', { toUserId: userId })
  },

  // 2) Lấy lời mời đang chờ nhận
  getIncomingRequests: () => api.get('/friends/requests'),

  // 3) Lấy lời mời đã gửi (pending)
  getSentRequests: () => api.get('/friends/requests/sent'),

  // 4) Chấp nhận hoặc từ chối lời mời: action = accepted | declined
  respondToRequest: (requestId, action = 'accepted') =>
    api.patch(`/friends/requests/${requestId}`, { action }),

  // 5) Hủy lời mời đã gửi
  cancelSentRequest: (requestId) => api.delete(`/friends/requests/${requestId}`),

  // 6) Danh sách bạn bè của tôi
  getMyFriends: () => api.get('/friends'),

  // 6.1) Hủy kết bạn
  unfriend: (friendId) => api.delete(`/friends/${friendId}`),

  // 7) Danh sách bạn bè của user khác
  getFriendsByUserId: async (userId) => {
    const targetUserId = userId ? String(userId) : ''

    if (!targetUserId) {
      return []
    }

    return tryRequestCandidates([
      () => api.get(`/friends/${targetUserId}`),
      () => api.get(`/friends/user/${targetUserId}`),
    ])
  },

  // 8) Theo dõi user
  followUser: (userId) => api.post(`/friends/follow/${userId}`),

  // 9) Bỏ theo dõi user
  unfollowUser: (userId) => api.delete(`/friends/follow/${userId}`),

  // 10) Followers của tôi
  getMyFollowers: () => api.get('/friends/followers/me'),

  // 11) Followers của user khác
  getFollowersByUserId: (userId) => api.get(`/friends/followers/${userId}`),

  // 12) Following của tôi
  getMyFollowing: () => api.get('/friends/following/me'),

  // 13) Following của user khác
  getFollowingByUserId: (userId) => api.get(`/friends/following/${userId}`),

  // 14) Trạng thái quan hệ với user khác
  getRelationshipStatus: (userId) => api.get(`/friends/status/${userId}`),
}

export default friendService
