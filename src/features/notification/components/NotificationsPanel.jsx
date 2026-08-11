import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AiOutlineBell,
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiFillHeart,
  AiOutlineUserAdd,
  AiOutlineLoading3Quarters,
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { Avatar } from '@/components/ui'
import useNotifications from '../hooks/useNotifications'

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Vừa xong'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Vừa xong'

  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 604800)}w`
}

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'following'
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isUpdating,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
  } = useNotifications()

  const handleNotificationClick = (item) => {
    markAsRead(item.id)
    onClose?.()
    if (item.actionPath && item.actionPath !== '/notifications') {
      navigate(item.actionPath)
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return
    try {
      await deleteAllNotifications()
      toast.success('Đã xóa tất cả thông báo')
    } catch (err) {
      toast.error(err?.message || 'Xóa tất cả thông báo thất bại')
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (filterTab === 'following') {
      return item.type === 'follow' || item.type === 'friend'
    }
    return true
  })

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 z-[55] pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'
        }`}
      />

      {/* Slide-over Panel from Right */}
      <aside
        className={`fixed inset-y-0 right-0 z-[60] w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200/80 flex flex-col transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <AiOutlineBell size={22} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Thông báo</h2>
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={isUpdating}
                title="Đánh dấu tất cả đã đọc"
                className="p-1.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <AiOutlineCheckCircle size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Đóng"
              className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <AiOutlineClose size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Quick Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('following')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterTab === 'following'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Đang theo dõi
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllNotifications}
              disabled={isUpdating}
              className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Notification Items Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-slate-100">
          {isLoading && (
            <div className="py-16 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <AiOutlineLoading3Quarters size={18} className="animate-spin text-blue-600" />
              Đang tải thông báo...
            </div>
          )}

          {!isLoading && error && (
            <div className="m-4 p-4 rounded-2xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredNotifications.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-sm">
              Chưa có thông báo nào.
            </div>
          )}

          {filteredNotifications.map((item) => {
            const senderName = item.sender?.fullName || item.actor?.full_name || item.actor?.fullName || item.user?.fullName || item.title || 'Người dùng'
            const senderAvatar = item.sender?.avatar || item.actor?.avatar || item.actor?.avatarUrl || item.actor?.profilePicture || item.user?.avatar || ''
            const isFollowType = item.type === 'follow' || item.type === 'friend'

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start justify-between gap-3 py-3 px-2 rounded-2xl transition cursor-pointer ${
                  item.isUnread ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar with action badge */}
                <div className="relative shrink-0 mt-0.5 w-11 h-11">
                  <Avatar
                    src={senderAvatar}
                    name={senderName}
                    size="md"
                    className="w-11 h-11 rounded-full ring-2 ring-white shadow-sm object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 z-10 w-4.5 h-4.5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-sm">
                    {isFollowType ? (
                      <AiOutlineUserAdd size={10} strokeWidth={2} />
                    ) : (
                      <AiFillHeart size={10} />
                    )}
                  </div>
                </div>

                {/* Content Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-900 leading-snug">
                    <span className="font-bold mr-1 text-slate-900">{senderName}</span>
                    <span className="text-slate-700">{item.description || 'đã tương tác với bạn.'}</span>
                  </p>
                  <span className="mt-1 block text-[11px] font-semibold text-slate-400">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>

                {/* Follow Button */}
                {isFollowType && (
                  <button
                    type="button"
                    className="shrink-0 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
                  >
                    Theo dõi
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default NotificationsPanel
