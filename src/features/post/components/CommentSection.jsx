import { Avatar, Button } from '@/components/ui'
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
  onCommentChange,
  onSubmitComment,
}) => {
  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Bình luận ({commentsCount || comments.length})
      </h3>

      {/* Danh sách comment */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment, i) => (
            <div key={comment._id || i} className="flex gap-3">
              <Avatar
                src={comment.user?.avatar}
                name={comment.user?.username}
                size="sm"
              />
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.user?.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
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
        >
          Gửi
        </Button>
      </form>
    </div>
  )
}

export default CommentSection
