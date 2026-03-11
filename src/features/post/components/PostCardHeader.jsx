import { Link } from 'react-router-dom'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'

/**
 * PostCardHeader – Header bài viết (Avatar, tên, thời gian, menu).
 * Props: user (object), createdAt (string)
 */
const PostCardHeader = ({ user, createdAt }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatar}
          name={user?.full_name}
          size="md"
          to={`/profile/${user?._id}`}
        />
        <div>
          <Link
            to={`/profile/${user?._id}`}
            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm"
          >
            {user?.full_name}
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
