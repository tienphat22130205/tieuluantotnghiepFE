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
  AiOutlineClose,
  AiOutlineSetting,
  AiOutlineGlobal,
  AiOutlineBulb,
  AiOutlineRight,
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import ChatConversationsPanel from '@/features/chat/components/ChatConversationsPanel'
import { isAdminUser } from '@/utils/auth'

const TRANSLATIONS = {
  vi: {
    home: 'Trang chủ',
    friends: 'Bạn bè',
    create: 'Đăng bài',
    notifications: 'Thông báo',
    admin: 'Quản trị',
    searchPlaceholder: 'Tìm kiếm trên Zivo',
    messages: 'Tin nhắn',
    logout: 'Đăng xuất',
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
    friends: 'Friends',
    create: 'Create',
    notifications: 'Notifications',
    admin: 'Admin',
    searchPlaceholder: 'Search on Zivo',
    messages: 'Messages',
    logout: 'Log out',
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
  const { user, handleLogout } = useAuth()
  const location = useLocation()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)

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
    const timeoutId = setTimeout(() => {
      const nextPrefs = getStoredPreferences(preferenceStorageKey)
      setLanguage(nextPrefs.language)
      setIsDarkMode(nextPrefs.isDarkMode)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [preferenceStorageKey])

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

  const navLinks = [
    { path: '/', icon: AiOutlineHome, activeIcon: AiFillHome, labelKey: 'home' },
    { path: '/friends', icon: AiOutlineTeam, activeIcon: FaUserFriends, labelKey: 'friends' },
    { path: '/create', icon: AiOutlinePlusCircle, activeIcon: AiFillPlusCircle, labelKey: 'create' },
    { path: '/notifications', icon: AiOutlineBell, activeIcon: AiFillBell, labelKey: 'notifications' },
    ...(isAdminUser(user)
      ? [{ path: '/admin', icon: AiOutlineDashboard, activeIcon: AiOutlineDashboard, labelKey: 'admin' }]
      : []),
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-15 h-15 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="/Zlogo.png" alt="Zivo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Zivo</span>
            </Link>

            <div className="hidden md:flex">
              <input
                type="text"
                placeholder={text.searchPlaceholder}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition w-64"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, labelKey }) => {
              const active = isActive(path)
              const label = text[labelKey] || labelKey

              return (
                <Link
                  key={path}
                  to={path}
                  title={label}
                  className={`relative flex items-center justify-center w-30 h-12 rounded-lg transition-all cursor-pointer ${
                    active ? 'text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {active ? <ActiveIcon size={28} /> : <Icon size={29} />}
                  {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to={profilePath} className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
              <Avatar src={user?.avatar} name={displayName} size="sm" />
              <span className="text-sm font-medium text-gray-700">{displayName}</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsChatOpen((prev) => !prev)}
              title={text.messages}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <AiOutlineMessage size={21} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title={text.logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              <AiOutlineLogout size={20} />
            </button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
            aria-label={text.openMenu}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <AiOutlineMenu size={24} />
          </button>
        </div>
      </nav>

      <ChatConversationsPanel isOpen={isChatOpen} onClose={closeChatPanel} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-14">
          {navLinks.map(({ path, icon: Icon, activeIcon: ActiveIcon, labelKey }) => {
            const active = isActive(path)
            const label = text[labelKey] || labelKey

            return (
              <Link
                key={path}
                to={path}
                title={label}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer"
              >
                {active ? <ActiveIcon size={24} className="text-primary-600" /> : <Icon size={24} className="text-gray-500" />}
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
