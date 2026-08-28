import { useState } from 'react'
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
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { useAuth } from '@/features/auth'
import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'

const SettingsPage = () => {
  const { user, handleLogout } = useAuth()
  const { isDarkMode, setIsDarkMode, language, setLanguage, t } = usePreferences()

  const [postVisibility, setPostVisibility] = useState('public')
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState('appearance')

  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'

  const handleSaveSettings = () => {
    toast.success(t('settings.savedSuccess') || 'Đã lưu cấu hình cài đặt thành công!', { autoClose: 2000 })
  }

  const tabs = [
    { id: 'appearance', label: t('settings.appearanceTab'), icon: AiOutlineBulb },
    { id: 'privacy', label: t('settings.privacyTab'), icon: AiOutlineLock },
    { id: 'notifications', label: t('settings.notificationsTab'), icon: AiOutlineBell },
    { id: 'account', label: t('settings.accountTab'), icon: AiOutlineUser },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 transition-colors duration-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
          <AiOutlineSetting size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('settings.desc')}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Tab Menu */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 self-start transition-colors">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold border-l-4 border-primary-600 rounded-l-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={19} className={active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          {/* TAB 1: GIAO DIỆN & NGÔN NGỮ */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('settings.appearanceSection')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.appearanceSectionDesc')}</p>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <AiOutlineBulb size={20} className="text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('settings.darkMode')}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.darkModeDesc')}</p>
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
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('settings.language')}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.languageDesc')}</p>
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
          )}

          {/* TAB 2: QUYỀN RIÊNG TƯ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('settings.privacySection')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.privacySectionDesc')}</p>
              </div>

              {/* Online Status Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('settings.onlineStatus')}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.onlineStatusDesc')}</p>
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
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('settings.postVisibility')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.postVisibilityDesc')}</p>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { id: 'public', label: t('settings.public'), icon: AiOutlineGlobal },
                    { id: 'friends', label: t('settings.friendsOnly'), icon: AiOutlineTeam },
                    { id: 'private', label: t('settings.private'), icon: AiOutlineLock },
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
            </div>
          )}

          {/* TAB 3: THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('settings.notificationsSection')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.notificationsSectionDesc')}</p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('settings.sound')}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t('settings.soundDesc')}</p>
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
          )}

          {/* TAB 4: TÀI KHOẢN */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('settings.accountSection')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.accountSectionDesc')}</p>
              </div>

              <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <Avatar src={user?.avatar} name={displayName} size="md" />
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{user?.username || 'zivo_user'}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-100 dark:border-red-900/40 transition cursor-pointer"
                >
                  <AiOutlineLogout size={16} />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
            >
              <AiOutlineCheck size={16} />
              <span>{t('settings.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
