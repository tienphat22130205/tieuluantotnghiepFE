import { AiOutlineClose, AiOutlineArrowLeft, AiOutlineExpand } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'

const ChatPanelHeader = ({
  selectedConversation,
  onBack,
  onClose,
  onMakeCall,
  onExpand,
  isUnread = false,
}) => {
  if (!selectedConversation) return null

  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onBack}
          title="Thu nhỏ thành bong bóng chat"
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
        >
          <AiOutlineArrowLeft size={18} />
        </button>
        <Avatar
          src={selectedConversation.avatar}
          name={selectedConversation.full_name}
          size="sm"
          online={selectedConversation.isOnline}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {selectedConversation.full_name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {selectedConversation.isOnline
              ? 'Đang hoạt động'
              : formatLastSeenText(selectedConversation.lastSeen)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onMakeCall?.(selectedConversation, true)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          title="Gọi video"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onMakeCall?.(selectedConversation, false)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          title="Gọi thoại"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.194-4.176-7-7l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onExpand}
          title="Mở rộng trang chat"
          className="hidden md:inline-flex p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
        >
          <AiOutlineExpand size={16} />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Đóng cuộc trò chuyện"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
        >
          <AiOutlineClose size={16} />
        </button>
      </div>
    </div>
  )
}

export default ChatPanelHeader
