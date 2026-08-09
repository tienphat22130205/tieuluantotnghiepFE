import { create } from 'zustand'
import notificationService from '../services/notificationService'
import { getItemsFromResponse, normalizeNotification } from '@/utils/notificationAdapters'
import { socketDebugLog } from '@/services/socketClient'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true })
    try {
      const response = await notificationService.getNotifications({
        unread: unreadOnly ? true : undefined,
      })
      const list = getItemsFromResponse(response)
      const normalizedList = list.map(normalizeNotification).filter(Boolean)
      set({ notifications: normalizedList })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount()
      const count = Number(response?.unreadCount ?? response?.data?.unreadCount ?? 0)
      set({ unreadCount: Math.max(0, count) })
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err)
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isUnread: false } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
      window.dispatchEvent(new Event('notifications:unread-updated'))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isUnread: false })),
        unreadCount: 0,
      }))
      window.dispatchEvent(new Event('notifications:unread-updated'))
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      const target = get().notifications.find((n) => n.id === notificationId)
      const isUnread = target ? target.isUnread : false
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }))
      window.dispatchEvent(new Event('notifications:unread-updated'))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  },

  deleteAllNotifications: async () => {
    try {
      await notificationService.deleteAllNotifications()
      set({ notifications: [], unreadCount: 0 })
      window.dispatchEvent(new Event('notifications:unread-updated'))
    } catch (err) {
      console.error('Failed to delete all notifications:', err)
    }
  },

  setupSocketListeners: (socket) => {
    if (!socket) return null

    const handleNewNotification = (payload) => {
      socketDebugLog('event:notification:new', payload)
      const normalized = normalizeNotification(payload?.notification || payload?.data || payload)
      if (!normalized?.id) return

      set((state) => {
        const exists = state.notifications.some((n) => n.id === normalized.id)
        if (exists) return {}
        return {
          notifications: [normalized, ...state.notifications],
          unreadCount: normalized.isUnread ? state.unreadCount + 1 : state.unreadCount,
        }
      })
    }

    const handleUnreadCount = (payload) => {
      socketDebugLog('event:notification:unread-count', payload)
      const count = Number(payload?.unreadCount ?? payload?.data?.unreadCount)
      if (Number.isFinite(count)) {
        set({ unreadCount: Math.max(0, count) })
        window.dispatchEvent(new Event('notifications:unread-updated'))
      }
    }

    socket.on('notification:new', handleNewNotification)
    socket.on('notification:unread-count', handleUnreadCount)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.off('notification:unread-count', handleUnreadCount)
    }
  },
}))
