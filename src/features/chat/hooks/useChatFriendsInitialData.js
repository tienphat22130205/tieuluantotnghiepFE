import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import friendService from '@/features/user/services/friendService'
import userService from '@/features/user/services/userService'
import { extractItems } from '@/utils/friendship'
import { mapPresenceItems, normalizeFriendUser } from '@/utils/chatFriendAdapters'

const CHAT_FRIENDS_CACHE_PREFIX = 'chat-friends-cache-v1'

const getChatFriendsCacheKey = (userId) => `${CHAT_FRIENDS_CACHE_PREFIX}:${String(userId || 'guest')}`

const readChatFriendsCache = (cacheKey) => {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return new Map()

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.items)) return new Map()

    return new Map(
      parsed.items
        .map((item) => {
          const id = item?._id || item?.id
          if (!id) return null

          return [String(id), {
            lastMessagePreview: String(item?.lastMessagePreview || '').trim(),
            lastMessageAt: item?.lastMessageAt || null,
            newMessagesCount: Math.max(0, Number(item?.newMessagesCount || 0) || 0),
          }]
        })
        .filter(Boolean)
    )
  } catch {
    return new Map()
  }
}

const writeChatFriendsCache = (cacheKey, friends) => {
  try {
    const items = (Array.isArray(friends) ? friends : []).map((friend) => ({
      _id: String(friend?._id || ''),
      lastMessagePreview: String(friend?.lastMessagePreview || '').trim(),
      lastMessageAt: friend?.lastMessageAt || null,
      newMessagesCount: Math.max(0, Number(friend?.newMessagesCount || 0) || 0),
    })).filter((item) => item._id)

    localStorage.setItem(cacheKey, JSON.stringify({ items }))
  } catch {
    // Ignore storage write failures.
  }
}

const useChatFriendsInitialData = ({ isOpen }) => {
  const authUserId = useSelector((state) => state.auth.user?._id || state.auth.user?.id || null)
  const cacheKey = getChatFriendsCacheKey(authUserId)
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!Array.isArray(friends) || friends.length === 0) return

    writeChatFriendsCache(cacheKey, friends)
  }, [cacheKey, friends])

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

        const cacheByFriendId = typeof window === 'undefined'
          ? new Map()
          : readChatFriendsCache(cacheKey)

        const friendsWithCache = normalizedFriends.map((friend) => {
          const cached = cacheByFriendId.get(String(friend._id))
          if (!cached) return friend

          return {
            ...friend,
            lastMessagePreview: cached.lastMessagePreview || friend.lastMessagePreview || '',
            lastMessageAt: cached.lastMessageAt || friend.lastMessageAt || null,
            newMessagesCount: Math.max(
              Number(friend.newMessagesCount || 0),
              Number(cached.newMessagesCount || 0)
            ),
          }
        })

        const friendIds = friendsWithCache.map((item) => item._id)
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
          friendsWithCache.map((friend) => {
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
  }, [cacheKey, isOpen])

  return {
    friends,
    setFriends,
    isLoading,
  }
}

export default useChatFriendsInitialData
