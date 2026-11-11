import { useState, useMemo } from 'react'
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Check,
  UserCheck,
  UserX,
  FileText,
  MessageSquare,
  Shield,
  AlertTriangle,
  UserPlus,
  Unlock,
  Radio,
} from 'lucide-react'

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '--'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '--'

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSeconds < 30) return 'Vừa xong'
  if (diffSeconds < 60) return `${diffSeconds} giây trước`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày trước`

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTypeConfig = (type) => {
  switch (type) {
    case 'unban_request':
      return {
        icon: Unlock,
        label: 'Yêu cầu mở khóa',
        bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-500 text-white',
      }
    case 'unban_reviewed':
      return {
        icon: CheckCheck,
        label: 'Đã duyệt mở khóa',
        bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-500 text-white',
      }
    case 'user_registered':
      return {
        icon: UserPlus,
        label: 'Đăng ký mới',
        bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-500 text-white',
      }
    case 'user_banned':
      return {
        icon: UserX,
        label: 'Khóa tài khoản',
        bg: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800',
        badge: 'bg-red-500 text-white',
      }
    case 'user_unbanned':
      return {
        icon: UserCheck,
        label: 'Mở tài khoản',
        bg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800',
        badge: 'bg-teal-500 text-white',
      }
    case 'user_role_changed':
      return {
        icon: Shield,
        label: 'Đổi vai trò',
        bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        badge: 'bg-purple-500 text-white',
      }
    case 'post_created':
      return {
        icon: FileText,
        label: 'Bài viết mới',
        bg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200 dark:border-sky-800',
        badge: 'bg-sky-500 text-white',
      }
    case 'post_deleted':
      return {
        icon: Trash2,
        label: 'Bài viết bị xóa',
        bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        badge: 'bg-rose-500 text-white',
      }
    case 'comment_created':
      return {
        icon: MessageSquare,
        label: 'Bình luận mới',
        bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        badge: 'bg-indigo-500 text-white',
      }
    default:
      return {
        icon: AlertTriangle,
        label: 'Hệ thống',
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        badge: 'bg-slate-500 text-white',
      }
  }
}

const AdminNotificationsPanel = ({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  isLiveConnected = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onNavigateSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Categories filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (showUnreadOnly && item.isRead) return false

      if (selectedCategory === 'unban' && !['unban_request', 'unban_reviewed'].includes(item.type)) {
        return false
      }
      if (selectedCategory === 'users' && !['user_registered', 'user_banned', 'user_unbanned', 'user_role_changed'].includes(item.type)) {
        return false
      }
      if (selectedCategory === 'content' && !['post_created', 'post_deleted', 'comment_created', 'comment_deleted'].includes(item.type)) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(query)
        const matchMessage = (item.message || '').toLowerCase().includes(query)
        const matchActor = (item.actor?.name || item.actor?.email || '').toLowerCase().includes(query)
        return matchTitle || matchMessage || matchActor
      }

      return true
    })
  }, [notifications, showUnreadOnly, selectedCategory, searchQuery])

  // Counts for cards
  const statsCounts = useMemo(() => {
    const unbanReqCount = notifications.filter((n) => n.type === 'unban_request').length
    const newUsersCount = notifications.filter((n) => n.type === 'user_registered').length
    const contentCount = notifications.filter((n) => ['post_created', 'comment_created'].includes(n.type)).length

    return {
      total: notifications.length,
      unread: unreadCount,
      unban: unbanReqCount,
      users: newUsersCount,
      content: contentCount,
    }
  }, [notifications, unreadCount])

  return (
    <div className="space-y-5">
      {/* Realtime Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/50 p-4 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Radio size={20} className={isLiveConnected ? 'animate-pulse' : ''} />
            {isLiveConnected && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Thông báo Quản trị Thời gian thực (Real-time Live)
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isLiveConnected
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {isLiveConnected ? 'Socket.io Connected' : 'Đang kết nối...'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhận ngay thông báo khi có người dùng đăng ký, gửi yêu cầu mở khóa, đăng bài hoặc kiểm duyệt nội dung.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 shadow-xs transition hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
            >
              <CheckCheck size={15} />
              Đánh dấu tất cả đã đọc
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-xs transition hover:bg-red-50 dark:border-red-900/40 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-slate-700"
            >
              <Trash2 size={15} />
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng thông báo</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{statsCounts.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chưa đọc</p>
            {statsCounts.unread > 0 && (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{statsCounts.unread}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Yêu cầu mở khóa</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{statsCounts.unban}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Đăng ký mới</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{statsCounts.users}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('unban')}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === 'unban'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Yêu cầu mở khóa ({statsCounts.unban})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('users')}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Người dùng ({statsCounts.users})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('content')}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === 'content'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Bài viết & Bình luận ({statsCounts.content})
          </button>

          <button
            type="button"
            onClick={() => setShowUnreadOnly((prev) => !prev)}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              showUnreadOnly
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Chưa đọc ({statsCounts.unread})
          </button>
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thông báo..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-2 text-xs text-slate-500">Đang tải danh sách thông báo...</p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-slate-800 dark:text-blue-400">
            <Bell size={24} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Không có thông báo nào phù hợp
          </p>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Hệ thống sẽ tự động cập nhật ngay khi có sự kiện mới từ người dùng hoặc hoạt động trên mạng xã hội.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => {
            const id = item._id || item.id
            const typeConfig = getTypeConfig(item.type)
            const TypeIcon = typeConfig.icon
            const isUnread = !item.isRead

            return (
              <div
                key={id}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-150 ${
                  isUnread
                    ? 'border-blue-300 bg-blue-50/40 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${typeConfig.bg}`}>
                    <TypeIcon size={18} />
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeConfig.badge}`}>
                        {typeConfig.label}
                      </span>
                      <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-blue-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.title}
                      </h3>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900" />
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto sm:ml-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>

                    {item.actor?.email && (
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        Người thực hiện: <span className="font-medium text-slate-600 dark:text-slate-300">{item.actor.name || item.actor.email}</span> ({item.actor.email})
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.link && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isUnread && onMarkAsRead) {
                          onMarkAsRead(id)
                        }
                        if (onNavigateSection) {
                          onNavigateSection(item.link)
                        }
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
                    >
                      <ExternalLink size={13} />
                      Xử lý ngay
                    </button>
                  )}

                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => onMarkAsRead(id)}
                      title="Đánh dấu đã đọc"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Check size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteNotification(id)}
                    title="Xóa thông báo"
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminNotificationsPanel

