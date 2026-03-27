import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { deletePost, toggleLike } from '../store/postSlice'
import postService from '../services/postService'
import { mockComments, mockToken } from '@/utils/mockData'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import PostCardHeader from './PostCardHeader'
import PostCardActions from './PostCardActions'
import PostCardBody from './PostCardBody'
import CommentSection from './CommentSection'
import ImageLightbox from './ImageLightbox'
import { ConfirmModal } from '@/components/ui'

/**
 * PostCard Component – Card hiển thị 1 bài viết trên Newsfeed.
 * Props: post (Object)
 */
const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : [])
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  const currentUserId = user?._id || user?.id
  const isLiked = post.isLiked ?? (post.likes?.includes(currentUserId) || false)
  const isDemoMode = token === mockToken
  const postAuthorId = post?.user?._id || post?.user?.id
  const canManage = Boolean(currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId))

  useEffect(() => {
    if (Array.isArray(post.comments)) {
      setComments(post.comments)
    }
  }, [post.comments])
  const postImages = [
    ...(Array.isArray(post.images) ? post.images : []),
    ...(post.image_url ? [post.image_url] : []),
  ]
    .map((image) => resolveMediaUrl(image))
    .filter(Boolean)
  const uniquePostImages = [...new Set(postImages)]

  const handleLike = () => dispatch(toggleLike({ postId: post._id, isLiked, currentUserId }))
  const handleSave = () => setSaved(!saved)
  const handleEditPost = () => navigate(`/post/${post._id}/edit`)

  const handleImageClick = (index, e) => {
    e.preventDefault()
    e.stopPropagation()
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

  const handleDeletePost = () => {
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    setIsConfirmDeleteOpen(false)
    try {
      await dispatch(deletePost(post._id)).unwrap()
      toast.success('Xóa bài viết thành công!')
    } catch (_err) {
      toast.error('Xóa bài viết thất bại!')
    }
  }

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false)
  }

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      if (isDemoMode) {
        const mock = mockComments[post._id] || []
        setComments(mock)
        setCommentsCount((prev) => Math.max(prev, mock.length))
      } else {
        let list = []
        try {
          if (Array.isArray(post.comments) && post.comments.length > 0) {
            list = post.comments
          } else {
            list = await postService.getComments(post._id)
          }
        } catch (getErr) {
          console.warn('Cannot fetch comments via GET, using post.comments fallback:', getErr)
          list = Array.isArray(post.comments) ? post.comments : []
        }
        
        setComments(list)
        setCommentsCount((prev) => Math.max(prev, list.length || post.comments_count || 0))
      }
    } catch (err) {
      console.error('Load comments failed:', err)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleToggleComments = async () => {
    const next = !showComments
    setShowComments(next)
    if (next && comments.length === 0) {
      await loadComments()
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content) return

    setIsCommenting(true)
    try {
      if (isDemoMode) {
        const optimistic = {
          _id: `demo-cmt-${Date.now()}`,
          user,
          content,
          created_at: new Date().toISOString(),
        }
        setComments((prev) => [...prev, optimistic])
      } else {
        const result = await postService.addComment(post._id, content)
        const incomingComment = result?.comment || null
        if (incomingComment) {
          setComments((prev) => [...prev, incomingComment])
        }
        if (typeof result?.commentCount === 'number') {
          setCommentsCount(result.commentCount)
        } else {
          setCommentsCount((prev) => prev + 1)
        }
      }
      setNewComment('')
    } catch (err) {
      console.error('Add comment failed:', err)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!commentId || isDemoMode) return

    setDeletingCommentId(commentId)
    try {
      const result = await postService.deleteComment(post._id, commentId)
      setComments((prev) => prev.filter((comment) => comment?._id !== commentId))
      if (typeof result?.commentCount === 'number') {
        setCommentsCount(result.commentCount)
      } else {
        setCommentsCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Delete comment failed:', err)
      toast.error('Xoa binh luan that bai!')
    } finally {
      setDeletingCommentId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <PostCardHeader
        user={post.user}
        createdAt={post.created_at}
        visibility={post.visibility}
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
        onCommentClick={handleToggleComments}
      />

      {showComments && (
        isLoadingComments ? (
          <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Đang tải bình luận...
          </div>
        ) : (
          <CommentSection
            comments={comments}
            commentsCount={commentsCount}
            newComment={newComment}
            isCommenting={isCommenting}
            currentUserId={currentUserId}
            currentUser={user}
            deletingCommentId={deletingCommentId}
            onCommentChange={setNewComment}
            onSubmitComment={handleSubmitComment}
            onDeleteComment={handleDeleteComment}
          />
        )
      )}

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
    </div>
  )
}

export default PostCard
