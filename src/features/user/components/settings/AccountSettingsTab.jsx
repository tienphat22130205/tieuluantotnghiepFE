import { AiOutlineLogout } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'

/**
 * Tab Cài đặt: Tài khoản (Tổng quan tài khoản & Đăng xuất)
 */
const AccountSettingsTab = ({ user, onLogout }) => {
  const { t } = usePreferences()

  const displayName =
    user?.full_name ||
    user?.fullName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'Người dùng'

  return (
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
          onClick={onLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900/40 transition cursor-pointer"
        >
          <AiOutlineLogout size={16} />
          <span>{t('nav.logout') || 'Đăng xuất tài khoản'}</span>
        </button>
      </div>
    </div>
  )
}

export default AccountSettingsTab
