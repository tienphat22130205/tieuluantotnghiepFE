import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'

const ChangeAvatarModal = ({
  isOpen,
  onClose,
  onUploadClick,
  onRemoveAvatar,
  hasAvatar = false,
  isLoading = false,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Motion.div
                className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs will-change-opacity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              forceMount
              onEscapeKeyDown={(e) => {
                if (isLoading) e.preventDefault()
              }}
              onPointerDownOutside={(e) => {
                if (isLoading) e.preventDefault()
              }}
            >
              <Motion.div
                className="fixed left-1/2 top-1/2 z-[71] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 will-change-transform transition-colors"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              >
                {/* Header Title */}
                <div className="py-5 sm:py-6 px-4 text-center">
                  <Dialog.Title className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Thay đổi ảnh đại diện
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Tùy chọn tải ảnh đại diện mới hoặc gỡ ảnh hiện tại
                  </Dialog.Description>
                </div>

                {/* Tải ảnh lên */}
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onUploadClick?.()
                  }}
                  disabled={isLoading}
                  className="w-full py-3.5 border-t border-slate-100 dark:border-slate-800 text-center font-bold text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer select-none disabled:opacity-50"
                >
                  Tải ảnh lên
                </button>

                {/* Gỡ ảnh hiện tại */}
                {hasAvatar && (
                  <button
                    type="button"
                    onClick={onRemoveAvatar}
                    disabled={isLoading}
                    className="w-full py-3.5 border-t border-slate-100 dark:border-slate-800 text-center font-bold text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer select-none disabled:opacity-50"
                  >
                    {isLoading ? 'Đang gỡ ảnh...' : 'Gỡ ảnh hiện tại'}
                  </button>
                )}

                {/* Hủy */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-3.5 border-t border-slate-100 dark:border-slate-800 text-center font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer select-none"
                >
                  Hủy
                </button>
              </Motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default ChangeAvatarModal
