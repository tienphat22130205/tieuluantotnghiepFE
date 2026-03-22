import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Feature Pages
import { LoginPage, RegisterPage, VerifyEmailPage } from '@/features/auth'
import { HomePage, CreatePostPage, PostDetailPage } from '@/features/post'
import { ProfilePage } from '@/features/user'
import { AdminDashboardPage } from '@/features/admin'
import { isAdminUser } from '@/utils/auth'

/**
 * ProtectedRoute – Chặn truy cập nếu chưa đăng nhập.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth)
  if (!token) return <Navigate to="/login" replace />
  return children
}

/**
 * GuestRoute – Chặn truy cập nếu đã đăng nhập (trang login/register).
 */
const GuestRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth)
  if (token) return <Navigate to={isAdminUser(user) ? '/admin' : '/'} replace />
  return children
}

/**
 * AdminRoute – Chỉ cho phép admin truy cập.
 */
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth)
  if (!isAdminUser(user)) return <Navigate to="/" replace />
  return children
}

/**
 * RoleHomeRedirect – Điều hướng theo role khi vào root.
 */
const RoleHomeRedirect = () => {
  const { user } = useSelector((state) => state.auth)
  if (isAdminUser(user)) return <Navigate to="/admin" replace />
  return <HomePage />
}

/**
 * App Component – Cấu hình Router chính.
 */
const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
      />
      <Routes>
        {/* ── Auth Routes (Guest only) ── */}
        <Route
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Public Auth Utility Routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* ── Protected Routes (Logged in) ── */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* ── 404 – Fallback ── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <p className="text-gray-500 mb-6">Trang không tồn tại</p>
                <a
                  href="/"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Quay về trang chủ
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
