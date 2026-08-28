/**
 * 🔐 Auth Feature – Barrel Export
 * ─────────────────────────────────
 * Export tất cả thành phần của feature auth từ 1 entry point.
 *
 *   import { LoginPage, useAuth, authReducer } from '@/features/auth'
 */
// Pages
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
export { default as VerifyEmailPage } from './pages/VerifyEmailPage'
export { default as SupportRequestPage } from './pages/SupportRequestPage'
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage'
export { default as ResetPasswordPage } from './pages/ResetPasswordPage'

// Components
export { default as LoginForm } from './components/LoginForm'
export { default as RegisterForm } from './components/RegisterForm'

// Hooks & Services
export { default as useAuth } from './hooks/useAuth'
export { default as useRoleRedirect } from './hooks/useRoleRedirect'
export { default as authService } from './services/authService'

// Store
export { default as authReducer } from './store/authSlice'
export { login, register, getMe, logout, clearError } from './store/authSlice'
