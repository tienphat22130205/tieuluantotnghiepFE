import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getRedirectPathByRole } from '@/utils/roleRedirect'

/**
 * Hook để tự động redirect user dựa trên role nếu họ truy cập sai trang
 * @param {string} requiredRole - role cần thiết để truy cập trang hiện tại (optional)
 * @returns {object} - { role, isLoading, shouldHaveAccess }
 *
 * Ví dụ:
 * - Nếu user là moderator nhưng truy cập /admin → sẽ redirect về /moderator
 * - Nếu user là user nhưng truy cập /admin → sẽ redirect về /home
 */
export const useRoleRedirect = (requiredRole = null) => {
  const navigate = useNavigate()
  const { role, isLoading, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isLoading || !token || !role) {
      return
    }

    // Nếu không yêu cầu role cụ thể, không cần redirect
    if (!requiredRole) {
      return
    }

    const hasAccess = role.toLowerCase() === requiredRole.toLowerCase()

    if (!hasAccess) {
      // User không có quyền truy cập, redirect về trang thích hợp
      const redirectPath = getRedirectPathByRole(role)
      navigate(redirectPath, { replace: true })
    }
  }, [role, isLoading, token, requiredRole, navigate])

  const shouldHaveAccess = !requiredRole || (role?.toLowerCase() === requiredRole.toLowerCase())

  return {
    role,
    isLoading,
    shouldHaveAccess,
  }
}

export default useRoleRedirect
