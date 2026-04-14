import { useCallback, useState } from 'react'
import notificationService from '../services/notificationService'
import { getItemsFromResponse, getMetaFromResponse, normalizeNotification } from '@/utils/notificationAdapters'

const useNotificationDataSource = ({
  fetchList,
  fetchUnreadCount,
  unreadOnly,
  initialPage,
  limit,
}) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [meta, setMeta] = useState({ page: initialPage, limit, totalItems: 0, totalPages: 1 })

  const loadNotifications = useCallback(async () => {
    if (!fetchList) return

    setIsLoading(true)
    setError('')
    try {
      const response = await notificationService.getNotifications({
        page: initialPage,
        limit,
        unread: unreadOnly ? true : undefined,
      })

      const items = getItemsFromResponse(response).map(normalizeNotification).filter((item) => item.id)
      const nextMeta = getMetaFromResponse(response, initialPage, limit, items.length)

      setNotifications(items)
      setMeta(nextMeta)
    } catch (loadError) {
      setError(loadError?.message || 'Không thể tải danh sách thông báo')
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [fetchList, initialPage, limit, unreadOnly])

  const refreshUnreadCount = useCallback(async () => {
    if (!fetchUnreadCount) return

    try {
      const response = await notificationService.getUnreadCount()
      const nextUnreadCount = Number(response?.data?.unreadCount || response?.unreadCount || 0)
      setUnreadCount(Math.max(0, nextUnreadCount))
    } catch {
      // Keep last known unread count when count endpoint fails.
    }
  }, [fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    meta,
    setNotifications,
    setUnreadCount,
    loadNotifications,
    refreshUnreadCount,
  }
}

export default useNotificationDataSource
