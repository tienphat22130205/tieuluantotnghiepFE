export const extractConversationPayload = (payload) => {
  if (!payload) return null

  return (
    payload?.conversation
    || payload?.data?.conversation
    || payload?.data
    || payload
  )
}

export const resolveConversationId = (payload) => {
  const conversation = extractConversationPayload(payload)
  return conversation?._id || conversation?.id || null
}

export const extractConversationsPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.conversations)) return payload.conversations
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.conversations)) return payload.data.conversations
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

const normalizeParticipant = (participant) => {
  if (!participant) return null

  if (typeof participant === 'string') {
    return { _id: participant }
  }

  if (participant?.user && typeof participant.user === 'object') {
    return {
      ...participant.user,
      _id: participant.user?._id || participant.user?.id || participant.user?.userId,
    }
  }

  return {
    ...participant,
    _id: participant?._id || participant?.id || participant?.userId,
  }
}

export const resolveDirectFriendIdFromConversation = (conversation, currentUserId) => {
  if (!conversation) return null

  const participantsRaw = []
  if (Array.isArray(conversation?.participants)) participantsRaw.push(...conversation.participants)
  if (Array.isArray(conversation?.members)) participantsRaw.push(...conversation.members)
  if (Array.isArray(conversation?.users)) participantsRaw.push(...conversation.users)

  const participants = participantsRaw
    .map((item) => normalizeParticipant(item))
    .filter(Boolean)

  if (participants.length === 0) return null

  const friend = participants.find((item) => String(item?._id || '') !== String(currentUserId || ''))
  return friend?._id ? String(friend._id) : null
}

export const resolveConversationUnreadCount = (conversation) => {
  const nextUnreadCount = Number(
    conversation?.unreadCount
    ?? conversation?.unread_count
    ?? conversation?.unread
    ?? conversation?.unreadMessages
    ?? conversation?.unread_messages
    ?? conversation?.meta?.unreadCount
    ?? conversation?.meta?.unread_count
    ?? conversation?.meta?.unread
    ?? 0
  )

  if (!Number.isFinite(nextUnreadCount)) return 0
  return Math.max(0, nextUnreadCount)
}

export const resolveConversationLastMessageText = (conversation) => {
  const raw =
    conversation?.lastMessage?.content
    || conversation?.lastMessage?.text
    || conversation?.latestMessage?.content
    || conversation?.latestMessage?.text
    || conversation?.last_message?.content
    || conversation?.last_message?.text
    || conversation?.latest_message?.content
    || conversation?.latest_message?.text
    || ''

  return String(raw || '').trim()
}

export const resolveConversationLastMessageCreatedAt = (conversation) => {
  const raw =
    conversation?.lastMessage?.createdAt
    || conversation?.lastMessage?.created_at
    || conversation?.latestMessage?.createdAt
    || conversation?.latestMessage?.created_at
    || conversation?.last_message?.createdAt
    || conversation?.last_message?.created_at
    || conversation?.latest_message?.createdAt
    || conversation?.latest_message?.created_at
    || conversation?.updatedAt
    || conversation?.updated_at
    || null

  if (!raw) return null
  const date = new Date(raw)
  if (!Number.isFinite(date.getTime())) return null
  return date.toISOString()
}

export const extractMessagesPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.messages)) return payload.messages
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.messages)) return payload.data.messages
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

export const normalizeChatMessage = (message, options = {}) => {
  if (!message) return null

  const { fallbackSenderId, forceMine = false } = options

  const sender = message?.sender
  const senderId =
    (typeof sender === 'object' && sender !== null
      ? sender?._id || sender?.id || sender?.userId
      : sender)
    || message?.fromUser?._id
    || message?.fromUser?.id
    || message?.sender_id
    || message?.from_user_id
    || message?.user?._id
    || message?.user?.id
    || message?.senderId
    || message?.userId
    || fallbackSenderId
    || null

  return {
    ...message,
    _id: message?._id || message?.id,
    content: message?.content || message?.text || '',
    createdAt: message?.createdAt || message?.created_at || new Date().toISOString(),
    senderId: senderId ? String(senderId) : null,
    isMine: Boolean(forceMine || message?.isMine || message?.is_mine),
    readAt: message?.readAt || message?.read_at || null,
    status: message?.status || null,
  }
}
