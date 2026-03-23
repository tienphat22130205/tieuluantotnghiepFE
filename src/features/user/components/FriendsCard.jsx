import { Link } from 'react-router-dom'

/**
 * FriendsCard – Sidebar card hiển thị danh sách bạn bè.
 * Giao diện Facebook-style: Avatar lớn, tên bên dưới, số bạn chung.
 * Props: friendCount (number), friends (array)
 */
const FriendsCard = ({ friendCount = 0, friends = [] }) => {
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
        <button className="text-sm text-primary-600 hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {previewFriends.map((friend) => (
          <Link
            key={friend._id || friend.id}
            to={`/profile/${friend._id || friend.id}`}
            className="group cursor-pointer"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={friend.avatar}
                alt={friend.full_name || friend.fullName || friend.username}
                className="w-full h-full object-cover group-hover:opacity-90 transition"
              />
            </div>
            <p className="text-xs font-semibold text-gray-900 mt-1.5 truncate">
              {friend.full_name || friend.fullName || friend.username}
            </p>
            {friend.mutualFriends > 0 && (
              <p className="text-[11px] text-gray-500">
                {friend.mutualFriends} bạn chung
              </p>
            )}
          </Link>
        ))}
      </div>
      {previewFriends.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-6">Chưa có bạn bè</p>
      )}
    </div>
  )
}

export default FriendsCard
