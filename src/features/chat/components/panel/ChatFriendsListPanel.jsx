import { AiOutlineSearch, AiOutlineClose, AiOutlineExpand } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'

const formatMessageAge = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes} phút`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày`
}

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

  const handleExpand = () => {
    onClose?.()
    navigate('/chat')
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-white transition-transform duration-300 ease-out md:inset-y-0 md:left-auto md:right-0 md:h-screen md:w-[360px] md:border-l md:border-gray-200 md:shadow-2xl ${
        isOpen && !selectedConversation ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Đoạn chat</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleExpand}
            title="Mở rộng trang chat"
            className="hidden md:inline-flex p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <AiOutlineExpand size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <AiOutlineClose size={16} />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
          <AiOutlineSearch size={16} className="text-gray-400" />
          <input
            value={searchKeyword}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Horizontal Friends List */}
      {!isLoading && unfilteredSortedFriends.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-4 overflow-x-auto border-b border-gray-100 bg-white shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                key={`h-panel-${friend._id}`}
                type="button"
                onClick={() => onSelectFriend(friend._id)}
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

      <div className="flex-1 min-h-0 overflow-y-auto py-1">
        {isLoading && (
          <div className="px-4 py-6 text-sm text-gray-500">Đang tải danh sách bạn bè...</div>
        )}

        {!isLoading && sortedFriends.length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-500">
            {searchKeyword.trim() ? 'Không tìm thấy bạn bè phù hợp.' : 'Bạn chưa có bạn bè nào để hiển thị.'}
          </div>
        )}

        {!isLoading && sortedFriends.map((friend) => {
          const unreadCount = Number(friend.newMessagesCount || 0)
          const hasUnread = unreadCount > 0
          const previewText = hasUnread
            ? `${unreadCount} tin nhắn`
            : friend.lastMessagePreview
              ? friend.lastMessagePreview
              : 'Chưa có tin nhắn'
          const messageAge = formatMessageAge(friend.lastMessageAt)
          const previewWithAge = messageAge ? `${previewText} · ${messageAge}` : previewText

          return (
            <button
              key={friend._id}
              type="button"
              onClick={() => onSelectFriend(friend._id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left"
            >
              <Avatar
                src={friend.avatar}
                name={friend.full_name}
                size="md"
                online={friend.isOnline}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-base truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-gray-900'}`}>
                  {friend.full_name}
                </p>
                <p className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-800' : 'text-gray-500'}`}>
                  {previewWithAge}
                </p>
              </div>
              {hasUnread && (
                <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
              )}
              {!hasUnread && (
                <span
                  className={`text-[11px] font-medium whitespace-nowrap ${
                    friend.isOnline ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {friend.isOnline ? 'Đang hoạt động' : formatLastSeenText(friend.lastSeen)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ChatFriendsListPanel
