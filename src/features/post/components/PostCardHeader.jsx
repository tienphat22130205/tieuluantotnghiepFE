import { Link } from 'react-router-dom'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'

/**
 * PostCardHeader – Header bài viết (Avatar, tên, thời gian, menu).
 * Props: user (object), createdAt (string)
 */
const PostCardHeader = ({ user, createdAt }) => {
  const userId = user?.id || user?._id
  const profilePath = userId ? `/profile/${userId}` : '#'
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatar}
          name={displayName}
          size="md"
          to={profilePath}
        />
        <div>
          <Link
            to={profilePath}
            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm"
          >
            {displayName}
          </Link>
          <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
        </div>
      </div>

      {/* Menu 3 chấm */}
      <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
        <HiOutlineDotsHorizontal size={20} />
      </button>
    </div>
  )
}

export default PostCardHeader
