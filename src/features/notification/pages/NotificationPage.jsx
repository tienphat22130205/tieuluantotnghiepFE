import { Link } from 'react-router-dom'
import { AiOutlineBell, AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { toast } from 'react-toastify'
import useNotifications from '../hooks/useNotifications'

const formatTime = (isoString) => {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Vừa xong'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

const NotificationPage = () => {
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

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      toast.success('Đã xóa thông báo')
    } catch (err) {
      toast.error(err?.message || 'Xóa thông báo thất bại')
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

  return (
    <div className="min-h-[70vh] rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
                <AiOutlineBell size={20} className="text-primary-600" />
                Thông báo
              </h1>
              <p className="mt-1 text-sm text-slate-500">Theo dõi cập nhật mới để không bỏ lỡ hoạt động quan trọng.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary-300 hover:text-primary-700"
              >
                <AiOutlineCheckCircle size={14} />
                Đánh dấu đã đọc
              </button>

              <button
                type="button"
                onClick={handleDeleteAllNotifications}
                disabled={isUpdating || notifications.length === 0}
                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo mới.` : 'Bạn đã đọc hết thông báo.'}
          </p>
        </section>

        <section className="space-y-3">
          {isLoading && (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              <div className="inline-flex items-center gap-2">
                <AiOutlineLoading3Quarters size={14} className="animate-spin" />
                Đang tải thông báo...
              </div>
            </article>
          )}

          {!isLoading && error && (
            <article className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              {error}
            </article>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Bạn chưa có thông báo nào.
            </article>
          )}

          {notifications.map((notificationItem) => (
            <article
              key={notificationItem.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                notificationItem.isUnread ? 'border-primary-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{notificationItem.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notificationItem.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <AiOutlineClockCircle size={13} />
                    {formatTime(notificationItem.createdAt)}
                  </p>
                </div>

                {notificationItem.isUnread && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  to={notificationItem.actionPath}
                  onClick={() => markAsRead(notificationItem.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700"
                >
                  {notificationItem.actionLabel}
                </Link>

                {notificationItem.isUnread && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notificationItem.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteNotification(notificationItem.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                >
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default NotificationPage
