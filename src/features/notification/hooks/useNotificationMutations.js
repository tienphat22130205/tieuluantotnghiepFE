import { useState } from 'react'
import notificationService from '../services/notificationService'

const useNotificationMutations = ({ notifications, unreadCount, setNotifications, setUnreadCount }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const markAsRead = async (notificationId) => {
    if (!notificationId) return

    const target = notifications.find((item) => item.id === notificationId)
    if (!target?.isUnread) return

    setIsUpdating(true)
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications((prev) => prev.map((item) => (
        item.id === notificationId
          ? { ...item, isUnread: false }
          : item
      )))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      window.dispatchEvent(new Event('notifications:unread-updated'))
    } catch {
      // Ignore per-item update failure to avoid disrupting list view.
    } finally {
      setIsUpdating(false)
    }
  }

  const markAllAsRead = async () => {
    if (notifications.length === 0) return

    setIsUpdating(true)
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, isUnread: false })))
      setUnreadCount(0)
      window.dispatchEvent(new Event('notifications:unread-updated'))
    } catch {
      // Keep current list state on failure.
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    if (!notificationId) return false

    const previousNotifications = notifications
    const previousUnreadCount = unreadCount
    const target = previousNotifications.find((item) => item.id === notificationId)

    if (!target || target.isDeleted) return false

    setIsUpdating(true)
    setNotifications((prev) => prev.map((item) => (
      item.id === notificationId
        ? { ...item, isDeleted: true }
        : item
    )))

    if (target.isUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
      window.dispatchEvent(new Event('notifications:unread-updated'))
    }

    try {
      await notificationService.deleteNotification(notificationId)
      return true
    } catch (err) {
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      window.dispatchEvent(new Event('notifications:unread-updated'))
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return false

    const previousNotifications = notifications
    const previousUnreadCount = unreadCount

    setIsUpdating(true)
    setNotifications((prev) => prev.map((item) => ({ ...item, isDeleted: true })))
    setUnreadCount(0)
    window.dispatchEvent(new Event('notifications:unread-updated'))

    try {
      await notificationService.deleteAllNotifications()
      return true
    } catch (err) {
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      window.dispatchEvent(new Event('notifications:unread-updated'))
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    isUpdating,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  }
}

export default useNotificationMutations
