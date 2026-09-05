import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineMessage,
  AiOutlineSetting,
  AiOutlineUser,
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { usePreferences } from '@/context/PreferencesContext'
import useNotifications from '@/features/notification/hooks/useNotifications'
import { usePresenceStore } from '@/features/chat/store/usePresenceStore'
import friendService from '@/features/user/services/friendService'
import { extractItems } from '@/utils/friendship'
import ChatConversationsPanel from '@/features/chat/components/ChatConversationsPanel'
import { NotificationsPanel } from '@/features/notification'

const TopHeader = ({ onOpenSettings }) => {
  const { user } = useAuth()
  const { t } = usePreferences()
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useNotifications({ fetchList: false, fetchUnreadCount: true })
  
  const unreadMessageCount = usePresenceStore((state) =>
    state.friends.reduce((total, friend) => total + (Number(friend.newMessagesCount) || 0), 0)
  )

  const [searchKeyword, setSearchKeyword] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [incomingRequestCount, setIncomingRequestCount] = useState(0)

  const profileIdentifier = user?.username ? String(user.username).replace(/^@/, '') : (user?.id || user?._id)
  const profilePath = profileIdentifier ? `/profile/${profileIdentifier}` : '/'
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'

  // Sync search keyword from query param
  useEffect(() => {
    setSearchKeyword(new URLSearchParams(location.search).get('q') || '')
  }, [location.search])

  // Listen to open chat events
  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true)
    window.addEventListener('chat:open', handleOpenChat)
    return () => window.removeEventListener('chat:open', handleOpenChat)
  }, [])

  // Load incoming friend requests count
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

    loadIncomingRequestCount()
    const onFriendEvent = () => loadIncomingRequestCount()
    window.addEventListener('friends:incoming-updated', onFriendEvent)
    return () => window.removeEventListener('friends:incoming-updated', onFriendEvent)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = searchKeyword.trim()
    if (trimmed.length < 2) return

    const params = new URLSearchParams()
    params.set('q', trimmed)
    params.set('page', '1')
    navigate(`/search?${params.toString()}`)
  }

  return (
    <>
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md px-3 md:px-5 items-center justify-between transition-colors">
        {/* Left Section: Logo & Inline Search Bar */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="h-9 w-9 overflow-hidden rounded-2xl bg-primary-600 p-0.5 shadow-md shadow-primary-500/20 transition group-hover:scale-105">
              <img src="/Zlogo.png" alt="Zivo" className="h-full w-full object-cover rounded-[14px]" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-primary-600">
              Zivo
            </span>
          </Link>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm hidden sm:block">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-9 pl-9 pr-4 text-xs md:text-sm bg-slate-100/90 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            <AiOutlineSearch size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </form>
        </div>

        {/* Right Section: Quick Utilities & User Profile Badge */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Friends Link Button */}
          <Link
            to="/friends"
            title={t('friends')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <FaUserFriends size={20} />
            {incomingRequestCount > 0 && (
              <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {incomingRequestCount > 99 ? '99+' : incomingRequestCount}
              </span>
            )}
          </Link>

          {/* Messenger / Chat Button */}
          <button
            type="button"
            onClick={() => setIsChatOpen((prev) => !prev)}
            title={t('messages')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <AiOutlineMessage size={21} />
            {unreadMessageCount > 0 && (
              <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
              </span>
            )}
          </button>

          {/* Notifications Button (Opens Slide-over Panel) */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            title={t('notifications')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <AiOutlineBell size={21} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <Link
            to="/settings"
            title={t('settingsPrivacy')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <AiOutlineSetting size={21} />
          </Link>

          {/* User Profile Badge (Avatar + Name) */}
          <Link
            to={profilePath}
            title={t('viewProfile')}
            className="ml-1 md:ml-2 flex items-center gap-2 py-1 px-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 transition group"
          >
            <Avatar src={user?.avatar} name={displayName} size="xs" />
            <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 max-w-[110px] truncate hidden md:inline">
              {displayName}
            </span>
          </Link>
        </div>
      </header>

      {/* Chat Conversations Drawer Panel */}
      <ChatConversationsPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Notifications Drawer Panel */}
      <NotificationsPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  )
}

export default TopHeader
