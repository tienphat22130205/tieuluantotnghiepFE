import { useCallback, useEffect, useState } from 'react'
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
  const [incomingRequests, setIncomingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [actingRequestId, setActingRequestId] = useState(null)
  const [actingFriendId, setActingFriendId] = useState(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [incomingRes, sentRes, friendsRes] = await Promise.all([
        friendService.getIncomingRequests(),
        friendService.getSentRequests(),
        friendService.getMyFriends(),
      ])

      setIncomingRequests(
        extractItems(incomingRes)
          .map((item) => normalizeRequest(item, 'incoming'))
          .filter(Boolean)
      )

      setSentRequests(
        extractItems(sentRes)
          .map((item) => normalizeRequest(item, 'sent'))
          .filter(Boolean)
      )

      setFriends(
        extractItems(friendsRes)
          .map((item) => normalizeUser(item.user || item.friend || item))
          .filter(Boolean)
      )
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.loadFriendsDataFailed)
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  return {
    incomingRequests,
    sentRequests,
    friends,
    isLoading,
    actingRequestId,
    actingFriendId,
    reloadFriendsData: loadData,
    handleRespondRequest,
    handleCancelSentRequest,
    handleUnfriend,
  }
}

export default useFriendsPage
