import { useEffect, useState } from 'react'
import friendService from '@/features/user/services/friendService'
import userService from '@/features/user/services/userService'
import { extractItems } from '@/utils/friendship'
import { mapPresenceItems, normalizeFriendUser } from '@/utils/chatFriendAdapters'

const useChatFriendsInitialData = ({ isOpen }) => {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const loadFriends = async () => {
      setIsLoading(true)
      try {
        const friendsResponse = await friendService.getMyFriends()
        const normalizedFriends = extractItems(friendsResponse)
          .map((item) => normalizeFriendUser(item))
          .filter(Boolean)

        const friendIds = normalizedFriends.map((item) => item._id)
        const presenceResponse = friendIds.length > 0
          ? await userService.getPresenceByUserIds(friendIds)
          : null
        const presenceItems = mapPresenceItems(presenceResponse)
        const presenceMap = new Map(
          presenceItems.map((item) => [String(item.userId), {
            isOnline: Boolean(item.isOnline),
            lastSeen: item.lastSeen || null,
          }])
        )

        if (!isMounted) return

        setFriends(
          normalizedFriends.map((friend) => {
            const presence = presenceMap.get(String(friend._id))
            if (!presence) return friend
            return {
              ...friend,
              isOnline: presence.isOnline,
              lastSeen: presence.lastSeen,
            }
          })
        )
      } catch {
        if (isMounted) {
          setFriends([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFriends()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  return {
    friends,
    setFriends,
    isLoading,
  }
}

export default useChatFriendsInitialData
