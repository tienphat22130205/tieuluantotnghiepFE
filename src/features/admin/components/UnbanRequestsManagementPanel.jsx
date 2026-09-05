import { useMemo, useState } from 'react'
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { COLORS } from '@/theme/colors'
import { usePreferences } from '@/context/PreferencesContext'

const statusStyleMap = {
  pending: {
    chipBg: COLORS.adminWarningSoft,
    chipText: COLORS.adminWarning,
    chipBorder: 'rgba(217, 119, 6, 0.18)',
    actionBg: 'rgba(217, 119, 6, 0.12)',
    actionText: COLORS.adminWarning,
  },
  approved: {
    chipBg: COLORS.adminSuccessSoft,
    chipText: COLORS.adminSuccess,
    chipBorder: 'rgba(5, 150, 105, 0.18)',
    actionBg: 'rgba(5, 150, 105, 0.12)',
    actionText: COLORS.adminSuccess,
  },
  rejected: {
    chipBg: COLORS.adminDangerSoft,
    chipText: COLORS.adminDanger,
    chipBorder: 'rgba(220, 38, 38, 0.18)',
    actionBg: 'rgba(220, 38, 38, 0.12)',
    actionText: COLORS.adminDanger,
  },
}

const statusIcons = {
  pending: FiClock,
  approved: FiCheckCircle,
  rejected: FiXCircle,
}

const formatDateTime = (value, locale = 'vi') => {
  if (!value) return '--'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '--'

  return date.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const UnbanRequestsManagementPanel = ({
  requests,
  isLoading,
  error,
  pagination,
  statusFilter,
  busyRequestId,
  onStatusFilterChange,
  onPageChange,
  onReview,
}) => {
  const { t, language } = usePreferences()
  const [noteDrafts, setNoteDrafts] = useState({})

  const currentPage = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)

  const statusLabelMap = useMemo(() => ({
    pending: t('admin.tabPending') || 'Chờ duyệt',
    approved: t('admin.tabApproved') || 'Đã duyệt',
    rejected: t('admin.tabRejected') || 'Đã từ chối',
  }), [t])

  const statusSummary = useMemo(() => {
    return requests.reduce(
      (acc, item) => {
        const status = String(item?.status || 'pending').toLowerCase()
        if (status === 'approved') acc.approved += 1
        else if (status === 'rejected') acc.rejected += 1
        else acc.pending += 1
        return acc
      },
      { pending: 0, approved: 0, rejected: 0 }
    )
  }, [requests])

  const handleReview = (requestId, decision) => {
    const adminNote = String(noteDrafts[requestId] || '').trim()
    onReview(requestId, decision, adminNote)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {t('admin.unbanRequestsTitle') || 'Yêu cầu mở khóa tài khoản'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('admin.tabPending') || 'Chờ duyệt'}: {statusSummary.pending} | {t('admin.tabApproved') || 'Đã duyệt'}: {statusSummary.approved} | {t('admin.tabRejected') || 'Đã từ chối'}: {statusSummary.rejected}
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800">
          {['pending', 'approved', 'rejected'].map((status) => {
            const Icon = statusIcons[status]
            const isActive = statusFilter === status
            const palette = statusStyleMap[status]

            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isActive ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: isActive ? palette.chipBg : 'transparent',
                  color: palette.chipText,
                  border: `1px solid ${isActive ? palette.chipBorder : 'transparent'}`,
                }}
              >
                <Icon size={14} />
                {statusLabelMap[status]}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.email') || 'Email'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.userReason') || 'Lý do người dùng'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.status') || 'Trạng thái'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.adminNote') || 'Ghi chú admin'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.createdAt') || 'Tạo lúc'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.reviewedAt') || 'Xử lý lúc'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.actions') || 'Hành động'}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('admin.loadingData') || 'Đang tải dữ liệu...'}
                </td>
              </tr>
            )}

            {!isLoading && requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('admin.noUnbanRequests') || 'Không có yêu cầu mở khóa nào.'}
                </td>
              </tr>
            )}

            {!isLoading && requests.map((req) => {
              const status = String(req.status || 'pending').toLowerCase()
              const isPending = status === 'pending'
              const palette = statusStyleMap[status] || statusStyleMap.pending
              const noteDraft = noteDrafts[req.id] ?? (req.adminNote || '')
              const isBusy = busyRequestId === req.id

              return (
                <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                  <td className="border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-800 dark:border-slate-800 dark:text-slate-100">
                    {req.email || req.userId?.email || '--'}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    <p className="line-clamp-2 max-w-sm">{req.reason || '--'}</p>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: palette.chipBg,
                        color: palette.chipText,
                        border: `1px solid ${palette.chipBorder}`,
                      }}
                    >
                      {statusLabelMap[status] || status}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    {isPending ? (
                      <input
                        type="text"
                        value={noteDraft}
                        onChange={(event) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [req.id]: event.target.value,
                          }))
                        }
                        placeholder={t('admin.enterAdminNote') || 'Nhập ghi chú cho quyết định...'}
                        className="w-full min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                        disabled={isBusy}
                      />
                    ) : (
                      <span className="text-xs text-slate-600 dark:text-slate-300">{req.adminNote || '--'}</span>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    {formatDateTime(req.createdAt, language)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    {formatDateTime(req.reviewedAt, language)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReview(req.id, 'approved')}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          {isBusy ? (t('admin.processing') || 'Đang xử lý...') : (t('admin.approve') || 'Chấp thuận')}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReview(req.id, 'rejected')}
                          className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                        >
                          {isBusy ? (t('admin.processing') || 'Đang xử lý...') : (t('admin.reject') || 'Từ chối')}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {statusLabelMap[status] || status}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('admin.prevPage') || 'Trang trước'}
        </button>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {t('admin.page') || 'Trang'} {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('admin.nextPage') || 'Trang sau'}
        </button>
      </div>
    </section>
  )
}

export default UnbanRequestsManagementPanel
