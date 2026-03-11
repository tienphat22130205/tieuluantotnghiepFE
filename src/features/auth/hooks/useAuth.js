import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, register, logout, clearError } from '../store/authSlice'

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
  const { user, token, isLoading, error } = useSelector((state) => state.auth)

  const isAuthenticated = !!token

  // Đăng nhập
  const handleLogin = async (credentials) => {
    const result = await dispatch(login(credentials))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/')
    }
    return result
  }

  // Đăng ký
  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/')
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
    token,
    isLoading,
    error,
    isAuthenticated,
    handleLogin,
    handleRegister,
    handleLogout,
    handleClearError,
  }
}

export default useAuth
