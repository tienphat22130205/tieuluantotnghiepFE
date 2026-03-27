import { useParams, Link } from 'react-router-dom'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { LoadingSpinner } from '@/components/ui'
import PostContent from '../components/PostContent'
import CommentSection from '../components/CommentSection'
import usePostDetailPage from '../hooks/usePostDetailPage'

/**
 * PostDetail Page – Xem chi tiết bài viết + bình luận.
 */
const PostDetailPage = () => {
  const { postId } = useParams()
  const {
    post,
    comments,
    newComment,
    isLoading,
    isCommenting,
    deletingCommentId,
    isLiked,
    user,
    setNewComment,
    handleLike,
    handleSubmitComment,
    handleDeleteComment,
  } = usePostDetailPage(postId)

  if (isLoading) return <LoadingSpinner text="Đang tải bài viết..." />

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Không tìm thấy bài viết.</p>
        <Link to="/" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nút quay lại */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
      >
        <AiOutlineArrowLeft size={16} />
        Quay lại
      </Link>

      {/* Bài viết */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <PostContent post={post} isLiked={isLiked} onLike={handleLike} />
        <CommentSection
          comments={comments}
          commentsCount={post.comments_count}
          newComment={newComment}
          isCommenting={isCommenting}
          currentUserId={user?._id || user?.id}
          currentUser={user}
          deletingCommentId={deletingCommentId}
          onCommentChange={setNewComment}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    </div>
  )
}

export default PostDetailPage
