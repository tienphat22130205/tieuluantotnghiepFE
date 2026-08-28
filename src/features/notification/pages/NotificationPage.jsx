import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AiOutlineBell,
  AiFillHeart,
  AiOutlineUserAdd,
  AiOutlineLoading3Quarters,
} from 'react-icons/ai'
import { FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'
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
  const { t } = usePreferences()
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
  } = useNotifications()

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
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-2xl bg-white dark:bg-slate-900 shadow-xs rounded-3xl p-4 md:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('notifications.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={isUpdating}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                {t('notifications.markAllAsRead')}
              </button>
            )}
          </div>
        </div>

        {/* Pill Filter Tabs (All / Following) */}
        <div className="flex items-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`rounded-full px-5 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterTab === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('notifications.all')}
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('following')}
            className={`rounded-full px-5 py-1.5 text-xs font-bold transition cursor-pointer ${
              filterTab === 'following'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('notifications.following')}
          </button>
        </div>

        {/* Section List */}
        <div className="pt-2">
          {isLoading && (
            <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <AiOutlineLoading3Quarters size={18} className="animate-spin text-primary-600" />
              Đang tải...
            </div>
          )}

          {!isLoading && error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredNotifications.length === 0 && (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
              {t('notifications.empty')}
            </div>
          )}

          {/* Notifications Items List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.map((item) => {
              const senderName = item.sender?.fullName || item.actor?.full_name || item.actor?.fullName || item.user?.fullName || item.title || 'Người dùng'
              const senderAvatar = item.sender?.avatar || item.actor?.avatar || item.actor?.avatarUrl || item.actor?.profilePicture || item.user?.avatar || ''
              const isFollowType = item.type === 'follow' || item.type === 'friend'

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start justify-between gap-3 py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl transition cursor-pointer ${
                    item.isUnread ? 'bg-primary-50/40 dark:bg-primary-950/30' : ''
                  }`}
                >
                  <div className="relative shrink-0 w-11 h-11">
                    <Avatar
                      src={senderAvatar}
                      name={senderName}
                      size="md"
                      className="w-11 h-11 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-xs object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 z-10 w-4.5 h-4.5 rounded-full bg-primary-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs">
                      {isFollowType ? (
                        <AiOutlineUserAdd size={10} strokeWidth={2} />
                      ) : (
                        <AiFillHeart size={10} />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-snug">
                      <span className="font-bold mr-1 text-slate-900 dark:text-white">{senderName}</span>
                      <span className="text-slate-600 dark:text-slate-300">{item.description || 'đã tương tác với bạn.'}</span>
                      <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </p>
                  </div>

                  {isFollowType && (
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-primary-600 px-3.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition cursor-pointer"
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
