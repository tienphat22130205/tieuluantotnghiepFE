export const getItemsFromResponse = (response) => {
  if (Array.isArray(response?.data?.items)) return response.data.items
  if (Array.isArray(response?.data?.notifications)) return response.data.notifications
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.notifications)) return response.notifications
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

export const getMetaFromResponse = (response, fallbackPage, fallbackLimit, fallbackLength) => {
  const data = response?.data || response || {}
  const meta = data?.meta || {}

  const page = Number(meta?.page || data?.page || fallbackPage || 1)
  const limit = Number(meta?.limit || data?.limit || fallbackLimit || 20)
  const totalItems = Number(meta?.totalItems || meta?.total || data?.totalItems || data?.total || fallbackLength || 0)
  const totalPages = Number(meta?.totalPages || data?.totalPages || Math.ceil(totalItems / Math.max(limit, 1)) || 1)

  return {
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, totalPages),
  }
}

const resolveNotificationPostId = (item, notificationId) => {
  const hasPostObject = item?.post && typeof item.post === 'object'
  const candidates = [
    item?.post?._id,
    item?.post?.id,
    typeof item?.post === 'string' ? item.post : null,
    item?.postId,
    item?.post_id,
    item?.target?.postId,
    item?.target?.post_id,
    item?.targetId,
    item?.target_id,
    item?.entity?.postId,
    item?.entity?.post_id,
    item?.resource?.postId,
    item?.resource?.post_id,
  ].filter(Boolean)

  const resolved = candidates.find((candidate) => {
    if (!candidate) return false
    if (!hasPostObject && String(candidate) === String(notificationId)) return false
    return true
  })

  return resolved ? String(resolved) : null
}

const resolveNotificationAction = (item, notificationId) => {
  const explicitPath = item?.actionPath || item?.path || item?.link || item?.url
  if (typeof explicitPath === 'string' && explicitPath.startsWith('/')) {
    return { label: 'Xem chi tiết', path: explicitPath }
  }

  const type = String(item?.type || '').toLowerCase()
  const actor = item?.actor || item?.fromUser || item?.sender || item?.user || null
  const actorIdentifier = actor?.username ? String(actor.username).replace(/^@/, '') : (actor?._id || actor?.id || item?.actorId || null)
  const postId = resolveNotificationPostId(item, notificationId)

  if (postId) {
    return { label: 'Mở bài viết', path: `/post/${postId}` }
  }

  if (type.includes('friend')) {
    return { label: 'Xem bạn bè', path: '/friends' }
  }

  if (actorIdentifier) {
    return { label: 'Xem hồ sơ', path: `/profile/${actorIdentifier}` }
  }

  return { label: 'Xem chi tiết', path: '/notifications' }
}

export const normalizeNotification = (item) => {
  const id = item?._id || item?.id
  const actor = item?.actor || item?.fromUser || item?.sender || item?.user || item?.author || null
  const actorName = actor?.full_name || actor?.fullName || actor?.name || actor?.username || item?.senderName || item?.actorName || 'Ai đó'
  const avatar = actor?.avatar || actor?.avatarUrl || actor?.profilePicture || actor?.profile_picture || item?.avatar || item?.senderAvatar || null

  const action = resolveNotificationAction(item, id)
  const type = item?.type || 'system'
  const isRead = Boolean(item?.isRead || item?.read || item?.readAt)
  const isDeleted = Boolean(item?.isDeleted || item?.deletedAt || item?.deleted_at)

  return {
    id,
    type,
    title: item?.title || `${actorName} có cập nhật mới`,
    description: item?.description || item?.content || item?.message || 'Bạn có một thông báo mới.',
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
    actionLabel: action.label,
    actionPath: action.path,
    isUnread: !isRead,
    isDeleted,
    actor,
    sender: {
      ...actor,
      fullName: actorName,
      avatar,
    },
  }
}
