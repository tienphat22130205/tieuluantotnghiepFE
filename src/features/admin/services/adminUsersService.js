import api from '@/services/api'

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.users)) return payload.data.users
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.result?.users)) return payload.result.users
  if (Array.isArray(payload?.result?.items)) return payload.result.items
  return []
}

const toIsoOrNull = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return date.toISOString()
}

const formatLastActive = (value) => {
  const isoValue = toIsoOrNull(value)
  if (!isoValue) return '--'

  return new Date(isoValue).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const resolveStatus = (item) => {
  const rawStatus = String(item?.status || '').toLowerCase()
  if (rawStatus === 'banned' || rawStatus === 'locked' || rawStatus === 'inactive') return 'locked'

  const isBanned = Boolean(
    item?.isBanned
    || item?.banned
    || item?.is_banned
    || item?.isLocked
    || item?.is_locked
  )

  return isBanned ? 'locked' : 'active'
}

const normalizeRole = (role) => {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'member') return 'user'
  if (normalized === 'user' || normalized === 'moderator' || normalized === 'admin') return normalized
  return 'user'
}

const resolveBanReason = (item) => {
  return (
    item?.banReason
    || item?.ban_reason
    || item?.reason
    || item?.lockReason
    || item?.lock_reason
    || item?.meta?.banReason
    || item?.meta?.reason
    || ''
  )
}

const normalizeUser = (item) => {
  const userId = item?._id || item?.id || item?.userId || item?.user_id
  if (!userId) return null

  const fullName =
    item?.full_name
    || item?.fullName
    || item?.name
    || `${item?.first_name || item?.firstName || ''} ${item?.last_name || item?.lastName || ''}`.trim()
    || 'Người dùng'

  const role = normalizeRole(item?.role)
  const status = resolveStatus(item)
  const lastActiveRaw = item?.lastActive || item?.last_active || item?.updatedAt || item?.updated_at || item?.createdAt || item?.created_at

  return {
    id: String(userId),
    fullName,
    email: item?.email || '--',
    role,
    status,
    lastActive: formatLastActive(lastActiveRaw),
    lastActiveAt: toIsoOrNull(lastActiveRaw),
    lockReason: resolveBanReason(item),
    banUntil: toIsoOrNull(item?.banUntil || item?.ban_until),
  }
}

const normalizePagination = (payload, fallbackPage, fallbackLimit) => {
  const meta = payload?.pagination || payload?.meta || payload?.data?.pagination || payload?.data?.meta || {}

  const page = Number(meta?.page || payload?.page || fallbackPage || 1)
  const limit = Number(meta?.limit || payload?.limit || fallbackLimit || 20)
  const totalItems = Number(
    meta?.total
    || meta?.totalItems
    || meta?.total_items
    || payload?.total
    || payload?.totalItems
    || payload?.total_items
    || 0
  )

  const totalPages = Number(
    meta?.totalPages
    || meta?.total_pages
    || payload?.totalPages
    || payload?.total_pages
    || (Number.isFinite(totalItems) && limit > 0 ? Math.ceil(totalItems / limit) : 1)
  )

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    totalItems: Number.isFinite(totalItems) && totalItems >= 0 ? totalItems : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

const extractUnbanRequestItems = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.requests)) return payload.requests
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.requests)) return payload.data.requests
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.result?.requests)) return payload.result.requests
  if (Array.isArray(payload?.result?.items)) return payload.result.items
  return []
}

const normalizeUnbanRequest = (item) => {
  const requestId = item?._id || item?.id || item?.requestId || item?.request_id
  if (!requestId) return null

  const status = String(item?.status || 'pending').toLowerCase()

  return {
    id: String(requestId),
    email: item?.email || item?.user?.email || '--',
    reason: item?.reason || item?.requestReason || item?.content || '--',
    status: ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending',
    adminNote: item?.adminNote || item?.admin_note || '',
    createdAt: item?.createdAt || item?.created_at || null,
    reviewedAt: item?.reviewedAt || item?.reviewed_at || item?.updatedAt || item?.updated_at || null,
  }
}

const listAdminUsers = async ({ page = 1, limit = 20, status = 'all', q = '' } = {}) => {
  const response = await api.get('/auth/admin/users', {
    params: { page, limit, status, q },
  })

  const users = extractItems(response)
    .map((item) => normalizeUser(item))
    .filter(Boolean)

  return {
    users,
    stats: response?.data?.stats || response?.stats || null,
    pagination: normalizePagination(response, page, limit),
  }
}

const banUser = async (userId, body) => {
  return api.patch(`/auth/users/${userId}/ban`, body)
}

const unbanUser = async (userId) => {
  return api.patch(`/auth/users/${userId}/unban`)
}

const updateUserRole = async (userId, role) => {
  return api.patch(`/auth/users/${userId}/role`, { role })
}

const listAdminUnbanRequests = async ({ status = 'pending', page = 1, limit = 20 } = {}) => {
  const response = await api.get('/auth/admin/unban-requests', {
    params: { status, page, limit },
  })

  const requests = extractUnbanRequestItems(response)
    .map((item) => normalizeUnbanRequest(item))
    .filter(Boolean)

  return {
    requests,
    pagination: normalizePagination(response, page, limit),
  }
}

const reviewAdminUnbanRequest = async (requestId, { decision, adminNote }) => {
  return api.patch(`/auth/admin/unban-requests/${requestId}/review`, {
    decision,
    adminNote,
  })
}

const adminUsersService = {
  listAdminUsers,
  banUser,
  unbanUser,
  updateUserRole,
  listAdminUnbanRequests,
  reviewAdminUnbanRequest,
}

export default adminUsersService
