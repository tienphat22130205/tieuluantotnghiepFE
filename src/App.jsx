import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { MotionConfig } from 'framer-motion'
import 'react-toastify/dist/ReactToastify.css'
import { PreferencesProvider } from '@/context/PreferencesContext'

// Layouts – loaded eagerly (small, always needed)
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Non-page imports that are always needed
import { canAccessAdminDashboard } from '@/utils/auth'
import { useCallStore } from '@/features/chat/store/useCallStore'
import { useChatStore } from '@/features/chat/store/useChatStore'
import { useNotificationStore } from '@/features/notification/store/useNotificationStore'
import { usePresenceStore } from '@/features/chat/store/usePresenceStore'
import { getSocket } from '@/services/socketClient'
import CallModal from '@/features/chat/components/panel/CallModal'
import { PageLoadingFallback } from '@/components/ui'

// ──────────────────────────────────────────────
// Lazy-loaded Pages – only loaded when navigated to
// ──────────────────────────────────────────────

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const SupportRequestPage = lazy(() => import('@/features/auth/pages/SupportRequestPage'))
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))

// Post pages
const HomePage = lazy(() => import('@/features/post/pages/HomePage'))
const CreatePostPage = lazy(() => import('@/features/post/pages/CreatePostPage'))
const PostDetailPage = lazy(() => import('@/features/post/pages/PostDetailPage'))
const SearchPage = lazy(() => import('@/features/post/pages/SearchPage'))
const WatchPage = lazy(() => import('@/features/post/pages/WatchPage'))

// User pages
const FriendsPage = lazy(() => import('@/features/user/pages/FriendsPage'))
const ProfilePage = lazy(() => import('@/features/user/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/features/user/pages/SettingsPage'))

// Group pages
const GroupsPage = lazy(() => import('@/features/group/pages/GroupsPage'))
const GroupDetailPage = lazy(() => import('@/features/group/pages/GroupDetailPage'))

// Notification page
const NotificationPage = lazy(() => import('@/features/notification/pages/NotificationPage'))

// Chat page
const ChatPage = lazy(() => import('@/features/chat/pages/ChatPage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'))
const AdminDashboardOverviewPage = lazy(() => import('@/features/admin/pages/AdminDashboardOverviewPage'))

// ──────────────────────────────────────────────
// Route Guard Components
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// App Component
// ──────────────────────────────────────────────

/**
 * App Component – Cấu hình Router chính.
 */
const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { user, token } = useSelector((state) => state.auth)

  // Debounced resize listener – prevents excessive re-renders during window resize
  useEffect(() => {
    let timeoutId = null
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768)
      }, 150)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (user && token) {
      useCallStore.getState().initPeer(user, token)
      useNotificationStore.getState().fetchUnreadCount()
      useNotificationStore.getState().fetchNotifications()

      const socket = getSocket(token)
      if (socket) {
        const cleanupChat = useChatStore.getState().setupSocketListeners(socket, String(user.id || user._id))
        const cleanupNotif = useNotificationStore.getState().setupSocketListeners(socket)
        const cleanupPresence = usePresenceStore.getState().setupSocketListeners(socket)

        return () => {
          if (cleanupChat) cleanupChat()
          if (cleanupNotif) cleanupNotif()
          if (cleanupPresence) cleanupPresence()
        }
      }
    } else {
      useCallStore.getState().destroyPeer()
      useChatStore.getState().closeConversation(null)
      useNotificationStore.setState({ notifications: [], unreadCount: 0 })
      usePresenceStore.setState({ friends: [] })
    }
  }, [user, token])

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.18,
        ease: 'easeOut',
      }}
    >
      <PreferencesProvider>
        <BrowserRouter>
        <ToastContainer
            position={isMobile ? "top-center" : "top-right"}
            autoClose={isMobile ? 3500 : 4500}
            hideProgressBar={isMobile}
            newestOnTop={true}
            closeOnClick={true}
            rtl={false}
            pauseOnHover={true}
            pauseOnFocusLoss={!isMobile}
            draggable={true}
            toastClassName={isMobile ? "mobile-toast" : ""}
          />

          <Suspense fallback={<PageLoadingFallback />}>
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId" element={<GroupDetailPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/log" element={<Navigate to="/notifications" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/create" element={<Navigate to="/" replace />} />
            <Route path="/post/:postId/edit" element={<CreatePostPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
          </Suspense>

          <CallModal />
        </BrowserRouter>
      </PreferencesProvider>
    </MotionConfig>
  )
}

export default App
