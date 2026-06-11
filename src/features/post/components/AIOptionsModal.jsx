import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { AiOutlineClose } from 'react-icons/ai'
import { BsRobot } from 'react-icons/bs'
import { TbSparkles, TbLanguage, TbAlignLeft } from 'react-icons/tb'
import { MdOutlineTune } from 'react-icons/md'
import { BiHash } from 'react-icons/bi'

const TONE_OPTIONS = [
  { value: 'fun', label: 'Vui nhộn', icon: '😄', desc: 'Sinh động, hài hước' },
  { value: 'chill', label: 'Chill', icon: '😌', desc: 'Nhẹ nhàng, thư thái' },
  { value: 'professional', label: 'Chuyên nghiệp', icon: '💼', desc: 'Trang trọng, lịch sự' },
]

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Ngắn', sub: '1-2 câu' },
  { value: 'medium', label: 'Vừa', sub: '3-4 câu' },
  { value: 'long', label: 'Dài', sub: '5+ câu' },
]

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
                className="fixed top-1/2 left-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-slate-200"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                    <BsRobot size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Dialog.Title className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      Tùy chọn AI <TbSparkles size={13} className="text-primary-500" />
                    </Dialog.Title>
                    <Dialog.Description className="text-[11px] text-slate-500 mt-0.5">
                      Điều chỉnh phong cách trước khi sinh nội dung
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

                {/* Body */}
                <div className="px-5 py-4 space-y-4">

                  {/* Tone */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <MdOutlineTune size={13} className="text-slate-400" /> Giọng văn
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TONE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onChangeOption('tone', opt.value)}
                          className={`flex flex-col items-center text-center py-3 px-2 rounded-xl border text-xs transition-all duration-150 ${
                            options.tone === opt.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-lg mb-1">{opt.icon}</span>
                          <span className="font-bold leading-none">{opt.label}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <TbAlignLeft size={13} className="text-slate-400" /> Độ dài caption
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {LENGTH_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onChangeOption('length', opt.value)}
                          className={`py-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-150 ${
                            options.length === opt.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <p>{opt.label}</p>
                          <p className="text-[9px] text-slate-400 font-normal mt-0.5">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <TbLanguage size={13} className="text-slate-400" /> Ngôn ngữ
                      </label>
                      <select
                        value={options.language}
                        onChange={(e) => onChangeOption('language', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400"
                      >
                        <option value="vi">🇻🇳 Tiếng Việt</option>
                        <option value="en">🇬🇧 English</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Số caption</label>
                      <select
                        value={options.numCaptions}
                        onChange={(e) => onChangeOption('numCaptions', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400"
                      >
                        <option value={1}>1 caption</option>
                        <option value={2}>2 captions</option>
                        <option value={3}>3 captions</option>
                      </select>
                    </div>
                  </div>

                  {/* Hashtag toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={options.includeHashtags}
                    onClick={() => onChangeOption('includeHashtags', !options.includeHashtags)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-3 transition"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <BiHash size={15} className="text-slate-500" />
                      Kèm hashtags gợi ý
                    </span>
                    <div className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${options.includeHashtags ? 'bg-primary-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${options.includeHashtags ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold transition shadow-sm disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <BsRobot size={14} />
                        Sinh nội dung với AI
                      </>
                    )}
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

export default AIOptionsModal
