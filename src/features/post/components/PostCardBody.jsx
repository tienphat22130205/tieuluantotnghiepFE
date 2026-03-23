import { Link } from 'react-router-dom'

/**
 * PostCardBody – Caption, hashtags, AI badge bài viết.
 * Props: post
 */
const PostCardBody = ({ post }) => {
  const postUserId = post?.user?.id || post?.user?._id
  const profilePath = postUserId ? `/profile/${postUserId}` : '#'

  return (
    <div className="px-4 pb-3">
      {post.caption && (
        <p className="text-sm text-gray-800 leading-relaxed">
          <Link
            to={profilePath}
            className="font-semibold mr-1.5 hover:text-primary-600"
          >
            {post.user?.username}
          </Link>
          {post.caption}
        </p>
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

      {/* AI badge */}
      {post.is_ai_generated && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
          <span>✨</span>
          <span>AI Generated</span>
        </div>
      )}
    </div>
  )
}

export default PostCardBody
