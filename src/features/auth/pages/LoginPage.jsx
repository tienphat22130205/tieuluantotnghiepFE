import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, loginDemo } from '../store/authSlice'
import { mockUser, mockToken } from '@/utils/mockData'
import LoginForm from '../components/LoginForm'
import DemoLoginSection from '../components/DemoLoginSection'

/**
 * Login Page – Trang đăng nhập (orchestrator).
 */
const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(login(form)).unwrap()
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleDemoLogin = () => {
    dispatch(loginDemo({ user: mockUser, token: mockToken }))
    navigate('/')
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-5">Login to Zivo</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <DemoLoginSection onDemoLogin={handleDemoLogin} />

      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <Link to="/register" className="inline-block w-full border border-primary-600 text-primary-600 font-semibold py-3 rounded-full hover:bg-primary-50 transition cursor-pointer">
          Tạo tài khoản mới
        </Link>
      </div>
    </>
  )
}

export default LoginPage
