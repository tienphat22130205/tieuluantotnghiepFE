import { Link } from 'react-router-dom'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'

/**
 * PostContent – Phần nội dung bài viết (header, ảnh, like, caption, hashtags).
 * Props: post, isLiked, onLike
 */
const PostContent = ({ post, isLiked, onLike }) => {
  const postUserId = post?.user?.id || post?.user?._id
  const profilePath = postUserId ? `/profile/${postUserId}` : '#'
  const displayName = post?.user?.full_name || post?.user?.fullName || `${post?.user?.firstName || ''} ${post?.user?.lastName || ''}`.trim() || 'Người dùng'

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Avatar
          src={post.user?.avatar}
          name={displayName}
          size="md"
          to={profilePath}
        />
        <div>
          <Link
            to={profilePath}
            className="font-semibold text-gray-900 hover:text-primary-600 text-sm"
          >
            {displayName}
          </Link>
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Ảnh */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full max-h-[600px] object-cover"
        />
      )}

      {/* Caption & Like */}
      <div className="px-5 py-4">
        {/* Nút like */}
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 transition ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            {isLiked ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
            <span className="text-sm font-medium">{post.likes?.length || 0} lượt thích</span>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-800 leading-relaxed">{post.caption}</p>
        )}

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default PostContent
