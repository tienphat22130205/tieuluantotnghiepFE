import { useEffect, useRef, useState } from 'react'
import { AiOutlineClose, AiOutlineArrowLeft, AiOutlineSend, AiOutlineExpand, AiOutlineSmile } from 'react-icons/ai'
import { FaReply } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'
import StickerPicker from '../StickerPicker'

const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}


const ChatConversationWindow = ({
  isOpen,
  selectedConversation,
  messages,
  isMessagesLoading,
  isSending,
  messageInput,
  onBack,
  onClose,
  onSendMessage,
  onChangeMessage,
  onSendSticker,
  onToggleReaction,
  replyToMessage = null,
  onSetReplyToMessage = () => {},
}) => {
  const messagesContainerRef = useRef(null)
  const navigate = useNavigate()
  const [showStickers, setShowStickers] = useState(false)
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null)
  const [longPressedMessage, setLongPressedMessage] = useState(null)
  const longPressTimeout = useRef(null)

  const handleTouchStart = (msg) => (e) => {
    if (window.innerWidth >= 768) return
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current)
    longPressTimeout.current = setTimeout(() => {
      setLongPressedMessage(msg)
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50)
        } catch (_err) {}
      }
    }, 600)
  }

  const handleTouchEnd = () => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current)
  }

  const handleTouchMove = () => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current)
  }

  useEffect(() => {
    if (!selectedConversation?._id || isMessagesLoading) return

    const container = messagesContainerRef.current
    if (!container) return

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight
    })
  }, [isMessagesLoading, messages, selectedConversation?._id])



  const handleInputKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    onSendMessage?.()
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col bg-white transition-all duration-300 ease-out md:inset-auto md:right-4 md:bottom-4 md:h-[460px] md:w-[340px] md:border md:border-gray-200 md:rounded-2xl md:shadow-2xl md:origin-bottom-right ${
        isOpen && selectedConversation
          ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
          : 'translate-x-10 translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {selectedConversation && (
        <>
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <AiOutlineArrowLeft size={18} />
              </button>
              <Avatar
                src={selectedConversation.avatar}
                name={selectedConversation.full_name}
                size="sm"
                online={selectedConversation.isOnline}
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedConversation.full_name}</p>
                <p className="text-xs text-gray-500">
                  {selectedConversation.isOnline ? 'Đang hoạt động' : formatLastSeenText(selectedConversation.lastSeen)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onClose?.()
                  navigate(`/chat?friendId=${selectedConversation._id}`)
                }}
                title="Mở rộng trang chat"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <AiOutlineExpand size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <AiOutlineClose size={16} />
              </button>
            </div>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/40">
            {isMessagesLoading && (
              <div className="h-full flex items-center justify-center text-center text-sm text-gray-500">
                Đang tải tin nhắn...
              </div>
            )}

            {!isMessagesLoading && messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-sm text-gray-500">
                Chưa có tin nhắn nào. Hãy gửi lời chào trước.
              </div>
            )}

            {!isMessagesLoading && messages.map((msg) => (
              <div
                key={msg._id || `${msg.sender}-${msg.createdAt}`}
                className={`group relative mb-6 flex items-end gap-1.5 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'me' && (
                  <div className="mr-0.5 shrink-0">
                    <Avatar
                      src={selectedConversation.avatar}
                      name={selectedConversation.full_name}
                      size="xs"
                      online={false}
                    />
                  </div>
                )}

                {/* Message Bubble or Sticker Content */}
                <div className="relative flex flex-col max-w-[70%]">
                  {msg.type === 'sticker' && msg.sticker ? (
                    <div
                      className="relative my-0.5"
                      onTouchStart={handleTouchStart(msg)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                    >
                      <img
                        src={msg.sticker}
                        alt="Sticker"
                        className={`object-contain select-none rounded-lg ${
                          msg.sticker.includes('giphy.com')
                            ? 'max-w-[140px] max-h-[140px] shadow-sm border border-gray-100/60 bg-gray-50/20 p-1'
                            : 'w-20 h-20'
                        }`}
                      />
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm relative ${
                        msg.sender === 'me'
                          ? 'bg-primary-600 text-white rounded-br-md font-medium shadow-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}
                      onTouchStart={handleTouchStart(msg)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                    >
                      <p className="whitespace-pre-wrap break-all">{msg.text}</p>
                    </div>
                  )}

                  {/* Reactions list pill under message bubble */}
                  {Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
                    <div
                      className={`absolute bottom-[-10px] bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 text-[9px] select-none z-10 cursor-pointer ${
                        msg.sender === 'me' ? 'right-2' : 'left-2'
                      }`}
                      title={msg.reactions.map((r) => `${r.user?.username || 'Người dùng'}: ${REACTION_EMOJIS[r.type]}`).join('\n')}
                    >
                      <span>
                        {Array.from(new Set(msg.reactions.map((r) => REACTION_EMOJIS[r.type]))).slice(0, 3).join('')}
                      </span>
                      {msg.reactions.length > 1 && (
                        <span className="text-gray-500 font-bold ml-0.5">{msg.reactions.length}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Reaction Trigger Button (visible on hover) */}
                <div
                  className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-0.5 shrink-0 gap-0.5 relative ${
                    msg.sender === 'me' ? 'order-first flex-row-reverse' : 'order-last flex-row'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSetReplyToMessage(msg)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 bg-white shadow-sm border border-gray-100 cursor-pointer"
                    title="Phản hồi"
                  >
                    <FaReply size={10} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveReactionMessageId(
                        activeReactionMessageId === msg._id ? null : msg._id
                      )
                    }
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 bg-white shadow-sm border border-gray-100 cursor-pointer"
                    title="Bày tỏ cảm xúc"
                  >
                    <AiOutlineSmile size={14} />
                  </button>

                  {/* Reactions bar popover */}
                  {activeReactionMessageId === msg._id && (
                    <div
                      className={`absolute bottom-full mb-1 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 flex items-center gap-1.5 z-[90] ${
                        msg.sender === 'me' ? 'right-0' : 'left-0'
                      }`}
                    >
                      {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            onToggleReaction?.(msg._id, type)
                            setActiveReactionMessageId(null)
                          }}
                          className="hover:scale-130 active:scale-95 transition text-sm cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`pointer-events-none absolute top-full mt-0.5 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] text-slate-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 z-10 ${
                    msg.sender === 'me' ? 'right-0' : 'left-8'
                  }`}
                >
                  {msg.fullTime || msg.time}
                </div>

                {msg.sender === 'me' && msg.deliveryStatus && (
                  <div className="absolute top-full right-0 mt-5 text-[9px] text-slate-400 font-medium">
                    {msg.deliveryStatus}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 p-3">
            {replyToMessage && (
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] text-slate-700 mb-2 border border-slate-200/50 animate-fade-in">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-900 block leading-tight">
                    Đang trả lời {replyToMessage.sender === 'me' ? 'chính mình' : selectedConversation.full_name}
                  </span>
                  <span className="truncate text-slate-500 block">
                    {replyToMessage.type === 'sticker' ? '[Nhãn dán]' : replyToMessage.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSetReplyToMessage(null)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 cursor-pointer transition shrink-0 ml-1.5"
                >
                  <AiOutlineClose size={14} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 relative">
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
                    onSendSticker?.(url)
                    setShowStickers(false)
                  }}
                  onClose={() => setShowStickers(false)}
                  className="absolute bottom-full right-0 mb-3"
                />
              )}

              <input
                value={messageInput}
                onChange={(e) => onChangeMessage(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Nhập tin nhắn..."
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                disabled={isSending || !String(messageInput || '').trim()}
                onClick={onSendMessage}
                className="p-1.5 text-primary-600 hover:text-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <AiOutlineSend size={18} />
              </button>
            </div>
          </div>

          {/* Mobile context menu bottom sheet */}
          {longPressedMessage && (
            <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/45 animate-fade-in md:hidden">
              <div className="absolute inset-0" onClick={() => setLongPressedMessage(null)} />
              <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl z-10 animate-slide-up pb-8 border-t border-slate-100">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3 px-1">Bày tỏ cảm xúc</p>
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2.5 mb-5 border border-slate-100/50">
                  {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onToggleReaction?.(longPressedMessage._id, type)
                        setLongPressedMessage(null)
                      }}
                      className="text-3xl active:scale-130 transition duration-150 p-1 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSetReplyToMessage(longPressedMessage)
                      setLongPressedMessage(null)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:bg-slate-100 cursor-pointer"
                  >
                    <span className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0">
                      <FaReply size={14} />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">Phản hồi tin nhắn</span>
                      <span className="text-xs text-slate-400 font-medium truncate max-w-[240px]">
                        "{longPressedMessage.text || (longPressedMessage.type === 'sticker' ? '[Nhãn dán]' : '')}"
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLongPressedMessage(null)}
                    className="w-full py-3.5 rounded-xl text-center text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ChatConversationWindow
