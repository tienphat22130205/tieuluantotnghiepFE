import { Link, useLocation } from 'react-router-dom'
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
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'

const Navbar = () => {
  const { user, handleLogout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path
  const isProfileActive = location.pathname.startsWith('/profile')

  const navLinks = [
    { path: '/', icon: AiOutlineHome, activeIcon: AiFillHome, label: 'Trang chủ' },
    { path: '/friends', icon: AiOutlineTeam, activeIcon: FaUserFriends, label: 'Bạn bè' },
    { path: '/create', icon: AiOutlinePlusCircle, activeIcon: AiFillPlusCircle, label: 'Đăng bài' },
    { path: '/notifications', icon: AiOutlineBell, activeIcon: AiFillBell, label: 'Thông báo' },
    { path: '/search', icon: AiOutlineSearch, activeIcon: AiOutlineSearch, label: 'Tìm kiếm' },
  ]

  return (
    <>
      {/* ══ TOP NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Zivo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">Zivo</span>
          </Link>

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
              to={`/profile/${user?._id}`}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
              <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              <AiOutlineLogout size={20} />
            </button>
          </div>

          {/* Mobile: Avatar only */}
          <Link to={`/profile/${user?._id}`} className="md:hidden">
            <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
          </Link>
        </div>
      </nav>

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
            to={`/profile/${user?._id}`}
            className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
          >
            <div className={isProfileActive ? 'ring-2 ring-primary-600 rounded-full' : ''}>
              <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
            </div>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Navbar
