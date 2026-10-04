import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'

const ChatFriendsStoryList = ({ user, friends = [], onSelectFriend }) => {
  const { t } = usePreferences()

  if (!friends || friends.length === 0) return null

  return (
    <div className="flex items-center gap-4 px-4 py-4 overflow-x-auto border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Create Story Placeholder */}
      <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
        <div className="relative">
          <Avatar
            src={user?.avatar}
            name={user?.full_name}
            size="lg"
            online={false}
            className="ring-2 ring-slate-100 dark:ring-slate-800"
          />
          <div className="absolute bottom-0 right-0 bg-primary-600 border border-white dark:border-slate-900 rounded-full p-0.5 flex items-center justify-center text-white">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[64px] text-center truncate mt-0.5">
          {t('sidebar.createStory')}
        </span>
      </div>

      {/* Friends Loop */}
      {friends.map((friend) => {
        const displayName =
          friend.full_name?.split(' ').slice(-2).join(' ') || friend.username || 'Bạn bè'
        return (
          <button
            key={`h-panel-${friend._id}`}
            type="button"
            onClick={() => onSelectFriend(friend._id)}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer focus:outline-none"
          >
            <div className="relative">
              <Avatar
                src={friend.avatar}
                name={friend.full_name}
                size="lg"
                online={friend.isOnline}
              />
            </div>
            <span className="text-xs text-slate-700 font-medium max-w-[64px] text-center truncate mt-0.5">
              {displayName}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ChatFriendsStoryList
