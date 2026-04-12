import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * AuthLayout – Bố cục cho trang Đăng nhập / Đăng ký.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-[#2B3E52] bg-white">
      {/* --- Main Content --- */}
      <main className="flex-grow flex flex-col lg:flex-row">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-8 py-16 lg:py-0 z-10 bg-white relative shadow-[15px_0_40px_rgba(0,0,0,0.04)]">
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Visual Z Section */}
        <div className="hidden lg:block lg:w-[60%] relative overflow-hidden flex-1 bg-white">
          {/* Logo Chữ Z - Phủ đầy bằng object-cover */}
          <img 
            src="/Z.png" 
            alt="Zivo Background" 
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-[2000ms] ease-out hover:scale-105"
          />
          
          {/* Overlay gradient nhẹ để làm mượt phần tiếp giáp form */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent pointer-events-none pointer-events-none"></div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
