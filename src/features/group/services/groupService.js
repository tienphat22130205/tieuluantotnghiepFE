import api from '@/services/api'

const unwrapDataPayload = (payload) => payload?.data || payload

const groupService = {
  // ── Group CRUD ──
  searchGroups: async (params) => {
    const res = await api.get('/groups/search', { params })
    return unwrapDataPayload(res)
  },

  getMyGroups: async (params) => {
    const res = await api.get('/groups/my', { params })
    return unwrapDataPayload(res)
  },

  getGroupById: async (groupId) => {
    const res = await api.get(`/groups/${groupId}`)
    return unwrapDataPayload(res)
  },

  createGroup: async (formData) => {
    const res = await api.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapDataPayload(res)
  },

  updateGroup: async (groupId, formData) => {
    const res = await api.patch(`/groups/${groupId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapDataPayload(res)
  },

  deleteGroup: async (groupId) => {
    const res = await api.delete(`/groups/${groupId}`)
    return unwrapDataPayload(res)
  },

  // ── Membership ──
  joinGroup: async (groupId) => {
    const res = await api.post(`/groups/${groupId}/join`)
    return unwrapDataPayload(res)
  },

  leaveGroup: async (groupId) => {
    const res = await api.delete(`/groups/${groupId}/leave`)
    return unwrapDataPayload(res)
  },

  getMembers: async (groupId, params) => {
    const res = await api.get(`/groups/${groupId}/members`, { params })
    return unwrapDataPayload(res)
  },

  getPendingMembers: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/members/pending`)
    return unwrapDataPayload(res)
  },

  approveMember: async (groupId, userId) => {
    const res = await api.patch(`/groups/${groupId}/members/${userId}/approve`)
    return unwrapDataPayload(res)
  },

  rejectMember: async (groupId, userId) => {
    const res = await api.patch(`/groups/${groupId}/members/${userId}/reject`)
    return unwrapDataPayload(res)
  },

  banMember: async (groupId, userId) => {
    const res = await api.patch(`/groups/${groupId}/members/${userId}/ban`)
    return unwrapDataPayload(res)
  },

  promoteMember: async (groupId, userId) => {
    const res = await api.patch(`/groups/${groupId}/members/${userId}/promote`)
    return unwrapDataPayload(res)
  },

  demoteMember: async (groupId, userId) => {
    const res = await api.patch(`/groups/${groupId}/members/${userId}/demote`)
    return unwrapDataPayload(res)
  },

  // ── Group Posts ──
  getGroupPosts: async (groupId, params) => {
    const res = await api.get(`/groups/${groupId}/posts`, { params })
    return unwrapDataPayload(res)
  },

  createGroupPost: async (groupId, formData) => {
    const res = await api.post(`/groups/${groupId}/posts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapDataPayload(res)
  },

  deleteGroupPost: async (groupId, postId) => {
    const res = await api.delete(`/groups/${groupId}/posts/${postId}`)
    return unwrapDataPayload(res)
  },

  pinGroupPost: async (groupId, postId) => {
    const res = await api.patch(`/groups/${groupId}/posts/${postId}/pin`)
    return unwrapDataPayload(res)
  },

  likeGroupPost: async (groupId, postId) => {
    const res = await api.post(`/groups/${groupId}/posts/${postId}/like`)
    return unwrapDataPayload(res)
  },

  unlikeGroupPost: async (groupId, postId) => {
    const res = await api.delete(`/groups/${groupId}/posts/${postId}/like`)
    return unwrapDataPayload(res)
  },

  addGroupComment: async (groupId, postId, content) => {
    const res = await api.post(`/groups/${groupId}/posts/${postId}/comments`, { content })
    return unwrapDataPayload(res)
  },

  deleteGroupComment: async (groupId, postId, commentId) => {
    const res = await api.delete(`/groups/${groupId}/posts/${postId}/comments/${commentId}`)
    return unwrapDataPayload(res)
  },

  // ── Chat ──
  getGroupMessages: async (groupId, params) => {
    const res = await api.get(`/groups/${groupId}/messages`, { params })
    return unwrapDataPayload(res)
  },

  sendGroupMessage: async (groupId, body) => {
    const res = await api.post(`/groups/${groupId}/messages`, body)
    return unwrapDataPayload(res)
  },

  // ── Polls ──
  createPoll: async (groupId, body) => {
    const res = await api.post(`/groups/${groupId}/polls`, body)
    return unwrapDataPayload(res)
  },

  getGroupPolls: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/polls`)
    return unwrapDataPayload(res)
  },

  votePoll: async (groupId, pollId, optionIds) => {
    const res = await api.post(`/groups/${groupId}/polls/${pollId}/vote`, { optionIds })
    return unwrapDataPayload(res)
  },

  closePoll: async (groupId, pollId) => {
    const res = await api.patch(`/groups/${groupId}/polls/${pollId}/close`)
    return unwrapDataPayload(res)
  },

  // ── Events ──
  createEvent: async (groupId, formData) => {
    const res = await api.post(`/groups/${groupId}/events`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapDataPayload(res)
  },

  getGroupEvents: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/events`)
    return unwrapDataPayload(res)
  },

  respondToEvent: async (groupId, eventId, status) => {
    const res = await api.patch(`/groups/${groupId}/events/${eventId}/attend`, { status })
    return unwrapDataPayload(res)
  },
}

export default groupService
