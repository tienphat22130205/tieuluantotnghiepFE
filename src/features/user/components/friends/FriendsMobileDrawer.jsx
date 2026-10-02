import { memo } from 'react'
import { AiOutlineClose, AiOutlineRight } from 'react-icons/ai'
import FRIEND_MENU_ITEMS from './friendMenuItems'

/**
 * FriendsMobileDrawer – Drawer trượt menu danh mục bạn bè dành riêng cho Mobile (lg:hidden).
 */
const FriendsMobileDrawer = memo(({
  isOpen,
  onClose,
  activeMenu,
  onSelectMenu,
  t,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile Drawer (Slides out from the right) */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-white dark:bg-slate-900 p-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden border-l border-slate-100 dark:border-slate-800 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('friends.title')}</h1>
          <button
            type="button"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <AiOutlineClose size={18} />
          </button>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          {FRIEND_MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeMenu === item.key
            const itemLabel = t(`friends.${item.key}`) || item.label

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectMenu(item.key)
                  onClose()
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition cursor-pointer ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{itemLabel}</span>
                </span>
                <AiOutlineRight size={14} className={active ? 'text-primary-500' : 'text-slate-400'} />
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
})

FriendsMobileDrawer.displayName = 'FriendsMobileDrawer'

export default FriendsMobileDrawer
