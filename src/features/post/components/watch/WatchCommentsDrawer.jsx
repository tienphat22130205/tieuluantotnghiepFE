import { AiOutlineClose, AiOutlineMessage, AiOutlineSend } from 'react-icons/ai'
import { Avatar } from '@/components/ui'

const WatchCommentsDrawer = ({
  activeCommentVideoId,
  activeComments,
  newCommentText,
  setNewCommentText,
  currentUser,
  onClose,
  onSubmitComment,
}) => {
  if (!activeCommentVideoId) return null

  return (
    <div className="absolute inset-0 z-50 flex justify-end animate-fade-in">
      {/* Backdrop */}
      <button
        className="flex-1 bg-black/40 backdrop-blur-xs cursor-default transition-opacity"
        onClick={onClose}
        aria-label="Đóng bình luận"
      />

      {/* Comment Panel */}
      <div className="w-full max-w-[380px] h-full bg-white border-l border-slate-200/90 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <AiOutlineMessage size={18} className="text-primary-600" />
            Bình luận ({activeComments.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <AiOutlineClose size={18} />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {activeComments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 py-16">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <AiOutlineMessage size={28} />
              </div>
              <p className="text-xs font-semibold text-slate-500">Chưa có bình luận nào</p>
              <p className="text-[11px] text-slate-400 text-center">Hãy là người đầu tiên chia sẻ cảm nghĩ về video này!</p>
            </div>
          ) : (
            activeComments.map((comm) => (
              <div key={comm.id} className="flex gap-3 items-start group">
                <Avatar src={comm.avatar} name={comm.name} size="sm" />
                <div className="flex-1 bg-slate-50 border border-slate-100/90 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="font-bold text-slate-900 text-[12px]">{comm.name}</p>
                  <p className="text-slate-700 text-xs mt-1 leading-relaxed">{comm.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={onSubmitComment} className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2.5 shrink-0">
          <Avatar src={currentUser?.avatar} name={currentUser?.full_name || 'Bạn'} size="sm" />
          <input
            type="text"
            placeholder="Thêm bình luận cho video..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 bg-slate-100/80 border border-transparent focus:border-primary-500 focus:bg-white text-slate-900 rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder:text-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full p-2.5 transition cursor-pointer shadow-sm disabled:cursor-not-allowed"
          >
            <AiOutlineSend size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default WatchCommentsDrawer
