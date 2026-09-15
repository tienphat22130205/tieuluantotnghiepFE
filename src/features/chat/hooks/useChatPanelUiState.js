import { useEffect, useMemo, useState } from 'react'
import { useChatHeadStore } from '../store/useChatHeadStore'

const useChatPanelUiState = ({ friends, onClose }) => {
  const [messageInput, setMessageInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')

  const {
    chatHeads,
    activeChatHeadId,
    openChatHead,
    minimizeChatHead,
    closeChatHead,
  } = useChatHeadStore()

  // Lắng nghe sự kiện khi người dùng click vào bạn bè ở bất kỳ đâu (RightSidebar, Profile, etc.)
  useEffect(() => {
    const handleSelectFriendEvent = (event) => {
      const { friendId, friend } = event.detail || {}
      const targetFriend =
        friend ||
        friends.find((item) => String(item._id || item.id) === String(friendId)) ||
        (friendId ? { _id: friendId, id: friendId } : null)

      if (targetFriend) {
        openChatHead(targetFriend)
      }
    }
    window.addEventListener('chat:select-friend', handleSelectFriendEvent)
    return () => window.removeEventListener('chat:select-friend', handleSelectFriendEvent)
  }, [friends, openChatHead])

  // Cuộc trò chuyện đang active và không bị thu nhỏ
  const activeHead = useMemo(() => {
    if (!activeChatHeadId) return null
    return (
      chatHeads.find(
        (h) => String(h.id) === String(activeChatHeadId) && !h.isMinimized
      ) || null
    )
  }, [chatHeads, activeChatHeadId])

  // Dữ liệu đối tượng bạn bè của cuộc trò chuyện đang mở
  const selectedConversation = useMemo(() => {
    if (!activeHead) return null
    const foundInFriends = friends.find(
      (item) => String(item._id || item.id) === String(activeHead.id)
    )
    return foundInFriends || activeHead.friend || null
  }, [friends, activeHead])

  // Khi bấm nút mũi tên (←) -> Thu nhỏ thành Avatar Bong bóng (Chat Head) ở góc phải
  const handleMinimize = () => {
    if (activeChatHeadId) {
      minimizeChatHead(activeChatHeadId)
    }
    setMessageInput('')
  }

  // Khi bấm dấu X trên khung chat -> Đóng và xóa hẳn avatar bubble khỏi góc phải
  const handleCloseConversation = () => {
    if (activeChatHeadId) {
      closeChatHead(activeChatHeadId)
    }
    setMessageInput('')
  }

  // Đóng drawer danh sách
  const handleClosePanel = () => {
    if (activeChatHeadId) {
      minimizeChatHead(activeChatHeadId)
    }
    setMessageInput('')
    onClose?.()
  }

  // Chọn bạn từ drawer danh sách
  const handleSelectFriend = (friendId) => {
    const targetFriend =
      friends.find((item) => String(item._id || item.id) === String(friendId)) ||
      { _id: friendId, id: friendId }
    openChatHead(targetFriend)
  }

  return {
    selectedConversation,
    messageInput,
    searchKeyword,
    setMessageInput,
    setSearchKeyword,
    handleClosePanel,
    handleMinimize,
    handleCloseConversation,
    handleSelectFriend,
  }
}

export default useChatPanelUiState
