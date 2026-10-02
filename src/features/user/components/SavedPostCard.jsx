import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { BsBookmarkFill, BsChatDots, BsImages } from 'react-icons/bs'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { HiChevronRight } from 'react-icons/hi'
import { BiSolidQuoteAltLeft } from 'react-icons/bi'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'
import PostDetailModal from '@/features/post/components/PostDetailModal'
import usePostCardController from '@/features/post/hooks/post-card/usePostCardController'

/**
 * SavedPostCard – Thẻ bài viết đã lưu nhỏ gọn, tinh tế.
 * Không bị quá to/cồng kềnh như PostCard trên Newsfeed.
 */
const SavedPostCard = memo(({ post, viewMode = 'grid' }) => {
  const {
    user,
    currentUserId,
    isLiked,
    comments,
    commentsCount,
    newComment,
    isCommenting,
    deletingCommentId,
    isDetailModalOpen,
    uniquePostImages,
    handleLike,
    handleSave,
    openPostDetail,
    closePostDetail,
    setNewComment,
    handleSubmitComment,
    handleDeleteComment,
    replyToComment,
    setReplyToComment,
  } = usePostCardController(post)

  const author = post.user || post.author || {}
  const authorIdentifier = author.username ? String(author.username).replace(/^@/, '') : (author._id || author.id)
  const profilePath = authorIdentifier ? `/profile/${authorIdentifier}` : '#'
  const displayName =
    author.full_name ||
    author.fullName ||
    `${author.firstName || ''} ${author.lastName || ''}`.trim() ||
    author.name ||
    author.username ||
    'Người dùng'

  const contentText = post.content || post.text || post.caption || ''
  const hasImages = uniquePostImages && uniquePostImages.length > 0
  const thumbnail = hasImages ? uniquePostImages[0] : null
  const likesCount = post.likeCount ?? post.likes?.length ?? 0
  const postTime = post.createdAt || post.created_at

  const handleCardClick = () => {
    openPostDetail()
  }

  const handleUnsaveClick = (e) => {
    e.stopPropagation()
    handleSave()
  }

  /* ---------------- LIST VIEW (HÀNG NGANG NHỎ GỌN) ---------------- */
  if (viewMode === 'list') {
    return (
      <>
        <Motion.article
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          onClick={handleCardClick}
          className="group relative flex flex-col sm:flex-row items-stretch rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
        >
          {/* Thumbnail bên trái */}
          <div className="w-full sm:w-44 md:w-52 h-36 sm:h-auto shrink-0 relative overflow-hidden bg-slate-100 dark:bg-slate-800/80">
            {thumbnail ? (
              <>
                <img
                  src={thumbnail}
                  alt={contentText || 'Ảnh bài viết'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {uniquePostImages.length > 1 && (
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
                    <BsImages size={11} />
                    <span>+{uniquePostImages.length - 1}</span>
                  </span>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 text-center relative overflow-hidden">
                <BiSolidQuoteAltLeft className="text-blue-500/20 dark:text-blue-400/15 text-5xl absolute -bottom-1 -right-1" />
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 italic px-1 font-serif">
                  {contentText ? `"${contentText}"` : 'Bài viết trạng thái'}
                </p>
              </div>
            )}
          </div>

          {/* Nội dung bên phải */}
          <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              {/* Header: Tác giả & nút Bỏ lưu */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={author.avatar || author.profile_pic}
                    name={displayName}
                    size="xs"
                    to={profilePath}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div className="min-w-0">
                    <Link
                      to={profilePath}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                    >
                      {displayName}
                    </Link>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {postTime ? timeAgo(postTime) : 'Gần đây'}
                    </p>
                  </div>
                </div>

                {/* Nút Bỏ lưu */}
                <button
                  type="button"
                  onClick={handleUnsaveClick}
                  title="Bỏ lưu bài viết"
                  className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/60 dark:hover:text-red-400 transition-colors shrink-0 shadow-2xs"
                >
                  <BsBookmarkFill size={15} />
                </button>
              </div>

              {/* Đoạn trích nội dung */}
              {contentText && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed font-normal">
                  {contentText}
                </p>
              )}
            </div>

            {/* Footer: Thống kê & Nút xem */}
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  {isLiked ? (
                    <AiFillHeart size={14} className="text-rose-500" />
                  ) : (
                    <AiOutlineHeart size={14} />
                  )}
                  <span>{likesCount}</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <BsChatDots size={13} />
                  <span>{commentsCount}</span>
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>Xem bài viết</span>
                <HiChevronRight size={14} />
              </span>
            </div>
          </div>
        </Motion.article>

        {/* Modal chi tiết bài viết khi click */}
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
          onCommentChange={(e) => setNewComment(e.target.value)}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
          replyToComment={replyToComment}
          onSetReplyToComment={setReplyToComment}
        />
      </>
    )
  }

  /* ---------------- GRID VIEW (DẠNG LƯỚI GỌN GÀNG - DEFAULT) ---------------- */
  return (
    <>
      <Motion.article
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      >
        {/* Khối Thumbnail / Preview ở trên */}
        <div className="relative w-full h-40 sm:h-44 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          {thumbnail ? (
            <>
              <img
                src={thumbnail}
                alt={contentText || 'Ảnh bài viết'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {uniquePostImages.length > 1 && (
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
                  <BsImages size={11} />
                  <span>+{uniquePostImages.length - 1}</span>
                </span>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 text-center relative overflow-hidden">
              <BiSolidQuoteAltLeft className="text-blue-500/20 dark:text-blue-400/15 text-5xl absolute -bottom-1 -right-1" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-4 italic px-2 font-serif leading-relaxed">
                {contentText ? `"${contentText}"` : 'Bài viết trạng thái'}
              </p>
            </div>
          )}

          {/* Nút Bỏ lưu đặt góc trên bên phải của Thumbnail */}
          <button
            type="button"
            onClick={handleUnsaveClick}
            title="Bỏ lưu bài viết"
            className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-blue-600 dark:text-blue-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/80 dark:hover:text-red-400 shadow-sm backdrop-blur-xs border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            <BsBookmarkFill size={15} />
          </button>
        </div>

        {/* Nội dung bên dưới */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Tác giả */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={author.avatar || author.profile_pic}
                name={displayName}
                size="xs"
                to={profilePath}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={profilePath}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                >
                  {displayName}
                </Link>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {postTime ? timeAgo(postTime) : 'Gần đây'}
                </p>
              </div>
            </div>

            {/* Trích đoạn text (nếu có ảnh thì trích 2 dòng, text post thì trích gọn) */}
            {hasImages && contentText && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed font-normal">
                {contentText}
              </p>
            )}
          </div>

          {/* Footer Card: Thống kê like/cmt và nút mở bài */}
          <div className="pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                {isLiked ? (
                  <AiFillHeart size={14} className="text-rose-500" />
                ) : (
                  <AiOutlineHeart size={14} />
                )}
                <span>{likesCount}</span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <BsChatDots size={13} />
                <span>{commentsCount}</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <span>Xem bài viết</span>
              <HiChevronRight size={14} />
            </span>
          </div>
        </div>
      </Motion.article>

      {/* Modal chi tiết bài viết khi click */}
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
        onCommentChange={(e) => setNewComment(e.target.value)}
        onSubmitComment={handleSubmitComment}
        onDeleteComment={handleDeleteComment}
        replyToComment={replyToComment}
        onSetReplyToComment={setReplyToComment}
      />
    </>
  )
})

SavedPostCard.displayName = 'SavedPostCard'

export default SavedPostCard
