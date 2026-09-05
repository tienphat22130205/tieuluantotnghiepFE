import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'

const AdminTopbar = ({ activeSection, user, onLogout, onToggleMenu, isDesktopCollapsed }) => {
  const { language, setLanguage, isDarkMode, toggleDarkMode, t } = usePreferences()
  const displayName = user?.fullName || user?.username || 'Admin'
  const avatarText = displayName.slice(0, 1).toUpperCase()

  const titles = {
    dashboard: t('admin.dashboard'),
    users: t('admin.usersManagement'),
    unbanRequests: t('admin.unbanRequests'),
    posts: t('admin.postsModeration'),
    comments: t('admin.commentsManagement'),
    stats: t('admin.documentStats'),
  }

  const subtitles = {
    dashboard: t('admin.dashboardSubtitle'),
    users: t('admin.usersSubtitle'),
    unbanRequests: t('admin.unbanSubtitle'),
    posts: t('admin.postsSubtitle'),
    comments: t('admin.commentsSubtitle'),
    stats: t('admin.statsSubtitle'),
  }

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleMenu}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label={isDesktopCollapsed ? t('admin.openMenu') : t('admin.collapseMenu')}
          title={isDesktopCollapsed ? t('admin.openMenu') : t('admin.collapseMenu')}
        >
          <Menu size={18} />
          <span className="hidden text-sm font-medium lg:inline">
            {isDesktopCollapsed ? t('admin.openMenu') : t('admin.collapseMenu')}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Pill-shaped Language Switcher matching User's requested design */}
          <div
            className="relative inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/70 p-0.5 shadow-inner dark:border-slate-700 dark:bg-slate-800"
            role="group"
            aria-label="Language switch"
          >
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-blue-600 shadow-sm transition-all duration-200 ease-in-out ${
                language === 'vi' ? 'left-0.5' : 'left-[calc(50%+1.5px)]'
              }`}
            />

            <button
              type="button"
              onClick={() => setLanguage('vi')}
              className={`relative z-10 flex min-w-[34px] cursor-pointer items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${
                language === 'vi'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Tiếng Việt"
            >
              VI
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`relative z-10 flex min-w-[34px] cursor-pointer items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${
                language === 'en'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
          </button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {avatarText}
              </span>
            )}
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
              {displayName}
            </span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <LogOut size={16} />
            {t('admin.logout')}
          </button>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {t('admin.title')} / {titles[activeSection] || activeSection}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
        {titles[activeSection] || activeSection}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {subtitles[activeSection] || ''}
      </p>
    </header>
  )
}

export default AdminTopbar
