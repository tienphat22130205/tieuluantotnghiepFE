import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import friendService from '@/features/user/services/friendService'
import userService from '@/features/user/services/userService'
import chatService from '@/features/chat/services/chatService'
import { extractItems } from '@/utils/friendship'
import { mapPresenceItems, normalizeFriendUser } from '@/utils/chatFriendAdapters'
import { extractConversationsPayload } from '@/utils/chatConversationAdapters'
import { usePresenceStore } from '../store/usePresenceStore'
import { registerConversationFriendMapping } from '../store/useChatStore'

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
  const friends = usePresenceStore((state) => state.friends)
  const setFriends = usePresenceStore((state) => state.setFriends)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!Array.isArray(friends) || friends.length === 0) return

    writeChatFriendsCache(cacheKey, friends)
  }, [cacheKey, friends])

  useEffect(() => {
    if (!authUserId) return

    let isMounted = true

    const loadFriendsAndConversations = async () => {
      setIsLoading(true)
      try {
        const [friendsResult, convosResult] = await Promise.allSettled([
          friendService.getMyFriends(),
          chatService.getMyConversations({ page: 1, limit: 50 }),
        ])

        const normalizedFriends = friendsResult.status === 'fulfilled'
          ? extractItems(friendsResult.value).map((item) => normalizeFriendUser(item)).filter(Boolean)
          : []

        const convos = convosResult.status === 'fulfilled'
          ? extractConversationsPayload(convosResult.value)
          : []

        const cacheByFriendId = typeof window === 'undefined'
          ? new Map()
          : readChatFriendsCache(cacheKey)

        const convosByFriendId = new Map()
        convos.forEach((convo) => {
          const participants = Array.isArray(convo.participants) ? convo.participants : []
          const otherUser = participants.find((p) => {
            const pId = p?._id || p?.id || p?.userId
            return pId && String(pId) !== String(authUserId)
          })
          if (!otherUser) return

          const otherUserId = String(otherUser._id || otherUser.id || otherUser.userId)
          const convoId = String(convo._id || convo.id)

          registerConversationFriendMapping(otherUserId, convoId)

          const senderId = convo.lastMessage?.sender?._id || convo.lastMessage?.sender
          const isMine = senderId && String(senderId) === String(authUserId)
          const rawContent = String(convo.lastMessage?.content || '').trim()
          const preview = rawContent ? (isMine ? `Bạn: ${rawContent}` : rawContent) : ''
          const createdAt = convo.lastMessage?.createdAt || convo.updatedAt || null
          const unreadCount = Number(convo.unreadCount || 0)

          convosByFriendId.set(otherUserId, {
            conversationId: convoId,
            lastMessagePreview: preview,
            lastMessageAt: createdAt,
            newMessagesCount: unreadCount,
            user: otherUser,
          })
        })

        // Merge friends with conversations & cache
        const mergedFriends = normalizedFriends.map((friend) => {
          const friendId = String(friend._id)
          const convoData = convosByFriendId.get(friendId)
          const cached = cacheByFriendId.get(friendId)

          let lastMessagePreview = convoData?.lastMessagePreview || cached?.lastMessagePreview || friend.lastMessagePreview || ''
          let lastMessageAt = convoData?.lastMessageAt || cached?.lastMessageAt || friend.lastMessageAt || null
          let newMessagesCount = convoData !== undefined
            ? convoData.newMessagesCount
            : Math.max(Number(friend.newMessagesCount || 0), Number(cached?.newMessagesCount || 0))

          convosByFriendId.delete(friendId)

          return {
            ...friend,
            conversationId: convoData?.conversationId || friend.conversationId || null,
            lastMessagePreview,
            lastMessageAt,
            newMessagesCount,
          }
        })

        // Add non-friend users who have conversations
        convosByFriendId.forEach((convoData, otherUserId) => {
          const u = convoData.user
          const fullName =
            u.full_name ||
            u.fullName ||
            `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
            u.username ||
            'Người dùng'

          mergedFriends.push({
            _id: otherUserId,
            id: otherUserId,
            username: u.username || '',
            full_name: fullName,
            avatar: u.avatar || null,
            isOnline: Boolean(u.isOnline),
            lastSeen: u.lastSeen || null,
            conversationId: convoData.conversationId,
            lastMessagePreview: convoData.lastMessagePreview,
            lastMessageAt: convoData.lastMessageAt,
            newMessagesCount: convoData.newMessagesCount,
          })
        })

        // Fetch presence
        const friendIds = mergedFriends.map((item) => item._id)
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

        const finalFriends = mergedFriends.map((friend) => {
          const presence = presenceMap.get(String(friend._id))
          if (!presence) return friend
          return {
            ...friend,
            isOnline: presence.isOnline,
            lastSeen: presence.lastSeen,
          }
        })

        setFriends(finalFriends)
        writeChatFriendsCache(cacheKey, finalFriends)
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

    loadFriendsAndConversations()

    return () => {
      isMounted = false
    }
  }, [cacheKey, authUserId])

  return {
    friends,
    setFriends,
    isLoading,
  }
}

export default useChatFriendsInitialData
