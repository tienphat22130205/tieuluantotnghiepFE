import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { AiOutlineClose, AiOutlineExclamationCircle } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { auth, googleProvider } from '@/services/firebase'
import { login, checkRole, loginWithGoogle } from '../store/authSlice'
import LoginForm from '../components/LoginForm'
import useLockNotice from '../hooks/useLockNotice'
import { getRedirectPathByRole } from '@/utils/roleRedirect'
import { getRememberedEmail, getRememberMeFlag } from '@/utils/authStorage'

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

  const rememberedEmail = getRememberedEmail()
  const savedRememberMe = getRememberMeFlag()

  const [form, setForm] = useState({
    email: rememberedEmail || '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(
    Boolean(rememberedEmail) || savedRememberMe
  )
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleSuccessRedirect = async (authData, googleResult) => {
    clearNotice()

    const isNewUser = Boolean(authData?.isNewUser || authData?.data?.isNewUser)
    const displayName =
      authData?.user?.firstName ||
      authData?.user?.username ||
      googleResult?.user?.displayName ||
      'bạn'

    if (isNewUser) {
      toast.success(`🎉 Chào mừng ${displayName} lần đầu gia nhập Mạng xã hội Zivo!`, { autoClose: 3500 })
    } else {
      toast.success(`Chào mừng ${displayName} trở lại với Zivo! 🎉`, { autoClose: 2000 })
    }

    try {
      const roleData = await dispatch(checkRole()).unwrap()
      navigate(getRedirectPathByRole(roleData?.role))
    } catch {
      navigate('/home')
    }
  }

  // Xử lý kết quả khi Firebase redirect trở về (mobile fallback)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (!result) return // Không có redirect result → bỏ qua

        setIsGoogleLoading(true)
        const idToken = await result.user.getIdToken()
        const authData = await dispatch(loginWithGoogle({ idToken, rememberMe })).unwrap()
        await handleGoogleSuccessRedirect(authData, result)
      } catch (err) {
        if (err?.code === 'auth/popup-closed-by-user') return
        console.error('Redirect result error:', err)
      } finally {
        setIsGoogleLoading(false)
      }
    }

    handleRedirectResult()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(login({ ...form, rememberMe })).unwrap()
      clearNotice()
      toast.success('Đăng nhập thành công! 🎉', { autoClose: 2000 })
      try {
        const roleData = await dispatch(checkRole()).unwrap()
        navigate(getRedirectPathByRole(roleData?.role))
      } catch (roleCheckErr) {
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      if (!auth) {
        toast.error('Firebase Auth chưa được khởi tạo. Vui lòng thêm các biến môi trường VITE_FIREBASE_* trên Vercel/Render.')
        setIsGoogleLoading(false)
        return
      }

      // Thử popup trước (hoạt động tốt trên desktop và hầu hết mobile)
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      const authData = await dispatch(loginWithGoogle({ idToken, rememberMe })).unwrap()
      await handleGoogleSuccessRedirect(authData, result)
    } catch (err) {
      // User tự đóng popup → không cần báo lỗi
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        setIsGoogleLoading(false)
        return
      }

      // Popup bị chặn (thường xảy ra trên mobile) → fallback sang redirect
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          // Redirect sẽ tải lại trang; kết quả xử lý ở useEffect getRedirectResult
          await signInWithRedirect(auth, googleProvider)
          return
        } catch (redirectErr) {
          console.error('Redirect login failed:', redirectErr)
        }
      }

      const errorMsg =
        (typeof err === 'string' ? err : err?.message)
        || 'Đăng nhập Google thất bại. Vui lòng thử lại'
      showNotice(errorMsg)
      console.error('Google login failed:', err)
      setIsGoogleLoading(false)
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
          role="alert"
          className={`mb-5 rounded-xl border px-3.5 py-3 text-sm shadow-sm transition-all duration-200 ${
            isLockedNotice
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AiOutlineExclamationCircle className="mt-0.5 shrink-0 text-base" />
              <p className="font-medium leading-relaxed">
                {isLockedNotice ? <strong className="font-semibold">Tài khoản bị khóa: </strong> : null}
                {loginNotice}
              </p>
            </div>
            <button
              type="button"
              onClick={clearNotice}
              className="mt-0.5 rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none"
              aria-label="Đóng thông báo"
              title="Đóng thông báo"
            >
              <AiOutlineClose size={15} />
            </button>
          </div>
        </div>
      )}

      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        rememberMe={rememberMe}
        onToggleRememberMe={() => setRememberMe((prev) => !prev)}
      />

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase">Hoặc</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isGoogleLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
        ) : (
          <FcGoogle size={20} />
        )}
        <span>{isGoogleLoading ? 'Đang xử lý...' : 'Đăng nhập bằng Google'}</span>
      </button>

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
