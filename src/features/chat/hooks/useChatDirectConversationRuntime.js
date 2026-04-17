import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import chatService from '../services/chatService'
import { getSocket } from '@/services/socketClient'
import {
  extractConversationsPayload,
  extractConversationPayload,
  extractMessagesPayload,
  normalizeChatMessage,
  resolveConversationLastMessageCreatedAt,
  resolveConversationLastMessageText,
  resolveConversationUnreadCount,
  resolveDirectFriendIdFromConversation,
  resolveConversationId,
} from '@/utils/chatConversationAdapters'

const toTimeLabel = (value) => {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '--:--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const toDateTimeLabel = (value) => {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '--'

  return date.toLocaleString('vi-VN', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const mergeIncomingMessage = (prev, incoming) => {
  if (!incoming?._id) return [...prev, incoming]

  const existingIndex = prev.findIndex((item) => String(item._id || item.id) === String(incoming._id))
  if (existingIndex === -1) {
    return [...prev, incoming]
  }

  const next = [...prev]
  next[existingIndex] = { ...next[existingIndex], ...incoming }
  return next
}

const createTempMessageId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const useChatDirectConversationRuntime = ({
  isOpen,
  selectedConversation,
  setFriends,
  messageInput,
  setMessageInput,
}) => {
  const { token, user } = useSelector((state) => state.auth)
  const currentUserId = String(user?._id || user?.id || '')
  const [messages, setMessages] = useState([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const conversationByFriendIdRef = useRef(new Map())
  const friendByConversationIdRef = useRef(new Map())
  const joinedConversationIdRef = useRef(null)

  const setFriendPreview = useCallback((friendId, content, options = {}) => {
    if (!friendId) return

    const {
      incrementUnread = false,
      resetUnread = false,
      createdAt = null,
    } = options

    setFriends((prev) => prev.map((friend) => {
      if (String(friend._id) !== String(friendId)) return friend

      const previousUnread = Number(friend.newMessagesCount || 0)
      let nextUnread = previousUnread
      if (resetUnread) {
        nextUnread = 0
      } else if (incrementUnread) {
        nextUnread = previousUnread + 1
      }

      return {
        ...friend,
        lastMessagePreview: String(content || '').trim() || friend.lastMessagePreview || '',
        lastMessageAt: createdAt || friend.lastMessageAt || null,
        newMessagesCount: Math.max(0, nextUnread),
      }
    }))
  }, [setFriends])

  useEffect(() => {
    if (!isOpen || !token) return

    let isMounted = true

    const loadConversationSummaries = async () => {
      try {
        const response = await chatService.getMyConversations({ page: 1, limit: 50 })
        const conversations = extractConversationsPayload(response)

        const summaryByFriendId = new Map()
        conversations.forEach((conversation) => {
          const conversationId = resolveConversationId(conversation)
          const friendId = resolveDirectFriendIdFromConversation(conversation, currentUserId)
          if (!conversationId || !friendId) return

          conversationByFriendIdRef.current.set(String(friendId), String(conversationId))
          friendByConversationIdRef.current.set(String(conversationId), String(friendId))

          summaryByFriendId.set(String(friendId), {
            lastMessagePreview: resolveConversationLastMessageText(conversation),
            lastMessageAt: resolveConversationLastMessageCreatedAt(conversation),
            newMessagesCount: resolveConversationUnreadCount(conversation),
          })
        })

        if (!isMounted) return

        setFriends((prev) => prev.map((friend) => {
          const summary = summaryByFriendId.get(String(friend._id))
          if (!summary) return friend
          return {
            ...friend,
            lastMessagePreview: summary.lastMessagePreview || friend.lastMessagePreview || '',
            lastMessageAt: summary.lastMessageAt || friend.lastMessageAt || null,
            newMessagesCount: summary.newMessagesCount,
          }
        }))
      } catch {
        // Ignore summary fetch failure and keep existing friend list state.
      }
    }

    loadConversationSummaries()

    return () => {
      isMounted = false
    }
  }, [currentUserId, isOpen, setFriends, token])

  useEffect(() => {
    if (!isOpen || !token || !selectedConversation?._id) {
      setMessages([])
      setActiveConversationId(null)
      return
    }

    let isMounted = true

    const openConversation = async () => {
      setIsMessagesLoading(true)
      const socket = getSocket(token)

      try {
        const friendId = String(selectedConversation._id)

        const cachedConversationId = conversationByFriendIdRef.current.get(friendId)
        let conversationId = cachedConversationId || null

        if (!conversationId) {
          const conversationResponse = await chatService.createOrGetDirectConversation(friendId)
          const conversation = extractConversationPayload(conversationResponse)
          conversationId = resolveConversationId(conversation)

          if (conversationId) {
            conversationByFriendIdRef.current.set(friendId, String(conversationId))
            friendByConversationIdRef.current.set(String(conversationId), String(friendId))
          }
        }

        if (!conversationId || !isMounted) {
          setMessages([])
          return
        }

        if (socket) {
          const previousJoinedConversationId = joinedConversationIdRef.current
          if (previousJoinedConversationId && String(previousJoinedConversationId) !== String(conversationId)) {
            socket.emit('chat:leave', previousJoinedConversationId)
          }

          socket.emit('chat:join', conversationId)
          joinedConversationIdRef.current = String(conversationId)
        }

        setActiveConversationId(String(conversationId))
        setFriends((prev) => prev.map((friend) => {
          if (String(friend._id) !== String(friendId)) return friend
          return {
            ...friend,
            newMessagesCount: 0,
            lastMessagePreview: friend.lastMessagePreview || '',
          }
        }))

        const messagesResponse = await chatService.getConversationMessages(conversationId, { page: 1, limit: 30 })
        const normalizedMessages = extractMessagesPayload(messagesResponse)
          .map((item) => normalizeChatMessage(item, { fallbackSenderId: null }))
          .filter(Boolean)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        if (isMounted) {
          setMessages(normalizedMessages)
        }

        chatService.markConversationAsRead(conversationId).catch(() => {
          // Do not block chat view when mark-read fails.
        })
      } catch {
        if (isMounted) {
          setMessages([])
        }
      } finally {
        if (isMounted) {
          setIsMessagesLoading(false)
        }
      }
    }

    openConversation()

    return () => {
      isMounted = false
    }
  }, [isOpen, selectedConversation?._id, setFriends, token])

  useEffect(() => {
    if (isOpen && selectedConversation?._id) return

    const socket = token ? getSocket(token) : null
    const joinedConversationId = joinedConversationIdRef.current
    if (socket && joinedConversationId) {
      socket.emit('chat:leave', joinedConversationId)
    }

    joinedConversationIdRef.current = null
  }, [isOpen, selectedConversation?._id, token])

  useEffect(() => {
    if (!token || !isOpen) return

    const socket = getSocket(token)
    if (!socket) return

    const handleMessageNew = (payload) => {
      const conversationId = String(payload?.conversationId || payload?.data?.conversationId || '')
      if (!conversationId) return

      const normalized = normalizeChatMessage(payload?.message || payload?.data?.message || payload)
      if (!normalized) return

      const friendId = friendByConversationIdRef.current.get(conversationId)
      const isMine = Boolean(
        normalized.isMine
        || (normalized.senderId && currentUserId && String(normalized.senderId) === String(currentUserId))
      )

      if (String(activeConversationId) === conversationId) {
        setMessages((prev) => mergeIncomingMessage(prev, normalized))
        if (friendId) {
          setFriendPreview(friendId, normalized.content, {
            incrementUnread: false,
            createdAt: normalized.createdAt,
          })
        }
        return
      }

      if (friendId) {
        setFriendPreview(friendId, normalized.content, {
          incrementUnread: !isMine && Boolean(normalized.senderId),
          createdAt: normalized.createdAt,
        })
      }
    }

    const handleConversationUpdated = (payload) => {
      const conversationId = String(payload?.conversationId || payload?.data?.conversationId || '')
      if (!conversationId) return

      const friendId = friendByConversationIdRef.current.get(conversationId)
      if (!friendId) return

      const content =
        payload?.lastMessage?.content
        || payload?.lastMessage?.text
        || payload?.data?.lastMessage?.content
        || payload?.data?.lastMessage?.text
        || ''

      const createdAt =
        payload?.lastMessage?.createdAt
        || payload?.lastMessage?.created_at
        || payload?.data?.lastMessage?.createdAt
        || payload?.data?.lastMessage?.created_at
        || new Date().toISOString()

      const unreadCountRaw =
        payload?.unreadCount
        ?? payload?.unread_count
        ?? payload?.unread
        ?? payload?.data?.unreadCount
        ?? payload?.data?.unread_count
        ?? payload?.data?.unread
        ?? null
      const parsedUnreadCount = Number(unreadCountRaw)
      const hasUnreadCount = Number.isFinite(parsedUnreadCount)

      setFriends((prev) => prev.map((friend) => {
        if (String(friend._id) !== String(friendId)) return friend
        return {
          ...friend,
          lastMessagePreview: String(content || '').trim() || friend.lastMessagePreview || '',
          lastMessageAt: createdAt || friend.lastMessageAt || null,
          newMessagesCount: hasUnreadCount ? Math.max(0, parsedUnreadCount) : friend.newMessagesCount,
        }
      }))
    }

    const handleConversationRead = (payload) => {
      const conversationId = String(payload?.conversationId || payload?.data?.conversationId || '')
      const readerUserId = String(payload?.userId || payload?.data?.userId || '')
      if (!conversationId || !readerUserId) return

      const friendId = friendByConversationIdRef.current.get(conversationId)

      if (friendId && readerUserId === String(currentUserId)) {
        setFriends((prev) => prev.map((friend) => {
          if (String(friend._id) !== String(friendId)) return friend
          return {
            ...friend,
            newMessagesCount: 0,
          }
        }))
      }

      if (String(activeConversationId) !== String(conversationId)) return

      if (readerUserId !== String(currentUserId)) {
        const readAt = payload?.readAt || payload?.data?.readAt || new Date().toISOString()
        setMessages((prev) => prev.map((message) => {
          if (!message?.isMine) return message
          return {
            ...message,
            readAt,
          }
        }))
      }
    }

    socket.on('chat:message:new', handleMessageNew)
    socket.on('chat:conversation:updated', handleConversationUpdated)
    socket.on('chat:conversation:read', handleConversationRead)

    return () => {
      socket.off('chat:message:new', handleMessageNew)
      socket.off('chat:conversation:updated', handleConversationUpdated)
      socket.off('chat:conversation:read', handleConversationRead)
    }
  }, [activeConversationId, currentUserId, isOpen, setFriendPreview, setFriends, token])

  const sendMessage = async () => {
    const content = String(messageInput || '').trim()
    if (!content || !activeConversationId) return

    setIsSending(true)
    const tempMessageId = createTempMessageId()
    const optimisticMessage = normalizeChatMessage({
      _id: tempMessageId,
      content,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      isMine: true,
      status: 'sending',
    }, {
      fallbackSenderId: currentUserId || null,
      forceMine: true,
    })

    if (optimisticMessage) {
      setMessages((prev) => mergeIncomingMessage(prev, optimisticMessage))
      if (selectedConversation?._id) {
        setFriendPreview(selectedConversation._id, optimisticMessage.content, {
          incrementUnread: false,
          resetUnread: true,
          createdAt: optimisticMessage.createdAt,
        })
      }
      setMessageInput('')
    }

    try {
      const response = await chatService.sendMessage(activeConversationId, content)
      const normalized = normalizeChatMessage(
        response?.message || response?.data?.message || response,
        {
          fallbackSenderId: currentUserId || null,
          forceMine: true,
        }
      )
      if (normalized) {
        const normalizedWithStatus = {
          ...normalized,
          _id: normalized._id || tempMessageId,
          status: 'sent',
        }

        setMessages((prev) => {
          const withoutTemp = prev.filter((message) => String(message._id) !== String(tempMessageId))
          return mergeIncomingMessage(withoutTemp, normalizedWithStatus)
        })

        if (selectedConversation?._id) {
          setFriendPreview(selectedConversation._id, normalizedWithStatus.content, {
            incrementUnread: false,
            resetUnread: true,
            createdAt: normalizedWithStatus.createdAt,
          })
        }
      }
    } catch {
      setMessages((prev) => prev.map((message) => (
        String(message._id) === String(tempMessageId)
          ? { ...message, status: 'failed' }
          : message
      )))
    } finally {
      setIsSending(false)
    }
  }

  const viewMessages = useMemo(() => {
    return messages
      .filter((message) => String(message?.content || '').trim().length > 0)
      .map((message) => ({
      ...message,
      sender: message.isMine || (message.senderId && currentUserId && String(message.senderId) === currentUserId) ? 'me' : 'them',
      time: toTimeLabel(message.createdAt),
      fullTime: toDateTimeLabel(message.createdAt),
      text: message.content,
      deliveryStatus: message.isMine
        ? (message.readAt
          ? 'Đã xem'
          : message.status === 'sending'
            ? 'Đang gửi'
            : message.status === 'failed'
              ? 'Gửi lỗi'
              : 'Đã gửi')
        : '',
      }))
  }, [currentUserId, messages])

  return {
    isMessagesLoading,
    isSending,
    messages: viewMessages,
    sendMessage,
  }
}

export default useChatDirectConversationRuntime
