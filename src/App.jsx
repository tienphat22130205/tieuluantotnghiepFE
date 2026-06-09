import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { MotionConfig } from 'framer-motion'
import 'react-toastify/dist/ReactToastify.css'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Feature Pages
import { LoginPage, RegisterPage, SupportRequestPage, VerifyEmailPage } from '@/features/auth'
import { HomePage, CreatePostPage, PostDetailPage, SearchPage, ExplorePage } from '@/features/post'
import { FriendsPage, ProfilePage } from '@/features/user'
import { NotificationPage } from '@/features/notification'
import { ChatPage } from '@/features/chat'
import { AdminDashboardPage, AdminDashboardOverviewPage } from '@/features/admin'
import { canAccessAdminDashboard } from '@/utils/auth'

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
  const { token, user, role } = useSelector((state) => state.auth)
  if (token) return <Navigate to={canAccessAdminDashboard(user, role) ? '/admin' : '/'} replace />
  return children
}

/**
 * AdminRoute – Chỉ cho phép admin truy cập.
 */
const AdminRoute = ({ children }) => {
  const { user, role } = useSelector((state) => state.auth)
  if (!canAccessAdminDashboard(user, role)) return <Navigate to="/" replace />
  return children
}

/**
 * RoleHomeRedirect – Điều hướng theo role khi vào root.
 */
const RoleHomeRedirect = () => {
  const { user, role } = useSelector((state) => state.auth)
  if (canAccessAdminDashboard(user, role)) return <Navigate to="/admin" replace />
  return <HomePage />
}

/**
 * App Component – Cấu hình Router chính.
 */
const App = () => {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.18,
        ease: 'easeOut',
      }}
    >
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
          <Route path="/support-request" element={<SupportRequestPage />} />
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
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/log" element={<Navigate to="/notifications" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:postId/edit" element={<CreatePostPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
        </Route>

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboardOverviewPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

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
    </MotionConfig>
  )
}

export default App
