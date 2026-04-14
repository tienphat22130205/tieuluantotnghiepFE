import { AiOutlineClose, AiOutlineArrowLeft, AiOutlineSend } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'

const ChatConversationWindow = ({
  isOpen,
  selectedConversation,
  messageInput,
  onBack,
  onClose,
  onChangeMessage,
}) => {
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

          <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/40">
            <div className="h-full flex items-center justify-center text-center text-sm text-gray-500">
              Chọn hội thoại để bắt đầu nhắn tin.
            </div>
          </div>

          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
              <input
                value={messageInput}
                onChange={(e) => onChangeMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button className="p-1.5 text-primary-600 hover:text-primary-700 transition">
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
