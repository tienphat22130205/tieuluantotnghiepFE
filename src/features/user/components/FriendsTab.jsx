import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '@/utils/mediaUrl'

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
      <div className="mb-6">
        <h3 className="font-bold text-xl text-gray-900">
          Bạn bè
        </h3>
        <p className="text-gray-500 text-sm mt-0.5">
          {friendCount} người bạn
        </p>
      </div>

      {/* Friends Grid - Facebook style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {normalizedFriends.map((friend) => {
          const avatarUrl = resolveMediaUrl(friend.avatar)
          const displayName = friend.full_name || friend.fullName || friend.username

          return (
            <Link
              key={friend._id || friend.id}
              to={`/profile/${friend._id || friend.id}`}
              className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:border-primary-100 hover:shadow-sm hover:bg-slate-50/30 transition duration-200 group"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-slate-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xl">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-primary-600 transition truncate">
                  {displayName}
                </p>
                {friend.username && (
                  <p className="text-xs text-gray-500 truncate">
                    @{friend.username}
                  </p>
                )}
                {friend.mutualFriends > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {friend.mutualFriends} bạn chung
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {normalizedFriends.length === 0 && (
        <p className="text-center text-gray-500 py-8">Chưa có bạn bè nào</p>
      )}
    </div>
  )
}

export default FriendsTab
