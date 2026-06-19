import { useState, useEffect } from 'react'
import { FiX, FiTrash, FiEye, FiMusic } from 'react-icons/fi'
import { toast } from 'react-toastify'
import storyService from '../services/storyService'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { ConfirmModal } from '@/components/ui'

const StoryArchiveModal = ({ isOpen, onClose, onDeleteStoryFromParent }) => {
  if (!isOpen) return null

  const [archivedStories, setArchivedStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState(null)
  const [storyToDelete, setStoryToDelete] = useState(null)

  const fetchArchivedStories = async () => {
    setLoading(true)
    try {
      const data = await storyService.getArchivedStories()
      setArchivedStories(data || [])
    } catch (err) {
      console.error('Lỗi khi tải kho lưu trữ:', err)
      toast.error('Không thể tải kho lưu trữ tin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArchivedStories()
  }, [])

  const handleDeleteStory = async () => {
    if (!storyToDelete) return
    const storyId = storyToDelete._id || storyToDelete.id
    try {
      await storyService.deleteStory(storyId)
      toast.success('Đã xóa tin khỏi kho lưu trữ!')
      setArchivedStories((prev) => prev.filter((s) => s._id !== storyId && s.id !== storyId))
      onDeleteStoryFromParent?.(storyId)
      setStoryToDelete(null)
      if (selectedStory && (selectedStory._id === storyId || selectedStory.id === storyId)) {
        setSelectedStory(null)
      }
    } catch (err) {
      toast.error(err?.message || 'Xóa tin thất bại!')
    }
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[600px] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kho lưu trữ tin</h2>
            <p className="text-xs text-slate-500 mt-0.5">Các tin cũ của bạn được lưu ở đây sau 24h. Chỉ mình bạn xem được.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
              <span className="text-sm font-semibold text-slate-500">Đang tải kho lưu trữ...</span>
            </div>
          ) : archivedStories.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-700">Kho lưu trữ trống</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Tin của bạn sẽ tự động lưu lại ở đây sau khi kết thúc thời gian hiển thị 24 giờ.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {archivedStories.map((story) => {
                const storyId = String(story._id || story.id || '')
                return (
                  <div
                    key={storyId}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    {/* Visual Card Content */}
                    <div className="absolute inset-0 z-0">
                      {story.bgColor ? (
                        <div
                          className="w-full h-full flex items-center justify-center p-3 text-center"
                          style={{ background: story.bgColor }}
                        >
                          <span
                            className="text-[11px] font-extrabold line-clamp-4 break-words drop-shadow-sm"
                            style={{ color: story.textColor || '#fff' }}
                          >
                            {story.textContent}
                          </span>
                        </div>
                      ) : story.mediaType === 'video' ? (
                        <video
                          src={resolveMediaUrl(story.mediaUrl)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={resolveMediaUrl(story.mediaUrl)}
                          alt="Archived story"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 opacity-80" />
                    </div>

                    {/* Metadata inside card */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                      <span className="text-[10px] bg-black/40 text-white rounded-full px-2 py-0.5 font-medium border border-white/5">
                        {story.mediaType === 'video' ? 'Video' : story.bgColor ? 'Chữ' : 'Ảnh'}
                      </span>
                      {story.spotifyUrl && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-sm">
                          <FiMusic />
                        </span>
                      )}
                    </div>

                    {/* Hover Actions Menu */}
                    <div className="absolute inset-0 z-20 bg-slate-950/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => setSelectedStory(story)}
                        className="p-2.5 bg-white/20 hover:bg-white/35 text-white rounded-full transition hover:scale-105"
                        title="Xem lại"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStoryToDelete(story)
                        }}
                        className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition hover:scale-105"
                        title="Xóa vĩnh viễn"
                      >
                        <FiTrash size={18} />
                      </button>
                    </div>

                    {/* Footer - Date info */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-left">
                      <span className="text-[10px] font-semibold text-slate-200 block drop-shadow-md leading-none">
                        {formatDate(story.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Dynamic Detail Viewer (Nested Preview) */}
        {selectedStory && (
          <div className="absolute inset-0 z-[70] bg-slate-950 flex flex-col justify-between p-4 text-white animate-fade-in select-none">
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => setStoryToDelete(selectedStory)}
                className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white cursor-pointer"
                title="Xóa tin này"
              >
                <FiTrash size={18} />
              </button>
              <button
                onClick={() => setSelectedStory(null)}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white cursor-pointer"
                title="Đóng xem thử"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Preview Player */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                  {selectedStory.bgColor ? (
                    <div
                      className="w-full h-full flex items-center justify-center p-6 text-center"
                      style={{ background: selectedStory.bgColor }}
                    >
                      <span
                        className="text-base font-bold break-words whitespace-pre-wrap drop-shadow-md"
                        style={{ color: selectedStory.textColor || '#fff' }}
                      >
                        {selectedStory.textContent}
                      </span>
                    </div>
                  ) : selectedStory.mediaType === 'video' ? (
                    <video
                      src={resolveMediaUrl(selectedStory.mediaUrl)}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <img
                      src={resolveMediaUrl(selectedStory.mediaUrl)}
                      alt="Archived story preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
                </div>

                {/* Spotify Iframe */}
                {selectedStory.spotifyUrl && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 rounded-xl overflow-hidden bg-black/60 shadow border border-white/5">
                    <iframe
                      title="Spotify Player Archive"
                      src={selectedStory.spotifyUrl}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      style={{ borderRadius: '8px', border: 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom details info */}
            <div className="text-center py-2 bg-slate-900/60 rounded-xl border border-slate-800/80 max-w-xs mx-auto px-4 z-10">
              <span className="text-xs text-slate-300 block">Đã đăng lúc:</span>
              <span className="text-sm font-bold text-white block mt-0.5">{formatDate(selectedStory.createdAt)}</span>
              {selectedStory.duration && (
                <span className="text-[10px] text-slate-400 mt-0.5 block">Thời lượng phát: {selectedStory.duration}s</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={!!storyToDelete}
        message="Bạn có chắc chắn muốn xóa tin này không? Hành động này không thể hoàn tác."
        onConfirm={handleDeleteStory}
        onCancel={() => setStoryToDelete(null)}
      />
    </div>
  )
}

export default StoryArchiveModal
