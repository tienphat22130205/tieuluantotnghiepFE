import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineHome, AiFillHome } from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { FiPlus } from 'react-icons/fi'
import { MdOutlineOndemandVideo, MdOndemandVideo } from 'react-icons/md'
import { Avatar } from '@/components/ui'

/**
 * MobileBottomNav – Thanh điều hướng nổi dưới cùng trên màn hình điện thoại (mobile).
 */
const MobileBottomNav = memo(({
  isActive,
  incomingRequestCount = 0,
  isMobileMenuOpen,
  isProfileActive,
  onOpenCreatePost,
  onOpenMobileMenu,
  user,
  displayName,
  t,
}) => {
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-[0_14px_40px_-6px_rgba(0,0,0,0.25)] rounded-full h-15 px-4 flex items-center justify-between transition-colors">
      {/* 1. Home Link */}
      <Link
        to="/"
        title={t('nav.home')}
        className="flex flex-col items-center justify-center w-11 h-11 rounded-full transition cursor-pointer"
      >
        {isActive('/') ? (
          <div className="flex flex-col items-center">
            <AiFillHome size={26} className="text-primary-600 dark:text-primary-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-0.5" />
          </div>
        ) : (
          <AiOutlineHome size={26} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
        )}
      </Link>

      {/* 2. Friends Link */}
      <Link
        to="/friends"
        title={t('nav.friends')}
        className="flex flex-col items-center justify-center w-11 h-11 rounded-full transition cursor-pointer relative"
      >
        {isActive('/friends') ? (
          <div className="flex flex-col items-center">
            <FaUserFriends size={24} className="text-primary-600 dark:text-primary-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-0.5" />
          </div>
        ) : (
          <FaUserFriends size={24} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
        )}
        {incomingRequestCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </Link>

      {/* 3. Center Floating Create Post Button (+) */}
      <button
        type="button"
        onClick={onOpenCreatePost}
        title={t('home.createPost')}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-600/30 -translate-y-3 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ring-4 ring-white dark:ring-slate-900"
      >
        <FiPlus size={24} strokeWidth={3} />
      </button>

      {/* 4. Watch Link */}
      <Link
        to="/watch"
        title={t('nav.watch')}
        className="flex flex-col items-center justify-center w-11 h-11 rounded-full transition cursor-pointer"
      >
        {isActive('/watch') ? (
          <div className="flex flex-col items-center">
            <MdOndemandVideo size={26} className="text-primary-600 dark:text-primary-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-0.5" />
          </div>
        ) : (
          <MdOutlineOndemandVideo size={26} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
        )}
      </Link>

      {/* 5. Mobile Menu Button */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        title={t('nav.menu')}
        className="flex flex-col items-center justify-center w-11 h-11 rounded-full transition cursor-pointer"
      >
        <div className={isMobileMenuOpen || isActive('/settings') || isProfileActive ? 'ring-2 ring-primary-600 dark:ring-primary-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 rounded-full' : ''}>
          <Avatar src={user?.avatar} name={displayName} size="xs" />
        </div>
      </button>
    </nav>
  )
})

MobileBottomNav.displayName = 'MobileBottomNav'

export default MobileBottomNav
