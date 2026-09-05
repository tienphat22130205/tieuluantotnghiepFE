import { BarChart3, ClipboardCheck, FileText, Lock, MessageSquareText, Users } from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'

const menuIcons = {
  users: Users,
  unbanRequests: ClipboardCheck,
  posts: FileText,
  comments: MessageSquareText,
  stats: BarChart3,
  dashboard: BarChart3,
}

const AdminSidebar = ({
  activeSection,
  menuItems,
  onSelect,
  isOpen,
  onClose,
  isDesktopCollapsed,
  lockedSectionIds = [],
}) => {
  const { t } = usePreferences()

  const labelMap = {
    dashboard: t('admin.dashboard'),
    users: t('admin.usersManagement'),
    unbanRequests: t('admin.unbanRequests'),
    posts: t('admin.postsModeration'),
    comments: t('admin.commentsManagement'),
    stats: t('admin.documentStats'),
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 cursor-pointer lg:hidden bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:z-20 transition-[width,transform] duration-250 ease-in-out will-change-[width] overflow-y-auto shrink-0 dark:border-slate-800 dark:bg-slate-900 ${
          isDesktopCollapsed ? 'lg:w-[84px]' : 'lg:w-[280px]'
        } ${
          isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div
          className={`mb-5 flex items-center border-b border-slate-200 dark:border-slate-800 pb-4 pt-2 transition-all duration-200 ${
            isDesktopCollapsed ? 'justify-center gap-0' : 'gap-3 px-2'
          }`}
        >
          <img src="/Zlogo.png" alt="Z logo" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
          <div
            className={`overflow-hidden transition-all duration-200 ${
              isDesktopCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'
            }`}
          >
            <p className="text-base font-bold whitespace-nowrap leading-tight text-slate-800 dark:text-white">{t('admin.title')}</p>
            <p className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">{t('admin.subtitle')}</p>
          </div>
        </div>

        <nav className="grid gap-2" aria-label="Danh sách chức năng admin">
          {menuItems.map((item) => {
            const Icon = menuIcons[item.id] || Users
            const isActive = activeSection === item.id
            const isLocked = lockedSectionIds.includes(item.id)

            const stateClasses = isLocked
              ? 'bg-slate-100/60 text-slate-400 border border-slate-200/60 dark:bg-slate-950/40 dark:text-slate-600 dark:border-slate-800/60 cursor-not-allowed'
              : isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold dark:bg-blue-600 dark:text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isLocked) return
                  onSelect(item.id)
                }}
                title={labelMap[item.id] || item.label}
                disabled={isLocked}
                className={`w-full cursor-pointer rounded-xl py-3 text-left text-sm font-medium transition-all duration-150 ${
                  isDesktopCollapsed
                    ? 'flex items-center justify-center px-0'
                    : 'flex items-center gap-3 px-4'
                } ${stateClasses}`}
              >
                <Icon size={20} className="shrink-0" />
                <div
                  className={`flex min-w-0 items-center justify-between overflow-hidden transition-all duration-200 ${
                    isDesktopCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100 flex-1'
                  }`}
                >
                  <span className="truncate whitespace-nowrap">{labelMap[item.id] || item.label}</span>
                  {isLocked && <Lock size={14} className="shrink-0 ml-1.5" aria-label="Bị khóa với kiểm duyệt viên" />}
                </div>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default AdminSidebar
