import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * FriendsCard – Sidebar card hiển thị danh sách bạn bè.
 * Giao diện Facebook-style: Avatar lớn, tên bên dưới, số bạn chung.
 * Props: friendCount (number), friends (array), onSeeAll (function)
 */
const FriendsCard = ({ friendCount = 0, friends = [], onSeeAll }) => {
  const previewFriends = friends
    .filter((friend) => friend && typeof friend === 'object')
    .slice(0, 6)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">
          Bạn bè
          <span className="text-gray-500 font-normal text-sm ml-1">
            ({friendCount})
          </span>
        </h3>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-sm text-primary-600 hover:underline"
          >
            Xem tất cả
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {previewFriends.map((friend) => {
          const avatarUrl = resolveMediaUrl(friend.avatar)
          const displayName = friend.full_name || friend.fullName || friend.username

          return (
            <Link
              key={friend._id || friend.id}
              to={`/profile/${friend._id || friend.id}`}
              className="group cursor-pointer block"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-slate-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-900 mt-1.5 truncate group-hover:text-primary-600 transition">
                {displayName}
              </p>
            {friend.mutualFriends > 0 && (
              <p className="text-[11px] text-gray-500">
                {friend.mutualFriends} bạn chung
              </p>
            )}
          </Link>
          )
        })}
      </div>
      {previewFriends.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-6">Chưa có bạn bè</p>
      )}
    </div>
  )
}

export default FriendsCard
