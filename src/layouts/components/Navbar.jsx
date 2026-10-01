import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlinePlusCircle,
  AiFillPlusCircle,
  AiOutlineBell,
  AiFillBell,
  AiOutlineLogout,
  AiOutlineTeam,
  AiOutlineMessage,
  AiOutlineDashboard,
  AiOutlineMenu,
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineSetting,
  AiOutlineGlobal,
  AiOutlineBulb,
  AiOutlineRight,
  AiOutlineHeart,
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { FiPlus } from 'react-icons/fi'
import { MdOutlineOndemandVideo, MdOndemandVideo } from 'react-icons/md'
import { HiOutlineUserGroup, HiUserGroup } from 'react-icons/hi'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import useNotifications from '@/features/notification/hooks/useNotifications'
import friendService from '@/features/user/services/friendService'
import { extractItems } from '@/utils/friendship'
import ChatConversationsPanel from '@/features/chat/components/ChatConversationsPanel'
import CreatePostModal from '@/features/post/components/CreatePostModal'
import { canAccessAdminDashboard } from '@/utils/auth'
import { usePresenceStore } from '@/features/chat/store/usePresenceStore'
import { NotificationsPanel } from '@/features/notification'

import TopHeader from './TopHeader'
import MobileBottomNav from './MobileBottomNav'
import MobileMenuDrawer from './MobileMenuDrawer'
import { usePreferences } from '@/context/PreferencesContext'

const Navbar = () => {
  const { user, role, handleLogout } = useAuth()
  const { unreadCount, refreshUnreadCount } = useNotifications({ fetchList: false, fetchUnreadCount: true })
  const unreadMessageCount = usePresenceStore((state) =>
    state.friends.reduce((total, friend) => total + (Number(friend.newMessagesCount) || 0), 0)
  )
  const location = useLocation()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [incomingRequestCount, setIncomingRequestCount] = useState(0)

  const { isDarkMode, setIsDarkMode, language, setLanguage, t, translations: text } = usePreferences()

  const profileIdentifier = user?.username ? String(user.username).replace(/^@/, '') : (user?.id || user?._id)
  const isActive = (path) => location.pathname === path
  const isProfileActive = location.pathname.startsWith('/profile')
  const profilePath = profileIdentifier ? `/profile/${profileIdentifier}` : '/'
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

  const closeChatPanel = () => setIsChatOpen(false)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleOpenChat = () => {
      setIsChatOpen(true)
    }
    window.addEventListener('chat:open', handleOpenChat)
    return () => window.removeEventListener('chat:open', handleOpenChat)
  }, [])

  useEffect(() => {
    const loadIncomingRequestCount = async () => {
      try {
        const response = await friendService.getIncomingRequests()
        const items = extractItems(response)
        setIncomingRequestCount(items.length)
      } catch {
        setIncomingRequestCount(0)
      }
    }

    const refreshAllBadges = () => {
      refreshUnreadCount()
      loadIncomingRequestCount()
    }

    refreshAllBadges()

    const intervalId = window.setInterval(refreshAllBadges, 20000)
    const onFocus = () => refreshAllBadges()
    const onFriendEvent = () => loadIncomingRequestCount()
    const onNotificationEvent = () => refreshUnreadCount()

    window.addEventListener('focus', onFocus)
    window.addEventListener('friends:incoming-updated', onFriendEvent)
    window.addEventListener('notifications:unread-updated', onNotificationEvent)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('friends:incoming-updated', onFriendEvent)
      window.removeEventListener('notifications:unread-updated', onNotificationEvent)
    }
  }, [refreshUnreadCount])

  const navLinks = [
    { path: '/', icon: AiOutlineHome, activeIcon: AiFillHome, labelKey: 'home' },
    { path: '/watch', icon: MdOutlineOndemandVideo, activeIcon: MdOndemandVideo, labelKey: 'watch' },
    { path: '/groups', icon: HiOutlineUserGroup, activeIcon: HiUserGroup, labelKey: 'groups' },
    { path: '/friends', icon: AiOutlineTeam, activeIcon: FaUserFriends, labelKey: 'friends' },
    { path: '/notifications', icon: AiOutlineBell, activeIcon: AiFillBell, labelKey: 'notifications' },
    ...(canAccessAdminDashboard(user, role)
      ? [{ path: '/admin', icon: AiOutlineDashboard, activeIcon: AiOutlineDashboard, labelKey: 'admin' }]
      : []),
  ]

  return (
    <>
      <TopHeader
        onOpenSettings={() => setIsMobileMenuOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onToggleNotifications={() => setIsNotificationOpen((prev) => !prev)}
      />

      <nav className="hidden md:flex fixed left-0 top-14 bottom-0 z-40 w-72 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm overflow-y-auto transition-colors">
        <div className="flex h-full w-full flex-col px-3 py-4 space-y-5">
          {/* Section 1: MENU CHÍNH */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {t('nav.mainMenu')}
            </p>
            <div className="space-y-1">
              {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, labelKey }) => {
                const active = isActive(path)
                const label = t(`nav.${labelKey}`) || labelKey
                const isNotificationLink = path === '/notifications'
                const isFriendLink = path === '/friends'

                if (isNotificationLink) {
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => setIsNotificationOpen((prev) => !prev)}
                      title={label}
                      className="group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <span className="relative inline-flex">
                        <Icon size={20} className="text-slate-500 dark:text-slate-400" />
                        {unreadCount > 0 && (
                          <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </span>
                      <span>{label}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={path}
                    to={path}
                    title={label}
                    className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold border-l-4 border-primary-600 rounded-l-none'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="relative inline-flex">
                      {active ? <ActiveIcon size={20} className="text-primary-600 dark:text-primary-400" /> : <Icon size={20} className="text-slate-500 dark:text-slate-400" />}
                      {isFriendLink && incomingRequestCount > 0 && (
                        <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
                          {incomingRequestCount > 99 ? '99+' : incomingRequestCount}
                        </span>
                      )}
                    </span>
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Section 2: LỐI TẮT CỦA BẠN */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {t('nav.yourShortcuts')}
            </p>
            <div className="space-y-1">
              <Link
                to={profilePath}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isProfileActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold border-l-4 border-primary-600 rounded-l-none'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Avatar src={user?.avatar} name={displayName} size="xs" />
                <span className="truncate">{displayName || t('nav.unknownUser')}</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsChatOpen((prev) => !prev)}
                className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <span className="relative inline-flex">
                  <AiOutlineMessage size={20} className="text-slate-500 dark:text-slate-400" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </span>
                <span>{t('nav.messages')}</span>
              </button>
            </div>
          </div>

          {/* Section 3: CÀI ĐẶT & TÀI KHOẢN */}
          <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {t('nav.accountAndSettings')}
            </p>
            <Link
              to="/settings"
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive('/settings')
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold border-l-4 border-primary-600 rounded-l-none'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AiOutlineSetting size={20} className={isActive('/settings') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'} />
              <span>{t('nav.settingsPrivacy')}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title={t('nav.logout')}
              className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            >
              <AiOutlineLogout size={20} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Seamless Mobile Top Header (Rendered ON MOBILE) */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between transition-colors">
        {/* Solid Brand Logo Zivo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="h-9 w-9 overflow-hidden rounded-2xl bg-primary-600 p-0.5 shadow-md shadow-primary-500/20 transition group-hover:scale-105">
            <img src="/Zlogo.png" alt="Zivo" className="h-full w-full object-cover rounded-[14px]" />
          </div>
          <span className="text-xl font-black tracking-tight text-primary-600">
            Zivo
          </span>
        </Link>

        {/* Right Utilities (Search, Notifications, Chat, and Menu Avatar) */}
        <div className="flex items-center gap-1.5">
          {/* Search Button */}
          <Link
            to="/search"
            aria-label="Tìm kiếm"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <AiOutlineSearch size={21} />
          </Link>

          {/* Notifications Button */}
          <button
            type="button"
            aria-label="Thông báo"
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <AiOutlineBell size={21} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Messenger / Chat Button with Real Unread Count */}
          <button
            type="button"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
            aria-label={t('nav.messages')}
            onClick={() => setIsChatOpen(true)}
          >
            <AiOutlineMessage size={21} />
            {unreadMessageCount > 0 && (
              <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
              </span>
            )}
          </button>

          {/* Mobile Menu / Settings Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label={t('nav.menu')}
            className="p-1 ml-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Avatar src={user?.avatar} name={displayName} size="xs" />
          </button>
        </div>
      </nav>

      <ChatConversationsPanel isOpen={isChatOpen} onClose={closeChatPanel} />
      <NotificationsPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

      {/* Floating Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        isActive={isActive}
        incomingRequestCount={incomingRequestCount}
        isMobileMenuOpen={isMobileMenuOpen}
        isProfileActive={isProfileActive}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        user={user}
        displayName={displayName}
        t={t}
      />

      {/* Mobile Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostSuccess={() => {
          setIsCreatePostOpen(false)
          window.dispatchEvent(new Event('posts:refetch'))
        }}
      />

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        user={user}
        displayName={displayName}
        profilePath={profilePath}
        role={role}
        isActive={isActive}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        language={language}
        setLanguage={setLanguage}
        onLogout={handleLogout}
        t={t}
      />
    </>
  )
}

export default Navbar
