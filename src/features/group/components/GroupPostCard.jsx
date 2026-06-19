import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  toggleLikeGroupPost,
  deleteGroupPost,
  togglePinGroupPost,
  addGroupComment,
  deleteGroupComment,
} from '../store/groupSlice'
import { toast } from 'react-toastify'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { Avatar, ConfirmModal } from '@/components/ui'
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineDelete,
  AiOutlinePushpin,
} from 'react-icons/ai'

const GroupPostCard = ({ post, groupId, isAdmin }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  const author = post.author || {}
  const isAuthor = String(author._id || author.id) === String(currentUserId)
  const canDelete = isAuthor || isAdmin

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const handleLike = async () => {
    try {
      await dispatch(
        toggleLikeGroupPost({
          groupId,
          postId: post._id,
          isLiked: post.isLiked,
        })
      ).unwrap()
    } catch (err) {
      toast.error(err?.message || 'Lỗi thích bài viết!')
    }
  }

  const handlePin = async () => {
    try {
      const res = await dispatch(togglePinGroupPost({ groupId, postId: post._id })).unwrap()
      const isPinned = res?.post?.isPinned ?? res?.data?.isPinned ?? !post.isPinned
      toast.success(isPinned ? 'Đã ghim bài viết lên đầu nhóm!' : 'Đã bỏ ghim bài viết!')
    } catch (err) {
      toast.error(err?.message || 'Lỗi ghim bài viết!')
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    setShowDeleteConfirm(false)
    try {
      await dispatch(deleteGroupPost({ groupId, postId: post._id })).unwrap()
      toast.success('Xóa bài viết thành công!')
    } catch (err) {
      toast.error(err?.message || 'Xóa bài viết thất bại!')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || submittingComment) return

    setSubmittingComment(true)
    try {
      await dispatch(
        addGroupComment({
          groupId,
          postId: post._id,
          content: commentText.trim(),
        })
      ).unwrap()
      setCommentText('')
      toast.success('Đã thêm bình luận!')
    } catch (err) {
      toast.error(err?.message || 'Bình luận thất bại!')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return
    try {
      await dispatch(deleteGroupComment({ groupId, postId: post._id, commentId })).unwrap()
      toast.success('Đã xóa bình luận!')
    } catch (err) {
      toast.error(err?.message || 'Xóa bình luận thất bại!')
    }
  }

  return (
    <>
      <article className={`bg-white rounded-2xl border overflow-hidden p-5 shadow-sm space-y-4 transition ${
        post.isPinned ? 'border-primary-300 ring-2 ring-primary-500/10' : 'border-slate-200'
      }`}>
        {/* Pinned notice banner */}
        {post.isPinned && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-primary-600 bg-primary-50/50 rounded-lg px-2.5 py-1 w-max">
            <AiOutlinePushpin size={12} className="rotate-45" />
            <span>Được ghim lên đầu nhóm</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={author.avatar} name={author.full_name} size="md" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {author.full_name || 'Thành viên'}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                type="button"
                onClick={handlePin}
                className={`p-2 rounded-full cursor-pointer hover:bg-slate-100 transition ${
                  post.isPinned ? 'text-primary-600' : 'text-slate-400'
                }`}
                title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
              >
                <AiOutlinePushpin size={18} className={post.isPinned ? 'rotate-0' : 'rotate-45'} />
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                title="Xóa bài viết"
              >
                <AiOutlineDelete size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-800 text-xs font-normal leading-relaxed whitespace-pre-wrap break-all">
          {post.content}
        </div>

        {/* Image Grid */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-1 rounded-xl overflow-hidden ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {post.images.map((imgUrl, index) => (
              <img
                key={index}
                src={resolveMediaUrl(imgUrl)}
                alt={`Post image ${index + 1}`}
                className={`w-full object-cover max-h-[350px] ${
                  post.images.length === 1
                    ? 'w-full max-h-[450px]'
                    : post.images.length === 3 && index === 0
                      ? 'col-span-2 max-h-[300px]'
                      : 'max-h-[220px]'
                }`}
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between border-t border-b border-slate-100 py-2.5 shrink-0">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
              post.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {post.isLiked ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
            <span>{post.likeCount || 0} Thích</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <AiOutlineComment size={18} />
            <span>{post.comments_count || 0} Bình luận</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-2 shrink-0">
            {/* Comments List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {(post.comments || []).map((comment) => {
                const commentUser = comment.user || {}
                const commentAuthorId = commentUser._id || commentUser.id || comment.user
                const isCommentAuthor = String(commentAuthorId) === String(currentUserId)
                const canDeleteComment = isCommentAuthor || isAdmin

                return (
                  <div key={comment._id || comment.id} className="flex gap-2.5 items-start">
                    <Avatar src={commentUser.avatar} name={commentUser.full_name} size="sm" />
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100 relative group/comment">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-800">
                          {commentUser.full_name || 'Thành viên'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1 font-normal break-all">{comment.content}</p>
                      
                      {canDeleteComment && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment._id || comment.id)}
                          className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition opacity-0 group-hover/comment:opacity-100 cursor-pointer"
                        >
                          <AiOutlineDelete size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 transition disabled:opacity-50 cursor-pointer"
              >
                Gửi
              </button>
            </form>
          </div>
        )}
      </article>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}

export default GroupPostCard
