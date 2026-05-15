const normalizeRoleToken = (value) => {
  const roleText = String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (!roleText) return ''
  if (roleText.includes('MODERATOR') || roleText.includes('KIEM DUYET')) return 'MODERATOR'
  if (roleText.includes('ADMIN') || roleText.includes('QUAN TRI')) return 'ADMIN'
  if (roleText.includes('USER') || roleText.includes('MEMBER') || roleText.includes('THANH VIEN')) return 'USER'
  return roleText
}

/**
 * Chuẩn hóa role từ nhiều format backend khác nhau.
 */
export const getRoleValue = (user, explicitRole) => {
  const roleCandidates = [
    explicitRole,
    user?.role,
    user?.roleName,
    user?.rolename,
    user?.userRole,
  ]

  for (const candidate of roleCandidates) {
    if (!candidate) continue

    if (typeof candidate === 'string') {
      const normalized = normalizeRoleToken(candidate)
      if (normalized) return normalized
    }

    if (typeof candidate === 'object') {
      const nested = [candidate?.role, candidate?.name, candidate?.roleName, candidate?.rolename]
      for (const item of nested) {
        const normalized = normalizeRoleToken(item)
        if (normalized) return normalized
      }
    }
  }

  return ''
}

export const isAdminUser = (user, explicitRole) => {
  const roleValue = getRoleValue(user, explicitRole)
  return roleValue === 'ADMIN' || roleValue === 'ROLE_ADMIN'
}

export const isModeratorUser = (user, explicitRole) => {
  const roleValue = getRoleValue(user, explicitRole)
  return roleValue === 'MODERATOR' || roleValue === 'ROLE_MODERATOR'
}

export const canAccessAdminDashboard = (user, explicitRole) => (
  isAdminUser(user, explicitRole) || isModeratorUser(user, explicitRole)
)
