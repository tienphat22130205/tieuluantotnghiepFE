import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { AiOutlineClose, AiOutlineLoading3Quarters, AiOutlineShareAlt } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const normalizeHashtags = (input) =>
  input
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/^#/, ''))

const SharePostModal = ({ isOpen, post, isSharing, onClose, onSubmit }) => {
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [hashtagsText, setHashtagsText] = useState('')

  const previewImage = useMemo(() => {
    const source = post?.image_url || (Array.isArray(post?.images) ? post.images[0] : null)
    return resolveMediaUrl(source)
  }, [post])

  const handleClose = () => {
    if (isSharing) return
    onClose?.()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const hashtags = normalizeHashtags(hashtagsText)

    const payload = {
      content: content.trim(),
      visibility,
      hashtags,
    }

    await onSubmit?.(payload)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Motion.div
                className="fixed inset-0 z-[72] bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <Motion.div
                className="fixed left-1/2 top-1/2 z-[73] w-[94%] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <Dialog.Title className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <AiOutlineShareAlt size={18} className="text-primary-600" />
                    Chia sẻ bài viết
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Nhập nội dung chia sẻ, thiết lập quyền riêng tư và hashtag trước khi đăng lại bài viết.
                  </Dialog.Description>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Đóng"
                  >
                    <AiOutlineClose size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Bài viết gốc</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post?.caption || 'Bài viết không có nội dung văn bản.'}</p>
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Ảnh bài viết gốc"
                        className="mt-3 max-h-52 w-full rounded-xl object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="share-content" className="mb-1.5 block text-sm font-semibold text-slate-700">Nội dung chia sẻ</label>
                    <textarea
                      id="share-content"
                      rows={3}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Mình share lại bài này..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="share-visibility" className="mb-1.5 block text-sm font-semibold text-slate-700">Quyền riêng tư</label>
                      <select
                        id="share-visibility"
                        value={visibility}
                        onChange={(event) => setVisibility(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="public">Công khai</option>
                        <option value="friends">Bạn bè</option>
                        <option value="private">Chỉ mình tôi</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="share-hashtags" className="mb-1.5 block text-sm font-semibold text-slate-700">Hashtag</label>
                      <input
                        id="share-hashtags"
                        type="text"
                        value={hashtagsText}
                        onChange={(event) => setHashtagsText(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        placeholder="hot news"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSharing}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSharing}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                    >
                      {isSharing && <AiOutlineLoading3Quarters size={14} className="animate-spin" />}
                      {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
                    </button>
                  </div>
                </form>
              </Motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default SharePostModal
