/**
 * Role-based redirect utility
 * Maps role to appropriate dashboard/home page
 */

export const ROLE_PATHS = {
  admin: '/admin',
  moderator: '/admin',
  user: '/',
}

/**
 * Lấy đường dẫn redirect dựa trên role
 * @param {string} role - role của user (admin, moderator, user)
 * @returns {string} - đường dẫn redirect (e.g. /admin, /home)
 */
export const getRedirectPathByRole = (role) => {
  if (!role) return '/'
  return ROLE_PATHS[role.toLowerCase()] || '/'
}
