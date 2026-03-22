import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineMail, AiOutlineCheckCircle, AiOutlineCustomerService } from 'react-icons/ai'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth'
import RegisterForm from '../components/RegisterForm'

/**
 * Register Page – Trang đăng ký tài khoản mới (orchestrator).
 */
const RegisterPage = () => {
  const { isLoading, error, handleRegister, handleClearError } = useAuth()

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [formError, setFormError] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) handleClearError()
    if (formError) setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp!')
      return
    }

    if (form.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    const registerPayload = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    }

    const result = await handleRegister(registerPayload)

    if (result.meta.requestStatus === 'fulfilled') {
      setRegisteredEmail(registerPayload.email)
      toast.success('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.', {
        autoClose: 3000,
      })
    }
  }

  const handleUseAnotherEmail = () => {
    setRegisteredEmail('')
  }

  return (
    <div className="relative">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Tạo tài khoản mới</h2>
      <p className="text-sm text-gray-500 mb-5">
        Nhanh chóng và dễ dàng.
      </p>

      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {formError || error}
        </div>
      )}

      <RegisterForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <p className="text-sm text-center text-gray-500 mt-6">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Đăng nhập
        </Link>
      </p>

      {registeredEmail && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-100/95 px-4 py-6">
          <div className="w-full max-w-[560px] rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600">
                  <AiOutlineCustomerService size={24} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">Nhân viên tư vấn</p>
                  <p className="mt-1 text-sm leading-6 text-gray-700">
                    Chúng tôi đã gửi mail xác thực tài khoản. Vui lòng xác nhận email:
                    {' '}
                    <span className="font-bold text-gray-900">{registeredEmail}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-900">
                <AiOutlineMail size={18} className="text-primary-600" />
                <p className="text-sm font-semibold">Xác thực email để kích hoạt tài khoản</p>
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Sau khi nhấn link trong email, bạn có thể đăng nhập và sử dụng đầy đủ chức năng hệ thống.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleUseAnotherEmail}
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Đây không phải email của tôi
              </button>

              <button
                type="button"
                onClick={() => window.open('https://mail.google.com', '_blank', 'noopener,noreferrer')}
                className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Xác nhận ngay
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-gray-700">
              <AiOutlineCheckCircle className="text-accent-500" size={18} />
              Sau khi xác minh xong, bạn có thể đăng nhập bình thường.
            </div>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:underline">
                Tôi đã xác minh, đi đến đăng nhập
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisterPage
