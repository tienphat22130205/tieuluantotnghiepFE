import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'

const ChatFriendsListPanel = ({
  isOpen,
  selectedConversation,
  isLoading,
  sortedFriends,
  searchKeyword,
  onChangeSearch,
  onClose,
  onSelectFriend,
}) => {
  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-white transition-transform duration-300 ease-out md:inset-y-0 md:left-auto md:right-0 md:h-screen md:w-[360px] md:border-l md:border-gray-200 md:shadow-2xl ${
        isOpen && !selectedConversation ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Đoạn chat</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <AiOutlineClose size={16} />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
          <AiOutlineSearch size={16} className="text-gray-400" />
          <input
            value={searchKeyword}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Tìm bạn bè..."
            className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-1">
        {isLoading && (
          <div className="px-4 py-6 text-sm text-gray-500">Đang tải danh sách bạn bè...</div>
        )}

        {!isLoading && sortedFriends.length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-500">
            {searchKeyword.trim() ? 'Không tìm thấy bạn bè phù hợp.' : 'Bạn chưa có bạn bè nào để hiển thị.'}
          </div>
        )}

        {!isLoading && sortedFriends.map((friend) => (
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
              <p className="text-base font-medium text-gray-900 truncate">{friend.full_name}</p>
              <p className="text-sm text-gray-500 truncate">@{friend.username || friend._id}</p>
            </div>
            <span
              className={`text-[11px] font-medium whitespace-nowrap ${
                friend.isOnline ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              {friend.isOnline ? 'Đang hoạt động' : formatLastSeenText(friend.lastSeen)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatFriendsListPanel
