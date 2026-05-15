import { useMemo, useState } from 'react'
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { COLORS } from '@/theme/colors'

const statusLabelMap = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
}

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

const formatDateTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '--'

  return date.toLocaleString('vi-VN', {
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
  const [noteDrafts, setNoteDrafts] = useState({})

  const currentPage = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)

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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Yêu cầu mở khóa tài khoản</h2>
          <p className="text-xs text-slate-500">
            Chờ duyệt: {statusSummary.pending} | Đã duyệt: {statusSummary.approved} | Đã từ chối: {statusSummary.rejected}
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {['pending', 'approved', 'rejected'].map((status) => {
            const Icon = statusIcons[status]
            const isActive = statusFilter === status
            const palette = statusStyleMap[status]

            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Email</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Lý do user</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Trạng thái</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Ghi chú admin</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Tạo lúc</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Xử lý lúc</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-sm text-slate-500">
                  Đang tải danh sách yêu cầu mở khóa...
                </td>
              </tr>
            )}

            {!isLoading && requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-sm text-slate-500">
                  Không có yêu cầu mở khóa nào.
                </td>
              </tr>
            )}

            {requests.map((request) => {
              const status = statusLabelMap[request.status] ? request.status : 'pending'
              const isRowBusy = busyRequestId === request.id
              const isPending = status === 'pending'
              const noteValue = noteDrafts[request.id] ?? request.adminNote ?? ''

              return (
                <tr key={request.id}>
                  <td className="border-b border-slate-100 px-2 py-2 text-sm text-slate-900">{request.email}</td>
                  <td className="border-b border-slate-100 px-2 py-2 text-sm text-slate-900">{request.reason || '--'}</td>
                  <td className="border-b border-slate-100 px-2 py-2">
                    {(() => {
                      const Icon = statusIcons[status]
                      const palette = statusStyleMap[status]
                      return (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: palette.chipBg,
                            color: palette.chipText,
                            borderColor: palette.chipBorder,
                          }}
                        >
                          <Icon size={12} />
                          {statusLabelMap[status]}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2">
                    <textarea
                      rows={2}
                      value={noteValue}
                      onChange={(event) => {
                        setNoteDrafts((prev) => ({ ...prev, [request.id]: event.target.value }))
                      }}
                      disabled={isRowBusy || !isPending}
                      placeholder={isPending ? 'Nhập ghi chú khi duyệt/từ chối' : 'Đã xử lý'}
                      className="w-[260px] rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-sm">{formatDateTime(request.createdAt)}</td>
                  <td className="border-b border-slate-100 px-2 py-2 text-sm">{formatDateTime(request.reviewedAt)}</td>
                  <td className="border-b border-slate-100 px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!isPending || isRowBusy}
                        onClick={() => handleReview(request.id, 'approve')}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-55"
                        style={{
                          backgroundColor: 'rgba(5, 150, 105, 0.12)',
                          color: COLORS.adminSuccess,
                        }}
                      >
                        <FiCheckCircle size={13} />
                        {isRowBusy ? 'Đang xử lý...' : 'Duyệt'}
                      </button>
                      <button
                        type="button"
                        disabled={!isPending || isRowBusy}
                        onClick={() => handleReview(request.id, 'reject')}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-55"
                        style={{
                          backgroundColor: 'rgba(220, 38, 38, 0.12)',
                          color: COLORS.adminDanger,
                        }}
                      >
                        <FiXCircle size={13} />
                        {isRowBusy ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                    </div>
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
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trang trước
        </button>
        <span className="text-xs font-medium text-slate-600">Trang {currentPage}/{totalPages}</span>
        <button
          type="button"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </section>
  )
}

export default UnbanRequestsManagementPanel
