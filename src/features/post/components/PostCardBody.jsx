import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { timeAgo } from '@/utils/formatDate'

/**
 * PostCardBody – Caption, hashtags, AI badge bài viết.
 * Props: post
 */
const PostCardBody = ({ post }) => {
  const author = post?.user || post?.author || {}
  const postUserIdentifier = author.username ? String(author.username).replace(/^@/, '') : (author.id || author._id)
  const profilePath = postUserIdentifier ? `/profile/${postUserIdentifier}` : '#'
  const content = post?.caption || post?.content || ''
  const createdAt = post?.createdAt || post?.created_at
  const handleName = author.username ? `@${author.username}` : (author.full_name || 'Người dùng')

  const sharedPostId = post?.sharedPost?._id || post?.sharedPost?.id || null
  const sharedPostPath = sharedPostId ? `/post/${sharedPostId}` : null
  const sharedPostUserName = post?.sharedPost?.user?.username || post?.sharedPost?.user?.full_name || 'Người dùng'
  const sharedPostCaption = post?.sharedPost?.caption || post?.sharedPost?.content || ''
  const sharedPostImage = resolveMediaUrl(
    post?.sharedPost?.image_url || (Array.isArray(post?.sharedPost?.images) ? post.sharedPost.images[0] : null)
  )
  const hasSharedPreview = Boolean(sharedPostId || sharedPostCaption || sharedPostImage)

  return (
    <div className="px-4 pt-1.5 pb-4 space-y-1">
      {/* Timestamp */}
      {createdAt && (
        <p className="text-xs font-semibold text-slate-400">
          {timeAgo(createdAt)}
        </p>
      )}

      {/* Caption Content */}
      {content && (
        <p className="text-sm text-slate-900 leading-relaxed font-normal">
          <Link
            to={profilePath}
            className="font-bold mr-1 text-slate-900 hover:text-primary-600"
          >
            {handleName}
          </Link>
          {content}
        </p>
      )}

      {hasSharedPreview && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500">Bài viết được chia sẻ</div>

          {sharedPostPath ? (
            <Link to={sharedPostPath} className="block border-t border-slate-200 px-3 py-2.5 hover:bg-slate-100/70">
              <p className="text-xs font-bold text-slate-700">@{sharedPostUserName}</p>
              {sharedPostCaption ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate-700">{sharedPostCaption}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Bài viết gốc không có nội dung văn bản.</p>
              )}

              {sharedPostImage && (
                <img
                  src={sharedPostImage}
                  alt="Shared post"
                  className="mt-2 max-h-52 w-full rounded-lg object-cover"
                  loading="lazy"
                />
              )}
            </Link>
          ) : (
            <div className="border-t border-slate-200 px-3 py-2.5">
              <p className="text-xs font-bold text-slate-700">@{sharedPostUserName}</p>
              {sharedPostCaption ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate-700">{sharedPostCaption}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Không tìm thấy dữ liệu chi tiết bài viết gốc.</p>
              )}
            </div>
          )}
        </div>
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
