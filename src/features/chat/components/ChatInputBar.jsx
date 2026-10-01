import { AiOutlineClose, AiOutlineSmile, AiOutlineSend } from 'react-icons/ai'
import StickerPicker from './StickerPicker'

const ChatInputBar = ({
  replyToMessage,
  selectedConversation,
  messageInput,
  setMessageInput,
  showStickers,
  setShowStickers,
  isSending,
  onSendMessage,
  onSendSticker,
  onCancelReply,
  onInputKeyDown,
}) => {
  return (
    <div className="border-t border-slate-200 p-4 bg-white">
      {replyToMessage && (
        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-700 mb-2.5 border border-slate-200/50 animate-fade-in">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block">
              Đang trả lời {replyToMessage.sender === 'me' ? 'chính mình' : selectedConversation?.full_name}
            </span>
            <span className="truncate text-slate-500 block">
              {replyToMessage.type === 'sticker' ? '[Nhãn dán]' : replyToMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 cursor-pointer transition shrink-0 ml-2"
          >
            <AiOutlineClose size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-4 pr-2 py-1.5 relative">
        <button
          type="button"
          onClick={() => setShowStickers((prev) => !prev)}
          className={`p-1.5 text-gray-400 hover:text-primary-600 transition shrink-0 cursor-pointer ${showStickers ? 'text-primary-600' : ''}`}
          title="Nhãn dán"
        >
          <AiOutlineSmile size={20} />
        </button>

        {/* Sticker picker popover */}
        {showStickers && (
          <StickerPicker
            onSelectSticker={(url) => {
              onSendSticker(url)
              setShowStickers(false)
            }}
            onClose={() => setShowStickers(false)}
            className="absolute bottom-full left-0 mb-3"
          />
        )}

        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Nhập tin nhắn..."
          className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
        />

        <button
          type="button"
          disabled={isSending || !String(messageInput || '').trim()}
          onClick={onSendMessage}
          className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <AiOutlineSend size={16} />
        </button>
      </div>
    </div>
  )
}

export default ChatInputBar
