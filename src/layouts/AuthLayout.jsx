import { Outlet } from 'react-router-dom'

/**
 * AuthLayout – Bố cục cho trang Đăng nhập / Đăng ký.
 * Trái 65%: ảnh nền full. Phải 35%: form login.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left: Background image ── */}
      <div
        className="hidden lg:block lg:w-[55%] xl:w-[60%] 2xl:w-[65%] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/backlogin.png')" }}
      />

      {/* ── Right: Form ── */}
      <div className="flex-1 lg:w-[45%] xl:w-[40%] 2xl:w-[35%] flex items-center justify-center bg-white px-4 sm:px-6 md:px-10 py-8 sm:py-10">
        <div className="w-full max-w-[480px]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
