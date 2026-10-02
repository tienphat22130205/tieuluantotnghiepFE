import { MdOndemandVideo } from 'react-icons/md'
import { AiOutlineFire } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { TAB_ITEMS, TRENDING_HASHTAGS, FEATURED_CREATORS } from '../../constants/watchConstants'

const WatchSidebar = ({
  activeTab,
  setActiveTab,
  selectedTag,
  setSelectedTag,
  followedUsers,
  onToggleFollow,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 py-5 px-4 shrink-0 overflow-y-auto text-slate-800 dark:text-white select-none transition-colors duration-200">
      {/* Watch Brand */}
      <div className="flex items-center gap-2.5 px-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
          <MdOndemandVideo size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
            Zivo <span className="text-primary-600 dark:text-primary-400">Watch</span>
          </h2>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Video ngắn & Reels</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="space-y-1 mb-6">
        {TAB_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setSelectedTag(null)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-600 dark:text-white shadow-xs dark:shadow-md dark:shadow-primary-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Trending Topics */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mb-6">
        <div className="flex items-center gap-1.5 px-2 mb-3">
          <AiOutlineFire size={16} className="text-amber-500 dark:text-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Chủ đề hot
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 px-1">
          {TRENDING_HASHTAGS.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                selectedTag === tag
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white border border-transparent dark:border-slate-700/50'
              }`}
            >
              <span>{tag}</span>
              <span className="ml-1 text-[10px] opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Creators */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-auto">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-3">
          Tác giả gợi ý
        </p>
        <div className="space-y-3 px-1">
          {FEATURED_CREATORS.map((creator) => (
            <div key={creator.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={creator.avatar} name={creator.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">{creator.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{creator.followers} theo dõi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleFollow(creator.username)}
                className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 ${
                  followedUsers[creator.username]
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-600/20 dark:text-primary-400 dark:hover:bg-primary-600 dark:hover:text-white border border-primary-100 dark:border-primary-500/30'
                }`}
              >
                {followedUsers[creator.username] ? 'Đang theo' : '+ Theo dõi'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default WatchSidebar
