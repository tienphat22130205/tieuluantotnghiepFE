import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * AuthLayout – Bố cục cho trang Đăng nhập / Đăng ký.
 * Trái 65%: ảnh nền full. Phải 35%: form login.
 */
const AuthLayout = () => {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const MotionDiv = motion.div

  const transitionProps = prefersReducedMotion
    ? {
      initial: false,
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    }
    : {
      initial: { opacity: 0, x: 8 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -8 },
      transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
    }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left: Background image ── */}
      <div
        className="hidden lg:block lg:w-[55%] xl:w-[60%] 2xl:w-[65%] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/backlogin.png')" }}
      />

      {/* ── Right: Form ── */}
      <div className="flex-1 lg:w-[45%] xl:w-[40%] 2xl:w-[35%] flex items-center justify-center bg-white px-4 sm:px-6 md:px-10 py-8 sm:py-10">
        <div className="w-full max-w-[480px] relative min-h-[640px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <MotionDiv
              key={location.pathname}
              {...transitionProps}
              className="absolute inset-0 will-change-[opacity,transform]"
            >
              <Outlet />
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
