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
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import useNotifications from '@/features/notification/hooks/useNotifications'
import friendService from '@/features/user/services/friendService'
import { extractItems } from '@/utils/friendship'
import ChatConversationsPanel from '@/features/chat/components/ChatConversationsPanel'
import { canAccessAdminDashboard } from '@/utils/auth'

const TRANSLATIONS = {
  vi: {
    home: 'Trang chủ',
    notifications: 'Thông báo',
    friends: 'Bạn bè',
    create: 'Đăng bài',
    admin: 'Quản trị',
    messages: 'Tin nhắn',
    logout: 'Đăng xuất',
    quickPost: 'Đăng',
    menu: 'Menu',
    close: 'Đóng',
    viewProfile: 'Xem trang cá nhân của bạn',
    settingsPrivacy: 'Cài đặt và quyền riêng tư',
    language: 'Ngôn ngữ',
    darkMode: 'Chế độ tối',
    openMenu: 'Mở menu',
    unknownUser: 'Người dùng',
  },
  en: {
    home: 'Home',
    notifications: 'Notifications',
    friends: 'Friends',
    create: 'Create',
    admin: 'Admin',
    messages: 'Messages',
    logout: 'Log out',
    quickPost: 'Post',
    menu: 'Menu',
    close: 'Close',
    viewProfile: 'View your profile',
    settingsPrivacy: 'Settings & privacy',
    language: 'Language',
    darkMode: 'Dark mode',
    openMenu: 'Open menu',
    unknownUser: 'User',
  },
}

const getStoredPreferences = (storageKey) => {
  if (!storageKey) {
    return { language: 'vi', isDarkMode: false }
  }

  try {
    const rawValue = localStorage.getItem(storageKey)
    if (!rawValue) {
      return { language: 'vi', isDarkMode: false }
    }

    const parsed = JSON.parse(rawValue)

    return {
      language: parsed?.language === 'en' ? 'en' : 'vi',
      isDarkMode: Boolean(parsed?.isDarkMode),
    }
  } catch {
    return { language: 'vi', isDarkMode: false }
  }
}

const Navbar = () => {
  const { user, role, handleLogout } = useAuth()
  const { unreadCount, refreshUnreadCount } = useNotifications({ fetchList: false, fetchUnreadCount: true })
  const location = useLocation()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [incomingRequestCount, setIncomingRequestCount] = useState(0)

  const profileUserId = user?.id || user?._id
  const preferenceStorageKey = profileUserId ? `ui-preferences:${profileUserId}` : null
  const initialPrefs = getStoredPreferences(preferenceStorageKey)

  const [language, setLanguage] = useState(initialPrefs.language)
  const [isDarkMode, setIsDarkMode] = useState(initialPrefs.isDarkMode)

  const isActive = (path) => location.pathname === path
  const isProfileActive = location.pathname.startsWith('/profile')
  const profilePath = profileUserId ? `/profile/${profileUserId}` : '/'
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const text = TRANSLATIONS[language] || TRANSLATIONS.vi

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
    document.documentElement.lang = language
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [language, isDarkMode])

  useEffect(() => {
    if (!preferenceStorageKey) return

    localStorage.setItem(
      preferenceStorageKey,
      JSON.stringify({
        language,
        isDarkMode,
      })
    )
  }, [preferenceStorageKey, language, isDarkMode])

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
    { path: '/notifications', icon: AiOutlineBell, activeIcon: AiFillBell, labelKey: 'notifications' },
    { path: '/friends', icon: AiOutlineTeam, activeIcon: FaUserFriends, labelKey: 'friends' },
    { path: '/create', icon: AiOutlinePlusCircle, activeIcon: AiFillPlusCircle, labelKey: 'create' },
    ...(canAccessAdminDashboard(user, role)
      ? [{ path: '/admin', icon: AiOutlineDashboard, activeIcon: AiOutlineDashboard, labelKey: 'admin' }]
      : []),
  ]

  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-72 border-r border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex h-full w-full flex-col px-4 py-5">
          <Link to="/" className="mb-6 flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100">
            <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-100">
              <img src="/Zlogo.png" alt="Zivo" className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Zivo</span>
          </Link>

          <div className="space-y-1">
            {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, labelKey }) => {
              const active = isActive(path)
              const label = text[labelKey] || labelKey
              const isNotificationLink = path === '/notifications'
              const isFriendLink = path === '/friends'

              return (
                <Link
                  key={path}
                  to={path}
                  title={label}
                  className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-semibold transition ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="relative inline-flex">
                    {active ? <ActiveIcon size={22} /> : <Icon size={22} />}
                    {isNotificationLink && unreadCount > 0 && (
                      <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {isFriendLink && incomingRequestCount > 0 && (
                      <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                        {incomingRequestCount > 99 ? '99+' : incomingRequestCount}
                      </span>
                    )}
                  </span>
                  <span>{label}</span>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <AiOutlineMessage size={22} />
              <span>{text.messages}</span>
            </button>
          </div>

          <Link
            to="/create"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            {text.quickPost}
          </Link>

          <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
            <Link to={profilePath} className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100">
              <Avatar src={user?.avatar} name={displayName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{displayName || text.unknownUser}</p>
                <p className="truncate text-xs text-slate-500">@{user?.username || 'zivo'}</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title={text.logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <AiOutlineLogout size={18} />
              {text.logout}
            </button>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
              <img src="/Zlogo.png" alt="Zivo" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-gray-900">Zivo</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/search"
              aria-label="Mở trang tìm kiếm"
              className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
            >
              <AiOutlineSearch size={22} />
            </Link>

            <button
              type="button"
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              aria-label={text.messages}
              onClick={() => setIsChatOpen(true)}
            >
              <AiOutlineMessage size={22} />
            </button>

            <button
              type="button"
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              aria-label={text.openMenu}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <AiOutlineMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <ChatConversationsPanel isOpen={isChatOpen} onClose={closeChatPanel} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-14">
          {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, labelKey }) => {
            const active = isActive(path)
            const label = text[labelKey] || labelKey
            const isNotificationLink = path === '/notifications'
            const isFriendLink = path === '/friends'

            return (
              <Link
                key={path}
                to={path}
                title={label}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer"
              >
                <span className="relative inline-flex">
                  {active ? <ActiveIcon size={24} className="text-primary-600" /> : <Icon size={24} className="text-gray-500" />}
                  {isNotificationLink && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {isFriendLink && incomingRequestCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
                      {incomingRequestCount > 9 ? '9+' : incomingRequestCount}
                    </span>
                  )}
                </span>
              </Link>
            )
          })}
          <Link to={profilePath} className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer">
            <div className={isProfileActive ? 'ring-2 ring-primary-600 rounded-full' : ''}>
              <Avatar src={user?.avatar} name={displayName} size="sm" />
            </div>
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[70]">
            <Motion.button
              type="button"
              className="absolute inset-0 bg-black/35"
              aria-label={text.close}
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
              className="absolute right-0 top-0 h-full w-[66.6667vw] max-w-[430px] min-w-[260px] bg-gray-100 shadow-2xl border-l border-gray-200 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">{text.menu}</h2>
                <button type="button" className="p-2 rounded-full text-gray-700 hover:bg-gray-200" aria-label={text.close} onClick={closeMobileMenu}>
                  <AiOutlineClose size={22} />
                </button>
              </div>

              <div className="p-3 border-b border-gray-200 bg-white">
                <Link to={profilePath} onClick={closeMobileMenu} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={user?.avatar} name={displayName} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{displayName || text.unknownUser}</p>
                      <p className="text-sm text-gray-500 truncate">{text.viewProfile}</p>
                    </div>
                  </div>
                  <AiOutlineRight size={18} className="text-gray-400 shrink-0" />
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <section className="bg-gray-100 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    className="w-full px-3 py-3 flex items-center justify-between text-left"
                    onClick={() => setIsSettingsOpen((prev) => !prev)}
                  >
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <AiOutlineSetting size={20} />
                      {text.settingsPrivacy}
                    </span>
                    <AiOutlineRight size={16} className={`text-gray-500 transition-transform ${isSettingsOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {isSettingsOpen && (
                    <div className="px-3 pb-3 space-y-2">
                      <div className="rounded-xl bg-white border border-gray-200 px-3 py-2.5 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-gray-800">
                          <AiOutlineGlobal size={18} className="text-gray-500" />
                          {text.language}
                        </span>
                        <select
                          value={language}
                          onChange={(event) => setLanguage(event.target.value)}
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
                        >
                          <option value="vi">vi</option>
                          <option value="en">en</option>
                        </select>
                      </div>

                      <div className="rounded-xl bg-white border border-gray-200 px-3 py-2.5 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-gray-800">
                          <AiOutlineBulb size={18} className="text-gray-500" />
                          {text.darkMode}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isDarkMode}
                          onClick={() => setIsDarkMode((prev) => !prev)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${isDarkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-white border border-red-200 px-3 py-3 flex items-center gap-2 text-red-600 font-medium hover:bg-red-50"
                >
                  <AiOutlineLogout size={18} />
                  {text.logout}
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
