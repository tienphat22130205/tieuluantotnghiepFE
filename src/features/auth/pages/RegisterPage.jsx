import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth'
import RegisterForm from '../components/RegisterForm'

const RegisterPage = () => {
  const { isLoading, error, handleRegister, handleClearError } = useAuth()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    day: '',
    month: '',
    year: '',
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

  const isAgeValid = (day, month, year) => {
    if (!day || !month || !year) return false
    const birthDate = new Date(year, parseInt(month) - 1, day)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 13
    }
    return age >= 13
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.day || !form.month || !form.year) {
      setFormError('Vui lòng nhập ngày sinh!')
      return
    }
    if (!isAgeValid(form.day, form.month, form.year)) {
      setFormError('Bạn phải từ 13 tuổi trở lên để đăng ký')
      return
    }
    if (form.password !== form.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp!')
      return
    }
    if (form.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    const dateOfBirth = `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`

    const registerPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      dateOfBirth,
      password: form.password,
      confirmPassword: form.confirmPassword,
    }

    const result = await handleRegister(registerPayload)

    if (result.meta?.requestStatus === 'fulfilled') {
      setRegisteredEmail(registerPayload.email)
      toast.success('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.', {
        autoClose: 3000,
      })
    }
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Đăng ký</h1>
      <p className="mb-8 text-sm font-medium text-slate-500">
        Điền thông tin để tạo tài khoản mới.
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

      <p className="mt-8 text-center text-sm text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary-600 font-bold hover:underline">
          Đăng nhập
        </Link>
      </p>

      {/* Verification modal logic is kept simple so it overrides the screen */}
      {registeredEmail && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Kiểm tra Email</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">Đã gửi xác thực tới: <b>{registeredEmail}</b></p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setRegisteredEmail('')}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RegisterPage
