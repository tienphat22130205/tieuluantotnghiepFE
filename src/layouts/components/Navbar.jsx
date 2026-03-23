import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineSearch,
  AiOutlinePlusCircle,
  AiFillPlusCircle,
  AiOutlineBell,
  AiFillBell,
  AiOutlineLogout,
  AiOutlineTeam,
  AiOutlineMessage,
  AiOutlineDashboard,
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import ChatConversationsPanel from '@/features/chat/components/ChatConversationsPanel'
import { isAdminUser } from '@/utils/auth'

const Navbar = () => {
  const { user, handleLogout } = useAuth()
  const location = useLocation()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const isActive = (path) => location.pathname === path
  const isProfileActive = location.pathname.startsWith('/profile')
  const profileUserId = user?.id || user?._id
  const profilePath = profileUserId ? `/profile/${profileUserId}` : '/'
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

  const closeChatPanel = () => setIsChatOpen(false)

  const navLinks = [
    { path: '/', icon: AiOutlineHome, activeIcon: AiFillHome, label: 'Trang chủ' },
    { path: '/friends', icon: AiOutlineTeam, activeIcon: FaUserFriends, label: 'Bạn bè' },
    { path: '/create', icon: AiOutlinePlusCircle, activeIcon: AiFillPlusCircle, label: 'Đăng bài' },
    { path: '/notifications', icon: AiOutlineBell, activeIcon: AiFillBell, label: 'Thông báo' },
    ...(isAdminUser(user)
      ? [{ path: '/admin', icon: AiOutlineDashboard, activeIcon: AiOutlineDashboard, label: 'Quản trị' }]
      : []),
  ]

  return (
    <>
      {/* ══ TOP NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">

          {/* Logo & Search */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="Zivo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Zivo</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex">
              <input
                type="text"
                placeholder="Tìm kiếm trên Zivo"
                className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition w-64"
              />
            </div>
          </div>

          {/* Desktop Nav Icons – Center */}
          <div className="hidden md:flex items-center gap-10">
                {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, label }) => {
                  const active = isActive(path)
                  return (
                    <Link
                      key={path}
                      to={path}
                      title={label}
                      className={`relative flex items-center justify-center w-30 h-12 rounded-lg transition-all cursor-pointer
                        ${ active ? 'text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' }
                      `}
                    >
                      {active
                        ? <ActiveIcon size={28} />
                        : <Icon size={29} />
                      }
                      {active && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* User menu */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={profilePath}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Avatar src={user?.avatar} name={displayName} size="sm" />
                  <span className="text-sm font-medium text-gray-700">{displayName}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsChatOpen((prev) => !prev)
                  }}
                  title="Tin nhắn"
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  <AiOutlineMessage size={21} />
                </button>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <AiOutlineLogout size={20} />
                </button>
              </div>

              {/* Mobile: Avatar only */}
              <Link to={profilePath} className="md:hidden">
                <Avatar src={user?.avatar} name={displayName} size="sm" />
              </Link>
        </div>
      </nav>

      <ChatConversationsPanel isOpen={isChatOpen} onClose={closeChatPanel} />

      {/* ══ BOTTOM NAV (Mobile) ══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-14">
          {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, label }) => {
            const active = isActive(path)
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer"
              >
                {active
                  ? <ActiveIcon size={24} className="text-primary-600" />
                  : <Icon size={24} className="text-gray-500" />
                }
              </Link>
            )
          })}
          <Link
            to={profilePath}
            className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
          >
            <div className={isProfileActive ? 'ring-2 ring-primary-600 rounded-full' : ''}>
              <Avatar src={user?.avatar} name={displayName} size="sm" />
            </div>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Navbar
