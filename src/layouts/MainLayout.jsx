import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

/**
 * MainLayout – Bố cục chung cho các trang đã đăng nhập.
 * Bao gồm: Navbar (top) + Nội dung chính (center) + Footer (optional).
 *
 * Sử dụng <Outlet /> của React Router để render page con.
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar cố định trên cùng */}
      <Navbar />

      {/* Nội dung chính – margin-top tránh navbar đè, pb cho bottom nav mobile */}
      <main className="pt-16 pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto px-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout
