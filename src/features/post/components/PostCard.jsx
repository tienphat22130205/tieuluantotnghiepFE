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

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
        <PostCardHeader
          user={post.user}
          createdAt={post.created_at}
          visibility={post.visibility}
          location={post.location || post.locationData || post.locationContext || null}
          canManage={canManage}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />

        {/* Hình ảnh */}
        {uniquePostImages.length > 0 && (
          <div className={`grid gap-1 ${uniquePostImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {uniquePostImages.map((imageUrl, index) => (
              <img
                key={`${post._id}-${index}`}
                src={imageUrl}
                alt={`Post ${index + 1}`}
                onClick={(e) => handleImageClick(index, e)}
                className={`w-full object-cover cursor-pointer transition-opacity hover:opacity-80 ${
                  uniquePostImages.length === 1
                    ? 'max-h-[500px]'
                    : uniquePostImages.length === 3 && index === 0
                      ? 'col-span-2 max-h-[420px]'
                      : 'max-h-[260px]'
                }`}
                loading="lazy"
              />
            ))}
          </div>
        )}

        <PostCardBody post={post} />

        <PostCardActions
          likesCount={post.likeCount ?? post.likes?.length ?? 0}
          commentsCount={commentsCount}
          isLiked={isLiked}
          saved={saved}
          onLike={handleLike}
          onSave={handleSave}
          onCommentClick={openPostDetail}
          onShareClick={openShareModal}
        />
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

export default PostCard
