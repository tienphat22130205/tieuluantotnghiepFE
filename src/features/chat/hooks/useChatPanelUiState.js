import { useEffect, useMemo, useState } from 'react'

const useChatPanelUiState = ({ friends, onClose }) => {
  const [selectedFriendId, setSelectedFriendId] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    const handleSelectFriendEvent = (event) => {
      const { friendId } = event.detail || {}
      if (friendId) {
        setSelectedFriendId(friendId)
      }
    }
    window.addEventListener('chat:select-friend', handleSelectFriendEvent)
    return () => window.removeEventListener('chat:select-friend', handleSelectFriendEvent)
  }, [])

  const selectedConversation = useMemo(
    () => friends.find((item) => String(item._id) === String(selectedFriendId)) || null,
    [friends, selectedFriendId]
  )

  const handleClosePanel = () => {
    setSelectedFriendId(null)
    setMessageInput('')
    onClose()
  }

  const handleBackToList = () => {
    setSelectedFriendId(null)
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
