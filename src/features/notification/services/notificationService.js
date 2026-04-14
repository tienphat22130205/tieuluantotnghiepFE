import api from '@/services/api'

const notificationService = {
  getNotifications: ({ page = 1, limit = 20, unread } = {}) => {
    const params = { page, limit }
    if (typeof unread === 'boolean') {
      params.unread = unread
    }

    return api.get('/notifications', { params })
  },

  getUnreadCount: () => api.get('/notifications/unread-count'),

  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),

  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),

  deleteAllNotifications: () => api.delete('/notifications'),
}

export default notificationService
