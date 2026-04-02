import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Button } from '@/components/ui'

const AIOptionsModal = ({
  isOpen,
  options,
  isLoading,
  onClose,
  onChangeOption,
  onGenerate,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Motion.div
                className="fixed inset-0 bg-black/50 z-50 will-change-opacity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              onEscapeKeyDown={(event) => {
                if (isLoading) event.preventDefault()
              }}
              onPointerDownOutside={(event) => {
                if (isLoading) event.preventDefault()
              }}
            >
              <Motion.div
                className="fixed top-1/2 left-1/2 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden will-change-transform transform-gpu"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.18 }}
              >
                <div className="px-5 py-4 border-b border-gray-100">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">Tùy chọn AI</Dialog.Title>
                  <p className="text-sm text-gray-500 mt-1">Chọn phong cách caption trước khi AI sinh nội dung.</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm text-gray-700">
                      <span className="block mb-1">Language</span>
                      <select
                        value={options.language}
                        onChange={(e) => onChangeOption('language', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                      >
                        <option value="vi">vi</option>
                        <option value="en">en</option>
                      </select>
                    </label>

                    <label className="text-sm text-gray-700">
                      <span className="block mb-1">Tone</span>
                      <select
                        value={options.tone}
                        onChange={(e) => onChangeOption('tone', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                      >
                        <option value="fun">fun</option>
                        <option value="chill">chill</option>
                        <option value="professional">professional</option>
                      </select>
                    </label>

                    <label className="text-sm text-gray-700">
                      <span className="block mb-1">Length</span>
                      <select
                        value={options.length}
                        onChange={(e) => onChangeOption('length', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                      >
                        <option value="short">short</option>
                        <option value="medium">medium</option>
                        <option value="long">long</option>
                      </select>
                    </label>

                    <label className="text-sm text-gray-700">
                      <span className="block mb-1">Số caption (1-3)</span>
                      <select
                        value={options.numCaptions}
                        onChange={(e) => onChangeOption('numCaptions', Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </label>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={options.includeHashtags}
                      onChange={(e) => onChangeOption('includeHashtags', e.target.checked)}
                    />
                    Kèm hashtags
                  </label>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button type="button" onClick={onGenerate} isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Sinh caption...' : 'Sinh content với AI'}
                  </Button>
                </div>
              </Motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default AIOptionsModal
