import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import RegisterForm from '../components/RegisterForm'

/**
 * Register Page – Trang đăng ký tài khoản mới (orchestrator).
 */
const RegisterPage = () => {
  const { isLoading, error, handleRegister, handleClearError } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) handleClearError()
    if (formError) setFormError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp!')
      return
    }

    if (form.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    const { confirmPassword: _confirmPassword, ...userData } = form
    handleRegister(userData)
  }

  return (
    <>
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
    </>
  )
}

export default RegisterPage
