import { memo } from 'react'
import { AiOutlineRight } from 'react-icons/ai'
import FRIEND_MENU_ITEMS from './friendMenuItems'

/**
 * FriendsSidebar – Thanh sidebar danh mục bạn bè dành riêng cho Web / Desktop (hidden lg:block).
 */
const FriendsSidebar = memo(({
  activeMenu,
  onSelectMenu,
  t,
}) => {
  return (
    <aside className="hidden lg:block rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:sticky lg:top-20 lg:h-fit transition-colors">
      <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('friends.title')}</h1>
      </div>
      <nav className="space-y-1">
        {FRIEND_MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeMenu === item.key
          const itemLabel = t(`friends.${item.key}`) || item.label

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectMenu(item.key)}
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
    </aside>
  )
})

FriendsSidebar.displayName = 'FriendsSidebar'

export default FriendsSidebar
