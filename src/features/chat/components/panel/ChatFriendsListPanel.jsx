import { AiOutlineSearch, AiOutlineClose, AiOutlineExpand } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { usePreferences } from '@/context/PreferencesContext'
import ChatFriendsStoryList from './ChatFriendsStoryList'
import ChatFriendsListItem from './ChatFriendsListItem'

const ChatFriendsListPanel = ({
  isOpen,
  selectedConversation,
  isLoading,
  sortedFriends,
  unfilteredSortedFriends = [],
  searchKeyword,
  onChangeSearch,
  onClose,
  onSelectFriend,
}) => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { t } = usePreferences()

  const handleExpand = () => {
    onClose?.()
    navigate('/chat')
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-white dark:bg-slate-900 transition-transform duration-300 ease-out md:inset-y-0 md:left-auto md:right-0 md:h-screen md:w-[360px] md:border-l md:border-slate-200 dark:md:border-slate-800 md:shadow-2xl ${
        isOpen && !selectedConversation ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('chat.title')}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleExpand}
            title={t('chat.expand')}
            className="hidden md:inline-flex p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <AiOutlineExpand size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title={t('nav.close')}
            className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <AiOutlineClose size={16} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
          <AiOutlineSearch size={16} className="text-slate-400 dark:text-slate-500" />
          <input
            value={searchKeyword}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder={t('friends.searchPlaceholder')}
            className="w-full text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Horizontal Story & Active Friends Strip */}
      {!isLoading && (
        <ChatFriendsStoryList
          user={user}
          friends={unfilteredSortedFriends}
          onSelectFriend={onSelectFriend}
        />
      )}

      {/* Vertical Friends List */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1">
        {isLoading && (
          <div className="px-4 py-6 text-sm text-gray-500">{t('chat.loadingFriends', 'Đang tải danh sách bạn bè...')}</div>
        )}

        {!isLoading && sortedFriends.length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-500">
            {searchKeyword.trim()
              ? t('chat.noFriendsMatch', 'Không tìm thấy bạn bè phù hợp.')
              : t('chat.noFriendsDisplay', 'Bạn chưa có bạn bè nào để hiển thị.')}
          </div>
        )}

        {!isLoading &&
          sortedFriends.map((friend) => (
            <ChatFriendsListItem
              key={friend._id}
              friend={friend}
              onSelectFriend={onSelectFriend}
            />
          ))}
      </div>
    </div>
  )
}

export default ChatFriendsListPanel
