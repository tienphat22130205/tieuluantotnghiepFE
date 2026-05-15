import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import authService from '../services/authService'

const normalizeHistoryItems = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.requests)) return payload.requests
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data?.requests)) return payload.data.requests
  if (Array.isArray(payload?.result?.items)) return payload.result.items
  if (Array.isArray(payload?.result?.requests)) return payload.result.requests
  return []
}

const normalizePagination = (payload, fallbackPage, fallbackLimit) => {
  const meta = payload?.pagination || payload?.meta || payload?.data?.pagination || payload?.data?.meta || {}

  const page = Number(meta?.page || payload?.page || fallbackPage || 1)
  const limit = Number(meta?.limit || payload?.limit || fallbackLimit || 10)
  const totalItems = Number(
    meta?.total
    || meta?.totalItems
    || meta?.total_items
    || payload?.total
    || payload?.totalItems
    || payload?.total_items
    || 0
  )

  const totalPages = Number(
    meta?.totalPages
    || meta?.total_pages
    || payload?.totalPages
    || payload?.total_pages
    || (Number.isFinite(totalItems) && limit > 0 ? Math.ceil(totalItems / limit) : 1)
  )

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
    totalItems: Number.isFinite(totalItems) && totalItems >= 0 ? totalItems : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
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

const statusLabelMap = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
}

const statusClassMap = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

const UnbanRequestForm = ({ initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyItems, setHistoryItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 })

  useEffect(() => {
    if (!initialEmail) return
    setEmail((prev) => prev || initialEmail)
  }, [initialEmail])

  const emailError = useMemo(() => {
    const trimmed = email.trim()
    if (!trimmed) return 'Vui lòng nhập email.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) return 'Email không hợp lệ.'
    return ''
  }, [email])

  const reasonError = useMemo(() => {
    if (!reason.trim()) return 'Vui lòng nhập nội dung cần hỗ trợ.'
    return ''
  }, [reason])

  const loadHistory = useCallback(async (nextPage = 1) => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setIsLoadingHistory(true)
    setHistoryError('')

    try {
      const response = await authService.getUnbanRequestHistory({
        email: trimmedEmail,
        page: nextPage,
        limit: pagination.limit,
      })

      const items = normalizeHistoryItems(response).map((item) => ({
        id: String(item?._id || item?.id || item?.requestId || item?.request_id || Math.random()),
        status: String(item?.status || 'pending').toLowerCase(),
        reason: item?.reason || item?.requestReason || '--',
        adminNote: item?.adminNote || item?.admin_note || '',
        createdAt: item?.createdAt || item?.created_at,
        reviewedAt: item?.reviewedAt || item?.reviewed_at || item?.updatedAt || item?.updated_at,
      }))

      setHistoryItems(items)
      setPagination(normalizePagination(response, nextPage, pagination.limit))
    } catch (error) {
      setHistoryItems([])
      setHistoryError(error?.message || 'Không tải được lịch sử yêu cầu mở khóa.')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [email, pagination.limit])

  const handleSubmitRequest = async (event) => {
    event.preventDefault()

    if (emailError || reasonError) return

    setIsSubmitting(true)
    try {
      await authService.createUnbanRequest({
        email: email.trim(),
        reason: reason.trim(),
      })

      toast.success('Đã gửi yêu cầu hỗ trợ đến admin.', { autoClose: 2400 })
      setReason('')
      loadHistory(1)
    } catch (error) {
      toast.error(error?.message || 'Gửi yêu cầu hỗ trợ thất bại.', { autoClose: 2800 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="unban-request-form" className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <form className="space-y-3" onSubmit={handleSubmitRequest}>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email tài khoản</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {emailError && <p className="mt-1 text-xs text-rose-600">{emailError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nội dung cần hỗ trợ</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Mô tả tình trạng bạn đang gặp và mong muốn hỗ trợ..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {reasonError && <p className="mt-1 text-xs text-rose-600">{reasonError}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting || Boolean(emailError) || Boolean(reasonError)}
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
          </button>

          <button
            type="button"
            onClick={() => loadHistory(1)}
            disabled={isLoadingHistory || Boolean(emailError)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingHistory ? 'Đang tải...' : 'Xem lịch sử hỗ trợ'}
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Lịch sử yêu cầu hỗ trợ</h3>
          <span className="text-xs text-slate-500">Tổng: {pagination.totalItems}</span>
        </div>

          {historyError && (
            <p className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs text-rose-700">{historyError}</p>
        )}

        {isLoadingHistory && <p className="text-xs text-slate-500">Đang tải lịch sử...</p>}

        {!isLoadingHistory && historyItems.length === 0 && (
          <p className="text-xs text-slate-500">Chưa có yêu cầu hỗ trợ nào cho email này.</p>
        )}

        {!isLoadingHistory && historyItems.length > 0 && (
          <div className="space-y-2">
            {historyItems.map((item) => {
              const status = statusLabelMap[item.status] ? item.status : 'pending'

              return (
                <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClassMap[status]}`}>
                      {statusLabelMap[status]}
                    </span>
                    <span className="text-[11px] text-slate-500">Gửi lúc: {formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700">{item.reason}</p>
                  {item.adminNote && (
                    <p className="mt-1 text-xs text-slate-600">
                      Ghi chú admin: <span className="font-medium">{item.adminNote}</span>
                    </p>
                  )}
                  {(item.status === 'approved' || item.status === 'rejected') && (
                    <p className="mt-1 text-[11px] text-slate-500">Xử lý lúc: {formatDateTime(item.reviewedAt)}</p>
                  )}
                </article>
              )
            })}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={pagination.page <= 1 || isLoadingHistory}
                onClick={() => loadHistory(pagination.page - 1)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trang trước
              </button>
              <span className="text-xs text-slate-600">Trang {pagination.page}/{pagination.totalPages}</span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || isLoadingHistory}
                onClick={() => loadHistory(pagination.page + 1)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnbanRequestForm
