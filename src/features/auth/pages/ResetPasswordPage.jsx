import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCheckCircle,
  AiOutlineArrowLeft,
} from 'react-icons/ai'
import authService from '../services/authService'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error('Mã xác thực đặt lại mật khẩu không hợp lệ hoặc đã bị thiếu.')
      return
    }

    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.resetPassword({
        token,
        email,
        newPassword,
        confirmPassword,
      })

      setIsSuccess(true)
      toast.success(response?.message || 'Đặt lại mật khẩu thành công! 🎉', {
        autoClose: 3000,
      })

      setTimeout(() => {
        navigate('/login')
      }, 3500)
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!isSuccess ? (
        <>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">
            Đặt lại mật khẩu
          </h1>
          <p className="mb-8 text-sm font-medium text-slate-500">
            {email ? (
              <>
                Tạo mật khẩu mới an toàn cho tài khoản: <strong>{email}</strong>
              </>
            ) : (
              'Vui lòng nhập mật khẩu mới của bạn bên dưới'
            )}
          </p>

          {!token ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 space-y-2">
              <p>Liên kết không hợp lệ do thiếu mã token xác thực.</p>
              <Link
                to="/forgot-password"
                className="inline-block text-primary-600 underline font-bold"
              >
                Gửi lại yêu cầu đặt lại mật khẩu
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <AiOutlineLock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    autoFocus
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={18} />
                    ) : (
                      <AiOutlineEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <AiOutlineLock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full justify-center items-center gap-2 rounded-2xl bg-primary-600 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  'LƯU MẬT KHẨU MỚI'
                )}
              </button>
            </form>
          )}
        </>
      ) : (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <AiOutlineCheckCircle size={36} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Đổi mật khẩu thành công!
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Mật khẩu tài khoản của bạn đã được cập nhật. Bạn sẽ được tự động chuyển hướng đến trang đăng nhập trong giây lát...
          </p>

          <div className="pt-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-primary-700 transition"
            >
              <span>ĐĂNG NHẬP NGAY</span>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary-600 transition"
        >
          <AiOutlineArrowLeft size={16} />
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>
    </>
  )
}

export default ResetPasswordPage
