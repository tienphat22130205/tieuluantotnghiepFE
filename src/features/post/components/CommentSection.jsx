import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Button, ConfirmModal } from '@/components/ui'
import { AiOutlineSend } from 'react-icons/ai'
import { timeAgo } from '@/utils/formatDate'
import { getProfilePath } from '@/utils/profileData'

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
  replyToComment = null,
  onSetReplyToComment = () => {},
}) => {
  const [commentToDelete, setCommentToDelete] = useState(null)

  const resolveName = (raw) => {
    if (!raw || typeof raw !== 'object') return ''

    const fullName = raw.full_name || raw.fullName || raw.name
    if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()

    const fromFirstLast = `${raw.first_name || raw.firstName || ''} ${raw.last_name || raw.lastName || ''}`.trim()
    if (fromFirstLast) return fromFirstLast

    if (typeof raw.username === 'string' && raw.username.trim()) return raw.username.trim()
    return ''
  }

  const getCommentUser = (c) => {
    if (!c || typeof c !== 'object') {
      return {
        id: 'unknown',
        name: 'Người dùng',
        avatar: null
      }
    }

    const raw = c.user || c.author || c.sender || c.fromUser || c.userId
    
    if (raw && typeof raw === 'object') {
      const id = raw._id || raw.id || raw.user_id
      const matchesCurrent = currentUserId && String(id) === String(currentUserId)

      const nestedRaw = raw.user && typeof raw.user === 'object' ? raw.user : null
      const name = resolveName(raw) || resolveName(nestedRaw)
      const username = raw.username || nestedRaw?.username || (matchesCurrent ? currentUser?.username : null)

      if (!name || name === 'user' || name === 'Người dùng') {
         if (matchesCurrent && currentUser) return { 
            id, 
            username: currentUser.username || username || null,
            name: resolveName(currentUser) || 'Người dùng',
            avatar: currentUser.avatar || raw.avatar || nestedRaw?.avatar 
         }
      }
      
      return {
        id,
        username: username || null,
        name: name || 'Người dùng',
        avatar: raw.avatar || raw.profile_pic || nestedRaw?.avatar || nestedRaw?.profile_pic || null
      }
    }
    
    const strId = typeof raw === 'string' || typeof raw === 'number' ? raw : c.user_id || c.userId
    if (strId && currentUserId && currentUser && String(strId) === String(currentUserId)) {
      return {
        id: strId,
        username: currentUser.username || null,
        name: resolveName(currentUser) || 'Bạn',
        avatar: currentUser.avatar
      }
    }

    const commentLevelName = c.full_name || c.fullName || c.username || c.userName || c.authorName
    const commentLevelUsername = c.username || c.userName || null
    if (typeof commentLevelName === 'string' && commentLevelName.trim()) {
      return {
        id: strId || c._id || 'unknown',
        username: commentLevelUsername || null,
        name: commentLevelName.trim(),
        avatar: c.avatar || c.user_avatar || c.authorAvatar || null,
      }
    }
    
    return {
      id: strId || c._id || 'unknown',
      username: null,
      name: 'Người dùng',
      avatar: null
    }
  }

  const validComments = Array.isArray(comments) ? comments.filter(Boolean) : []
  const rootComments = validComments.filter((c) => c && !c.replyTo)
  
  const getRepliesForRoot = (rootId) => {
    if (!rootId) return []
    return validComments.filter((c) => {
      if (!c || !c.replyTo) return false
      if (String(c.replyTo) === String(rootId)) return true
      
      let temp = c
      let depth = 0
      while (temp && temp.replyTo && depth < 5) {
        if (String(temp.replyTo) === String(rootId)) return true
        temp = validComments.find((x) => x && String(x._id || x.id || '') === String(temp.replyTo))
        depth++
      }
      return false
    })
  }

  const getDirectParentUser = (comment) => {
    if (!comment || !comment.replyTo) return null
    const parent = validComments.find((x) => x && String(x._id || x.id || '') === String(comment.replyTo))
    return parent ? getCommentUser(parent) : null
  }

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Bình luận ({commentsCount || comments.length})
      </h3>

      {/* Danh sách comment */}
      <div className="space-y-5 mb-4 max-h-[350px] overflow-y-auto pr-1">
        {rootComments.length > 0 ? (
          rootComments.map((comment, i) => {
            const commentUser = getCommentUser(comment)
            const threadReplies = getRepliesForRoot(comment._id)

            return (
              <div key={comment._id || i} className="space-y-3">
                {/* Bình luận gốc */}
                <div className="flex gap-3">
                  <Avatar
                    src={commentUser.avatar}
                    name={commentUser.name}
                    size="sm"
                    to={getProfilePath(commentUser)}
                  />
                  <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2.5">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          to={getProfilePath(commentUser)}
                          className="text-sm font-semibold text-gray-900 hover:underline"
                        >
                          {commentUser.name}
                        </Link>
                        <span className="text-xs text-gray-400">
                          {timeAgo(comment.created_at || comment.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onSetReplyToComment(comment)}
                          className="text-xs text-primary-600 hover:underline cursor-pointer font-semibold"
                        >
                          Phản hồi
                        </button>

                        {onDeleteComment && (() => {
                          const commentUserId = commentUser.id
                          const canDelete = Boolean(currentUserId && commentUserId && String(currentUserId) === String(commentUserId))
                          if (!canDelete) return null

                          return (
                            <button
                              type="button"
                              onClick={() => setCommentToDelete(comment._id)}
                              disabled={deletingCommentId === comment._id}
                              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60 cursor-pointer font-medium"
                            >
                              Xóa
                            </button>
                          )
                        })()}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-all">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Các phản hồi lồng nhau */}
                {threadReplies.map((reply, rIdx) => {
                  const replyUser = getCommentUser(reply)
                  const directParentUser = getDirectParentUser(reply)

                  return (
                    <div key={reply._id || rIdx} className="pl-9 flex gap-3">
                      <Avatar
                        src={replyUser.avatar}
                        name={replyUser.name}
                        size="xs"
                        to={getProfilePath(replyUser)}
                      />
                      <div className="flex-1 bg-slate-50/70 border border-slate-100/50 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <Link
                              to={getProfilePath(replyUser)}
                              className="text-sm font-semibold text-gray-900 hover:underline"
                            >
                              {replyUser.name}
                            </Link>
                            <span className="text-xs text-gray-400">
                              {timeAgo(reply.created_at || reply.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => onSetReplyToComment(reply)}
                              className="text-xs text-primary-600 hover:underline cursor-pointer font-semibold"
                            >
                              Phản hồi
                            </button>

                            {onDeleteComment && (() => {
                              const replyUserId = replyUser.id
                              const canDelete = Boolean(currentUserId && replyUserId && String(currentUserId) === String(replyUserId))
                              if (!canDelete) return null

                              return (
                                <button
                                  type="button"
                                  onClick={() => setCommentToDelete(reply._id)}
                                  disabled={deletingCommentId === reply._id}
                                  className="text-xs text-red-600 hover:text-red-700 disabled:opacity-60 cursor-pointer font-medium"
                                >
                                  Xóa
                                </button>
                              )
                            })()}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-all">
                          {directParentUser && (
                            <span className="text-primary-600 font-semibold mr-1.5 select-none">
                              @{directParentUser.name}
                            </span>
                          )}
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  )
                })}
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
      <div className="mt-4">
        {replyToComment && (
          <div className="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-1.5 text-xs text-primary-700 mb-2 border border-primary-100">
            <span>Đang trả lời <strong>{getCommentUser(replyToComment).name}</strong></span>
            <button
              type="button"
              onClick={() => onSetReplyToComment(null)}
              className="text-primary-600 hover:text-primary-800 font-bold hover:underline cursor-pointer"
            >
              Hủy
            </button>
          </div>
        )}
        <form onSubmit={onSubmitComment} className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={replyToComment ? `Phản hồi...` : "Viết bình luận..."}
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition bg-slate-50"
          />
          <Button
            type="submit"
            size="sm"
            isLoading={isCommenting}
            disabled={!newComment.trim()}
            className="!px-3 rounded-full"
            aria-label="Gửi bình luận"
          >
            <AiOutlineSend size={16} />
          </Button>
        </form>
      </div>

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
