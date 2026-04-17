import { useEffect, useRef } from 'react'
import { AiOutlineClose, AiOutlineArrowLeft, AiOutlineSend } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'

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
}) => {
  const messagesContainerRef = useRef(null)

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
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <AiOutlineClose size={16} />
            </button>
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
                className={`group relative mb-5 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'me' && (
                  <div className="mr-2 mt-auto">
                    <Avatar
                      src={selectedConversation.avatar}
                      name={selectedConversation.full_name}
                      size="xs"
                      online={false}
                    />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender === 'me'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                <div
                  className={`pointer-events-none absolute top-full mt-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] text-slate-700 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 ${
                    msg.sender === 'me' ? 'right-0' : 'left-0'
                  }`}
                >
                  {msg.fullTime || msg.time}
                </div>

                {msg.sender === 'me' && msg.deliveryStatus && (
                  <div className="absolute top-full right-0 mt-6 text-[11px] text-slate-500">
                    {msg.deliveryStatus}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
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
                className="p-1.5 text-primary-600 hover:text-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <AiOutlineSend size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatConversationWindow
