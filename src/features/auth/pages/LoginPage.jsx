import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { AiOutlineClose } from 'react-icons/ai'
import { login, checkRole } from '../store/authSlice'
import LoginForm from '../components/LoginForm'
import useLockNotice from '../hooks/useLockNotice'
import { getRedirectPathByRole } from '@/utils/roleRedirect'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading } = useSelector((state) => state.auth)
  const {
    notice: loginNotice,
    isLockedNotice,
    showNotice,
    clearNotice,
  } = useLockNotice()

  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(login(form)).unwrap()
      clearNotice()
      toast.success('Đăng nhập thành công! 🎉', { autoClose: 2000 })

      // Kiểm tra role từ backend
      try {
        const roleData = await dispatch(checkRole()).unwrap()
        const redirectPath = getRedirectPathByRole(roleData?.role)
        navigate(redirectPath)
      } catch (roleCheckErr) {
        // Nếu checkRole fail, redirect mặc định
        console.warn('Role check failed, redirecting to home:', roleCheckErr)
        navigate('/home')
      }
    } catch (err) {
      const errorMsg =
        (typeof err === 'string' ? err : err?.message)
        || 'Đăng nhập thất bại. Vui lòng thử lại'
      showNotice(errorMsg)
      console.error('Login failed:', err)
    }
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
      <p className="mb-8 text-sm font-medium text-slate-500">
        Nhập email và mật khẩu của bạn để đăng nhập
      </p>

      {loginNotice && (
        <div
          className={`mb-4 rounded-xl border px-3 py-2.5 text-sm ${
            isLockedNotice
              ? 'border-rose-300 bg-rose-50 text-rose-700'
              : 'border-amber-300 bg-amber-50 text-amber-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>
              {isLockedNotice ? 'Tài khoản đang bị khóa: ' : ''}
              {loginNotice}
            </p>
            <button
              type="button"
              onClick={clearNotice}
              className="mt-0.5 rounded p-0.5 opacity-70 transition hover:opacity-100"
              aria-label="Đóng thông báo"
              title="Đóng thông báo"
            >
              <AiOutlineClose size={14} />
            </button>
          </div>
        </div>
      )}

      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <p className="mt-8 text-center text-sm text-slate-500">
        Bạn chưa có tài khoản?{' '}
        <Link to="/register" className="font-bold text-primary-600 hover:underline">
          Đăng ký
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-slate-500">
        Cần hỗ trợ tài khoản?{' '}
        <Link to="/support-request" className="font-bold text-primary-600 hover:underline">
          Yêu cầu hỗ trợ
        </Link>
      </p>
    </>
  )
}

export default LoginPage
