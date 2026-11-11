import api from '@/services/api'

const getAdminNotifications = async ({ page = 1, limit = 20, type = 'all', unreadOnly = false } = {}) => {
  const response = await api.get('/notifications/admin', {
    params: { page, limit, type, unreadOnly },
  })
  return response?.data || response
}

const getAdminUnreadCount = async () => {
  const response = await api.get('/notifications/admin/unread-count')
  return response?.data || response
}

const markAdminAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/admin/${notificationId}/read`)
  return response?.data || response
}

const markAllAdminAsRead = async () => {
  const response = await api.patch('/notifications/admin/read-all')
  return response?.data || response
}

const deleteAdminNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/admin/${notificationId}`)
  return response?.data || response
}

const clearAllAdminNotifications = async () => {
  const response = await api.delete('/notifications/admin/clear-all')
  return response?.data || response
}

const adminNotificationService = {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminAsRead,
  markAllAdminAsRead,
  deleteAdminNotification,
  clearAllAdminNotifications,
}

export default adminNotificationService

