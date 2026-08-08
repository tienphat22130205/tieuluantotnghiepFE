import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import useChatFriendsInitialData from './useChatFriendsInitialData'
import useChatPanelUiState from './useChatPanelUiState'
import { useChatStore } from '../store/useChatStore'
import { usePresenceStore } from '../store/usePresenceStore'
import { getSocket } from '@/services/socketClient'

const useChatFriendsPresencePanelState = ({ isOpen, onClose }) => {
  const token = useSelector((state) => state.auth.token)
  const { user } = useSelector((state) => state.auth)
  const currentUserId = String(user?._id || user?.id || '')

  const { friends, isLoading } = useChatFriendsInitialData({ isOpen })
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

  const {
    messages,
    isMessagesLoading,
    isSending,
    replyToMessage,
    openConversation,
    closeConversation,
    sendMessage: storeSendMessage,
    sendSticker: storeSendSticker,
    toggleReaction: storeToggleReaction,
    setReplyToMessage,
  } = useChatStore()

  const selectedFriendId = selectedConversation?._id || selectedConversation?.id || null

  useEffect(() => {
    if (selectedFriendId && selectedConversation) {
      openConversation(selectedConversation, token, currentUserId)
    } else {
      closeConversation(getSocket(token))
    }
  }, [selectedFriendId, token, currentUserId])

  const sendMessage = () => {
    const content = String(messageInput || '').trim()
    if (!content) return
    storeSendMessage(content, currentUserId, user?.username)
    setMessageInput('')
  }

  const sendSticker = (stickerUrl) => {
    storeSendSticker(stickerUrl, currentUserId, user?.username)
  }

  const toggleReaction = (messageId, emojiType) => {
    storeToggleReaction(messageId, emojiType, currentUserId, user?.username)
  }

  const filteredFriends = useMemo(() => {
    const keyword = String(searchKeyword || '').trim().toLowerCase()
    if (!keyword) return friends

    return friends.filter((friend) => {
      const fullName = String(friend?.full_name || friend?.fullName || '').toLowerCase()
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

  const unfilteredSortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
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
  }, [friends])

  const viewMessages = useMemo(() => {
    return useChatStore.getState().getViewMessages(currentUserId)
  }, [messages, currentUserId])

  return {
    isLoading,
    sortedFriends,
    unfilteredSortedFriends,
    selectedConversation,
    messages: viewMessages,
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
