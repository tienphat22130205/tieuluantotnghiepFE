import { Link } from 'react-router-dom'
import { AiOutlineTeam } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * FriendsCard – Sidebar card hiển thị danh sách bạn bè xem nhanh.
 */
const FriendsCard = ({ friendCount = 0, friends = [], onSeeAll }) => {
  const previewFriends = (friends || [])
    .filter((friend) => friend && typeof friend === 'object')
    .slice(0, 6)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-5 transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <AiOutlineTeam size={18} className="text-blue-500" />
          Bạn bè
          <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">
            ({friendCount})
          </span>
        </h3>
        {onSeeAll && friendCount > 0 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Xem tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {previewFriends.map((friend) => {
          const avatarUrl = resolveMediaUrl(friend.avatar)
          const displayName = friend.full_name || friend.fullName || friend.username || 'Người dùng'

          const friendIdentifier = friend.username ? String(friend.username).replace(/^@/, '') : (friend._id || friend.id)

          return (
            <Link
              key={friend._id || friend.id}
              to={`/profile/${friendIdentifier}`}
              className="group cursor-pointer block text-center"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 shadow-xs group-hover:shadow-md transition duration-200">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-indigo-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1.5 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {displayName}
              </p>
            </Link>
          )
        })}
      </div>

      {previewFriends.length === 0 && (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
          Chưa có bạn bè nào
        </div>
      )}
    </div>
  )
}

export default FriendsCard
