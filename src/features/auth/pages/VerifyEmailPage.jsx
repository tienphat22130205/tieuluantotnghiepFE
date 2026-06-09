import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import authService from '../services/authService'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams])

  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Nhấn "Xác minh email" để kích hoạt tài khoản của bạn.')

  const handleVerify = async () => {
    if (!token) {
      setStatus('error')
      setMessage('Link xác minh không hợp lệ hoặc thiếu token.')
      return
    }

    setStatus('loading')
    try {
      const response = await authService.verifyEmail(token)
      const successMessage = response?.message || 'Xác minh email thành công! Bạn có thể quay lại tab đăng ký để tiếp tục.'
      setStatus('success')
      setMessage(successMessage)
      toast.success(successMessage, { autoClose: 3000 })
    } catch (error) {
      const errorMessage = error?.message || 'Xác minh email thất bại. Link có thể đã hết hạn.'
      setStatus('error')
      setMessage(errorMessage)
      toast.error(errorMessage, { autoClose: 3000 })
    }
  }

  // Tự động xác minh khi load trang nếu có token
  useEffect(() => {
    if (token && status === 'idle') {
      handleVerify()
    }
  }, [token, status])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black tracking-tight text-slate-900">Xác minh email</h2>
      <p className="mt-2 text-sm text-slate-600">
        Hoàn tất bước xác thực để kích hoạt tài khoản và đăng nhập vào hệ thống.
      </p>

      <div
        className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
          status === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : status === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
        }`}
      >
        {message}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={!token || status === 'loading' || status === 'success'}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {status === 'loading' ? 'Đang xác minh...' : 'Xác minh email'}
      </button>

      <div className="mt-4 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  )
}

export default VerifyEmailPage
