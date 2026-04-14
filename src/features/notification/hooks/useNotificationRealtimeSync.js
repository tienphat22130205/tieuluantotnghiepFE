import { useEffect } from 'react'
import { getSocket, socketDebugLog } from '@/services/socketClient'
import { normalizeNotification } from '@/utils/notificationAdapters'

const useNotificationRealtimeSync = ({ token, unreadOnly, setNotifications, setUnreadCount }) => {
  useEffect(() => {
    if (!token) return

    const socket = getSocket(token)
    if (!socket) return

    const handleNewNotification = (payload) => {
      socketDebugLog('event:notification:new', payload)
      const normalized = normalizeNotification(payload?.notification || payload?.data || payload)
      if (!normalized?.id) return

      if (unreadOnly && !normalized.isUnread) {
        return
      }

      setNotifications((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === normalized.id)
        if (existingIndex === -1) {
          return [normalized, ...prev]
        }

        const next = [...prev]
        next[existingIndex] = { ...next[existingIndex], ...normalized }
        return next
      })
    }

    const handleUnreadCount = (payload) => {
      socketDebugLog('event:notification:unread-count', payload)
      const nextUnreadCount = Number(payload?.unreadCount ?? payload?.data?.unreadCount)
      if (!Number.isFinite(nextUnreadCount)) return

      setUnreadCount(Math.max(0, nextUnreadCount))
      window.dispatchEvent(new Event('notifications:unread-updated'))
    }

    socket.on('notification:new', handleNewNotification)
    socket.on('notification:unread-count', handleUnreadCount)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.off('notification:unread-count', handleUnreadCount)
    }
  }, [setNotifications, setUnreadCount, token, unreadOnly])
}

export default useNotificationRealtimeSync
