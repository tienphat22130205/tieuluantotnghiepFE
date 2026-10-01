import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import {
  AiOutlineKey,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineClockCircle,
  AiOutlineLock,
  AiOutlineLoading3Quarters,
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { updateUser } from '@/features/auth/store/authSlice'
import authService from '@/features/auth/services/authService'
import { usePreferences } from '@/context/PreferencesContext'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Tab Cài đặt: Đổi mật khẩu (Form đổi mật khẩu, kiểm tra độ mạnh, 30 ngày cooldown)
 */
const PasswordSettingsTab = ({ user }) => {
  const dispatch = useDispatch()
  const { t } = usePreferences()

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [lastPasswordChangedAt, setLastPasswordChangedAt] = useState(
    user?.lastPasswordChangedAt || null
  )

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '', width: '0%' }
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 2) return { score: 1, text: t('settings.strengthWeak', 'Yếu'), color: 'bg-red-500', width: '33%' }
    if (score <= 4) return { score: 2, text: t('settings.strengthMedium', 'Trung bình'), color: 'bg-amber-500', width: '66%' }
    return { score: 3, text: t('settings.strengthStrong', 'Mạnh'), color: 'bg-emerald-500', width: '100%' }
  }

  // 30-day cooldown remaining for password change
  const passwordCooldownDays = useMemo(() => {
    const ts = lastPasswordChangedAt || user?.lastPasswordChangedAt
    if (!ts) return 0
    const elapsed = Date.now() - new Date(ts).getTime()
    if (elapsed >= THIRTY_DAYS_MS) return 0
    return Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000))
  }, [lastPasswordChangedAt, user?.lastPasswordChangedAt])

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  const handleChangePassword = async (e) => {
    e?.preventDefault()
    if (passwordCooldownDays > 0) {
      toast.warning(
        `${t('settings.passwordCooldownMsg', 'Bạn chỉ có thể đổi mật khẩu 30 ngày một lần. Bạn có thể đổi lại mật khẩu sau')} ${passwordCooldownDays} ${t('settings.daysLeft', 'ngày nữa')}.`
      )
      return
    }

    if (!passwordForm.currentPassword) {
      toast.error(t('settings.enterCurrentPassword', 'Vui lòng nhập mật khẩu hiện tại.'))
      return
    }
    if (!passwordForm.newPassword) {
      toast.error(t('settings.enterNewPassword', 'Vui lòng nhập mật khẩu mới.'))
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t('settings.passwordMinLength', 'Mật khẩu mới phải có tối thiểu 6 ký tự.'))
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('settings.passwordsDoNotMatch', 'Mật khẩu xác nhận không khớp với mật khẩu mới.'))
      return
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error(t('settings.passwordSameAsCurrent', 'Mật khẩu mới không được trùng với mật khẩu hiện tại.'))
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })

      const updatedTimestamp = response?.data?.lastPasswordChangedAt || new Date().toISOString()
      setLastPasswordChangedAt(updatedTimestamp)
      dispatch(updateUser({ lastPasswordChangedAt: updatedTimestamp }))

      toast.success(response?.message || t('settings.passwordChangeSuccess', 'Đổi mật khẩu thành công!'))
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      console.error('Change password error:', err)
      toast.error(err.message || t('settings.passwordChangeFailed', 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.passwordSection', 'Đổi mật khẩu tài khoản')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.passwordSectionDesc', 'Để đảm bảo tính bảo mật, bạn cần nhập mật khẩu hiện tại trước khi thiết lập mật khẩu mới.')}
        </p>
      </div>

      {/* 30-day Cooldown Banner for Password Change */}
      {passwordCooldownDays > 0 && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
          <AiOutlineClockCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-bold">{t('settings.passwordCooldownTitle', 'Giới hạn bảo mật:')}</span> {t('settings.passwordCooldownMsg', 'Bạn chỉ có thể đổi mật khẩu 30 ngày một lần. Bạn có thể đổi lại mật khẩu sau')} <span className="font-bold underline">{passwordCooldownDays} {t('settings.daysLeft', 'ngày nữa')}</span>.
          </div>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('settings.currentPassword', 'Mật khẩu hiện tại')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              disabled={passwordCooldownDays > 0 || isChangingPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder={t('settings.currentPasswordPlaceholder', 'Nhập mật khẩu hiện tại của bạn')}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={passwordCooldownDays > 0 || isChangingPassword}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              {showCurrentPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('settings.newPassword', 'Mật khẩu mới')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              disabled={passwordCooldownDays > 0 || isChangingPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder={t('settings.newPasswordPlaceholder', 'Nhập mật khẩu mới (tối thiểu 6 ký tự)')}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={passwordCooldownDays > 0 || isChangingPassword}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              {showNewPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>

          {/* Password strength meter */}
          {passwordForm.newPassword && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: passwordStrength.width }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{t('settings.passwordStrength', 'Độ mạnh mật khẩu:')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {passwordStrength.text}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('settings.confirmPassword', 'Xác nhận mật khẩu mới')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              disabled={passwordCooldownDays > 0 || isChangingPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder={t('settings.confirmPasswordPlaceholder', 'Nhập lại mật khẩu mới')}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={passwordCooldownDays > 0 || isChangingPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>

          {passwordForm.confirmPassword && (
            <p
              className={`text-[11px] mt-1 font-medium ${
                passwordForm.newPassword === passwordForm.confirmPassword
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500'
              }`}
            >
              {passwordForm.newPassword === passwordForm.confirmPassword
                ? t('settings.passwordMatch', '✓ Mật khẩu xác nhận trùng khớp')
                : t('settings.passwordMismatch', '✗ Mật khẩu xác nhận không khớp')}
            </p>
          )}
        </div>

        {/* Security Tips Card */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <AiOutlineLock size={15} />
            {t('settings.securityTips', 'Lời khuyên bảo mật:')}
          </p>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-700 dark:text-amber-400">
            <li>{t('settings.tip1', 'Mật khẩu phải có ít nhất 6 ký tự.')}</li>
            <li>{t('settings.tip2', 'Nên kết hợp chữ hoa, chữ thường, chữ số và ký hiệu đặc biệt.')}</li>
            <li>{t('settings.tip3', 'Không chia sẻ mật khẩu của bạn cho bất kỳ ai.')}</li>
          </ul>
        </div>

        {/* Submit Change Password Button */}
        <div className="pt-3 flex flex-col sm:flex-row justify-end">
          <button
            type="submit"
            disabled={
              passwordCooldownDays > 0 ||
              isChangingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword ||
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChangingPassword ? (
              <>
                <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                <span>{t('settings.processing', 'Đang xử lý...')}</span>
              </>
            ) : (
              <>
                <AiOutlineKey size={16} />
                <span>
                  {passwordCooldownDays > 0
                    ? `${t('settings.updatePassword', 'Đổi lại sau')} ${passwordCooldownDays} ${t('settings.daysLeft', 'ngày nữa')}`
                    : t('settings.updatePassword', 'Cập nhật mật khẩu')}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PasswordSettingsTab
