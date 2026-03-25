import { useEffect } from 'react'

/**
 * Custom Confirm Modal Component.
 * Thay thế cho window.confirm mặc định.
 */
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
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

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-[90%] max-w-sm z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận</h3>
          <p className="text-gray-600 text-sm">
            {message}
          </p>
        </div>
        <div className="flex bg-gray-50 px-6 py-3 justify-end gap-3 rounded-b-xl border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </>
  )
}

export default ConfirmModal