import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { login } from '../store/authSlice'
import LoginForm from '../components/LoginForm'
import { isAdminUser } from '@/utils/auth'

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
      const response = await dispatch(login(form)).unwrap()
      toast.success('Đăng nhập thành công! 🎉', { autoClose: 2000 })
      navigate(isAdminUser(response?.user) ? '/admin' : '/')
    } catch (err) {
      const errorMsg = err || 'Đăng nhập thất bại. Vui lòng thử lại'
      toast.error(errorMsg, { autoClose: 3000 })
      console.error('Login failed:', err)
    }
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
      <p className="mb-8 text-sm font-medium text-slate-500">
        Nhập email và mật khẩu của bạn để đăng nhập
      </p>

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
    </>
  )
}

export default LoginPage
