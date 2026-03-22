import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { login } from '../store/authSlice'
import LoginForm from '../components/LoginForm'

/**
 * Login Page – Trang đăng nhập (orchestrator).
 */
const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(login(form)).unwrap()
      toast.success('Đăng nhập thành công! 🎉', { autoClose: 2000 })
      navigate('/')
    } catch (err) {
      const errorMsg = err || 'Đăng nhập thất bại. Vui lòng thử lại'
      toast.error(errorMsg, { autoClose: 3000 })
      console.error('Login failed:', err)
    }
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-5">Login to Zivo</h2>
      
      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <Link to="/register" className="inline-block w-full border border-primary-600 text-primary-600 font-semibold py-3 rounded-full hover:bg-primary-50 transition cursor-pointer">
          Tạo tài khoản mới
        </Link>
      </div>
    </>
  )
}

export default LoginPage
