import { Link } from 'react-router-dom'
import { mockFriends } from '@/utils/mockData'

/**
 * FriendsCard – Sidebar card hiển thị danh sách bạn bè.
 * Giao diện Facebook-style: Avatar lớn, tên bên dưới, số bạn chung.
 * Props: friendCount (number)
 */
const FriendsCard = ({ friendCount = 0 }) => {
  const friends = mockFriends.slice(0, 6)

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
        {friends.map((friend) => (
          <Link
            key={friend._id}
            to={`/profile/${friend._id}`}
            className="group cursor-pointer"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img
                src={friend.avatar}
                alt={friend.full_name}
                className="w-full h-full object-cover group-hover:opacity-90 transition"
              />
            </div>
            <p className="text-xs font-semibold text-gray-900 mt-1.5 truncate">
              {friend.full_name}
            </p>
            {friend.mutualFriends > 0 && (
              <p className="text-[11px] text-gray-500">
                {friend.mutualFriends} bạn chung
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FriendsCard
