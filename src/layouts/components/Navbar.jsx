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
      <TopHeader onOpenSettings={() => setIsMobileMenuOpen(true)} />

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
          onClick={() => setIsCreatePostOpen(true)}
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

        {/* 5. Mobile Menu Button (Opens Drawer with Settings, Profile, Groups, Dark Mode, etc.) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          title={t('nav.menu')}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full transition cursor-pointer"
        >
          <div className={isMobileMenuOpen || isActive('/settings') || isProfileActive ? 'ring-2 ring-primary-600 dark:ring-primary-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 rounded-full' : ''}>
            <Avatar src={user?.avatar} name={displayName} size="xs" />
          </div>
        </button>
      </nav>

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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[70]">
            <Motion.button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              aria-label={t('nav.close')}
              onClick={closeMobileMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            />

            <Motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
              className="absolute right-0 top-0 h-full w-[85vw] max-w-[380px] min-w-[280px] bg-slate-50 dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-colors overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('nav.menu')}</h2>
                <button
                  type="button"
                  className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label={t('nav.close')}
                  onClick={closeMobileMenu}
                >
                  <AiOutlineClose size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Profile Card */}
                <Link
                  to={profilePath}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={user?.avatar} name={displayName} size="md" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{displayName || t('nav.unknownUser')}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">{t('nav.viewProfile')}</p>
                    </div>
                  </div>
                  <AiOutlineRight size={16} className="text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition shrink-0" />
                </Link>

                {/* Main Shortcuts Section */}
                <div className="space-y-1.5">
                  <p className="px-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {t('nav.yourShortcuts')}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Settings & Privacy Shortcut */}
                    <Link
                      to="/settings"
                      onClick={closeMobileMenu}
                      className={`col-span-2 flex items-center justify-between p-3.5 rounded-2xl border transition shadow-xs ${
                        isActive('/settings')
                          ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-800 text-primary-700 dark:text-primary-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                          <AiOutlineSetting size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">{t('nav.settingsPrivacy')}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tùy chỉnh giao diện, bảo mật</p>
                        </div>
                      </div>
                      <AiOutlineRight size={16} className="text-slate-400 shrink-0" />
                    </Link>

                    {/* Friends Shortcut */}
                    <Link
                      to="/friends"
                      onClick={closeMobileMenu}
                      className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                    >
                      <FaUserFriends size={22} className="text-blue-500 mb-2" />
                      <span className="text-xs font-bold">{t('nav.friends')}</span>
                    </Link>

                    {/* Groups Shortcut */}
                    <Link
                      to="/groups"
                      onClick={closeMobileMenu}
                      className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                    >
                      <HiOutlineUserGroup size={24} className="text-emerald-500 mb-2" />
                      <span className="text-xs font-bold">{t('nav.groups')}</span>
                    </Link>

                    {/* Watch Shortcut */}
                    <Link
                      to="/watch"
                      onClick={closeMobileMenu}
                      className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                    >
                      <MdOutlineOndemandVideo size={24} className="text-red-500 mb-2" />
                      <span className="text-xs font-bold">{t('nav.watch')}</span>
                    </Link>

                    {/* Notifications Shortcut */}
                    <Link
                      to="/notifications"
                      onClick={closeMobileMenu}
                      className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                    >
                      <AiOutlineBell size={24} className="text-amber-500 mb-2" />
                      <span className="text-xs font-bold">{t('nav.notifications')}</span>
                    </Link>

                    {/* Admin Dashboard if applicable */}
                    {canAccessAdminDashboard(role) && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="col-span-2 flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold text-xs"
                      >
                        <AiOutlineDashboard size={20} className="text-amber-600 dark:text-amber-400" />
                        <span>{t('nav.admin')}</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Quick Preferences Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3.5">
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    Cài đặt nhanh
                  </p>

                  {/* Dark mode toggle */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <AiOutlineBulb size={18} className="text-primary-600 dark:text-primary-400" />
                      {t('settings.darkMode')}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDarkMode}
                      onClick={() => setIsDarkMode((prev) => !prev)}
                      className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                        isDarkMode ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language switch buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <AiOutlineGlobal size={18} className="text-primary-600 dark:text-primary-400" />
                      {t('settings.language')}
                    </span>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setLanguage('vi')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          language === 'vi'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        🇻🇳 VI
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          language === 'en'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        🇬🇧 EN
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
                >
                  <AiOutlineLogout size={18} />
                  {t('nav.logout')}
                </button>
              </div>
            </Motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
