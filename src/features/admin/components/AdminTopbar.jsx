import { useState, useRef, useEffect } from 'react'
import {
  Bell,
  CheckCheck,
  Check,
  ExternalLink,
  LogOut,
  Menu,
  Moon,
  Sun,
  Unlock,
  UserPlus,
  UserX,
  UserCheck,
  FileText,
  Trash2,
  MessageSquare,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '--'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '--'

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSeconds < 60) return 'Vừa xong'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}p trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h trước`
  return `${Math.floor(diffHours / 24)}d trước`
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'unban_request':
      return <Unlock size={14} className="text-amber-500" />
    case 'unban_reviewed':
      return <CheckCheck size={14} className="text-emerald-500" />
    case 'user_registered':
      return <UserPlus size={14} className="text-blue-500" />
    case 'user_banned':
      return <UserX size={14} className="text-red-500" />
    case 'user_unbanned':
      return <UserCheck size={14} className="text-teal-500" />
    case 'user_role_changed':
      return <Shield size={14} className="text-purple-500" />
    case 'post_created':
      return <FileText size={14} className="text-sky-500" />
    case 'post_deleted':
      return <Trash2 size={14} className="text-rose-500" />
    case 'comment_created':
      return <MessageSquare size={14} className="text-indigo-500" />
    default:
      return <AlertTriangle size={14} className="text-slate-400" />
  }
}

const AdminTopbar = ({
  activeSection,
  user,
  onLogout,
  onToggleMenu,
  isDesktopCollapsed,
  unreadNotificationsCount = 0,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onSelectSection,
  isLiveConnected = false,
}) => {
  const { language, setLanguage, isDarkMode, toggleDarkMode, t } = usePreferences()
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false)
  const notifDropdownRef = useRef(null)

  const displayName = user?.fullName || user?.username || 'Admin'
  const avatarText = displayName.slice(0, 1).toUpperCase()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false)
      }
    }
    if (isNotifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotifDropdownOpen])

  const titles = {
    dashboard: t('admin.dashboard') || 'Dashboard',
    notifications: t('admin.notifications') || 'Thông báo Realtime',
    users: t('admin.usersManagement') || 'Quản lý người dùng',
    unbanRequests: t('admin.unbanRequests') || 'Yêu cầu mở khóa',
    posts: t('admin.postsModeration') || 'Kiểm duyệt bài viết',
    comments: t('admin.commentsManagement') || 'Quản lý bình luận',
    stats: t('admin.documentStats') || 'Thống kê tài liệu',
  }

  const subtitles = {
    dashboard: t('admin.dashboardSubtitle') || 'Tổng quan hệ thống và các chỉ số hoạt động.',
    notifications: t('admin.notificationsSubtitle') || 'Theo dõi và quản lý các sự kiện thời gian thực từ người dùng và hệ thống.',
    users: t('admin.usersSubtitle') || 'Phân quyền và khóa/mở khóa tài khoản người dùng.',
    unbanRequests: t('admin.unbanSubtitle') || 'Duyệt hoặc từ chối các yêu cầu mở khóa từ người dùng bị khóa.',
    posts: t('admin.postsSubtitle') || 'Xem, lọc, tìm kiếm và kiểm duyệt bài viết vi phạm.',
    comments: t('admin.commentsSubtitle') || 'Xem danh sách bình luận và xóa bình luận vi phạm.',
    stats: t('admin.statsSubtitle') || 'Theo dõi các tài liệu có lượt xem cao nhất trên hệ thống.',
  }

  const previewNotifications = notifications.slice(0, 6)

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMenu}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label={isDesktopCollapsed ? t('admin.openMenu') : t('admin.collapseMenu')}
            title={isDesktopCollapsed ? t('admin.openMenu') : t('admin.collapseMenu')}
          >
            <Menu size={18} />
            <span className="hidden text-sm font-medium lg:inline">
              {isDesktopCollapsed ? t('admin.openMenu') : t('admin.collapseMenu')}
            </span>
          </button>

          {/* Realtime Socket Live Pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isLiveConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
              }`}
            title={isLiveConnected ? 'Socket.io kết nối trực tiếp (Realtime Live)' : 'Đang kết nối lại Socket.io...'}
          >
            <span className="relative flex h-2 w-2">
              {isLiveConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span>{isLiveConnected ? 'Realtime Live' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
              className="relative inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Thông báo hệ thống"
              aria-label="Thông báo hệ thống"
            >
              <Bell size={17} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Thông báo</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                        {unreadNotificationsCount} mới
                      </span>
                    )}
                  </div>

                  {unreadNotificationsCount > 0 && onMarkAllNotificationsAsRead && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkAllNotificationsAsRead()
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <CheckCheck size={13} />
                      Đã đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {previewNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Chưa có thông báo quản trị nào
                    </div>
                  ) : (
                    previewNotifications.map((notif) => {
                      const notifId = notif._id || notif.id
                      const isUnread = !notif.isRead

                      return (
                        <div
                          key={notifId}
                          onClick={() => {
                            if (isUnread && onMarkNotificationAsRead) {
                              onMarkNotificationAsRead(notifId)
                            }
                            if (notif.link && onSelectSection) {
                              onSelectSection(notif.link)
                              setIsNotifDropdownOpen(false)
                            }
                          }}
                          className={`flex items-start gap-3 p-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 ${isUnread ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                            }`}
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            {getNotificationIcon(notif.type)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-semibold truncate ${isUnread ? 'text-blue-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>

                          {isUnread && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-slate-100 p-2.5 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectSection) {
                        onSelectSection('notifications')
                        setIsNotifDropdownOpen(false)
                      }
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <ExternalLink size={13} />
                    Xem tất cả trong mục Thông báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pill-shaped Language Switcher */}
          <div
            className="relative inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/70 p-0.5 shadow-inner dark:border-slate-700 dark:bg-slate-800"
            role="group"
            aria-label="Language switch"
          >
            <div
              className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-blue-600 shadow-sm transition-all duration-200 ease-in-out ${language === 'vi' ? 'left-0.5' : 'left-[calc(50%+1.5px)]'
                }`}
            />

            <button
              type="button"
              onClick={() => setLanguage('vi')}
              className={`relative z-10 flex min-w-[34px] cursor-pointer items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${language === 'vi'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white'
                }`}
              title="Tiếng Việt"
            >
              VI
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`relative z-10 flex min-w-[34px] cursor-pointer items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${language === 'en'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white'
                }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
          </button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {avatarText}
              </span>
            )}
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
              {displayName}
            </span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <LogOut size={16} />
            {t('admin.logout')}
          </button>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t('admin.title')} / {titles[activeSection] || activeSection}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
        {titles[activeSection] || activeSection}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {subtitles[activeSection] || ''}
      </p>
    </header>
  )
}

export default AdminTopbar
