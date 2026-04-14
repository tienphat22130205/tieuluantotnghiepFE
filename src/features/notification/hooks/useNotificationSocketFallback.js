import { useEffect, useState } from 'react'
import { getSocket, socketDebugLog } from '@/services/socketClient'

const useNotificationSocketFallback = ({ token, fetchList, loadNotifications, refreshUnreadCount }) => {
  const [isSocketFallbackActive, setIsSocketFallbackActive] = useState(false)

  useEffect(() => {
    if (!token) return

    const socket = getSocket(token)
    if (!socket) return
    let fallbackTimer = null

    const activateFallbackAfterGrace = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
      }

      fallbackTimer = window.setTimeout(() => {
        setIsSocketFallbackActive(true)
        socketDebugLog('notification fallback polling activated')
      }, 15000)
    }

    const onConnect = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
        fallbackTimer = null
      }
      setIsSocketFallbackActive(false)
      socketDebugLog('notification socket connected')
    }

    const onDisconnect = (reason) => {
      socketDebugLog('notification socket disconnected', { reason })
      activateFallbackAfterGrace()
    }

    const onConnectError = (error) => {
      socketDebugLog('notification socket connect_error', { message: error?.message })
      activateFallbackAfterGrace()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    if (socket.connected) {
      onConnect()
    } else {
      activateFallbackAfterGrace()
    }

    return () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
      }
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [token])

  useEffect(() => {
    if (!isSocketFallbackActive) return

    const runFallbackRefresh = () => {
      socketDebugLog('notification fallback poll tick')
      refreshUnreadCount()
      if (fetchList) {
        loadNotifications()
      }
    }

    runFallbackRefresh()
    const intervalId = window.setInterval(runFallbackRefresh, 30000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [fetchList, isSocketFallbackActive, loadNotifications, refreshUnreadCount])

  return {
    isSocketFallbackActive,
  }
}

export default useNotificationSocketFallback
