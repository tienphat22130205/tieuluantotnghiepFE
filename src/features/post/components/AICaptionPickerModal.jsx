import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { AiOutlineClose, AiOutlineCheck } from 'react-icons/ai'
import { BsRobot } from 'react-icons/bs'
import { TbSparkles } from 'react-icons/tb'
import { BiHash } from 'react-icons/bi'

const AICaptionPickerModal = ({
  isOpen,
  isLoading,
  captions = [],
  hashtags = [],
  captionHashtags = [],
  selectedTags = [],
  selectedIndex,
  onClose,
  onToggleTag,
  onApplyHashtags,
  onUseCaption,
}) => {
  // Chỉ dùng hashtag từ API response, KHÔNG tự trích xuất từ caption text
  // (để tránh sinh ra hashtag rác từ nội dung văn bản)
  const availableHashtags = [...hashtags, ...captionHashtags.flat()]
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

  const uniqueHashtags = [...new Set(availableHashtags)]

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount
              onEscapeKeyDown={(e) => { if (isLoading) e.preventDefault() }}
              onPointerDownOutside={(e) => { if (isLoading) e.preventDefault() }}
            >
              <Motion.div
                className="fixed top-1/2 left-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[88vh] flex flex-col border border-slate-200"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header */}
                <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                    <BsRobot size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Dialog.Title className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      Kết quả AI <TbSparkles size={13} className="text-primary-500" />
                    </Dialog.Title>
                    <Dialog.Description className="text-[11px] text-slate-500 mt-0.5">
                      Chọn caption phù hợp và đưa vào bài viết
                    </Dialog.Description>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition disabled:opacity-40"
                  >
                    <AiOutlineClose size={16} />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                  {/* Loading state */}
                  {isLoading && (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 p-4 space-y-2 bg-slate-50">
                          <Skeleton height={11} count={2} borderRadius={4} />
                          <Skeleton height={26} width={100} borderRadius={16} />
                        </div>
                      ))}
                      <div className="flex items-center justify-center gap-2 py-2">
                        <BsRobot size={14} className="text-primary-400 animate-pulse" />
                        <p className="text-xs text-slate-400 animate-pulse">AI đang phân tích ảnh và sinh nội dung...</p>
                      </div>
                    </div>
                  )}

                  {/* Empty */}
                  {!isLoading && captions.length === 0 && (
                    <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <BsRobot size={28} className="text-slate-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-500">Chưa có caption từ AI</p>
                        <p className="text-xs text-slate-400 mt-1">Hãy thử lại hoặc kiểm tra kết nối AI service</p>
                      </div>
                    </div>
                  )}

                  {/* Caption list */}
                  {!isLoading && captions.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <TbSparkles size={12} className="text-primary-400" />
                        Nội dung gợi ý ({captions.length})
                      </p>
                      {captions.map((caption, index) => {
                        const isSelected = selectedIndex === index
                        return (
                          <div
                            key={`${caption}-${index}`}
                            onClick={() => onUseCaption(caption, index)}
                            className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {/* Caption index badge */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary-500' : 'text-slate-400'}`}>
                                Caption {index + 1}
                              </span>
                              {isSelected && (
                                <span className="flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                                  <AiOutlineCheck size={9} /> Đang dùng
                                </span>
                              )}
                            </div>

                            {/* Caption text */}
                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                              {caption}
                            </p>

                            {/* Use button */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onUseCaption(caption, index) }}
                              className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-150 ${
                                isSelected
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? (
                                <><AiOutlineCheck size={10} /> Đang sử dụng</>
                              ) : 'Dùng caption này'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Hashtags */}
                  {!isLoading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <BiHash size={13} className="text-slate-400" />
                          Hashtags gợi ý
                        </p>
                        {selectedTags.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onApplyHashtags(selectedTags)}
                            className="flex items-center gap-1 rounded-full bg-slate-900 hover:bg-slate-700 px-3 py-1 text-[10px] font-bold text-white transition"
                          >
                            <AiOutlineCheck size={9} /> Dùng {selectedTags.length} hashtag
                          </button>
                        )}
                      </div>

                      {uniqueHashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueHashtags.map((tag, i) => {
                            const isPicked = selectedTags.includes(tag)
                            return (
                              <button
                                key={`${tag}-${i}`}
                                type="button"
                                onClick={() => onToggleTag(tag)}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition-all duration-150 ${
                                  isPicked
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {tag}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">AI chưa sinh hashtag. Bạn có thể nhập tay ở ô hashtags.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-slate-100 px-5 py-3.5 bg-slate-50 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition disabled:opacity-50"
                  >
                    Đóng
                  </button>
                </div>
              </Motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default AICaptionPickerModal
