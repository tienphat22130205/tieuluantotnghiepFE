import { create } from 'zustand'

export const usePresenceStore = create((set) => ({
  friends: [],
  setFriends: (friendsList) => set({ friends: friendsList || [] }),
  updatePresence: (userId, isOnline, lastSeen) => {
    set((state) => ({
      friends: state.friends.map((friend) => {
        if (String(friend._id || friend.id) === String(userId)) {
          return { ...friend, isOnline, lastSeen }
        }
        return friend
      }),
    }))
  },
  setupSocketListeners: (socket) => {
    if (!socket) return null

    const handlePresenceUpdate = (payload) => {
      const userId = payload?.userId || payload?.data?.userId
      if (!userId) return

      const isOnline = Boolean(payload?.isOnline ?? payload?.data?.isOnline)
      const lastSeen =
        payload?.lastSeen ||
        payload?.data?.lastSeen ||
        payload?.last_seen ||
        payload?.data?.last_seen ||
        null

      usePresenceStore.getState().updatePresence(userId, isOnline, lastSeen)
    }

    socket.on('presence:update', handlePresenceUpdate)

    return () => {
      socket.off('presence:update', handlePresenceUpdate)
    }
  },
}))
