import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { AiOutlineClose } from 'react-icons/ai'
import PostContent from './PostContent'
import CommentSection from './CommentSection'

const PostDetailModal = ({
  isOpen,
  post,
  isLiked,
  onLike,
  comments,
  commentsCount,
  newComment,
  isCommenting,
  deletingCommentId,
  currentUser,
  currentUserId,
  onClose,
  onCommentChange,
  onSubmitComment,
  onDeleteComment,
  replyToComment = null,
  onSetReplyToComment = () => {},
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Motion.div
                className="fixed inset-0 z-[70] bg-black/55 will-change-opacity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <Motion.div
                className="fixed left-1/2 top-1/2 z-[71] w-[97%] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <Dialog.Title className="text-sm font-bold text-slate-900">Chi tiết bài viết</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Xem nội dung bài viết và bình luận chi tiết.
                  </Dialog.Description>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Đóng"
                  >
                    <AiOutlineClose size={18} />
                  </button>
                </div>

                <div className="max-h-[82vh] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="min-w-0">
                      <PostContent post={post} isLiked={isLiked} onLike={onLike} inDetailModal />
                    </div>

                    <div className="border-t border-slate-100 lg:border-l lg:border-t-0">
                      <CommentSection
                        comments={comments}
                        commentsCount={commentsCount}
                        newComment={newComment}
                        isCommenting={isCommenting}
                        currentUserId={currentUserId}
                        currentUser={currentUser}
                        deletingCommentId={deletingCommentId}
                        onCommentChange={onCommentChange}
                        onSubmitComment={onSubmitComment}
                        onDeleteComment={onDeleteComment}
                        replyToComment={replyToComment}
                        onSetReplyToComment={onSetReplyToComment}
                      />
                    </div>
                  </div>
                </div>
              </Motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default PostDetailModal