import { useState, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import {
  AiOutlineEdit,
  AiOutlineClockCircle,
  AiOutlineCalendar,
  AiOutlineMail,
  AiOutlineSafetyCertificate,
  AiOutlineArrowLeft,
  AiOutlineClose,
  AiOutlineLoading3Quarters,
  AiOutlineCheck,
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { updateUser } from '@/features/auth/store/authSlice'
import userService from '@/features/user/services/userService'
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

const formatDateDisplay = (dateValue, lang = 'vi', fallback = 'Chưa cập nhật') => {
  if (!dateValue) return fallback
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return fallback
    return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return fallback
  }
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Tab Cài đặt: Thông tin cá nhân (Xem & Chỉnh sửa, kèm 30 ngày cooldown)
 */
const ProfileSettingsTab = ({ user }) => {
  const dispatch = useDispatch()
  const { t, language } = usePreferences()

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
  const [profileMeta, setProfileMeta] = useState({
    lastProfileInfoChangedAt: user?.lastProfileInfoChangedAt || null,
  })

  // Sync profile details on mount / user change
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
      setProfileMeta((prev) => ({
        ...prev,
        lastProfileInfoChangedAt: user.lastProfileInfoChangedAt || prev.lastProfileInfoChangedAt,
      }))
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
          setProfileMeta({
            lastProfileInfoChangedAt: data.lastProfileInfoChangedAt || null,
          })
        }
      })
      .catch(() => {})
  }, [user])

  // 30-day cooldown remaining for profile name / DOB change
  const profileCooldownDays = useMemo(() => {
    const ts = profileMeta.lastProfileInfoChangedAt || user?.lastProfileInfoChangedAt
    if (!ts) return 0
    const elapsed = Date.now() - new Date(ts).getTime()
    if (elapsed >= THIRTY_DAYS_MS) return 0
    return Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000))
  }, [profileMeta.lastProfileInfoChangedAt, user?.lastProfileInfoChangedAt])

  const displayName =
    user?.full_name ||
    user?.fullName ||
    `${profileForm.firstName || user?.firstName || ''} ${profileForm.lastName || user?.lastName || ''}`.trim() ||
    t('nav.unknownUser', 'Người dùng')

  const maxDateOfBirth = new Date().toISOString().split('T')[0]

  const handleCancelEditProfile = () => {
    setProfileForm(initialProfileData)
    setIsEditingProfileInfo(false)
  }

  const handleSaveProfile = async (e) => {
    e?.preventDefault()
    if (!profileForm.firstName.trim() && !profileForm.lastName.trim()) {
      toast.error(t('settings.enterFirstAndLastName', 'Vui lòng nhập họ và tên của bạn.'))
      return
    }

    const isNameOrDobChanged =
      profileForm.firstName.trim() !== (initialProfileData.firstName || '').trim() ||
      profileForm.lastName.trim() !== (initialProfileData.lastName || '').trim() ||
      (profileForm.dateOfBirth || '') !== (initialProfileData.dateOfBirth || '')

    if (isNameOrDobChanged && profileCooldownDays > 0) {
      toast.warning(
        `${t('settings.profileCooldownToast', 'Bạn chỉ có thể đổi họ tên hoặc ngày sinh 30 ngày một lần. Vui lòng thử lại sau')} ${profileCooldownDays} ${t('settings.daysLeft', 'ngày nữa')}.`
      )
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
        lastProfileInfoChangedAt:
          updatedData.lastProfileInfoChangedAt ||
          (isNameOrDobChanged ? new Date().toISOString() : profileMeta.lastProfileInfoChangedAt),
      }

      dispatch(updateUser(updatedFields))
      setInitialProfileData({
        firstName: updatedFields.firstName,
        lastName: updatedFields.lastName,
        dateOfBirth: formatDateForInput(updatedFields.dateOfBirth),
        bio: updatedFields.bio,
      })

      if (isNameOrDobChanged) {
        setProfileMeta((prev) => ({
          ...prev,
          lastProfileInfoChangedAt: updatedFields.lastProfileInfoChangedAt,
        }))
      }

      setIsEditingProfileInfo(false)
      toast.success(t('settings.profileUpdated', 'Cập nhật thông tin cá nhân thành công!'))
    } catch (err) {
      console.error('Update profile error:', err)
      toast.error(err.message || t('settings.profileUpdateFailed', 'Cập nhật thông tin cá nhân thất bại.'))
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* FORM 1: HIỂN THỊ THÔNG TIN (VIEW MODE) */}
      {!isEditingProfileInfo ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Header View Mode */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('settings.profileSection', 'Thông tin cá nhân')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.profileSectionDesc', 'Xem và quản lý các thông tin cá nhân cơ bản của bạn.')}
              </p>
            </div>
            {/* Desktop only: Circular Blue Edit Button at Top Right */}
            <button
              type="button"
              onClick={() => {
                if (profileCooldownDays > 0) {
                  toast.warning(
                    `${t('settings.profileCooldownToast', 'Bạn chỉ có thể đổi họ tên hoặc ngày sinh 30 ngày một lần. Vui lòng thử lại sau')} ${profileCooldownDays} ${t('settings.daysLeft', 'ngày nữa')}.`
                  )
                  return
                }
                setIsEditingProfileInfo(true)
              }}
              className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md transition cursor-pointer shrink-0 ${
                profileCooldownDays > 0
                  ? 'bg-slate-400 hover:bg-slate-500 opacity-80'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg'
              }`}
              title={
                profileCooldownDays > 0
                  ? `${t('settings.profileCooldownMsg', 'Có thể cập nhật lại sau')} ${profileCooldownDays} ${t('settings.daysLeft', 'ngày nữa')}`
                  : t('settings.editProfile', 'Chỉnh sửa thông tin cá nhân')
              }
            >
              <AiOutlineEdit size={20} />
            </button>
          </div>

          {/* 30-day Cooldown Banner for Profile Info */}
          {profileCooldownDays > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
              <AiOutlineClockCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">{t('settings.profileCooldownTitle', 'Giới hạn thay đổi:')}</span> {t('settings.profileCooldownMsg', 'Bạn chỉ có thể cập nhật họ tên và ngày sinh 30 ngày một lần. Bạn có thể cập nhật lại sau')} <span className="font-bold underline">{profileCooldownDays} {t('settings.daysLeft', 'ngày nữa')}</span>.
              </div>
            </div>
          )}

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
                    ? t('settings.roleAdmin', 'Quản trị viên')
                    : user?.role === 'moderator'
                    ? t('settings.roleModerator', 'Kiểm duyệt viên')
                    : t('settings.roleMember', 'Thành viên')}
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
                {t('settings.lastName', 'Họ và tên đệm')}
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {profileForm.lastName || <span className="text-slate-400 italic font-normal">{t('settings.notUpdated', 'Chưa cập nhật')}</span>}
              </p>
            </div>

            {/* Tên */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('settings.firstName', 'Tên')}
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {profileForm.firstName || <span className="text-slate-400 italic font-normal">{t('settings.notUpdated', 'Chưa cập nhật')}</span>}
              </p>
            </div>

            {/* Ngày sinh */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                <AiOutlineCalendar size={13} className="text-primary-500" />
                <span>{t('settings.dateOfBirth', 'Ngày sinh')}</span>
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {formatDateDisplay(profileForm.dateOfBirth, language, t('settings.notUpdated', 'Chưa cập nhật'))}
              </p>
            </div>

            {/* Username */}
            <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t('settings.username', 'Tên người dùng')}
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
                <span>{t('settings.emailLinked', 'Email liên kết')}</span>
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                {user?.email || t('settings.notLinked', 'Chưa liên kết')}
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl shrink-0">
              <AiOutlineSafetyCertificate size={15} />
              <span>{t('settings.verified', 'Đã xác thực')}</span>
            </span>
          </div>

          {/* Bio */}
          <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              {t('settings.bio', 'Tiểu sử (Bio)')}
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {profileForm.bio || (
                <span className="text-slate-400 italic font-normal">
                  {t('settings.noBio', 'Chưa có thông tin tiểu sử. Nhấn Chỉnh sửa thông tin để thêm giới thiệu về bản thân!')}
                </span>
              )}
            </p>
          </div>

          {/* Mobile Action Button */}
          <div className="pt-2 flex md:hidden">
            <button
              type="button"
              onClick={() => {
                if (profileCooldownDays > 0) {
                  toast.warning(
                    `${t('settings.profileCooldownToast', 'Bạn chỉ có thể đổi họ tên hoặc ngày sinh 30 ngày một lần. Vui lòng thử lại sau')} ${profileCooldownDays} ${t('settings.daysLeft', 'ngày nữa')}.`
                  )
                  return
                }
                setIsEditingProfileInfo(true)
              }}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-xs transition cursor-pointer ${
                profileCooldownDays > 0
                  ? 'bg-slate-400 opacity-80'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              <AiOutlineEdit size={18} />
              <span>
                {profileCooldownDays > 0
                  ? `${t('settings.editProfile', 'Chỉnh sửa')} (${t('settings.profileCooldownMsg', 'Đổi lại sau')} ${profileCooldownDays} ${t('settings.daysLeft', 'ngày nữa')})`
                  : t('settings.editProfile', 'Chỉnh sửa thông tin cá nhân')}
              </span>
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
                title={t('settings.back', 'Quay lại')}
              >
                <AiOutlineArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('settings.editProfile', 'Chỉnh sửa thông tin cá nhân')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('settings.editProfileDesc', 'Cập nhật họ tên, ngày sinh và giới thiệu của bạn.')}
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
                  {t('settings.lastName', 'Họ và tên đệm')}
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder={t('settings.lastNamePlaceholder', 'Ví dụ: Nguyễn')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>

              {/* First Name (Tên) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('settings.firstName', 'Tên')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder={t('settings.firstNamePlaceholder', 'Ví dụ: Văn A')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AiOutlineCalendar size={15} className="text-primary-500" />
                <span>{t('settings.dateOfBirth', 'Ngày sinh')}</span>
              </label>
              <input
                type="date"
                max={maxDateOfBirth}
                value={profileForm.dateOfBirth}
                onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {t('settings.dobHint', 'Ngày sinh giúp bạn bè biết đến sinh nhật của bạn trên hệ thống.')}
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.bio', 'Tiểu sử (Bio)')}
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
                placeholder={t('settings.bioPlaceholder', 'Viết vài dòng giới thiệu ngắn về bản thân...')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-none"
              />
            </div>

            {/* Readonly Informational Fields */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <AiOutlineMail size={14} />
                  <span>{t('settings.emailFixed', 'Email liên kết (Cố định)')}</span>
                </label>
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                  <span>{user?.email || t('settings.notLinked', 'Chưa liên kết')}</span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <AiOutlineSafetyCertificate size={14} />
                    {t('settings.verified', 'Đã xác thực')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t('settings.username', 'Tên người dùng')}
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
                {t('settings.cancel', 'Hủy')}
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {isUpdatingProfile ? (
                  <>
                    <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                    <span>{t('settings.saving', 'Đang lưu...')}</span>
                  </>
                ) : (
                  <>
                    <AiOutlineCheck size={16} />
                    <span>{t('settings.saveChanges', 'Lưu thay đổi')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProfileSettingsTab
