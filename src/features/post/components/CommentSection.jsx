import { useState } from 'react'
import { Avatar, Button, ConfirmModal } from '@/components/ui'
import { AiOutlineSend } from 'react-icons/ai'
import { timeAgo } from '@/utils/formatDate'

/**
 * CommentSection – Phần bình luận (danh sách + form nhập).
 * Props: comments, commentsCount, newComment, isCommenting,
 *        onCommentChange, onSubmitComment
 */
const CommentSection = ({
  comments,
  commentsCount,
  newComment,
  isCommenting,
  currentUserId,
  currentUser,
  deletingCommentId,
  onCommentChange,
  onSubmitComment,
  onDeleteComment,
}) => {
  const [commentToDelete, setCommentToDelete] = useState(null)

  const getCommentUser = (c) => {
    const raw = c.user || c.author || c.userId
    
    if (raw && typeof raw === 'object') {
      const id = raw._id || raw.id
      const matchesCurrent = currentUserId && String(id) === String(currentUserId)
      
      const name = raw.full_name || raw.fullName || raw.username || raw.name
      if (!name || name === 'user' || name === 'Người dùng') {
         if (matchesCurrent && currentUser) return { 
            id, 
            name: currentUser.full_name || currentUser.fullName || currentUser.username || currentUser.name || 'Người dùng',
            avatar: currentUser.avatar || raw.avatar 
         }
      }
      
      return {
        id,
        name: name || 'Người dùng',
        avatar: raw.avatar || raw.profile_pic
      }
    }
    
    const strId = typeof raw === 'string' ? raw : c.user_id
    if (strId && currentUserId && currentUser && String(strId) === String(currentUserId)) {
      return {
        id: strId,
        name: currentUser.full_name || currentUser.fullName || currentUser.username || currentUser.name || 'Bạn',
        avatar: currentUser.avatar
      }
    }
    
    return {
      id: strId || 'unknown',
      name: 'Người dùng',
      avatar: null
    }
  }

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Bình luận ({commentsCount || comments.length})
      </h3>

      {/* Danh sách comment */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment, i) => {
            const commentUser = getCommentUser(comment)
            return (
              <div key={comment._id || i} className="flex gap-3">
                <Avatar
                  src={commentUser.avatar}
                  name={commentUser.name}
                  size="sm"
                />
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {commentUser.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(comment.created_at || comment.createdAt)}
                      </span>
                    </div>

                    {onDeleteComment && (
                      (() => {
                        const commentUserId = commentUser.id
                        const canDelete = Boolean(currentUserId && commentUserId && String(currentUserId) === String(commentUserId))
                        if (!canDelete) return null

                        return (
                          <button
                            type="button"
                            onClick={() => setCommentToDelete(comment._id)}
                            disabled={deletingCommentId === comment._id}
                            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60"
                          >
                            {deletingCommentId === comment._id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        )
                      })()
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mt-0.5">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </div>

      {/* Form nhập comment */}
      <form onSubmit={onSubmitComment} className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Viết bình luận..."
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
        />
        <Button
          type="submit"
          size="sm"
          isLoading={isCommenting}
          disabled={!newComment.trim()}
          className="!px-3"
          aria-label="Gửi bình luận"
        >
          <AiOutlineSend size={16} />
        </Button>
      </form>

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={!!commentToDelete}
        title="Xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={() => {
          if (commentToDelete) {
            onDeleteComment(commentToDelete)
          }
          setCommentToDelete(null)
        }}
        onCancel={() => setCommentToDelete(null)}
        isDestructive
      />
    </div>
  )
}

export default CommentSection
