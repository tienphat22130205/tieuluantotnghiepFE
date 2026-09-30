import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  AiOutlineSetting,
  AiOutlineGlobal,
  AiOutlineBulb,
  AiOutlineLock,
  AiOutlineBell,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineCheck,
  AiOutlineTeam,
  AiOutlineKey,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlineCalendar,
  AiOutlineMail,
  AiOutlineSafetyCertificate,
  AiOutlineEdit,
  AiOutlineClose,
  AiOutlineArrowLeft,
  AiOutlineRight,
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { useAuth } from '@/features/auth'
import { updateUser } from '@/features/auth/store/authSlice'
import userService from '@/features/user/services/userService'
import authService from '@/features/auth/services/authService'
import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'

const formatDateForInput = (dateValue) => {
  if (!dateValue) return ''
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

const formatDateDisplay = (dateValue) => {
  if (!dateValue) return 'Chưa cập nhật'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return 'Chưa cập nhật'
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return 'Chưa cập nhật'
  }
}

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, text: '', color: '', width: '0%' }
  let score = 0
  if (pwd.length >= 6) score += 1
  if (pwd.length >= 8) score += 1
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1

  if (score <= 2) return { score: 1, text: 'Yếu', color: 'bg-red-500', width: '33%' }
  if (score <= 4) return { score: 2, text: 'Trung bình', color: 'bg-amber-500', width: '66%' }
  return { score: 3, text: 'Mạnh', color: 'bg-emerald-500', width: '100%' }
}

const SettingsPage = () => {
  const dispatch = useDispatch()
  const { user, handleLogout } = useAuth()
  const { isDarkMode, setIsDarkMode, language, setLanguage, t } = usePreferences()

  // Desktop active tab
  const [activeTab, setActiveTab] = useState('profile')
  // Mobile active tab: null = show menu list; string = show selected sub-page
  const [mobileActiveTab, setMobileActiveTab] = useState(null)

  // Profile Form States: View Mode vs Edit Mode
  const [isEditingProfileInfo, setIsEditingProfileInfo] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: formatDateForInput(user?.dateOfBirth),
    bio: user?.bio || '',
  })
  const [initialProfileData, setInitialProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dateOfBirth: formatDateForInput(user?.dateOfBirth),
    bio: user?.bio || '',
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Other Settings State
  const [postVisibility, setPostVisibility] = useState('public')
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Sync profile details on mount
  useEffect(() => {
    if (user) {
      const data = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth),
        bio: user.bio || '',
      }
      setProfileForm((prev) => ({ ...prev, ...data }))
      setInitialProfileData(data)
    }

    userService
      .getMyProfile()
      .then((res) => {
        const data = res?.data || res
        if (data) {
          const formatted = {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: formatDateForInput(data.dateOfBirth) || '',
            bio: data.bio || '',
          }
          setProfileForm(formatted)
          setInitialProfileData(formatted)
        }
      })
      .catch(() => {})
  }, [user])

  const displayName =
    user?.full_name ||
    user?.fullName ||
    `${profileForm.firstName || user?.firstName || ''} ${profileForm.lastName || user?.lastName || ''}`.trim() ||
    'Người dùng'

  const userIdentifier = user?.username ? String(user.username).replace(/^@/, '') : (user?.id || user?._id)
  const profilePath = userIdentifier ? `/profile/${userIdentifier}` : '/profile'

  const maxDateOfBirth = new Date().toISOString().split('T')[0]
  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  // Cancel edit profile and revert form
  const handleCancelEditProfile = () => {
    setProfileForm(initialProfileData)
    setIsEditingProfileInfo(false)
  }

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    if (!profileForm.firstName.trim() && !profileForm.lastName.trim()) {
      toast.error('Vui lòng nhập họ và tên của bạn.')
      return
    }

    setIsUpdatingProfile(true)
    try {
      const payload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        dateOfBirth: profileForm.dateOfBirth || null,
        bio: profileForm.bio.trim(),
      }

      const response = await userService.updateMyProfile(payload)
      const updatedData = response?.data || response

      const updatedFields = {
        firstName: updatedData.firstName !== undefined ? updatedData.firstName : payload.firstName,
        lastName: updatedData.lastName !== undefined ? updatedData.lastName : payload.lastName,
        dateOfBirth: updatedData.dateOfBirth !== undefined ? updatedData.dateOfBirth : payload.dateOfBirth,
        bio: updatedData.bio !== undefined ? updatedData.bio : payload.bio,
        fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      }

      dispatch(updateUser(updatedFields))
      setInitialProfileData({
        firstName: updatedFields.firstName,
        lastName: updatedFields.lastName,
        dateOfBirth: formatDateForInput(updatedFields.dateOfBirth),
        bio: updatedFields.bio,
      })

      setIsEditingProfileInfo(false)
      toast.success('Cập nhật thông tin cá nhân thành công!')
    } catch (err) {
      console.error('Update profile error:', err)
      toast.error(err.message || 'Cập nhật thông tin cá nhân thất bại.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e?.preventDefault()
    if (!passwordForm.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.')
      return
    }
    if (!passwordForm.newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới.')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới.')
      return
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại.')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })

      toast.success(response?.message || 'Đổi mật khẩu thành công!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      console.error('Change password error:', err)
      toast.error(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveGeneralSettings = () => {
    toast.success('Đã lưu cấu hình cài đặt thành công!', { autoClose: 2000 })
  }

  const tabs = [
    {
      id: 'profile',
      label: 'Thông tin cá nhân',
      icon: AiOutlineUser,
      desc: 'Họ tên, ngày sinh, tiểu sử cá nhân',
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'password',
      label: 'Đổi mật khẩu',
      icon: AiOutlineKey,
      desc: 'Bảo mật tài khoản, mật khẩu đăng nhập',
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'privacy',
      label: t('settings.privacyTab') || 'Quyền riêng tư',
      icon: AiOutlineLock,
      desc: 'Trạng thái online, chế độ xem bài viết',
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'appearance',
      label: t('settings.appearanceTab') || 'Giao diện & Ngôn ngữ',
      icon: AiOutlineBulb,
      desc: 'Chế độ tối (Dark mode), Tiếng Việt / English',
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'notifications',
      label: t('settings.notificationsTab') || 'Thông báo',
      icon: AiOutlineBell,
      desc: 'Âm thanh thông báo và tương tác',
      color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'account',
      label: t('settings.accountTab') || 'Tài khoản',
      icon: AiOutlineSetting,
      desc: 'Tổng quan tài khoản và đăng xuất',
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
  ]

  // RENDER TAB 1: THÔNG TIN CÁ NHÂN
  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* FORM 1: HIỂN THỊ THÔNG TIN (VIEW MODE) */}
      {!isEditingProfileInfo ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Header View Mode */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thông tin cá nhân
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xem và quản lý các thông tin cá nhân cơ bản của bạn.
              </p>
            </div>
            {/* Desktop only: Circular Blue Edit Button at Top Right matching user's design */}
            <button
              type="button"
              onClick={() => setIsEditingProfileInfo(true)}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md hover:shadow-lg transition cursor-pointer shrink-0"
              title="Chỉnh sửa thông tin cá nhân"
            >
              <AiOutlineEdit size={20} />
            </button>
          </div>

          {/* User Profile Mini Banner */}
          <div className="flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-primary-50/20 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200/70 dark:border-slate-700/60">
            <Avatar src={user?.avatar} name={displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40">
                  {user?.role === 'admin'
                    ? 'Quản trị viên'
                    : user?.role === 'moderator'
                    ? 'Kiểm duyệt viên'
                    : 'Thành viên'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                @{user?.username || 'zivo_user'} • {user?.email}
              </p>
            </div>
          </div>

          {/* Detail Info Display Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Họ và tên đệm */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Họ và tên đệm
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {profileForm.lastName || <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>}
              </p>
            </div>

            {/* Tên */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Tên
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {profileForm.firstName || <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>}
              </p>
            </div>

            {/* Ngày sinh */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <AiOutlineCalendar size={13} className="text-primary-500" />
                <span>Ngày sinh</span>
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {formatDateDisplay(profileForm.dateOfBirth)}
              </p>
            </div>

            {/* Username */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Tên người dùng
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono">
                @{user?.username || 'zivo_user'}
              </p>
            </div>
          </div>

          {/* Email & Account Status */}
          <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <AiOutlineMail size={13} className="text-primary-500" />
                <span>Email liên kết</span>
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                {user?.email || 'Chưa liên kết'}
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl shrink-0">
              <AiOutlineSafetyCertificate size={15} />
              <span>Đã xác thực</span>
            </span>
          </div>

          {/* Bio */}
          <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Tiểu sử (Bio)
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {profileForm.bio || (
                <span className="text-slate-400 italic font-normal">
                  Chưa có thông tin tiểu sử. Nhấn Chỉnh sửa thông tin để thêm giới thiệu về bản thân!
                </span>
              )}
            </p>
          </div>

          {/* Mobile Action Button: prominently placed at bottom on mobile */}
          <div className="pt-2 flex md:hidden">
            <button
              type="button"
              onClick={() => setIsEditingProfileInfo(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <AiOutlineEdit size={18} />
              <span>Chỉnh sửa thông tin cá nhân</span>
            </button>
          </div>
        </div>
      ) : (
        /* FORM 2: CHỈNH SỬA THÔNG TIN (EDIT MODE) */
        <div className="space-y-5 animate-fadeIn">
          {/* Header Edit Mode */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancelEditProfile}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                title="Quay lại"
              >
                <AiOutlineArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chỉnh sửa thông tin cá nhân
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cập nhật họ tên, ngày sinh và giới thiệu của bạn.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelEditProfile}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
            >
              <AiOutlineClose size={18} />
            </button>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Last Name (Họ) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Họ và tên đệm
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              {/* First Name (Tên) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder="Ví dụ: Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AiOutlineCalendar size={15} className="text-primary-500" />
                <span>Ngày sinh</span>
              </label>
              <input
                type="date"
                max={maxDateOfBirth}
                value={profileForm.dateOfBirth}
                onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Ngày sinh giúp bạn bè biết đến sinh nhật của bạn trên hệ thống.
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tiểu sử (Bio)
                </label>
                <span className="text-[11px] text-slate-400">
                  {profileForm.bio.length}/200
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={200}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Viết vài dòng giới thiệu ngắn về bản thân..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
              />
            </div>

            {/* Readonly Informational Fields */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <AiOutlineMail size={14} />
                  <span>Email liên kết (Cố định)</span>
                </label>
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <span>{user?.email || 'Chưa liên kết'}</span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <AiOutlineSafetyCertificate size={14} />
                    Đã xác thực
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Tên người dùng (Username)
                </label>
                <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  @{user?.username || 'zivo_user'}
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancel and Save */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleCancelEditProfile}
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-60 text-center"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {isUpdatingProfile ? (
                  <>
                    <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <AiOutlineCheck size={16} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )

  // RENDER TAB 2: ĐỔI MẬT KHẨU
  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Đổi mật khẩu tài khoản
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Để đảm bảo tính bảo mật, bạn cần nhập mật khẩu hiện tại trước khi thiết lập mật khẩu mới.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu hiện tại của bạn"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              {showCurrentPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
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
                <span>Độ mạnh mật khẩu:</span>
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
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
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
                ? '✓ Mật khẩu xác nhận trùng khớp'
                : '✗ Mật khẩu xác nhận không khớp'}
            </p>
          )}
        </div>

        {/* Security Tips Card */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <AiOutlineLock size={15} />
            Lời khuyên bảo mật:
          </p>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-700 dark:text-amber-400">
            <li>Mật khẩu phải có ít nhất 6 ký tự.</li>
            <li>Nên kết hợp chữ hoa, chữ thường, chữ số và ký hiệu đặc biệt.</li>
            <li>Không chia sẻ mật khẩu của bạn cho bất kỳ ai.</li>
          </ul>
        </div>

        {/* Submit Change Password Button */}
        <div className="pt-3 flex flex-col sm:flex-row justify-end">
          <button
            type="submit"
            disabled={
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
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <AiOutlineKey size={16} />
                <span>Cập nhật mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )

  // RENDER TAB 3: QUYỀN RIÊNG TƯ
  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.privacySection') || 'Quyền riêng tư'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.privacySectionDesc') || 'Kiểm soát ai có thể nhìn thấy hoạt động và bài viết của bạn.'}
        </p>
      </div>

      {/* Online Status Toggle */}
      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('settings.onlineStatus') || 'Trạng thái hoạt động'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('settings.onlineStatusDesc') || 'Hiển thị khi bạn đang trực tuyến trên mạng xã hội'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowOnlineStatus((prev) => !prev)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            showOnlineStatus ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              showOnlineStatus ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Post Audience Visibility */}
      <div className="space-y-2 py-3 border-b border-slate-100 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {t('settings.postVisibility') || 'Chế độ người xem mặc định'}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('settings.postVisibilityDesc') || 'Đặt quyền hiển thị mặc định cho các bài đăng mới'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
          {[
            { id: 'public', label: t('settings.public') || 'Công khai', icon: AiOutlineGlobal },
            { id: 'friends', label: t('settings.friendsOnly') || 'Bạn bè', icon: AiOutlineTeam },
            { id: 'private', label: t('settings.private') || 'Chỉ mình tôi', icon: AiOutlineLock },
          ].map(({ id, label, icon: ItemIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPostVisibility(id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold border transition cursor-pointer text-center ${
                postVisibility === id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ItemIcon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSaveGeneralSettings}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
        >
          <AiOutlineCheck size={16} />
          <span>{t('settings.save') || 'Lưu cài đặt'}</span>
        </button>
      </div>
    </div>
  )

  // RENDER TAB 4: GIAO DIỆN & NGÔN NGỮ
  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.appearanceSection') || 'Giao diện & Ngôn ngữ'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.appearanceSectionDesc') || 'Tùy chỉnh chế độ hiển thị và ngôn ngữ bạn sử dụng.'}
        </p>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <AiOutlineBulb size={20} className="text-slate-600 dark:text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('settings.darkMode') || 'Chế độ tối (Dark mode)'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('settings.darkModeDesc') || 'Chuyển đổi giữa giao diện sáng và tối'}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Toggle Dark Mode"
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            isDarkMode ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Language Switch Buttons */}
      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <AiOutlineGlobal size={20} className="text-slate-600 dark:text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('settings.language') || 'Ngôn ngữ'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('settings.languageDesc') || 'Chọn ngôn ngữ giao diện hiển thị'}
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setLanguage('vi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'vi'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>
    </div>
  )

  // RENDER TAB 5: THÔNG BÁO
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.notificationsSection') || 'Cài đặt thông báo'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.notificationsSectionDesc') || 'Quản lý âm thanh và thông báo trên nền tảng.'}
        </p>
      </div>

      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('settings.sound') || 'Âm thanh thông báo'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('settings.soundDesc') || 'Phát âm thanh khi có tin nhắn hoặc thông báo mới'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            soundEnabled ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              soundEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )

  // RENDER TAB 6: TÀI KHOẢN & ĐĂNG XUẤT
  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.accountSection') || 'Quản lý tài khoản'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.accountSectionDesc') || 'Xem tổng quan tài khoản và đăng xuất.'}
        </p>
      </div>

      <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <Avatar src={user?.avatar} name={displayName} size="md" />
        <div>
          <p className="text-base font-bold text-slate-900 dark:text-white">{displayName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            @{user?.username || 'zivo_user'} • {user?.email}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900/40 transition cursor-pointer"
        >
          <AiOutlineLogout size={16} />
          <span>{t('nav.logout') || 'Đăng xuất tài khoản'}</span>
        </button>
      </div>
    </div>
  )

  // Helper to render content for any given tab id
  const renderTabContent = (tabId) => {
    switch (tabId) {
      case 'profile':
        return renderProfileTab()
      case 'password':
        return renderPasswordTab()
      case 'privacy':
        return renderPrivacyTab()
      case 'appearance':
        return renderAppearanceTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'account':
        return renderAccountTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-12 transition-colors duration-200 px-3 sm:px-4 md:px-0">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 sm:gap-4 transition-colors">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
          <AiOutlineSetting size={24} className="sm:text-[26px]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {t('settings.title') || 'Cài đặt & Quyền riêng tư'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            Quản lý thông tin cá nhân, bảo mật tài khoản và tùy chọn giao diện
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MOBILE INTERFACE (< md): LIST MENU -> DETAIL DRILLDOWN */}
      {/* ======================================================== */}
      <div className="block md:hidden">
        {mobileActiveTab === null ? (
          /* Mobile Screen 1: Master Menu List */
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            {/* Quick Profile Overview Row: Đi thẳng về Trang cá nhân */}
            <Link
              to={profilePath}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-[0.99] transition cursor-pointer"
            >
              <Avatar src={user?.avatar} name={displayName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  @{user?.username || 'zivo_user'} • Xem trang cá nhân
                </p>
              </div>
              <AiOutlineRight size={16} className="text-slate-400 shrink-0" />
            </Link>

            {/* Menu Sections List */}
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMobileActiveTab(tab.id)
                      setActiveTab(tab.id)
                      setIsEditingProfileInfo(false)
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tab.color}`}>
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tab.label}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {tab.desc}
                        </p>
                      </div>
                    </div>
                    <AiOutlineRight size={16} className="text-slate-400 shrink-0 ml-2" />
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Mobile Screen 2: Detail Sub-Page with Back Navigation */
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            {/* Top Back Navigation Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileActiveTab(null)
                  setIsEditingProfileInfo(false)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                <AiOutlineArrowLeft size={15} />
                <span>Cài đặt</span>
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                {tabs.find((t) => t.id === mobileActiveTab)?.label}
              </span>
            </div>

            {/* Sub-page content */}
            <div>{renderTabContent(mobileActiveTab)}</div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP INTERFACE (>= md): SIDEBAR TABS + DETAIL PANEL */}
      {/* ======================================================== */}
      <div className="hidden md:grid md:grid-cols-12 gap-6">
        {/* Left Tab Menu (Desktop) */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 self-start transition-colors">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id !== 'profile') {
                    setIsEditingProfileInfo(false)
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold border-l-4 border-primary-600 rounded-l-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={19}
                    className={active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}
                  />
                  <span>{tab.label}</span>
                </div>
                <AiOutlineRight
                  size={14}
                  className={active ? 'text-primary-500 opacity-100' : 'text-slate-300 dark:text-slate-600 opacity-60'}
                />
              </button>
            )
          })}
        </div>

        {/* Right Content Panel (Desktop) */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          {renderTabContent(activeTab)}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
