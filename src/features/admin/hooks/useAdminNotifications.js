import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import adminNotificationService from '../services/adminNotificationService'
import { getSocket, socketDebugLog } from '@/services/socketClient'
import { playNotificationChime } from '@/utils/audioChime'

export const useAdminNotifications = ({ isAdmin, isModerator } = {}) => {
  const { token } = useSelector((state) => state.auth)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    totalItems: 0,
    totalPages: 1,
  })

  const canAccess = Boolean(isAdmin || isModerator)
  const socketRef = useRef(null)

  // Fetch list of admin notifications
  const loadNotifications = useCallback(async (opts = {}) => {
    if (!canAccess) return
    setIsLoading(true)
    try {
      const type = opts.type ?? filterType
      const unread = opts.unreadOnly ?? unreadOnly
      const page = opts.page ?? pagination.page

      const response = await adminNotificationService.getAdminNotifications({
        page,
        limit: pagination.limit,
        type,
        unreadOnly: unread,
      })

      const items = response?.items || response?.data?.items || []
      const meta = response?.pagination || response?.data?.pagination || {}
      const count = response?.unreadCount ?? response?.data?.unreadCount ?? 0

      setNotifications(items)
      setUnreadCount(Math.max(0, Number(count) || 0))
      setPagination((prev) => ({
        ...prev,
        page: meta.page || prev.page,
        limit: meta.limit || prev.limit,
        totalItems: meta.totalItems || items.length,
        totalPages: meta.totalPages || 1,
      }))
    } catch (err) {
      console.error('Failed to load admin notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [canAccess, filterType, unreadOnly, pagination.page, pagination.limit])

  // Fetch unread count only
  const loadUnreadCount = useCallback(async () => {
    if (!canAccess) return
    try {
      const response = await adminNotificationService.getAdminUnreadCount()
      const count = response?.unreadCount ?? response?.data?.unreadCount ?? 0
      setUnreadCount(Math.max(0, Number(count) || 0))
    } catch (err) {
      console.error('Failed to load admin unread count:', err)
    }
  }, [canAccess])

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await adminNotificationService.markAdminAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId || item.id === notificationId
            ? { ...item, isRead: true, readAt: new Date() }
            : item
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await adminNotificationService.markAllAdminAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      toast.error('Không thể đánh dấu tất cả thông báo')
    }
  }, [])

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await adminNotificationService.deleteAdminNotification(notificationId)
      setNotifications((prev) =>
        prev.filter((item) => item._id !== notificationId && item.id !== notificationId)
      )
      loadUnreadCount()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [loadUnreadCount])

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await adminNotificationService.clearAllAdminNotifications()
      setNotifications([])
      setUnreadCount(0)
      toast.success('Đã xóa tất cả thông báo')
    } catch (err) {
      console.error('Failed to clear notifications:', err)
      toast.error('Không thể xóa tất cả thông báo')
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (canAccess) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [canAccess, loadNotifications, loadUnreadCount])

  // Socket listener setup for real-time notifications
  useEffect(() => {
    if (!canAccess || !token) return

    const socket = getSocket(token)
    if (!socket) return

    socketRef.current = socket

    const handleConnect = () => {
      setIsLiveConnected(true)
      socket.emit('admin:join')
    }

    const handleDisconnect = () => {
      setIsLiveConnected(false)
    }

    const handleAdminNotification = (payload) => {
      socketDebugLog('admin:notification received', payload)
      if (!payload) return

      // Play chime sound
      playNotificationChime()

      // Add to list and increment unread
      setNotifications((prev) => {
        const id = payload._id || payload.id
        const exists = prev.some((n) => n._id === id || n.id === id)
        if (exists) return prev
        return [payload, ...prev]
      })
      setUnreadCount((prev) => prev + 1)

      // Show toast alert without JSX so file stays pure JS
      const toastTitle = payload.title || 'Thông báo quản trị mới'
      const toastMessage = payload.message || ''
      toast.info(`${toastTitle}: ${toastMessage}`, {
        autoClose: 6000,
        icon: '🔔',
      })
    }

    const handleUnreadCountUpdate = (payload) => {
      const count = Number(payload?.unreadCount)
      if (Number.isFinite(count)) {
        setUnreadCount(Math.max(0, count))
      }
    }

    if (socket.connected) {
      setIsLiveConnected(true)
      socket.emit('admin:join')
    } else {
      socket.connect()
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('admin:notification', handleAdminNotification)
    socket.on('admin:unread_count', handleUnreadCountUpdate)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('admin:notification', handleAdminNotification)
      socket.off('admin:unread_count', handleUnreadCountUpdate)
    }
  }, [canAccess, token])

  return {
    notifications,
    unreadCount,
    isLoading,
    isLiveConnected,
    filterType,
    setFilterType,
    unreadOnly,
    setUnreadOnly,
    pagination,
    setPagination,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }
}

export default useAdminNotifications

