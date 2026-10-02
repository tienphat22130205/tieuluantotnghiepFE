import {
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineKey,
  AiOutlineLock,
  AiOutlineBulb,
  AiOutlineBell,
} from 'react-icons/ai'
import { useAuth } from '@/features/auth'
import { usePreferences } from '@/context/PreferencesContext'
import {
  ProfileSettingsTab,
  PasswordSettingsTab,
  PrivacySettingsTab,
  AppearanceSettingsTab,
  NotificationsSettingsTab,
  AccountSettingsTab,
  SettingsMobileView,
  SettingsDesktopView,
} from '../components/settings'

/**
 * SettingsPage – Trang cài đặt tài khoản người dùng
 * Đã tách biệt hoàn toàn Giao diện Mobile (SettingsMobileView) và Giao diện Web (SettingsDesktopView)
 * giúp việc tùy biến, sửa lỗi độc lập và không ảnh hưởng lẫn nhau.
 */
const SettingsPage = () => {
  const { user, handleLogout } = useAuth()
  const { t } = usePreferences()

  const displayName =
    user?.full_name ||
    user?.fullName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    t('nav.unknownUser', 'Người dùng')

  const userIdentifier = user?.username ? String(user.username).replace(/^@/, '') : (user?.id || user?._id)
  const profilePath = userIdentifier ? `/profile/${userIdentifier}` : '/profile'

  const tabs = [
    {
      id: 'profile',
      label: t('settings.profileTab', 'Thông tin cá nhân'),
      icon: AiOutlineUser,
      desc: t('settings.profileTabDesc', 'Họ tên, ngày sinh, tiểu sử cá nhân'),
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'password',
      label: t('settings.passwordTab', 'Đổi mật khẩu'),
      icon: AiOutlineKey,
      desc: t('settings.passwordTabDesc', 'Bảo mật tài khoản, mật khẩu đăng nhập'),
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'privacy',
      label: t('settings.privacyTab', 'Quyền riêng tư'),
      icon: AiOutlineLock,
      desc: t('settings.privacyTabDesc', 'Trạng thái online, chế độ xem bài viết'),
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'appearance',
      label: t('settings.appearanceTab', 'Giao diện & Ngôn ngữ'),
      icon: AiOutlineBulb,
      desc: t('settings.appearanceTabDesc', 'Chế độ tối (Dark mode), Tiếng Việt / English'),
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'notifications',
      label: t('settings.notificationsTab', 'Thông báo'),
      icon: AiOutlineBell,
      desc: t('settings.notificationsTabDesc', 'Âm thanh thông báo và tương tác'),
      color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'account',
      label: t('settings.accountTab', 'Tài khoản'),
      icon: AiOutlineSetting,
      desc: t('settings.accountTabDesc', 'Tổng quan tài khoản và đăng xuất'),
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
  ]

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case 'profile':
        return <ProfileSettingsTab user={user} />
      case 'password':
        return <PasswordSettingsTab user={user} />
      case 'privacy':
        return <PrivacySettingsTab />
      case 'appearance':
        return <AppearanceSettingsTab />
      case 'notifications':
        return <NotificationsSettingsTab />
      case 'account':
        return <AccountSettingsTab user={user} onLogout={handleLogout} />
      default:
        return <ProfileSettingsTab user={user} />
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
            {t('settings.title', 'Cài đặt & Quyền riêng tư')}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {t('settings.headerSubtitle', 'Quản lý thông tin cá nhân, bảo mật tài khoản và tùy chọn giao diện')}
          </p>
        </div>
      </div>

      {/* 1. GIAO DIỆN MOBILE (< md): Menu danh sách & Drilldown chi tiết */}
      <SettingsMobileView
        tabs={tabs}
        renderTabContent={renderTabContent}
        user={user}
        displayName={displayName}
        profilePath={profilePath}
      />

      {/* 2. GIAO DIỆN WEB / DESKTOP (>= md): Sidebar 2 cột */}
      <SettingsDesktopView
        tabs={tabs}
        renderTabContent={renderTabContent}
      />
    </div>
  )
}

export default SettingsPage
