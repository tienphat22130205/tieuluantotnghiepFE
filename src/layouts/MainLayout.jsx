import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { AiOutlineSearch } from 'react-icons/ai'
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
  const [desktopSearchKeyword, setDesktopSearchKeyword] = useState('')

  // Only show the right sidebar on the Home Feed and Post Details page
  const showRightSidebar = location.pathname === '/' || (location.pathname.startsWith('/post/') && !location.pathname.endsWith('/edit'))

  const rightColumnClass = showRightSidebar ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : 'lg:grid-cols-1'

  // Determine layout max-width to compress blank space and improve layout density
  let containerMaxWidthClass = 'max-w-6xl' // 1152px for standard layouts (Home, Friends)
  if (
    location.pathname.startsWith('/profile')
    || location.pathname === '/create'
    || (location.pathname.startsWith('/post/') && location.pathname.endsWith('/edit'))
    || location.pathname === '/search'
    || location.pathname === '/notifications'
    || location.pathname === '/explore'
  ) {
    containerMaxWidthClass = 'max-w-5xl' // 1024px for single-column/compact layouts
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

  const handleDesktopSearchSubmit = () => {
    const normalizedKeyword = desktopSearchKeyword.trim()
    if (normalizedKeyword.length < 2) return

    const params = new URLSearchParams()
    params.set('q', normalizedKeyword)
    params.set('page', '1')
    navigate(`/search?${params.toString()}`)
  }

  const trendingTopics = [
    '#HocTap',
    '#FrontEnd',
    '#ReactJS',
    '#TinCongNghe',
    '#Zivo',
  ]

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Navbar />

      <main className="pt-16 pb-16 md:pb-6 md:pl-72">
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
                <div className="sticky top-5 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label htmlFor="global-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tìm kiếm
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="global-search"
                        type="text"
                        value={desktopSearchKeyword}
                        onChange={(event) => setDesktopSearchKeyword(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            handleDesktopSearchSubmit()
                          }
                        }}
                        placeholder="Tìm người dùng, hashtag, bài viết..."
                        className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                      />
                      <button
                        type="button"
                        onClick={handleDesktopSearchSubmit}
                        className="rounded-full bg-primary-600 p-2 text-white transition hover:bg-primary-700"
                        aria-label="Tìm kiếm"
                      >
                        <AiOutlineSearch size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-base font-bold text-slate-900">Khám phá</p>
                    <p className="mt-1 text-sm text-slate-500">Theo dõi chủ đề bạn quan tâm.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {trendingTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-base font-bold text-slate-900">Gợi ý hôm nay</p>
                    <ul className="mt-3 space-y-3 text-sm text-slate-700">
                      <li className="rounded-xl bg-slate-50 px-3 py-2">Xem bạn bè mới vừa tham gia Zivo.</li>
                      <li className="rounded-xl bg-slate-50 px-3 py-2">Thử đăng bài có ảnh để tăng tương tác.</li>
                      <li className="rounded-xl bg-slate-50 px-3 py-2">Cập nhật hồ sơ để mọi người dễ tìm thấy bạn.</li>
                    </ul>
                  </div>
                </div>
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
