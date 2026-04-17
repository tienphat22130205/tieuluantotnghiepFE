import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const BanUserModal = ({ isOpen, user, isSubmitting, onCancel, onSubmit }) => {
  const [reason, setReason] = useState('')
  const [durationHours, setDurationHours] = useState('')
  const [banDate, setBanDate] = useState(null)
  const [banTime, setBanTime] = useState(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const reasonError = useMemo(
    () => (!reason.trim() ? 'Vui lòng nhập lý do khóa.' : ''),
    [reason]
  )

  const banUntilError = useMemo(() => {
    const hasDate = Boolean(banDate)
    const hasTime = Boolean(banTime)
    if (hasDate === hasTime) return ''
    return 'Vui lòng chọn đủ cả ngày và giờ cho thời điểm mở khóa.'
  }, [banDate, banTime])

  if (!isOpen) return null

  const handleSubmit = () => {
    const trimmedReason = reason.trim()
    if (!trimmedReason) return

    const payload = { reason: trimmedReason }

    const parsedDurationHours = Number(durationHours)
    if (durationHours.trim() && Number.isFinite(parsedDurationHours) && parsedDurationHours > 0) {
      payload.durationHours = parsedDurationHours
    }

    if (banDate && banTime) {
      const mergedDate = new Date(banDate)
      mergedDate.setHours(banTime.getHours(), banTime.getMinutes(), 0, 0)

      if (Number.isFinite(mergedDate.getTime())) {
        payload.banUntil = mergedDate.toISOString()
      }
    }

    onSubmit(payload)
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40" onClick={isSubmitting ? undefined : onCancel} />
      <div className="fixed left-1/2 top-1/2 z-[71] w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Khóa tài khoản</h3>
          <p className="mt-1 text-sm text-slate-600">
            {`Nhập thông tin khóa cho ${user?.fullName || 'người dùng này'}.`}
          </p>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Lý do khóa</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Ví dụ: Vi phạm quy định cộng đồng"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {reasonError && <p className="mt-1 text-xs text-rose-600">{reasonError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Khóa tạm (giờ, tùy chọn)</label>
            <input
              type="number"
              min="1"
              value={durationHours}
              onChange={(event) => setDurationHours(event.target.value)}
              placeholder="Ví dụ: 24"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hoặc khóa đến thời điểm (tùy chọn)</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DatePicker
                selected={banDate}
                onChange={(date) => setBanDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <DatePicker
                selected={banTime}
                onChange={(time) => setBanTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Giờ"
                dateFormat="HH:mm"
                placeholderText="Chọn giờ"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {banUntilError && <p className="mt-1 text-xs text-rose-600">{banUntilError}</p>}
          </div>

          <p className="text-xs text-slate-500">
            Nếu bỏ trống cả 2 trường thời hạn, hệ thống sẽ hiểu là khóa vĩnh viễn.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim() || Boolean(banUntilError)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            OK
          </button>
        </div>
      </div>
    </>
  )
}

export default BanUserModal
