import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import useNotificationDataSource from './useNotificationDataSource'
import useNotificationMutations from './useNotificationMutations'
import useNotificationRealtimeSync from './useNotificationRealtimeSync'
import useNotificationSocketFallback from './useNotificationSocketFallback'

const useNotifications = ({ fetchList = true, fetchUnreadCount = true, unreadOnly = false, initialPage = 1, limit = 20 } = {}) => {
  const token = useSelector((state) => state.auth.token)
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    meta,
    setNotifications,
    setUnreadCount,
    loadNotifications,
    refreshUnreadCount,
  } = useNotificationDataSource({
    fetchList,
    fetchUnreadCount,
    unreadOnly,
    initialPage,
    limit,
  })

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  useNotificationRealtimeSync({ token, unreadOnly, setNotifications, setUnreadCount })
  useNotificationSocketFallback({ token, fetchList, loadNotifications, refreshUnreadCount })

  const {
    isUpdating,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationMutations({
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
  })

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
    isUpdating,
    error,
    meta,
    hasUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshUnreadCount,
    reloadNotifications: loadNotifications,
  }
}

export default useNotifications
