import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import friendService from '../services/friendService'
import { extractItems, getUserId } from '@/utils/friendship'
import { FRIEND_MESSAGES } from '@/constants/messages'

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null
  return {
    ...user,
    _id: user._id || user.id,
    full_name: user.full_name || user.fullName || user.name || '',
    avatar: user.avatar || null,
    username: user.username || '',
  }
}

const normalizeRequest = (request, type) => {
  if (!request) return null

  const user = type === 'incoming'
    ? normalizeUser(request.sender || request.from || request.user)
    : normalizeUser(request.receiver || request.to || request.user)

  return {
    ...request,
    _id: request._id || request.id,
    status: request.status || 'pending',
    user,
  }
}

const useFriendsPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth)
  const [incomingRequests, setIncomingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingRequestId, setActingRequestId] = useState(null)
  const [actingFriendId, setActingFriendId] = useState(null)
  const [actingSuggestionId, setActingSuggestionId] = useState(null)

  const currentUserId = getUserId(currentUser)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [incomingRes, sentRes, friendsRes] = await Promise.all([
        friendService.getIncomingRequests(),
        friendService.getSentRequests(),
        friendService.getMyFriends(),
      ])

      const [followersRes, followingRes] = await Promise.allSettled([
        friendService.getMyFollowers(),
        friendService.getMyFollowing(),
      ])

      const normalizedIncoming = extractItems(incomingRes)
        .map((item) => normalizeRequest(item, 'incoming'))
        .filter(Boolean)

      const normalizedSent = extractItems(sentRes)
        .map((item) => normalizeRequest(item, 'sent'))
        .filter(Boolean)

      const normalizedFriends = extractItems(friendsRes)
        .map((item) => normalizeUser(item.user || item.friend || item))
        .filter(Boolean)

      const followersItems = followersRes.status === 'fulfilled'
        ? extractItems(followersRes.value)
        : []
      const followingItems = followingRes.status === 'fulfilled'
        ? extractItems(followingRes.value)
        : []

      const friendIds = new Set(normalizedFriends.map((item) => String(getUserId(item))))
      const requestUserIds = new Set([
        ...normalizedIncoming.map((item) => String(getUserId(item.user))),
        ...normalizedSent.map((item) => String(getUserId(item.user))),
      ])

      const suggestionMap = new Map()
      ;[...followersItems, ...followingItems]
        .map((item) => normalizeUser(item.user || item.follower || item.following || item.friend || item))
        .filter(Boolean)
        .forEach((item) => {
          const id = String(getUserId(item))
          if (!id) return
          if (currentUserId && id === String(currentUserId)) return
          if (friendIds.has(id)) return
          if (requestUserIds.has(id)) return
          if (!suggestionMap.has(id)) {
            suggestionMap.set(id, item)
          }
        })

      setIncomingRequests(normalizedIncoming)
      setSentRequests(normalizedSent)
      setFriends(normalizedFriends)
      setSuggestions(Array.from(suggestionMap.values()))
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.loadFriendsDataFailed)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRespondRequest = async (requestId, action) => {
    if (!requestId) return

    setActingRequestId(requestId)
    try {
      await friendService.respondToRequest(requestId, action)

      const requestItem = incomingRequests.find((item) => String(item._id) === String(requestId))
      setIncomingRequests((prev) => prev.filter((item) => String(item._id) !== String(requestId)))

      if (action === 'accepted' && requestItem?.user) {
        const newFriend = requestItem.user
        setFriends((prev) => {
          const exists = prev.some((item) => String(getUserId(item)) === String(getUserId(newFriend)))
          if (exists) return prev
          return [newFriend, ...prev]
        })
        toast.success(FRIEND_MESSAGES.acceptRequestSuccess)
      }

      if (action === 'declined') {
        toast.success(FRIEND_MESSAGES.declineRequestSuccess)
      }
        window.dispatchEvent(new Event('friends:incoming-updated'))
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.actionFailed)
    } finally {
      setActingRequestId(null)
    }
  }

  const handleCancelSentRequest = async (requestId) => {
    if (!requestId) return

    setActingRequestId(requestId)
    try {
      await friendService.cancelSentRequest(requestId)
      setSentRequests((prev) => prev.filter((item) => String(item._id) !== String(requestId)))
      toast.success(FRIEND_MESSAGES.cancelSentRequestSuccess)
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.cancelSentRequestFailed)
    } finally {
      setActingRequestId(null)
    }
  }

  const handleUnfriend = async (friendId) => {
    if (!friendId) return

    setActingFriendId(String(friendId))
    try {
      await friendService.unfriend(friendId)
      setFriends((prev) => prev.filter((item) => String(getUserId(item)) !== String(friendId)))
      toast.success(FRIEND_MESSAGES.unfriendSuccess)
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.unfriendFailed)
    } finally {
      setActingFriendId(null)
    }
  }

  const handleSendRequestFromSuggestion = async (targetUserId) => {
    if (!targetUserId) return

    const normalizedTargetId = String(targetUserId)
    setActingSuggestionId(normalizedTargetId)
    try {
      const response = await friendService.sendRequest(normalizedTargetId)
      const selectedUser = suggestions.find((item) => String(getUserId(item)) === normalizedTargetId)
      const requestId =
        response?.request?._id
        || response?.request?.id
        || response?.data?.requestId
        || response?.requestId
        || `temp-${normalizedTargetId}`

      setSuggestions((prev) => prev.filter((item) => String(getUserId(item)) !== normalizedTargetId))

      if (selectedUser) {
        setSentRequests((prev) => [
          {
            _id: String(requestId),
            status: 'pending',
            user: selectedUser,
          },
          ...prev,
        ])
      }

      toast.success(FRIEND_MESSAGES.sendRequestSuccess)
        window.dispatchEvent(new Event('friends:incoming-updated'))
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.actionFailed)
    } finally {
      setActingSuggestionId(null)
    }
  }

  return {
    incomingRequests,
    sentRequests,
    friends,
    suggestions,
    isLoading,
    actingRequestId,
    actingFriendId,
    actingSuggestionId,
    reloadFriendsData: loadData,
    handleRespondRequest,
    handleCancelSentRequest,
    handleUnfriend,
    handleSendRequestFromSuggestion,
  }
}

export default useFriendsPage
