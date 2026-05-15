import { useState } from 'react'
import UnbanRequestForm from './UnbanRequestForm'

const UnbanRequestPanel = ({ initialEmail = '', visible = false }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenForm = () => {
    setIsOpen(true)
    requestAnimationFrame(() => {
      const target = document.getElementById('unban-request-form')
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  if (!visible) return null

  return (
    <section className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
      <h2 className="text-sm font-semibold text-rose-800">Tài khoản đang bị khóa</h2>
      <p className="mt-1 text-xs text-rose-700">
        Bạn có thể gửi yêu cầu để admin xem xét mở khóa tài khoản.
      </p>

      {!isOpen && (
        <div className="mt-3">
          <button
            type="button"
            onClick={handleOpenForm}
            className="text-sm font-semibold text-rose-700 underline underline-offset-2 transition hover:text-rose-800"
          >
            Yêu cầu hỗ trợ
          </button>
        </div>
      )}

      {isOpen && <UnbanRequestForm initialEmail={initialEmail} />}
    </section>
  )
}

export default UnbanRequestPanel
