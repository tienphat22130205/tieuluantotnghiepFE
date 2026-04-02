export const getUserId = (user) => {
  if (!user) return null
  if (typeof user === 'string' || typeof user === 'number') return String(user)
  return String(user._id || user.id || user.userId || '') || null
}

export const isSameUser = (a, b) => {
  const idA = getUserId(a)
  const idB = getUserId(b)
  if (!idA || !idB) return false
  return idA === idB
}

export const normalizeVisibility = (visibility) => {
  if (visibility === 'me') return 'private'
  if (visibility === 'friends') return 'friends'
  return visibility === 'private' ? 'private' : 'public'
}

export const canViewPost = (post, { currentUserId, isFriend = false } = {}) => {
  if (!post) return false

  const ownerId = getUserId(post.user || post.author || post.author_id || post.user_id)
  const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId))
  const visibility = normalizeVisibility(post.visibility)

  if (visibility === 'public') return true
  if (visibility === 'private') return isOwner
  if (visibility === 'friends') return isOwner || Boolean(isFriend)
  return true
}

export const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.friends)) return payload.friends
  if (Array.isArray(payload?.requests)) return payload.requests
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data?.friends)) return payload.data.friends
  if (Array.isArray(payload?.data?.requests)) return payload.data.requests
  return []
}

export const normalizeRelationshipStatus = (payload, currentUserId, targetUserId) => {
  const data = payload?.data || payload || {}

  const areFriends = Boolean(
    data.areFriends
    || data.isFriend
    || data.friend
    || data.status === 'friends'
    || data.relation === 'friends'
  )

  const hasIncomingRequest = Boolean(
    data.hasIncomingRequest
    || data.incomingRequest
    || data.status === 'incoming_request'
    || data.relation === 'incoming_request'
  )

  const hasSentRequest = Boolean(
    data.hasSentRequest
    || data.sentRequest
    || data.outgoingRequest
    || data.status === 'sent_request'
    || data.relation === 'sent_request'
  )

  const requestId =
    data.requestId
    || data.friendRequestId
    || data.incomingRequestId
    || data.sentRequestId
    || data.request?._id
    || data.request?.id
    || null

  return {
    currentUserId: currentUserId ? String(currentUserId) : null,
    targetUserId: targetUserId ? String(targetUserId) : null,
    areFriends,
    hasIncomingRequest,
    hasSentRequest,
    requestId: requestId ? String(requestId) : null,
  }
}
