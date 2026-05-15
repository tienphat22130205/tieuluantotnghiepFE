import { BarChart3, ClipboardCheck, FileText, Lock, MessageSquareText, Users } from 'lucide-react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { COLORS } from '@/theme/colors'

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
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 cursor-pointer lg:hidden"
          style={{ backgroundColor: COLORS.adminOverlay }}
          onClick={onClose}
        />
      )}

      <Motion.aside
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`fixed left-0 top-0 z-40 h-screen w-[300px] border-r border-slate-200 bg-slate-50 p-5 transition-all duration-300 ease-out lg:static lg:h-auto lg:w-full lg:translate-x-0 lg:border-b-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderColor: COLORS.border,
          backgroundColor: COLORS.adminSidebarBg,
        }}
      >
        <div className={`mb-5 flex items-center border-b border-slate-200 px-2 py-3 transition-all duration-300 ${isDesktopCollapsed ? 'justify-center gap-0' : 'gap-3'}`}>
          <img src="/Zlogo.png" alt="Z logo" className="h-13 w-13 rounded-lg object-contain" />
          <AnimatePresence initial={false}>
            {!isDesktopCollapsed && (
              <Motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <p className="text-base font-bold">Zivo Admin</p>
                <p className="text-sm">Quản trị mạng xã hội</p>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="grid gap-3" aria-label="Danh sách chức năng admin">
          {menuItems.map((item) => {
            const Icon = menuIcons[item.id] || Users
            const isActive = activeSection === item.id
            const isLocked = lockedSectionIds.includes(item.id)

            return (
              <Motion.button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isLocked) return
                  onSelect(item.id)
                }}
                title={item.label}
                whileHover={undefined}
                whileTap={isLocked ? undefined : { scale: 0.98 }}
                disabled={isLocked}
                className={`w-full cursor-pointer rounded-xl py-3 text-left text-base font-medium transition-all duration-300 ${
                  isDesktopCollapsed ? 'flex items-center justify-center px-2' : 'flex items-center gap-4 px-4'
                }`}
                style={
                  isLocked
                    ? {
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(15, 23, 42, 0.25)',
                        color: '#cbd5e1',
                        opacity: 0.72,
                        cursor: 'not-allowed',
                      }
                    : isActive
                    ? {
                        background: `linear-gradient(135deg, ${COLORS.adminSidebarActive}, ${COLORS.adminSidebarActiveHover})`,
                        color: COLORS.surface,
                        boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)',
                      }
                    : {
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.adminSidebarText,
                      }
                }
              >
                <Icon size={20} />
                <AnimatePresence initial={false}>
                  {!isDesktopCollapsed && (
                    <div className="flex min-w-0 items-center gap-2">
                      <Motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="truncate"
                      >
                        {item.label}
                      </Motion.span>
                      {isLocked && <Lock size={14} aria-label="Bị khóa với kiểm duyệt viên" />}
                    </div>
                  )}
                </AnimatePresence>
              </Motion.button>
            )
          })}
        </nav>
      </Motion.aside>
    </>
  )
}

export default AdminSidebar
