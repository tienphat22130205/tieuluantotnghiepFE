import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'

/**
 * AuthLayout – Bố cục cho trang Đăng nhập / Đăng ký.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-[1180px] items-stretch px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[460px_minmax(0,1fr)]">
          <div className="flex items-center justify-center px-7 py-10 sm:px-10">
            <div className="w-full max-w-sm">
              <div className="mb-7 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                  <img src="/Zlogo.png" alt="Zivo" className="h-full w-full object-cover" />
                </div>
                <p className="text-xl font-black tracking-tight text-slate-900">Zivo</p>
              </div>

              <AnimatePresence mode="wait">
              <Motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Outlet />
              </Motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative hidden items-center justify-center overflow-hidden bg-slate-50 lg:flex">
            <img
              src="/Zlogo.png"
              alt="Zivo"
              className="h-[320px] w-[320px] rounded-[28%] object-cover shadow-2xl ring-1 ring-slate-200"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
