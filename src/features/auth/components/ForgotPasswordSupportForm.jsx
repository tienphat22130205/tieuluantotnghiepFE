import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AiOutlineMail, AiOutlineCheckCircle } from 'react-icons/ai'
import authService from '../services/authService'

const ForgotPasswordSupportForm = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.trim()) {
      toast.warning('Vui lòng nhập địa chỉ email')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(email.trim())
      setIsSuccess(true)
      setCountdown(60)
      toast.success(
        response?.message || 'Đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn!',
        { autoClose: 4000 }
      )
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra. Vui lòng thử lại sau.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || isLoading) return
    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(email.trim())
      setCountdown(60)
      toast.success(
        response?.message || 'Đã gửi lại link đặt lại mật khẩu!',
        { autoClose: 4000 }
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gửi lại thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <AiOutlineCheckCircle size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Đã gửi link khôi phục mật khẩu!
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Vui lòng kiểm tra hộp thư email (bao gồm cả thư mục Spam):
          <br />
          <strong className="text-slate-900 font-bold">{email}</strong>
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isLoading}
            className="text-xs font-bold text-primary-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {countdown > 0
              ? `Gửi lại sau ${countdown}s`
              : 'Chưa nhận được? Gửi lại'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800">Khôi phục mật khẩu qua Email</h3>
      <p className="mt-1 text-xs text-slate-500">
        Nhập địa chỉ email đăng ký tài khoản của bạn để nhận liên kết đặt lại mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Email đăng ký
          </label>
          <div className="relative">
            <AiOutlineMail
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Đang gửi link...</span>
            </>
          ) : (
            'GỬI LIÊN KẾT ĐẶT LẠI MẬT KHẨU'
          )}
        </button>
      </form>
    </div>
  )
}

export default ForgotPasswordSupportForm
