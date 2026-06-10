import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import postService from '@/features/post/services/postService'
import ImageLightbox from './ImageLightbox'

const extractPostPayload = (payload) => {
  if (!payload) return null
  return payload?.post || payload?.data?.post || payload?.data || payload
}

/**
 * PostContent – Phần nội dung bài viết (header, ảnh, like, caption, hashtags).
 * Props: post, isLiked, onLike
 */
const PostContent = ({ post, isLiked, onLike, inDetailModal = false }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [resolvedSharedPost, setResolvedSharedPost] = useState(
    post?.sharedPost && typeof post.sharedPost === 'object' ? post.sharedPost : null
  )

  const postUser = post?.user || post?.author || {}
  const postUserId = postUser.id || postUser._id || postUser.user_id
  const profilePath = postUserId ? `/profile/${postUserId}` : '#'
  const displayName =
    postUser.full_name ||
    postUser.fullName ||
    postUser.username ||
    `${postUser.first_name || postUser.firstName || ''} ${postUser.last_name || postUser.lastName || ''}`.trim() ||
    'Người dùng'
  const visibilityLabel = {
    public: 'Công khai',
    friends: 'Bạn bè',
    me: 'Chỉ mình tôi',
  }[post?.visibility] || 'Công khai'
  const postImages = [
    ...(Array.isArray(post.images) ? post.images : []),
    ...(post.image_url ? [post.image_url] : []),
  ]
    .map((image) => resolveMediaUrl(image))
    .filter(Boolean)
  const uniquePostImages = [...new Set(postImages)]
  const sharedPostRefId =
    (post?.sharedPost && typeof post.sharedPost === 'object'
      ? post.sharedPost?._id || post.sharedPost?.id
      : post?.sharedPost) ||
    post?.sharedPostId ||
    null

  useEffect(() => {
    let isMounted = true

    if (post?.sharedPost && typeof post.sharedPost === 'object') {
      setResolvedSharedPost(post.sharedPost)
      return () => {
        isMounted = false
      }
    }

    if (!sharedPostRefId) {
      setResolvedSharedPost(null)
      return () => {
        isMounted = false
      }
    }

    const loadSharedPost = async () => {
      try {
        const response = await postService.getById(sharedPostRefId)
        const payload = extractPostPayload(response)
        if (isMounted) {
          setResolvedSharedPost(payload)
        }
      } catch (_error) {
        if (isMounted) {
          setResolvedSharedPost(null)
        }
      }
    }

    loadSharedPost()

    return () => {
      isMounted = false
    }
  }, [post?.sharedPost, post?.sharedPostId, sharedPostRefId])

  const sharedPostPreview = useMemo(() => {
    const source =
      post?.sharedPost && typeof post.sharedPost === 'object'
        ? post.sharedPost
        : resolvedSharedPost

    if (!source) {
      return {
        id: sharedPostRefId,
        userName: 'Người dùng',
        caption: '',
        image: null,
      }
    }

    const sharedUser = source?.user || source?.author || {}
    return {
      id: source?._id || source?.id || sharedPostRefId,
      userName: sharedUser.username || sharedUser.full_name || sharedUser.fullName || 'Người dùng',
      caption: source?.caption || source?.content || '',
      image: resolveMediaUrl(
        source?.image_url || (Array.isArray(source?.images) ? source.images[0] : null)
      ),
    }
  }, [post?.sharedPost, resolvedSharedPost, sharedPostRefId])

  const hasSharedPreview = Boolean(sharedPostRefId || sharedPostPreview.caption || sharedPostPreview.image)
  const sharedPostPath = sharedPostPreview.id ? `/post/${sharedPostPreview.id}` : null

  // Lightbox handlers
  const handleImageClick = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleLightboxClose = () => {
    setLightboxOpen(false)
  }

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? uniquePostImages.length - 1 : prev - 1))
  }

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === uniquePostImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Avatar
          src={postUser.avatar}
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
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)} | {visibilityLabel}</p>
        </div>
      </div>

      {/* Ảnh */}
      {uniquePostImages.length > 0 && (
        <div className={inDetailModal ? 'mx-4 mb-2 overflow-hidden rounded-2xl border border-slate-100' : ''}>
          <div className={`grid gap-1 ${uniquePostImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {uniquePostImages.map((imageUrl, index) => (
              <img
                key={`${post._id || 'post'}-${index}`}
                src={imageUrl}
                alt={`Post ${index + 1}`}
                onClick={() => handleImageClick(index)}
                className={`w-full object-cover cursor-pointer transition-opacity hover:opacity-80 ${
                  uniquePostImages.length === 1
                    ? inDetailModal
                      ? 'max-h-[70vh]'
                      : 'max-h-[600px]'
                    : uniquePostImages.length === 3 && index === 0
                      ? 'col-span-2 max-h-[420px]'
                      : 'max-h-[280px]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Caption & Like */}
      <div className="px-5 py-4 mt-4">
        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-800 leading-relaxed my-2">{post.caption}</p>
        )}

        {hasSharedPreview && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500">Bài viết được chia sẻ</div>

            {sharedPostPath ? (
              <Link to={sharedPostPath} className="block border-t border-slate-200 px-3 py-2.5 hover:bg-slate-100/70">
                <p className="text-xs font-bold text-slate-700">@{sharedPostPreview.userName}</p>
                {sharedPostPreview.caption ? (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-700">{sharedPostPreview.caption}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Bài viết gốc không có nội dung văn bản.</p>
                )}

                {sharedPostPreview.image && (
                  <img
                    src={sharedPostPreview.image}
                    alt="Shared post"
                    className="mt-2 max-h-72 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                )}
              </Link>
            ) : (
              <div className="border-t border-slate-200 px-3 py-2.5">
                <p className="text-xs font-bold text-slate-700">@{sharedPostPreview.userName}</p>
                <p className="mt-1 text-sm text-slate-500">Không tìm thấy dữ liệu chi tiết bài viết gốc.</p>
              </div>
            )}
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
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

        {/* Nút like */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 transition ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            {isLiked ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
            <span className="text-sm font-medium">{post.likeCount ?? post.likes?.length ?? 0} lượt thích</span>
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={uniquePostImages}
        currentIndex={lightboxIndex}
        onClose={handleLightboxClose}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
      />
    </>
  )
}

export default PostContent
