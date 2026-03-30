import * as Dialog from '@radix-ui/react-dialog'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
  const extractHashtagsFromCaption = (text) => {
    if (typeof text !== 'string') return []
    const matches = text.match(/#[\p{L}\p{N}_]+/gu)
    return matches || []
  }

  const tagsFromCaptionsText = captions.flatMap((caption) => extractHashtagsFromCaption(caption))

  const availableHashtags = [...hashtags, ...captionHashtags.flat(), ...tagsFromCaptionsText]
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

  const uniqueHashtags = [...new Set(availableHashtags)]

  const handleApplyHashtags = () => {
    onApplyHashtags(selectedTags)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[85vh]">
          <div className="px-5 py-4 border-b border-gray-100">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Chọn caption AI</Dialog.Title>
            <p className="text-sm text-gray-500 mt-1">Chọn nội dung phù hợp trước khi đưa vào bài viết.</p>
          </div>

          <div className="p-5 space-y-3 overflow-y-auto max-h-[58vh]">
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-3">
                    <Skeleton height={14} count={2} className="mb-1" />
                    <Skeleton height={30} width={160} />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && captions.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có caption từ AI.</p>
            )}

            {!isLoading && captions.length > 0 && (
              <div className="space-y-2">
                {captions.map((caption, index) => {
                  const isSelected = selectedIndex === index
                  return (
                    <div
                      key={`${caption}-${index}`}
                      className={`rounded-lg border p-3 ${isSelected ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200'}`}
                    >
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{caption}</p>
                      <button
                        type="button"
                        onClick={() => onUseCaption(caption, index)}
                        className={`mt-2 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {isSelected ? 'Đang sử dụng caption này' : 'Dùng caption này'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {!isLoading && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Hashtags gợi ý</p>
                {uniqueHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uniqueHashtags.map((tag, index) => {
                      const isPicked = selectedTags.includes(tag)

                      return (
                        <button
                          key={`${tag}-${index}`}
                          type="button"
                          onClick={() => onToggleTag(tag)}
                          className={`rounded-full px-2.5 py-1 text-xs transition ${isPicked ? 'bg-primary-600 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                )}
                {uniqueHashtags.length === 0 && (
                  <p className="text-xs text-gray-400">AI chưa trả hashtag rõ ràng. Bạn có thể chọn caption khác hoặc nhập tay ở ô hashtags.</p>
                )}
                <button
                  type="button"
                  onClick={handleApplyHashtags}
                  disabled={selectedTags.length === 0}
                  className="mt-3 inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
                >
                  Dùng hashtags đã chọn
                </button>
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
            >
              Đóng
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AICaptionPickerModal
