import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, register, logout, clearError, suggestUsername, setUsername } from '../store/authSlice'
import { canAccessAdminDashboard } from '@/utils/auth'

/**
 * Custom Hook quản lý xác thực.
 * Tách logic auth khỏi component, giữ component clean.
 *
 * Cách dùng:
 *   const { user, isLoading, handleLogin, handleLogout } = useAuth()
 */
const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, role, token, isLoading, error } = useSelector((state) => state.auth)

  const isAuthenticated = !!token

  // Đăng nhập
  const handleLogin = async (credentials) => {
    const result = await dispatch(login(credentials))
    if (result.meta.requestStatus === 'fulfilled') {
      const nextUser = result.payload?.user
      navigate(canAccessAdminDashboard(nextUser, role) ? '/admin' : '/')
    }
    return result
  }

  // Đăng ký (Bước 1: giới hạn tại form, không auto-navigate)
  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData))
    // Không navigate ở đây vì user chưa xác thực email và chưa chọn username
    return result
  }

  // Gợi ý username (Bước 3)
  const handleSuggestUsername = async (data) => {
    const result = await dispatch(suggestUsername(data))
    return result
  }

  // Set username (Bước 3)
  const handleSetUsername = async (data) => {
    const result = await dispatch(setUsername(data))
    if (result.meta.requestStatus === 'fulfilled') {
      const nextUser = result.payload?.user
      navigate(canAccessAdminDashboard(nextUser, role) ? '/admin' : '/')
    }
    return result
  }

  // Đăng xuất
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Xóa lỗi
  const handleClearError = () => dispatch(clearError())

  return {
    user,
    role,
    token,
    isLoading,
    error,
    isAuthenticated,
    handleLogin,
    handleRegister,
    handleSuggestUsername,
    handleSetUsername,
    handleLogout,
    handleClearError,
  }
}

export default useAuth
