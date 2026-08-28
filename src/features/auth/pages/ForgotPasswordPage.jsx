import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  AiOutlineMail,
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
} from 'react-icons/ai'
import authService from '../services/authService'

const ForgotPasswordPage = () => {
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

  return (
    <>
      {!isSuccess ? (
        <>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">
            Quên mật khẩu?
          </h1>
          <p className="mb-8 text-sm font-medium text-slate-500">
            Nhập email đã đăng ký tài khoản của bạn để nhận liên kết đặt lại mật khẩu mới.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Email tài khoản
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
        </>
      ) : (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <AiOutlineCheckCircle size={36} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Kiểm tra hộp thư email
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Chúng tôi đã gửi hướng dẫn và đường dẫn đặt lại mật khẩu đến:
            <br />
            <strong className="text-slate-900 font-bold">{email}</strong>
          </p>

          <p className="text-xs text-slate-400">
            Nếu bạn không thấy email, hãy kiểm tra thư mục Thư rác (Spam) hoặc bấm gửi lại bên dưới.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {countdown > 0
                ? `Gửi lại sau ${countdown} giây`
                : 'Chưa nhận được email? Gửi lại'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary-600 transition"
        >
          <AiOutlineArrowLeft size={16} />
          <span>Quay lại trang Đăng nhập</span>
        </Link>
      </div>
    </>
  )
}

export default ForgotPasswordPage
