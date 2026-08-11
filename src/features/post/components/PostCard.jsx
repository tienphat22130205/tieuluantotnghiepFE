import { memo, useState, useMemo } from 'react'
import usePostCardController from '../hooks/post-card/usePostCardController'
import PostCardHeader from './PostCardHeader'
import PostCardActions from './PostCardActions'
import PostCardBody from './PostCardBody'
import ImageLightbox from './ImageLightbox'
import PostDetailModal from './PostDetailModal'
import SharePostModal from './SharePostModal'
import { ConfirmModal } from '@/components/ui'

/**
 * PostCard Component – Card hiển thị 1 bài viết trên Newsfeed.
 * Props: post (Object)
 */
const PostCard = ({ post }) => {
  const {
    user,
    currentUserId,
    canManage,
    isLiked,
    saved,
    comments,
    commentsCount,
    newComment,
    isCommenting,
    deletingCommentId,
    lightboxOpen,
    lightboxIndex,
    isConfirmDeleteOpen,
    isDetailModalOpen,
    isShareModalOpen,
    isSharing,
    uniquePostImages,
    handleLike,
    handleSave,
    handleEditPost,
    handleImageClick,
    handleLightboxClose,
    handleLightboxPrev,
    handleLightboxNext,
    handleDeletePost,
    confirmDelete,
    cancelDelete,
    openPostDetail,
    closePostDetail,
    openShareModal,
    closeShareModal,
    handleSharePost,
    setNewComment,
    handleSubmitComment,
    handleDeleteComment,
    replyToComment,
    setReplyToComment,
  } = usePostCardController(post)

  const [imgAspect, setImgAspect] = useState('standard') // 'landscape' | 'portrait' | 'standard'

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight
      if (ratio > 1.25) {
        setImgAspect('landscape')
      } else if (ratio < 0.85) {
        setImgAspect('portrait')
      } else {
        setImgAspect('standard')
      }
    }
  }

  // Dynamic notch path based on orientation
  const notchPathD = useMemo(() => {
    if (imgAspect === 'landscape') {
      // Shorter height -> notch Y at 0.82
      return 'M 0.08,0 H 0.92 A 0.08,0.08 0 0 1 1,0.08 V 0.92 A 0.08,0.08 0 0 1 0.92,1 H 0.44 A 0.04,0.04 0 0 1 0.39,0.95 L 0.39,0.88 A 0.04,0.04 0 0 0 0.34,0.82 H 0.08 A 0.08,0.08 0 0 1 0,0.76 V 0.08 A 0.08,0.08 0 0 1 0.08,0 Z'
    }
    if (imgAspect === 'portrait') {
      // Taller height -> notch Y at 0.91
      return 'M 0.08,0 H 0.92 A 0.08,0.08 0 0 1 1,0.08 V 0.92 A 0.08,0.08 0 0 1 0.92,1 H 0.40 A 0.04,0.04 0 0 1 0.36,0.97 L 0.36,0.94 A 0.04,0.04 0 0 0 0.32,0.91 H 0.08 A 0.08,0.08 0 0 1 0,0.85 V 0.08 A 0.08,0.08 0 0 1 0.08,0 Z'
    }
    // Standard / Square -> notch Y at 0.87
    return 'M 0.08,0 H 0.92 A 0.08,0.08 0 0 1 1,0.08 V 0.92 A 0.08,0.08 0 0 1 0.92,1 H 0.40 A 0.04,0.04 0 0 1 0.36,0.96 L 0.36,0.92 A 0.04,0.04 0 0 0 0.32,0.88 H 0.08 A 0.08,0.08 0 0 1 0,0.82 V 0.08 A 0.08,0.08 0 0 1 0.08,0 Z'
  }, [imgAspect])

  const hasImages = uniquePostImages.length > 0

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-slate-100/80 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] mb-6 md:mb-8 transition-all">
        {/* MEDIA SECTION with Overlaid Header and Bottom-Left Action Pocket */}
        {hasImages ? (
          <>
            <div className="relative rounded-t-[28px] overflow-hidden bg-slate-950">
              {/* Header overlaid on top of media */}
              <div className="absolute top-0 left-0 right-0 z-20">
                <PostCardHeader
                  user={post.user || post.author}
                  createdAt={post.createdAt || post.created_at}
                  visibility={post.visibility}
                  location={post.location || post.locationData || post.locationContext || null}
                  canManage={canManage}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  group={post.group}
                  isOverlay={true}
                />
              </div>

              {/* Images Grid with Natural Aspect Ratio */}
              <div className={`grid gap-1 ${uniquePostImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {uniquePostImages.map((imageUrl, index) => (
                  <img
                    key={`${post._id}-${index}`}
                    src={imageUrl}
                    alt={`Post ${index + 1}`}
                    onClick={(e) => handleImageClick(index, e)}
                    className={`w-full object-cover cursor-pointer transition-opacity hover:opacity-90 ${
                      uniquePostImages.length === 1
                        ? 'max-h-[560px] min-h-[220px]'
                        : uniquePostImages.length === 3 && index === 0
                          ? 'col-span-2 max-h-[420px]'
                          : 'max-h-[280px]'
                    }`}
                    loading="lazy"
                  />
                ))}
              </div>

              {/* Bottom-Left White Action Pocket with Smooth Inverted Concave Curves */}
              <div className="absolute -bottom-1 -left-1 bg-white rounded-tr-[24px] pt-1.5 pr-3.5 pb-1.5 pl-3.5 z-20 flex items-center border-0 outline-none ring-0 shadow-none">
                {/* Inverted Concave Curve Top-Left */}
                <svg className="absolute -top-4 left-1 w-4 h-4 text-white fill-current pointer-events-none" viewBox="0 0 16 16">
                  <path d="M 0,0 A 16,16 0 0 0 16,16 H 0 Z" />
                </svg>

                {/* Inverted Concave Curve Bottom-Right */}
                <svg className="absolute bottom-1 -right-4 w-4 h-4 text-white fill-current pointer-events-none" viewBox="0 0 16 16">
                  <path d="M 0,0 A 16,16 0 0 0 16,16 H 0 Z" />
                </svg>

                <PostCardActions
                  post={post}
                  likesCount={post.likeCount ?? post.likes?.length ?? 0}
                  commentsCount={commentsCount}
                  isLiked={isLiked}
                  saved={saved}
                  onLike={handleLike}
                  onSave={handleSave}
                  onCommentClick={openPostDetail}
                  onShareClick={openShareModal}
                  isOverlay={false}
                />
              </div>

              {/* Real Likers Overlay inside bottom-right corner of media image */}
              {(post.likeCount > 0 || post.likes?.length > 0) && (
                <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 text-white drop-shadow-md">
                  {Array.isArray(post.likes) && post.likes.filter((u) => u && typeof u === 'object' && u.avatar).length > 0 && (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {post.likes
                        .filter((u) => u && typeof u === 'object' && u.avatar)
                        .slice(0, 3)
                        .map((u, i) => (
                          <img
                            key={i}
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white/80 object-cover"
                            src={u.avatar}
                            alt="Liker"
                          />
                        ))}
                    </div>
                  )}
                  <span className="text-[11px] font-bold tracking-tight">
                    {post.likeCount ?? post.likes?.length} Liked
                  </span>
                </div>
              )}
            </div>

            {/* Post Caption Body (Below Media Image) */}
            <PostCardBody post={post} />
          </>
        ) : (
          /* Text-only Posts: Header -> Caption Body ABOVE Action buttons -> Actions */
          <>
            <PostCardHeader
              user={post.user || post.author}
              createdAt={post.createdAt || post.created_at}
              visibility={post.visibility}
              location={post.location || post.locationData || post.locationContext || null}
              canManage={canManage}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              group={post.group}
              isOverlay={false}
            />
            {/* Caption Body ABOVE Action buttons */}
            <PostCardBody post={post} />

            {/* Action buttons BELOW Caption */}
            <PostCardActions
              post={post}
              likesCount={post.likeCount ?? post.likes?.length ?? 0}
              commentsCount={commentsCount}
              isLiked={isLiked}
              saved={saved}
              onLike={handleLike}
              onSave={handleSave}
              onCommentClick={openPostDetail}
              onShareClick={openShareModal}
              isOverlay={false}
            />
          </>
        )}
      </article>

      <SharePostModal
        isOpen={isShareModalOpen}
        post={post}
        isSharing={isSharing}
        onClose={closeShareModal}
        onSubmit={handleSharePost}
      />

      <PostDetailModal
        isOpen={isDetailModalOpen}
        post={post}
        isLiked={isLiked}
        onLike={handleLike}
        comments={comments}
        commentsCount={commentsCount}
        newComment={newComment}
        isCommenting={isCommenting}
        deletingCommentId={deletingCommentId}
        currentUser={user}
        currentUserId={currentUserId}
        onClose={closePostDetail}
        onCommentChange={setNewComment}
        onSubmitComment={handleSubmitComment}
        onDeleteComment={handleDeleteComment}
        replyToComment={replyToComment}
        onSetReplyToComment={setReplyToComment}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={uniquePostImages}
        currentIndex={lightboxIndex}
        onClose={handleLightboxClose}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  )
}

export default memo(PostCard, (prevProps, nextProps) => {
  const p = prevProps.post
  const n = nextProps.post
  if (!p || !n) return false
  return (
    p._id === n._id &&
    p.content === n.content &&
    p.updatedAt === n.updatedAt &&
    (p.likeCount ?? p.likes?.length ?? 0) === (n.likeCount ?? n.likes?.length ?? 0) &&
    (p.commentCount ?? p.comments?.length ?? 0) === (n.commentCount ?? n.comments?.length ?? 0) &&
    p.visibility === n.visibility &&
    p.images?.length === n.images?.length
  )
})
