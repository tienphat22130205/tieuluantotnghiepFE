import { useEffect, useMemo, useState } from 'react'

const useChatPanelUiState = ({ friends, onClose }) => {
  const [selectedFriendId, setSelectedFriendId] = useState(null)
  const [fallbackFriend, setFallbackFriend] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    const handleSelectFriendEvent = (event) => {
      const { friendId, friend } = event.detail || {}
      if (friendId) {
        setSelectedFriendId(friendId)
        if (friend) {
          setFallbackFriend(friend)
        }
      }
    }
    window.addEventListener('chat:select-friend', handleSelectFriendEvent)
    return () => window.removeEventListener('chat:select-friend', handleSelectFriendEvent)
  }, [])

  const selectedConversation = useMemo(() => {
    if (!selectedFriendId) return null
    return (
      friends.find((item) => String(item._id || item.id) === String(selectedFriendId)) ||
      fallbackFriend ||
      null
    )
  }, [friends, selectedFriendId, fallbackFriend])

  const handleClosePanel = () => {
    setSelectedFriendId(null)
    setFallbackFriend(null)
    setMessageInput('')
    onClose()
  }

  const handleBackToList = () => {
    setSelectedFriendId(null)
    setFallbackFriend(null)
    setMessageInput('')
  }

  const handleSelectFriend = (friendId) => {
    setSelectedFriendId(friendId)
  }

  return {
    selectedConversation,
    messageInput,
    searchKeyword,
    setMessageInput,
    setSearchKeyword,
    handleClosePanel,
    handleBackToList,
    handleSelectFriend,
  }
}

export default useChatPanelUiState
