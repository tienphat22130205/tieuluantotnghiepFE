import { create } from 'zustand'
import chatService from '../services/chatService'
import { getSocket } from '@/services/socketClient'
import { usePresenceStore } from './usePresenceStore'
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

console.log('✅ [useChatStore] New version loaded successfully')

const conversationByFriendId = new Map()
const friendByConversationId = new Map()
let joinedConversationId = null

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

  const existing = prev[existingIndex]

  let mergedReplyTo = incoming.replyTo || existing.replyTo
  if (existing.replyTo && incoming.replyTo) {
    const existingContent = existing.replyTo.content || existing.replyTo.text || ''
    const incomingContent = incoming.replyTo.content || incoming.replyTo.text || ''
    const existingSender = existing.replyTo.sender
    const incomingSender = incoming.replyTo.sender

    mergedReplyTo = {
      ...existing.replyTo,
      ...incoming.replyTo,
      content: incomingContent || existingContent,
      text: incomingContent || existingContent,
      sender:
        incomingSender && (incomingSender.username || incomingSender.full_name || incomingSender._id)
          ? { ...existingSender, ...incomingSender }
          : existingSender,
    }
  } else if (existing.replyTo && !incoming.replyTo) {
    mergedReplyTo = existing.replyTo
  }

  const merged = {
    ...existing,
    ...incoming,
    isMine: Boolean(existing.isMine || incoming.isMine),
    status: incoming.status || existing.status || 'sent',
    replyTo: mergedReplyTo,
    content: incoming.content || existing.content || '',
  }

  const next = [...prev]
  next[existingIndex] = merged
  return next
}

const createTempMessageId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useChatStore = create((set, get) => ({
  messages: [],
  isMessagesLoading: false,
  isSending: false,
  activeConversationId: null,
  selectedConversation: null,
  replyToMessage: null,

  setReplyToMessage: (msg) => set({ replyToMessage: msg }),

  fetchConversations: async (currentUserId) => {
    try {
      const response = await chatService.getMyConversations({ page: 1, limit: 50 })
      const list = extractConversationsPayload(response)

      list.forEach((convo) => {
        const convoId = resolveConversationId(convo)
        const friendId = resolveDirectFriendIdFromConversation(convo, currentUserId)
        if (!convoId || !friendId) return

        conversationByFriendId.set(String(friendId), String(convoId))
        friendByConversationId.set(String(convoId), String(friendId))

        // Update preview info in the presence store (friends list)
        get().updateFriendPreview(friendId, resolveConversationLastMessageText(convo), {
          incrementUnread: false,
          resetUnread: false,
          createdAt: resolveConversationLastMessageCreatedAt(convo),
          forceUnreadCount: resolveConversationUnreadCount(convo),
        })
      })
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    }
  },

  openConversation: async (friend, token, currentUserId) => {
    if (!friend) return
    const friendId = String(
      (typeof friend === 'object' ? friend._id || friend.id : friend) || ''
    )
    if (!friendId || friendId === 'undefined' || friendId === 'null') return

    let convoId =
      conversationByFriendId.get(friendId) ||
      (typeof friend === 'object' && friend?.conversationId ? String(friend.conversationId) : null)

    if (!convoId && friendByConversationId.has(friendId)) {
      convoId = friendId
    }

    // If this conversation is ALREADY active, simply sync selectedConversation and stop!
    if (
      get().activeConversationId &&
      (String(get().activeConversationId) === String(convoId) ||
        String(get().activeConversationId) === String(friendId))
    ) {
      if (typeof friend === 'object') {
        set({ selectedConversation: friend })
      }
      return
    }

    if (get().isMessagesLoading) {
      return
    }

    set({ isMessagesLoading: true, selectedConversation: typeof friend === 'object' ? friend : null })
    const socket = getSocket(token)

    try {
      if (!convoId) {
        try {
          const convoResponse = await chatService.createOrGetDirectConversation(friendId)
          const convo = extractConversationPayload(convoResponse)
          convoId = resolveConversationId(convo)
        } catch (apiErr) {
          convoId = friendId
        }

        if (convoId) {
          conversationByFriendId.set(friendId, String(convoId))
          friendByConversationId.set(String(convoId), String(friendId))
        }
      }

      if (!convoId) {
        if (!get().messages || get().messages.length === 0) {
          set({ messages: [], activeConversationId: null })
        }
        return
      }

      if (socket) {
        if (joinedConversationId && String(joinedConversationId) !== String(convoId)) {
          socket.emit('chat:leave', joinedConversationId)
        }
        socket.emit('chat:join', convoId)
        joinedConversationId = String(convoId)
      }

      set({ activeConversationId: String(convoId) })

      // Clear unread badge locally via presence store
      get().updateFriendPreview(friendId, null, {
        incrementUnread: false,
        resetUnread: true,
      })

      const messagesResponse = await chatService.getConversationMessages(convoId, {
        page: 1,
        limit: 30,
      })
      const rawMsgs = extractMessagesPayload(messagesResponse)
      const normalized = rawMsgs
        .map((item) => normalizeChatMessage(item, { fallbackSenderId: null }))
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      set({ messages: normalized })

      chatService.markConversationAsRead(convoId).catch(() => {})
    } catch (err) {
      console.error('Failed to open conversation:', err)
      if (!get().messages || get().messages.length === 0) {
        set({ messages: [] })
      }
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  closeConversation: (socket) => {
    if (socket && joinedConversationId) {
      socket.emit('chat:leave', joinedConversationId)
    }
    joinedConversationId = null
    set({
      messages: [],
      activeConversationId: null,
      selectedConversation: null,
      replyToMessage: null,
    })
  },

  sendMessage: async (content, currentUserId, userUsername) => {
    const { activeConversationId, selectedConversation, replyToMessage } = get()
    if (!content || !activeConversationId) return

    set({ isSending: true })
    const tempId = createTempMessageId()

    const optimisticReplyTo = replyToMessage
      ? {
          _id: replyToMessage._id || replyToMessage.id,
          content: replyToMessage.text || replyToMessage.content || '',
          type: replyToMessage.type || 'text',
          sticker: replyToMessage.sticker || null,
          sender:
            typeof replyToMessage.sender === 'object' && replyToMessage.sender !== null
              ? replyToMessage.sender
              : {
                  _id:
                    replyToMessage.sender === 'me'
                      ? currentUserId
                      : replyToMessage.senderId || selectedConversation?._id,
                  username:
                    replyToMessage.sender === 'me'
                      ? userUsername
                      : selectedConversation?.username || 'user',
                  full_name:
                    replyToMessage.sender === 'me'
                      ? 'Bạn'
                      : selectedConversation?.full_name || selectedConversation?.fullName || 'Người dùng',
                },
        }
      : null

    const optimistic = normalizeChatMessage(
      {
        _id: tempId,
        content,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        isMine: true,
        status: 'sending',
        replyTo: optimisticReplyTo,
      },
      {
        fallbackSenderId: currentUserId,
        forceMine: true,
      }
    )

    if (optimistic) {
      set((state) => ({
        messages: mergeIncomingMessage(state.messages, optimistic),
      }))
      get().updateFriendPreview(selectedConversation?._id, optimistic.content, {
        incrementUnread: false,
        resetUnread: true,
        createdAt: optimistic.createdAt,
      })
    }

    try {
      const response = await chatService.sendMessage(activeConversationId, content, {
        replyTo: replyToMessage?._id || replyToMessage?.id || null,
      })
      const normalized = normalizeChatMessage(
        response?.message || response?.data?.message || response,
        {
          fallbackSenderId: currentUserId,
          forceMine: true,
        }
      )
      if (normalized) {
        const resolvedReplyTo =
          normalized.replyTo && typeof normalized.replyTo === 'object' && (normalized.replyTo.content || normalized.replyTo.text)
            ? normalized.replyTo
            : optimisticReplyTo

        const finalMsg = {
          ...normalized,
          _id: normalized._id || tempId,
          status: 'sent',
          replyTo: resolvedReplyTo,
        }
        set((state) => ({
          messages: mergeIncomingMessage(
            state.messages.filter((m) => String(m._id) !== String(tempId)),
            finalMsg
          ),
        }))
        get().updateFriendPreview(selectedConversation?._id, finalMsg.content, {
          incrementUnread: false,
          resetUnread: true,
          createdAt: finalMsg.createdAt,
        })
        set({ replyToMessage: null })
      }
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(tempId) ? { ...m, status: 'failed' } : m
        ),
      }))
    } finally {
      set({ isSending: false })
    }
  },

  sendSticker: async (stickerUrl, currentUserId, userUsername) => {
    const { activeConversationId, selectedConversation, replyToMessage } = get()
    if (!stickerUrl || !activeConversationId) return

    set({ isSending: true })
    const tempId = createTempMessageId()

    const optimisticReplyTo = replyToMessage
      ? {
          _id: replyToMessage._id || replyToMessage.id,
          content: replyToMessage.text || replyToMessage.content || '',
          type: replyToMessage.type || 'text',
          sticker: replyToMessage.sticker || null,
          sender:
            typeof replyToMessage.sender === 'object' && replyToMessage.sender !== null
              ? replyToMessage.sender
              : {
                  _id:
                    replyToMessage.sender === 'me'
                      ? currentUserId
                      : replyToMessage.senderId || selectedConversation?._id,
                  username:
                    replyToMessage.sender === 'me'
                      ? userUsername
                      : selectedConversation?.username || 'user',
                  full_name:
                    replyToMessage.sender === 'me'
                      ? 'Bạn'
                      : selectedConversation?.full_name || selectedConversation?.fullName || 'Người dùng',
                },
        }
      : null

    const optimistic = normalizeChatMessage(
      {
        _id: tempId,
        content: '[Sticker]',
        type: 'sticker',
        sticker: stickerUrl,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        isMine: true,
        status: 'sending',
        replyTo: optimisticReplyTo,
      },
      {
        fallbackSenderId: currentUserId,
        forceMine: true,
      }
    )

    if (optimistic) {
      set((state) => ({
        messages: mergeIncomingMessage(state.messages, optimistic),
      }))
      get().updateFriendPreview(selectedConversation?._id, '[Sticker]', {
        incrementUnread: false,
        resetUnread: true,
        createdAt: optimistic.createdAt,
      })
    }

    try {
      const response = await chatService.sendMessage(activeConversationId, '', {
        type: 'sticker',
        stickerUrl,
        replyTo: replyToMessage?._id || replyToMessage?.id || null,
      })
      const normalized = normalizeChatMessage(
        response?.message || response?.data?.message || response,
        {
          fallbackSenderId: currentUserId,
          forceMine: true,
        }
      )
      if (normalized) {
        const resolvedReplyTo =
          normalized.replyTo && typeof normalized.replyTo === 'object' && (normalized.replyTo.content || normalized.replyTo.text)
            ? normalized.replyTo
            : optimisticReplyTo

        const finalMsg = {
          ...normalized,
          _id: normalized._id || tempId,
          status: 'sent',
          replyTo: resolvedReplyTo,
        }
        set((state) => ({
          messages: mergeIncomingMessage(
            state.messages.filter((m) => String(m._id) !== String(tempId)),
            finalMsg
          ),
        }))
        get().updateFriendPreview(selectedConversation?._id, '[Sticker]', {
          incrementUnread: false,
          resetUnread: true,
          createdAt: finalMsg.createdAt,
        })
        set({ replyToMessage: null })
      }
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(tempId) ? { ...m, status: 'failed' } : m
        ),
      }))
    } finally {
      set({ isSending: false })
    }
  },

  toggleReaction: async (messageId, emojiType, currentUserId, userUsername) => {
    try {
      set((state) => ({
        messages: state.messages.map((msg) => {
          if (String(msg._id || msg.id) !== String(messageId)) return msg

          const list = Array.isArray(msg.reactions) ? msg.reactions : []
          const existing = list.findIndex(
            (r) => String(r.user?._id || r.user || '') === String(currentUserId)
          )

          let next = [...list]
          if (existing > -1) {
            if (next[existing].type === emojiType) {
              next.splice(existing, 1)
            } else {
              next[existing] = { ...next[existing], type: emojiType }
            }
          } else {
            next.push({ user: { _id: currentUserId, username: userUsername }, type: emojiType })
          }
          return { ...msg, reactions: next }
        }),
      }))

      await chatService.toggleMessageReaction(messageId, emojiType)
    } catch (err) {
      // Revert/ignore
    }
  },

  updateFriendPreview: (friendId, content, options = {}) => {
    if (!friendId) return
    const { incrementUnread = false, resetUnread = false, createdAt = null, forceUnreadCount = null } = options

    usePresenceStore.setState((state) => ({
      friends: state.friends.map((friend) => {
        if (String(friend._id || friend.id) !== String(friendId)) return friend

        let nextUnread
        if (forceUnreadCount !== null && forceUnreadCount !== undefined) {
          nextUnread = Math.max(0, Number(forceUnreadCount))
        } else {
          const currentUnread = Number(friend.newMessagesCount || 0)
          nextUnread = currentUnread
          if (resetUnread) {
            nextUnread = 0
          } else if (incrementUnread) {
            nextUnread = currentUnread + 1
          }
        }

        return {
          ...friend,
          lastMessagePreview: content !== null ? (String(content || '').trim() || friend.lastMessagePreview || '') : friend.lastMessagePreview || '',
          lastMessageAt: createdAt || friend.lastMessageAt || null,
          newMessagesCount: Math.max(0, nextUnread),
        }
      }),
    }))
  },

  getViewMessages: (currentUserId) => {
    const { messages } = get()
    return messages
      .filter(
        (message) => String(message?.content || '').trim().length > 0 || message.type === 'sticker'
      )
      .map((message) => {
        const isMine =
          message.isMine ||
          (message.senderId && currentUserId && String(message.senderId) === currentUserId)
        return {
          ...message,
          sender: isMine ? 'me' : 'them',
          time: toTimeLabel(message.createdAt),
          fullTime: toDateTimeLabel(message.createdAt),
          text: message.content,
          deliveryStatus: isMine
            ? message.readAt
              ? 'Đã xem'
              : message.status === 'sending'
              ? 'Đang gửi'
              : message.status === 'failed'
              ? 'Gửi lỗi'
              : 'Đã gửi'
            : '',
        }
      })
  },

  setupSocketListeners: (socket, currentUserId) => {
    if (!socket) return null

    const handleMessageNew = (payload) => {
      const convoId = String(
        payload?.conversationId ||
          payload?.data?.conversationId ||
          payload?.message?.conversationId ||
          payload?.message?.conversation ||
          ''
      )
      if (!convoId) return

      const normalized = normalizeChatMessage(payload?.message || payload?.data?.message || payload)
      if (!normalized) return

      const friendId = friendByConversationId.get(convoId)
      const isMine = Boolean(
        normalized.isMine ||
          (normalized.senderId && currentUserId && String(normalized.senderId) === String(currentUserId))
      )

      const { activeConversationId } = get()
      if (String(activeConversationId) === convoId) {
        set((state) => ({
          messages: mergeIncomingMessage(state.messages, { ...normalized, isMine }),
        }))
        if (friendId) {
          get().updateFriendPreview(friendId, normalized.content, {
            incrementUnread: false,
            createdAt: normalized.createdAt,
          })
        }
        return
      }

      if (friendId) {
        get().updateFriendPreview(friendId, normalized.content, {
          incrementUnread: !isMine && Boolean(normalized.senderId),
          createdAt: normalized.createdAt,
        })
      }
    }

    const handleConversationUpdated = (payload) => {
      const convoId = String(payload?.conversationId || payload?.data?.conversationId || '')
      if (!convoId) return

      const friendId = friendByConversationId.get(convoId)
      if (!friendId) return

      const content =
        payload?.lastMessage?.content ||
        payload?.lastMessage?.text ||
        payload?.data?.lastMessage?.content ||
        payload?.data?.lastMessage?.text ||
        ''

      const createdAt =
        payload?.lastMessage?.createdAt ||
        payload?.lastMessage?.created_at ||
        payload?.data?.lastMessage?.createdAt ||
        payload?.data?.lastMessage?.created_at ||
        new Date().toISOString()

      const unreadCountRaw =
        payload?.unreadCount ??
        payload?.unread_count ??
        payload?.unread ??
        payload?.data?.unreadCount ??
        payload?.data?.unread_count ??
        payload?.data?.unread ??
        null
      const parsedUnread = Number(unreadCountRaw)
      const hasUnread = Number.isFinite(parsedUnread)

      get().updateFriendPreview(friendId, content, {
        createdAt,
        forceUnreadCount: hasUnread ? parsedUnread : null,
      })
    }

    const handleConversationRead = (payload) => {
      const convoId = String(payload?.conversationId || payload?.data?.conversationId || '')
      const readerUserId = String(payload?.userId || payload?.data?.userId || '')
      if (!convoId || !readerUserId) return

      const friendId = friendByConversationId.get(convoId)
      if (friendId && readerUserId === String(currentUserId)) {
        get().updateFriendPreview(friendId, null, {
          incrementUnread: false,
          resetUnread: true,
        })
      }

      const { activeConversationId } = get()
      if (String(activeConversationId) !== String(convoId)) return

      if (readerUserId !== String(currentUserId)) {
        const readAt = payload?.readAt || payload?.data?.readAt || new Date().toISOString()
        set((state) => ({
          messages: state.messages.map((message) => {
            if (!message?.isMine) return message
            return { ...message, readAt }
          }),
        }))
      }
    }

    const handleMessageReactionUpdated = (payload) => {
      const { messageId, reactions } = payload || {}
      if (!messageId) return

      set((state) => ({
        messages: state.messages.map((msg) =>
          String(msg._id || msg.id) === String(messageId) ? { ...msg, reactions } : msg
        ),
      }))
    }

    socket.on('chat:message:new', handleMessageNew)
    socket.on('chat:conversation:updated', handleConversationUpdated)
    socket.on('chat:conversation:read', handleConversationRead)
    socket.on('chat:message:reaction:updated', handleMessageReactionUpdated)

    return () => {
      socket.off('chat:message:new', handleMessageNew)
      socket.off('chat:conversation:updated', handleConversationUpdated)
      socket.off('chat:conversation:read', handleConversationRead)
      socket.off('chat:message:reaction:updated', handleMessageReactionUpdated)
    }
  },
}))
