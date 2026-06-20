import api from '@/services/api'

const storyService = {
  // Lấy danh sách tin tức (Stories) của bạn bè và bản thân
  getStories: async () => {
    const response = await api.get('/stories')
    return response?.data || response || []
  },

  // Tạo tin tức mới
  createStory: async (formData) => {
    const response = await api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response?.data || response
  },

  // Đánh dấu đã xem tin tức
  viewStory: async (storyId) => {
    const response = await api.post(`/stories/${storyId}/view`)
    return response?.data || response
  },

  // Xóa tin tức
  deleteStory: async (storyId) => {
    const response = await api.delete(`/stories/${storyId}`)
    return response?.data || response
  },

  // Lấy danh sách tin tức lưu trữ (Archive) của bản thân
  getArchivedStories: async () => {
    const response = await api.get('/stories/archive')
    return response?.data || response || []
  },

  // Bày tỏ cảm xúc với tin tức
  reactStory: async (storyId, reaction) => {
    const response = await api.post(`/stories/${storyId}/react`, { reaction })
    return response?.data || response
  },
}

export default storyService
