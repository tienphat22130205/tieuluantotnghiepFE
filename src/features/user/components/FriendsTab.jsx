import { Link } from 'react-router-dom'
import { AiOutlineSearch } from 'react-icons/ai'

/**
 * FriendsTab – Nội dung tab "Bạn bè" (full page version).
 * Giao diện Facebook-style: Avatar lớn, tên, số bạn chung.
 * Props: friendCount (number), friends (array)
 */
const FriendsTab = ({ friendCount = 0, friends = [] }) => {
  const normalizedFriends = friends.filter((friend) => friend && typeof friend === 'object')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-gray-900">
          Bạn bè
          <span className="text-gray-500 font-normal text-sm ml-2">
            {friendCount} người bạn
          </span>
        </h3>
        <div className="relative">
          <AiOutlineSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè"
            className="pl-9 pr-4 py-2 text-sm rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border focus:border-primary-300 outline-none transition w-48"
          />
        </div>
      </div>

      {/* Friends Grid - Facebook style */}
      <div className="grid grid-cols-2 gap-3">
        {normalizedFriends.map((friend) => (
          <Link
            key={friend._id || friend.id}
            to={`/profile/${friend._id || friend.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={friend.avatar}
                alt={friend.full_name || friend.fullName || friend.username}
                className="w-full h-full object-cover group-hover:opacity-90 transition"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {friend.full_name || friend.fullName || friend.username}
              </p>
              {friend.mutualFriends > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {friend.mutualFriends} bạn chung
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {normalizedFriends.length === 0 && (
        <p className="text-center text-gray-500 py-8">Chưa có bạn bè nào</p>
      )}
    </div>
  )
}

export default FriendsTab
