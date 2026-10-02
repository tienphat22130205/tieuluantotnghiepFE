import { AiOutlineSearch, AiOutlineArrowLeft } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { formatMessageAge } from '../constants/chatConstants'
import { usePreferences } from '@/context/PreferencesContext'

const ChatSidebar = ({
  isChatActive,
  isFriendsLoading,
  searchKeyword,
  setSearchKeyword,
  selectedFriendId,
  setSelectedFriendId,
  user,
  unfilteredSortedFriends,
  sortedFriends,
  onBackHome,
}) => {
  const { t } = usePreferences()

  return (
    <aside
      className={`w-full md:w-80 lg:w-[360px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full ${
        isChatActive ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackHome}
            title={t('chat.backHome', 'Quay lại trang chủ')}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <AiOutlineArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-slate-900">{t('chat.title', 'Đoạn chat')}</h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2">
          <AiOutlineSearch size={16} className="text-slate-400" />
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={t('chat.searchPlaceholder', 'Tìm kiếm trên Messenger...')}
            className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Horizontal Friends List */}
      {!isFriendsLoading && unfilteredSortedFriends.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-4 overflow-x-auto border-b border-slate-100 bg-white shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Create Story Placeholder */}
          <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
            <div className="relative">
              <Avatar
                src={user?.avatar}
                name={user?.full_name}
                size="lg"
                online={false}
                className="ring-2 ring-slate-100 group-hover:scale-105 transition"
              />
              <div className="absolute bottom-0 right-0 bg-primary-600 border border-white rounded-full p-0.5 flex items-center justify-center text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium max-w-[64px] text-center truncate mt-0.5">
              Tạo tin
            </span>
          </div>

          {/* Friends Loop */}
          {unfilteredSortedFriends.map((friend) => {
            const displayName = friend.full_name?.split(' ').slice(-2).join(' ') || friend.username || 'Bạn bè'
            return (
              <button
                key={`h-page-${friend._id}`}
                type="button"
                onClick={() => setSelectedFriendId(friend._id)}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group focus:outline-none"
              >
                <div className="relative">
                  <Avatar
                    src={friend.avatar}
                    name={friend.full_name}
                    size="lg"
                    online={friend.isOnline}
                    className="group-hover:scale-105 transition"
                  />
                </div>
                <span className="text-xs text-slate-700 font-medium max-w-[64px] text-center truncate mt-0.5">
                  {displayName}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isFriendsLoading && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Đang tải danh sách...
          </div>
        )}

        {!isFriendsLoading && sortedFriends.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            {searchKeyword.trim() ? t('chat.noSearchResults', 'Không tìm thấy kết quả.') : t('chat.noFriends', 'Chưa có bạn bè nào.')}
          </div>
        )}

        {!isFriendsLoading &&
          sortedFriends.map((friend) => {
            const unreadCount = Number(friend.newMessagesCount || 0)
            const hasUnread = unreadCount > 0
            const isSelected = String(friend._id) === String(selectedFriendId)
            const rawPreview = friend.lastMessagePreview
            const previewText = rawPreview
              ? (rawPreview.startsWith('Bạn: ') ? `${t('chat.you', 'Bạn:')} ${rawPreview.slice(5)}` : rawPreview)
              : hasUnread
                ? `${unreadCount} ${t('chat.newMessages', 'tin nhắn mới')}`
                : t('chat.noMessages', 'Chưa có tin nhắn')
            const messageAge = formatMessageAge(friend.lastMessageAt)
            const previewWithAge = messageAge && rawPreview ? `${previewText} · ${messageAge}` : previewText

            return (
              <button
                key={friend._id}
                type="button"
                onClick={() => setSelectedFriendId(friend._id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 transition text-left cursor-pointer ${
                  isSelected ? 'bg-primary-50/70 border-l-4 border-primary-600 pl-3' : 'hover:bg-slate-50'
                }`}
              >
                <Avatar
                  src={friend.avatar}
                  name={friend.full_name}
                  size="md"
                  online={friend.isOnline}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <p
                      className={`text-sm truncate ${
                        hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                      }`}
                    >
                      {friend.full_name}
                    </p>
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      hasUnread ? 'font-bold text-primary-700' : 'text-slate-500'
                    }`}
                  >
                    {previewWithAge}
                  </p>
                </div>
                {hasUnread && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-600 shrink-0" />
                )}
              </button>
            )
          })}
      </div>
    </aside>
  )
}

export default ChatSidebar
