import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AiOutlineBell,
  AiOutlineCheckCircle,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineMessage,
  AiOutlineUserAdd,
  AiOutlineLoading3Quarters,
} from 'react-icons/ai'
import { FiArrowLeft } from 'react-icons/fi'
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

const NotificationPage = () => {
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
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications()

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

  const handleNotificationClick = (item) => {
    markAsRead(item.id)
    if (item.actionPath && item.actionPath !== '/notifications') {
      navigate(item.actionPath)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-[#f4f7fb] pb-16">
      <div className="mx-auto max-w-2xl bg-white min-h-screen shadow-none md:shadow-sm md:rounded-3xl p-4 md:p-6 space-y-4">
        {/* Header matching reference image */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-200 transition cursor-pointer"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Thông báo
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={isUpdating}
                className="text-xs font-semibold text-primary-600 hover:underline cursor-pointer"
              >
                Đã đọc tất cả
              </button>
            )}
          </div>
        </div>

        {/* Pill Filter Tabs matching reference image (All / Following) */}
        <div className="flex items-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition cursor-pointer ${
              filterTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('following')}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition cursor-pointer ${
              filterTab === 'following'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đang theo dõi
          </button>
        </div>

        {/* Section Today */}
        <div className="pt-2">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
            Hôm nay
          </h2>

          {isLoading && (
            <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <AiOutlineLoading3Quarters size={18} className="animate-spin text-primary-600" />
              Đang tải thông báo...
            </div>
          )}

          {!isLoading && error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredNotifications.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-sm">
              Chưa có thông báo nào.
            </div>
          )}

          {/* Notifications Items List */}
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((item) => {
              const senderName = item.sender?.fullName || item.actor?.full_name || item.actor?.fullName || item.user?.fullName || item.title || 'Người dùng'
              const senderAvatar = item.sender?.avatar || item.actor?.avatar || item.actor?.avatarUrl || item.actor?.profilePicture || item.user?.avatar || ''
              const isFollowType = item.type === 'follow' || item.type === 'friend'

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start justify-between gap-3 py-3.5 px-1 hover:bg-slate-50 transition cursor-pointer ${
                    item.isUnread ? 'bg-blue-50/40 rounded-2xl my-1' : ''
                  }`}
                >
                  {/* Avatar with blue icon badge on bottom-right matching reference image */}
                  <div className="relative shrink-0 w-12 h-12">
                    <Avatar
                      src={senderAvatar}
                      name={senderName}
                      size="md"
                      className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 z-10 w-5 h-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-sm">
                      {isFollowType ? (
                        <AiOutlineUserAdd size={11} strokeWidth={2} />
                      ) : (
                        <AiFillHeart size={11} />
                      )}
                    </div>
                  </div>

                  {/* Notification Content Text */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-slate-900 leading-snug">
                      <span className="font-bold mr-1 text-slate-900">{senderName}</span>
                      <span className="text-slate-700">{item.description || 'đã tương tác với bạn.'}</span>
                      <span className="ml-1.5 text-xs text-slate-400 font-semibold whitespace-nowrap">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </p>
                  </div>

                  {/* Right side Action Button / Thumbnail */}
                  {isFollowType && (
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
                    >
                      Theo dõi
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
