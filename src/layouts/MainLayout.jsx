import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import Navbar from './components/Navbar'
import RightSidebar from './components/RightSidebar'
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
  const location = useLocation()
  const navigate = useNavigate()
  const [suggestedUsernames, setSuggestedUsernames] = useState([])
  const [showUsernameModal, setShowUsernameModal] = useState(false)

  // Only show the right sidebar on the Home Feed and Post Details page
  const showRightSidebar = location.pathname === '/' || (location.pathname.startsWith('/post/') && !location.pathname.endsWith('/edit'))

  const rightColumnClass = showRightSidebar ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'lg:grid-cols-1'

  // Determine layout max-width to compress blank space and improve layout density
  let containerMaxWidthClass = 'max-w-[1240px]' // 1152px for standard layouts (Home, Friends)
  if (
    location.pathname.startsWith('/profile')
    || (location.pathname.startsWith('/post/') && location.pathname.endsWith('/edit'))
    || location.pathname === '/search'
    || location.pathname === '/notifications'
    || location.pathname === '/groups'
  ) {
    containerMaxWidthClass = 'max-w-5xl' // 1024px for single-column/compact layouts
  }
  if (location.pathname === '/create') {
    containerMaxWidthClass = 'max-w-2xl' // 672px – narrow card style for new post
  }

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased selection:bg-primary-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="pt-16 md:pt-20 pb-24 md:pb-8 md:pl-72">
        <div className={`mx-auto w-full px-3 md:px-6 ${containerMaxWidthClass}`}>
          <div className={`grid grid-cols-1 gap-6 ${rightColumnClass}`}>
            <section className="min-w-0">
              <AnimatePresence mode="sync" initial={false}>
                <Motion.div
                  key={location.pathname}
                  initial={{ opacity: 0.92 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className="will-change-opacity"
                >
                  <Outlet />
                </Motion.div>
              </AnimatePresence>
            </section>

            {showRightSidebar && (
              <aside className="hidden lg:block">
                <RightSidebar />
              </aside>
            )}
          </div>
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
