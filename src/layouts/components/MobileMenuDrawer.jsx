import { memo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import {
  AiOutlineClose,
  AiOutlineRight,
  AiOutlineSetting,
  AiOutlineBell,
  AiOutlineDashboard,
  AiOutlineBulb,
  AiOutlineGlobal,
  AiOutlineLogout,
} from 'react-icons/ai'
import { FaUserFriends } from 'react-icons/fa'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { MdOutlineOndemandVideo } from 'react-icons/md'
import { Avatar } from '@/components/ui'
import { canAccessAdminDashboard } from '@/utils/auth'

/**
 * MobileMenuDrawer – Drawer trượt từ bên phải trên màn hình mobile,
 * chứa thông tin tài khoản, phím tắt nhanh, cài đặt dark mode, ngôn ngữ và đăng xuất.
 */
const MobileMenuDrawer = memo(({
  isOpen,
  onClose,
  user,
  displayName,
  profilePath,
  role,
  isActive,
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  onLogout,
  t,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[70]">
          <Motion.button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            aria-label={t('nav.close')}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />

          <Motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            className="absolute right-0 top-0 h-full w-[85vw] max-w-[380px] min-w-[280px] bg-slate-50 dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-colors overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('nav.menu')}</h2>
              <button
                type="button"
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label={t('nav.close')}
                onClick={onClose}
              >
                <AiOutlineClose size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Profile Card */}
              <Link
                to={profilePath}
                onClick={onClose}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user?.avatar} name={displayName} size="md" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {displayName || t('nav.unknownUser')}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">
                      {t('nav.viewProfile')}
                    </p>
                  </div>
                </div>
                <AiOutlineRight
                  size={16}
                  className="text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition shrink-0"
                />
              </Link>

              {/* Main Shortcuts Section */}
              <div className="space-y-1.5">
                <p className="px-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {t('nav.yourShortcuts')}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {/* Settings & Privacy Shortcut */}
                  <Link
                    to="/settings"
                    onClick={onClose}
                    className={`col-span-2 flex items-center justify-between p-3.5 rounded-2xl border transition shadow-xs ${
                      isActive('/settings')
                        ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-800 text-primary-700 dark:text-primary-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                        <AiOutlineSetting size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">{t('nav.settingsPrivacy')}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Tùy chỉnh giao diện, bảo mật
                        </p>
                      </div>
                    </div>
                    <AiOutlineRight size={16} className="text-slate-400 shrink-0" />
                  </Link>

                  {/* Friends Shortcut */}
                  <Link
                    to="/friends"
                    onClick={onClose}
                    className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                  >
                    <FaUserFriends size={22} className="text-blue-500 mb-2" />
                    <span className="text-xs font-bold">{t('nav.friends')}</span>
                  </Link>

                  {/* Groups Shortcut */}
                  <Link
                    to="/groups"
                    onClick={onClose}
                    className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                  >
                    <HiOutlineUserGroup size={24} className="text-emerald-500 mb-2" />
                    <span className="text-xs font-bold">{t('nav.groups')}</span>
                  </Link>

                  {/* Watch Shortcut */}
                  <Link
                    to="/watch"
                    onClick={onClose}
                    className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                  >
                    <MdOutlineOndemandVideo size={24} className="text-red-500 mb-2" />
                    <span className="text-xs font-bold">{t('nav.watch')}</span>
                  </Link>

                  {/* Notifications Shortcut */}
                  <Link
                    to="/notifications"
                    onClick={onClose}
                    className="flex flex-col p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-primary-500 transition shadow-xs"
                  >
                    <AiOutlineBell size={24} className="text-amber-500 mb-2" />
                    <span className="text-xs font-bold">{t('nav.notifications')}</span>
                  </Link>

                  {/* Admin Dashboard if applicable */}
                  {canAccessAdminDashboard(role) && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="col-span-2 flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold text-xs"
                    >
                      <AiOutlineDashboard size={20} className="text-amber-600 dark:text-amber-400" />
                      <span>{t('nav.admin')}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Preferences Box */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3.5">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  Cài đặt nhanh
                </p>

                {/* Dark mode toggle */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <AiOutlineBulb size={18} className="text-primary-600 dark:text-primary-400" />
                    {t('settings.darkMode')}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDarkMode}
                    onClick={() => setIsDarkMode((prev) => !prev)}
                    className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                      isDarkMode ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Language switch buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <AiOutlineGlobal size={18} className="text-primary-600 dark:text-primary-400" />
                    {t('settings.language')}
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLanguage('vi')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                        language === 'vi'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      🇻🇳 VI
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                        language === 'en'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      🇬🇧 EN
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
              >
                <AiOutlineLogout size={18} />
                {t('nav.logout')}
              </button>
            </div>
          </Motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
})

MobileMenuDrawer.displayName = 'MobileMenuDrawer'

export default MobileMenuDrawer
