/**
 * Chuẩn hóa role từ nhiều format backend khác nhau.
 */
export const getRoleValue = (user) => {
  const role = user?.role

  if (!role) return ''
  if (typeof role === 'string') return role.toUpperCase()
  if (typeof role === 'object') {
    return String(role?.role || role?.name || '').toUpperCase()
  }

  return ''
}

export const isAdminUser = (user) => {
  const roleValue = getRoleValue(user)
  return roleValue === 'ROLE_ADMIN' || roleValue === 'ADMIN'
}
