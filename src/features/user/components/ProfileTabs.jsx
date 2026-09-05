import {
  AiOutlineIdcard,
  AiOutlineUser,
  AiOutlinePicture,
  AiOutlineTeam,
} from 'react-icons/ai'

/**
 * ProfileTabs – Thanh chuyển tab (Bài viết, Giới thiệu, Ảnh, Bạn bè) tích hợp Badge đếm số lượng.
 * Props: activeTab, onTabChange, postsCount, photosCount, friendCount
 */
const ProfileTabs = ({
  activeTab,
  onTabChange,
  postsCount = null,
  photosCount = null,
  friendCount = null,
}) => {
  const tabs = [
    {
      id: 'posts',
      label: 'Bài viết',
      icon: AiOutlineIdcard,
      count: postsCount,
    },
    {
      id: 'about',
      label: 'Giới thiệu',
      icon: AiOutlineUser,
      count: null,
    },
    {
      id: 'photos',
      label: 'Ảnh',
      icon: AiOutlinePicture,
      count: photosCount,
    },
    {
      id: 'friends',
      label: 'Bạn bè',
      icon: AiOutlineTeam,
      count: friendCount,
    },
  ]

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer select-none text-sm ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-t-xl font-medium'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count >= 0 && (
                <span
                  className={`ml-0.5 px-2 py-0.5 text-xs rounded-full font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileTabs
