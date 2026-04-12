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
      <h1 className="text-3xl font-extrabold mb-2 text-[#2B3E52]">Đăng nhập</h1>
      <p className="text-[#9EA6BC] mb-8 font-medium">
        Nhập email và mật khẩu của bạn để đăng nhập
      </p>

      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <p className="mt-8 text-center text-sm text-[#9EA6BC]">
        Bạn chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary-600 font-bold hover:underline">
          Đăng ký
        </Link>
      </p>
    </>
  )
}

export default LoginPage
