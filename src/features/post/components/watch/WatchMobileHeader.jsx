import { TAB_ITEMS } from '../../constants/watchConstants'

const WatchMobileHeader = ({ activeTab, setActiveTab }) => {
  return (
    <header className="flex lg:hidden items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200/80 backdrop-blur-md sticky top-0 z-20">
      <span className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Watch
      </span>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {TAB_ITEMS.slice(0, 3).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer ${
              activeTab === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
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
