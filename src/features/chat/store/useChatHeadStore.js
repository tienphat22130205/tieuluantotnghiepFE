import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChatHeadStore = create(
  persist(
    (set, get) => ({
      chatHeads: [], // Array of: { id, friend, isMinimized, unreadCount }
      activeChatHeadId: null,

      // Mở một cuộc trò chuyện (từ liên hệ, bạn bè hoặc click vào bubble)
      openChatHead: (friend) => {
        if (!friend) return
        const friendId = String(friend._id || friend.id)
        if (!friendId) return

        const currentHeads = get().chatHeads
        const existingIndex = currentHeads.findIndex((h) => String(h.id) === friendId)
        let updatedHeads

        if (existingIndex > -1) {
          // Nếu đã có trong danh sách: mở ra và đưa lên đầu/cuối, xóa badge chưa đọc
          updatedHeads = currentHeads.map((h) =>
            String(h.id) === friendId
              ? {
                  ...h,
                  friend: { ...h.friend, ...friend },
                  isMinimized: false,
                  unreadCount: 0,
                }
              : h
          )
        } else {
          // Giới hạn tối đa 4 bong bóng chat để không tràn màn hình
          const trimmed = currentHeads.length >= 4 ? currentHeads.slice(1) : currentHeads
          updatedHeads = [
            ...trimmed,
            {
              id: friendId,
              friend,
              isMinimized: false,
              unreadCount: 0,
            },
          ]
        }

        set({
          chatHeads: updatedHeads,
          activeChatHeadId: friendId,
        })
      },

      // Thu nhỏ khung chat thành avatar bubble (ấn nút mũi tên ←)
      minimizeChatHead: (friendId) => {
        const targetId = String(friendId)
        set((state) => ({
          chatHeads: state.chatHeads.map((h) =>
            String(h.id) === targetId ? { ...h, isMinimized: true } : h
          ),
          activeChatHeadId:
            String(state.activeChatHeadId) === targetId ? null : state.activeChatHeadId,
        }))
      },

      // Toggle mở/thu nhỏ khi click trực tiếp vào avatar bubble
      toggleChatHead: (friendId) => {
        const targetId = String(friendId)
        const targetHead = get().chatHeads.find((h) => String(h.id) === targetId)
        if (!targetHead) return

        if (!targetHead.isMinimized && String(get().activeChatHeadId) === targetId) {
          // Đang mở -> thu nhỏ lại
          get().minimizeChatHead(targetId)
        } else {
          // Đang thu nhỏ -> mở to ra
          set((state) => ({
            chatHeads: state.chatHeads.map((h) =>
              String(h.id) === targetId
                ? { ...h, isMinimized: false, unreadCount: 0 }
                : h
            ),
            activeChatHeadId: targetId,
          }))
        }
      },

      // Đóng hoàn toàn và xoá bỏ avatar bubble khỏi góc phải (ấn dấu X)
      closeChatHead: (friendId) => {
        const targetId = String(friendId)
        set((state) => ({
          chatHeads: state.chatHeads.filter((h) => String(h.id) !== targetId),
          activeChatHeadId:
            String(state.activeChatHeadId) === targetId ? null : state.activeChatHeadId,
        }))
      },

      // Đóng tất cả bong bóng chat
      closeAllChatHeads: () => {
        set({ chatHeads: [], activeChatHeadId: null })
      },

      // Tăng số lượng tin nhắn chưa đọc cho bong bóng đang thu nhỏ
      incrementUnread: (friendId) => {
        const targetId = String(friendId)
        set((state) => ({
          chatHeads: state.chatHeads.map((h) =>
            String(h.id) === targetId &&
            (h.isMinimized || String(state.activeChatHeadId) !== targetId)
              ? { ...h, unreadCount: (h.unreadCount || 0) + 1 }
              : h
          ),
        }))
      },

      // Xóa số lượng chưa đọc khi đã xem
      markHeadAsRead: (friendId) => {
        const targetId = String(friendId)
        set((state) => ({
          chatHeads: state.chatHeads.map((h) =>
            String(h.id) === targetId ? { ...h, unreadCount: 0 } : h
          ),
        }))
      },
    }),
    {
      name: 'zivo-chat-heads',
      partialize: (state) => ({
        chatHeads: state.chatHeads.map((h) => ({
          ...h,
          isMinimized: true, // Khi tải lại trang thì để ở trạng thái thu nhỏ
        })),
        activeChatHeadId: null,
      }),
    }
  )
)
