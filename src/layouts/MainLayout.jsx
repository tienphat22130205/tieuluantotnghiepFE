import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Navbar from './components/Navbar'
import UsernameSelectionModal from '@/features/auth/components/UsernameSelectionModal'
import { suggestUsername, setUsername } from '@/features/auth/store/authSlice'

/**
 * MainLayout – Bố cục chung cho các trang đã đăng nhập.
 * Bao gồm: Navbar (top) + Nội dung chính (center) + Footer (optional).
 *
 * Sử dụng <Outlet /> của React Router để render page con.
 */
const MainLayout = () => {
  const dispatch = useDispatch()
  const { user, token, isLoading, error } = useSelector((state) => state.auth)
  const [suggestedUsernames, setSuggestedUsernames] = useState([])
  const [showUsernameModal, setShowUsernameModal] = useState(false)

  const needsUsernameSelection = Boolean(token && user && !user?.username)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!needsUsernameSelection) {
        setShowUsernameModal(false)
        return
      }

      const result = await dispatch(
        suggestUsername({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
        })
      )

      if (result.meta.requestStatus === 'fulfilled') {
        setSuggestedUsernames(result.payload?.suggestions || [])
      } else {
        setSuggestedUsernames([])
      }

      setShowUsernameModal(true)
    }

    fetchSuggestions()
  }, [dispatch, needsUsernameSelection, user?.firstName, user?.lastName])

  const handleUsernameSubmit = async (selectedUsername) => {
    const result = await dispatch(setUsername({ username: selectedUsername }))

    if (result.meta.requestStatus === 'fulfilled') {
      setShowUsernameModal(false)
      toast.success('Đặt tên người dùng thành công!', { autoClose: 2500 })
      return
    }

    const message = result.payload || 'Đặt tên người dùng thất bại. Vui lòng thử lại.'
    toast.error(message, { autoClose: 3000 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar cố định trên cùng */}
      <Navbar />

      {/* Nội dung chính – margin-top tránh navbar đè, pb cho bottom nav mobile */}
      <main className="pt-16 pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto px-4">
          <Outlet />
        </div>
      </main>

      {showUsernameModal && needsUsernameSelection && (
        <UsernameSelectionModal
          suggestedUsernames={suggestedUsernames}
          onSelect={handleUsernameSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  )
}

export default MainLayout
