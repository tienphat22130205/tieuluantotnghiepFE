import { useEffect } from 'react'
import { getSocket } from '@/services/socketClient'

const useChatPresenceRealtimeSync = ({ isOpen, token, setFriends }) => {
  useEffect(() => {
    if (!isOpen || !token) return

    const socket = getSocket(token)
    if (!socket) return

    const handlePresenceUpdate = (payload) => {
      const userId = payload?.userId || payload?.data?.userId
      if (!userId) return

      const isOnline = Boolean(payload?.isOnline ?? payload?.data?.isOnline)
      const lastSeen = payload?.lastSeen || payload?.data?.lastSeen || payload?.last_seen || payload?.data?.last_seen || null

      setFriends((prev) => prev.map((friend) => {
        if (String(friend._id) !== String(userId)) return friend
        return {
          ...friend,
          isOnline,
          lastSeen,
        }
      }))
    }

    socket.on('presence:update', handlePresenceUpdate)

    return () => {
      socket.off('presence:update', handlePresenceUpdate)
    }
  }, [isOpen, setFriends, token])
}

export default useChatPresenceRealtimeSync
