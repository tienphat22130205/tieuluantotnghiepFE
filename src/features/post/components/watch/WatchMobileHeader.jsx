import { TAB_ITEMS } from '../../constants/watchConstants'

const WatchMobileHeader = ({ activeTab, setActiveTab }) => {
  return (
    <header className="flex lg:hidden items-center justify-between px-3.5 py-2.5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-20 text-slate-900 dark:text-white select-none transition-colors duration-200">
      <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Watch
      </span>

      <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
        {TAB_ITEMS.slice(0, 3).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 ${
              activeTab === key
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  )
}

export default WatchMobileHeader
