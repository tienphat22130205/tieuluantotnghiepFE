import { extractItems } from '@/utils/friendship'

export const normalizeFriendUser = (item) => {
  const source = item?.user || item?.friend || item || {}
  const userId = source?._id || source?.id || source?.userId
  if (!userId) return null

  const fullName =
    source?.full_name
    || source?.fullName
    || source?.name
    || `${source?.first_name || source?.firstName || ''} ${source?.last_name || source?.lastName || ''}`.trim()

  return {
    _id: String(userId),
    username: source?.username || source?.userName || '',
    full_name: fullName || source?.username || 'Nguoi dung',
    avatar: source?.avatar || source?.profile_pic || null,
    isOnline: Boolean(source?.isOnline),
    lastSeen: source?.lastSeen || source?.last_seen || null,
  }
}

export const mapPresenceItems = (payload) => {
  const base = payload?.data || payload || {}
  const items = extractItems(base)

  if (items.length > 0) {
    return items
      .map((item) => {
        const id = item?.userId || item?._id || item?.id || item?.user?._id || item?.user?.id
        if (!id) return null
        return {
          userId: String(id),
          isOnline: Boolean(item?.isOnline),
          lastSeen: item?.lastSeen || item?.last_seen || null,
        }
      })
      .filter(Boolean)
  }

  const singleId = base?.userId || base?._id || base?.id
  if (!singleId) return []

  return [{
    userId: String(singleId),
    isOnline: Boolean(base?.isOnline),
    lastSeen: base?.lastSeen || base?.last_seen || null,
  }]
}
