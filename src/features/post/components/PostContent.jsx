import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import ImageLightbox from './ImageLightbox'

/**
 * PostContent – Phần nội dung bài viết (header, ảnh, like, caption, hashtags).
 * Props: post, isLiked, onLike
 */
const PostContent = ({ post, isLiked, onLike }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const postUserId = post?.user?.id || post?.user?._id
  const profilePath = postUserId ? `/profile/${postUserId}` : '#'
  const displayName = post?.user?.full_name || post?.user?.fullName || `${post?.user?.firstName || ''} ${post?.user?.lastName || ''}`.trim() || 'Người dùng'
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
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)} | {visibilityLabel}</p>
        </div>
      </div>

      {/* Ảnh */}
      {uniquePostImages.length > 0 && (
        <div className={`grid gap-1 ${uniquePostImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {uniquePostImages.map((imageUrl, index) => (
            <img
              key={`${post._id || 'post'}-${index}`}
              src={imageUrl}
              alt={`Post ${index + 1}`}
              onClick={() => handleImageClick(index)}
              className={`w-full object-cover cursor-pointer transition-opacity hover:opacity-80 ${
                uniquePostImages.length === 1
                  ? 'max-h-[600px]'
                  : uniquePostImages.length === 3 && index === 0
                    ? 'col-span-2 max-h-[420px]'
                    : 'max-h-[280px]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Caption & Like */}
      <div className="px-5 py-4 mt-4">
        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-800 leading-relaxed my-2">{post.caption}</p>
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
            <span className="text-sm font-medium">{post.likes?.length || 0} lượt thích</span>
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
