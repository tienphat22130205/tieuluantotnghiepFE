import { COLORS } from '@/theme/colors'

const RoleConfirmModal = ({ isOpen, userName, roleLabel, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800">Xác nhận chuyển vai trò</h3>
        <p className="mt-2 text-sm text-slate-600">
          Bạn có chắc chắn muốn chuyển vai trò của <span className="font-semibold text-slate-900">{userName}</span> sang <span className="font-semibold text-slate-900">{roleLabel}</span> không?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: COLORS.primary }}
          >
            {isLoading ? 'Đang xử lý...' : 'Có'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleConfirmModal
