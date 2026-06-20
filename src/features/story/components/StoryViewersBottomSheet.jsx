import { FiEye, FiX } from 'react-icons/fi'
import { Avatar } from '@/components/ui'

const StoryViewersBottomSheet = ({
  isOpen,
  onClose,
  viewers = [],
}) => {
  if (!isOpen) return null

  const formatViewerTime = (dateStr) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return ''
    }
  }

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-x-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md rounded-t-3xl border-t border-slate-800/60 flex flex-col max-h-[60%] animate-slide-up shadow-[0_-8px_30px_rgb(0,0,0,0.5)]"
    >
      {/* Sheet handle / Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
        <span className="text-sm font-bold text-white flex items-center gap-1.5">
          <FiEye size={16} className="text-primary-400" />
          Chi tiết người xem ({viewers.length})
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {viewers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Chưa có ai xem tin này.
          </div>
        ) : (
          viewers.map((viewer, index) => {
            const u = viewer.user || {};
            const viewerName = u.fullName || u.full_name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Người dùng';
            
            return (
              <div key={index} className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={u.avatar}
                    name={viewerName}
                    size="sm"
                    className="border border-slate-800 shadow"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-200 block truncate max-w-[150px]">
                        {viewerName}
                      </span>
                      {viewer.reaction && (
                        <span className="text-base shrink-0 animate-bounce" title="Đã bày tỏ cảm xúc">
                          {viewer.reaction}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      @{u.username || 'user'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatViewerTime(viewer.viewedAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}

export default StoryViewersBottomSheet
