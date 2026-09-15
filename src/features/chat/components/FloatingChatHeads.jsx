import { useState } from 'react'
import { AiOutlineClose, AiOutlineEdit } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { useChatHeadStore } from '../store/useChatHeadStore'
import { usePresenceStore } from '../store/usePresenceStore'

const FloatingChatHeads = ({ onOpenNewChat }) => {
  const { chatHeads, activeChatHeadId, toggleChatHead, closeChatHead } = useChatHeadStore()
  const onlineFriends = usePresenceStore((state) => state.friends)
  const [hoveredHeadId, setHoveredHeadId] = useState(null)

  const handleOpenNew = () => {
    if (onOpenNewChat) {
      onOpenNewChat()
    } else {
      window.dispatchEvent(new CustomEvent('chat:open'))
    }
  }

  // Luôn hiển thị nút soạn tin nhắn tròn ở góc phải dưới cùng,
  // và các avatar bong bóng xếp dọc phía trên nó (giống hệt Facebook)
  return (
    <aside
      aria-label="Bong bóng trò chuyện"
      className="fixed bottom-20 md:bottom-5 right-4 md:right-5 z-[65] flex flex-col-reverse items-center gap-3 pointer-events-none select-none"
    >
      {/* 1. Nút soạn tin nhắn mới tròn (icon màu hệ thống) */}
      <button
        type="button"
        onClick={handleOpenNew}
        title="Tin nhắn mới / Tìm bạn bè trò chuyện"
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white dark:border-slate-800 cursor-pointer group"
      >
        <AiOutlineEdit size={22} className="transition-transform group-hover:scale-110" />
      </button>

      {/* 2. Danh sách các Avatar Bong bóng Chat (Chat Heads) */}
      {chatHeads.map((head) => {
        const friendId = String(head.id)
        const presenceFriend = onlineFriends.find((f) => String(f._id || f.id) === friendId)
        const isOnline = presenceFriend?.isOnline ?? head.friend?.isOnline ?? false
        const isActive = String(activeChatHeadId) === friendId && !head.isMinimized
        const displayName =
          head.friend?.full_name ||
          head.friend?.fullName ||
          head.friend?.name ||
          head.friend?.username ||
          'Bạn bè'

        return (
          <div
            key={friendId}
            onMouseEnter={() => setHoveredHeadId(friendId)}
            onMouseLeave={() => setHoveredHeadId(null)}
            className="pointer-events-auto relative group"
          >
            {/* Tooltip tên người bạn khi hover (nằm bên trái bong bóng) */}
            <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 dark:bg-slate-800/95 px-2.5 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-10">
              {displayName}
            </div>

            {/* Nút X nhỏ xóa nhanh bong bóng chat khi hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                closeChatHead(friendId)
              }}
              title="Đóng cuộc trò chuyện này"
              className="absolute -top-1 -left-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-white shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer border border-white/40"
            >
              <AiOutlineClose size={11} />
            </button>

            {/* Bong bóng Avatar */}
            <button
              type="button"
              onClick={() => toggleChatHead(friendId)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 cursor-pointer shadow-xl ${
                isActive
                  ? 'ring-3 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900 scale-105'
                  : 'hover:scale-110 active:scale-95'
              }`}
            >
              <Avatar
                src={head.friend?.avatar}
                name={displayName}
                size="md"
                online={isOnline}
                className="h-12 w-12 rounded-full border-2 border-white dark:border-slate-800 object-cover"
              />

              {/* Badge đếm số lượng tin nhắn chưa đọc (chấm đỏ như trong ảnh mẫu) */}
              {head.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold text-white shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
                  {head.unreadCount > 99 ? '99+' : head.unreadCount}
                </span>
              )}
            </button>
          </div>
        )
      })}
    </aside>
  )
}

export default FloatingChatHeads
