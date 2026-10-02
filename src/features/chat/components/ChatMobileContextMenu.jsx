import { FaReply } from 'react-icons/fa'
import { REACTION_EMOJIS } from '../constants/chatConstants'

const ChatMobileContextMenu = ({
  longPressedMessage,
  onClose,
  onReaction,
  onReply,
}) => {
  if (!longPressedMessage) return null

  return (
    <div className="fixed inset-0 z-[150] flex flex-col justify-end bg-black/60 animate-fade-in md:hidden">
      {/* Overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full bg-[#1c1c1e] rounded-t-3xl px-5 pt-6 pb-8 shadow-2xl border-t border-zinc-800 animate-slide-up flex flex-col gap-6">
        {/* Handle/bar at top */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-2" />

        {/* Emoji Reactions pill */}
        <div className="flex items-center justify-between bg-zinc-800/80 backdrop-blur-md rounded-full px-4 py-2.5 mx-auto max-w-md w-full border border-zinc-700/50 shadow-lg">
          {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onReaction?.(longPressedMessage._id, type)
                onClose()
              }}
              className="text-2xl active:scale-140 hover:scale-110 transition p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            className="text-zinc-400 bg-zinc-700/50 hover:bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition"
            title="Thêm cảm xúc"
          >
            <span className="text-lg font-bold leading-none">+</span>
          </button>
        </div>

        {/* Action buttons row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              onReply?.(longPressedMessage)
              onClose()
            }}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
          >
            <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-primary-400">
              <FaReply size={16} />
            </div>
            <span className="text-xs font-semibold">Reply</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(longPressedMessage.text || '')
              onClose()
            }}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
          >
            <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <span className="text-xs font-semibold">Copy</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
          >
            <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 0A18.015 18.015 0 0110 14.828M10 14.828a18.01 18.01 0 01-3.588-5.83M10 14.828l-1.84 3.7m0 0a17.98 17.98 0 01-1.301-3.7m1.301 3.7H3m18-3H15v1.5a1.5 1.5 0 001.5 1.5H19v2.5M15 19v-4.5" />
              </svg>
            </div>
            <span className="text-xs font-semibold">Translate</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
          >
            <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-amber-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className="text-xs font-semibold">More</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatMobileContextMenu
