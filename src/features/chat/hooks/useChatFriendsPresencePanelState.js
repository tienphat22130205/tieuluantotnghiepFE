import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import useChatFriendsInitialData from './useChatFriendsInitialData'
import useChatPanelUiState from './useChatPanelUiState'
import useChatPresenceRealtimeSync from './useChatPresenceRealtimeSync'
import useChatDirectConversationRuntime from './useChatDirectConversationRuntime'

const useChatFriendsPresencePanelState = ({ isOpen, onClose }) => {
  const token = useSelector((state) => state.auth.token)
  const { friends, setFriends, isLoading } = useChatFriendsInitialData({ isOpen })
  const {
    selectedConversation,
    messageInput,
    searchKeyword,
    setMessageInput,
    setSearchKeyword,
    handleClosePanel,
    handleBackToList,
    handleSelectFriend,
  } = useChatPanelUiState({ friends, onClose })

  useChatPresenceRealtimeSync({ isOpen, token, setFriends })
  const {
    isMessagesLoading,
    isSending,
    messages,
    sendMessage,
    sendSticker,
    toggleReaction,
    replyToMessage,
    setReplyToMessage,
  } = useChatDirectConversationRuntime({
    isOpen,
    selectedConversation,
    setFriends,
    messageInput,
    setMessageInput,
  })

  const filteredFriends = useMemo(() => {
    const keyword = String(searchKeyword || '').trim().toLowerCase()
    if (!keyword) return friends

    return friends.filter((friend) => {
      const fullName = String(friend?.full_name || '').toLowerCase()
      const username = String(friend?.username || '').toLowerCase()
      return fullName.includes(keyword) || username.includes(keyword)
    })
  }, [friends, searchKeyword])

  const sortedFriends = useMemo(() => {
    return [...filteredFriends].sort((a, b) => {
      const aLastMessageAt = new Date(a.lastMessageAt || 0).getTime()
      const bLastMessageAt = new Date(b.lastMessageAt || 0).getTime()
      if (aLastMessageAt !== bLastMessageAt) return bLastMessageAt - aLastMessageAt

      const aUnread = Number(a.newMessagesCount || 0)
      const bUnread = Number(b.newMessagesCount || 0)
      if (aUnread !== bUnread) return bUnread - aUnread

      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1

      const aLastSeen = new Date(a.lastSeen || 0).getTime()
      const bLastSeen = new Date(b.lastSeen || 0).getTime()
      return bLastSeen - aLastSeen
    })
  }, [filteredFriends])

  return {
    isLoading,
    sortedFriends,
    selectedConversation,
    messages,
    isMessagesLoading,
    isSending,
    messageInput,
    searchKeyword,
    setMessageInput,
    setSearchKeyword,
    sendMessage,
    sendSticker,
    toggleReaction,
    replyToMessage,
    setReplyToMessage,
    handleClosePanel,
    handleBackToList,
    handleSelectFriend,
  }
}

export default useChatFriendsPresencePanelState
