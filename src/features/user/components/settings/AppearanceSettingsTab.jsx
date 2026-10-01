import { AiOutlineBulb, AiOutlineGlobal } from 'react-icons/ai'
import { usePreferences } from '@/context/PreferencesContext'

/**
 * Tab Cài đặt: Giao diện & Ngôn ngữ (Dark mode, Tiếng Việt / English)
 */
const AppearanceSettingsTab = () => {
  const { isDarkMode, setIsDarkMode, language, setLanguage, t } = usePreferences()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.appearanceSection') || 'Giao diện & Ngôn ngữ'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.appearanceSectionDesc') ||
            'Tùy chỉnh chế độ hiển thị và ngôn ngữ bạn sử dụng.'}
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
}

export default AppearanceSettingsTab
