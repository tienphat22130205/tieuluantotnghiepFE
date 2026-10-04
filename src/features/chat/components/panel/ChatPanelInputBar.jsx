import { useRef, useState } from 'react'
import { AiOutlineClose, AiOutlineSmile, AiOutlineSend, AiOutlinePicture } from 'react-icons/ai'
import StickerPicker from '../StickerPicker'

const ChatPanelInputBar = ({
  replyToMessage,
  onClearReply,
  selectedConversation,
  messageInput,
  onChangeMessage,
  onSendMessage,
  onSendImage,
  onSendSticker,
  isSending,
}) => {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showStickers, setShowStickers] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh hợp lệ')
        return
      }
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setSelectedFile(null)
    setImagePreview(null)
  }

  const handleSend = () => {
    if (selectedFile) {
      onSendImage?.(selectedFile, messageInput)
      handleClearSelectedImage()
      onChangeMessage?.('')
    } else {
      onSendMessage?.()
    }
  }

  const handleInputKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    handleSend()
  }

  const canSend = !isSending && (Boolean(String(messageInput || '').trim()) || Boolean(selectedFile))

  return (
    <div className="border-t border-gray-100 p-3 bg-white shrink-0">
      {replyToMessage && (
        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] text-slate-700 mb-2 border border-slate-200/50 animate-fade-in">
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block leading-tight">
              Đang trả lời {replyToMessage.sender === 'me' ? 'chính mình' : selectedConversation?.full_name}
            </span>
            <span className="truncate text-slate-500 block">
              {replyToMessage.type === 'sticker'
                ? '[Nhãn dán]'
                : (replyToMessage.type === 'image' || replyToMessage.mediaUrl)
                ? '[Hình ảnh]'
                : replyToMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 cursor-pointer transition shrink-0 ml-1.5"
          >
            <AiOutlineClose size={14} />
          </button>
        </div>
      )}

      {/* Selected Image Preview Thumbnail before sending */}
      {imagePreview && (
        <div className="flex items-center gap-2 mb-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl w-fit max-w-full animate-fade-in">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-[11px] font-medium text-slate-700 truncate max-w-[140px]">
              {selectedFile?.name || 'Ảnh đính kèm'}
            </p>
            <p className="text-[10px] text-slate-400">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSelectedImage}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
            title="Hủy chọn ảnh"
          >
            <AiOutlineClose size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1 text-gray-400 hover:text-primary-600 transition shrink-0 cursor-pointer"
          title="Gửi hình ảnh"
        >
          <AiOutlinePicture size={18} />
        </button>

        <button
          type="button"
          onClick={() => setShowStickers((prev) => !prev)}
          className={`p-1 text-gray-400 hover:text-primary-600 transition shrink-0 cursor-pointer ${showStickers ? 'text-primary-600' : ''}`}
          title="Nhãn dán"
        >
          <AiOutlineSmile size={18} />
        </button>

        {/* Sticker picker popover */}
        {showStickers && (
          <StickerPicker
            onSelectSticker={(url) => {
              onSendSticker?.(url)
              setShowStickers(false)
            }}
            onClose={() => setShowStickers(false)}
            className="absolute bottom-full right-0 mb-3"
          />
        )}

        <input
          value={messageInput}
          onChange={(e) => onChangeMessage?.(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedFile ? 'Thêm chú thích cho ảnh...' : 'Nhập tin nhắn...'}
          className="w-full text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
        />

        <button
          type="button"
          disabled={!canSend}
          onClick={handleSend}
          className="p-1.5 text-primary-600 hover:text-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          title={isSending ? 'Đang gửi...' : 'Gửi'}
        >
          <AiOutlineSend size={18} />
        </button>
      </div>
    </div>
  )
}

export default ChatPanelInputBar
