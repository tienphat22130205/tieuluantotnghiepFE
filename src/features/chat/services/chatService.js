import api from '@/services/api'

const chatService = {
  createOrGetDirectConversation: (targetUserId) => api.post('/chats/conversations/direct', { targetUserId }),

  getMyConversations: ({ page = 1, limit = 20 } = {}) => api.get('/chats/conversations', {
    params: { page, limit },
  }),

  getConversationMessages: (conversationId, { page = 1, limit = 30 } = {}) => api.get(`/chats/conversations/${conversationId}/messages`, {
    params: { page, limit },
  }),

  sendMessage: (conversationId, content, payload = {}) => api.post(`/chats/conversations/${conversationId}/messages`, { content, ...payload }),

  markConversationAsRead: (conversationId) => api.patch(`/chats/conversations/${conversationId}/read`),

  toggleMessageReaction: (messageId, type) => api.patch(`/chats/messages/${messageId}/react`, { type }),
}

export default chatService
