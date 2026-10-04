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

  sendImageMessage: (conversationId, file, caption = '', payload = {}) => {
    const formData = new FormData()
    formData.append('image', file)
    if (caption) {
      formData.append('content', caption)
    }
    if (payload.replyTo) {
      formData.append('replyTo', payload.replyTo)
    }
    if (payload.storyReply) {
      formData.append('storyReply', typeof payload.storyReply === 'string' ? payload.storyReply : JSON.stringify(payload.storyReply))
    }
    return api.post(`/chats/conversations/${conversationId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  markConversationAsRead: (conversationId) => api.patch(`/chats/conversations/${conversationId}/read`),

  toggleMessageReaction: (messageId, type) => api.patch(`/chats/messages/${messageId}/react`, { type }),
}

export default chatService
