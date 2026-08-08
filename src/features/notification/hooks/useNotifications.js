import { useEffect, useMemo } from 'react'
import { useNotificationStore } from '../store/useNotificationStore'

const useNotifications = ({
  fetchList = true,
  fetchUnreadCount = true,
  unreadOnly = false,
} = {}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount: loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationStore()

  useEffect(() => {
    if (fetchList) {
      fetchNotifications(unreadOnly)
    }
  }, [fetchList, fetchNotifications, unreadOnly])

  useEffect(() => {
    if (fetchUnreadCount) {
      loadUnreadCount()
    }
  }, [fetchUnreadCount, loadUnreadCount])

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => !item.isDeleted),
    [notifications]
  )

  const hasUnread = useMemo(
    () => visibleNotifications.some((item) => item.isUnread),
    [visibleNotifications]
  )

  return {
    notifications: visibleNotifications,
    unreadCount,
    isLoading,
    isUpdating: false,
    error: null,
    hasUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshUnreadCount: loadUnreadCount,
    reloadNotifications: () => fetchNotifications(unreadOnly),
  }
}

export default useNotifications
