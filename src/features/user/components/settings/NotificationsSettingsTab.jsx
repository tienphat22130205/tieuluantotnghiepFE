import { useState } from 'react'
import { usePreferences } from '@/context/PreferencesContext'

/**
 * Tab Cài đặt: Thông báo (Bật/tắt âm thanh thông báo)
 */
const NotificationsSettingsTab = () => {
  const { t } = usePreferences()
  const [soundEnabled, setSoundEnabled] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.notificationsSection') || 'Cài đặt thông báo'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.notificationsSectionDesc') ||
            'Quản lý âm thanh và thông báo trên nền tảng.'}
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
}

export default NotificationsSettingsTab
