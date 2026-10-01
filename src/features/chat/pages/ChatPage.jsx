import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useChatFriendsInitialData from '@/features/chat/hooks/useChatFriendsInitialData'
import { useChatStore } from '@/features/chat/store/useChatStore'
import { useCallStore } from '@/features/chat/store/useCallStore'
import { usePresenceStore } from '@/features/chat/store/usePresenceStore'
import { getSocket } from '@/services/socketClient'
import userService from '@/features/user/services/userService'
import ChatSidebar from '../components/ChatSidebar'
import ChatWindow from '../components/ChatWindow'
import ChatMobileContextMenu from '../components/ChatMobileContextMenu'

const ChatPage = () => {
  const token = useSelector((state) => state.auth.token)
  const { user } = useSelector((state) => state.auth)
  const currentUserId = String(user?._id || user?.id || '')
  const navigate = useNavigate()

  // Load and sync initial list of friends (chats)
  const { isLoading: isFriendsLoading } = useChatFriendsInitialData({ isOpen: true })
  const friends = usePresenceStore((state) => state.friends)

  // Search params tracking for active conversation
  const [searchParams, setSearchParams] = useSearchParams()
  const friendIdFromUrl = searchParams.get('friendId') || searchParams.get('userId')
  const selectedFriendId = friendIdFromUrl || null

  const setSelectedFriendId = useCallback((friendId) => {
    if (friendId) {
      setSearchParams({ friendId })
    } else {
      setSearchParams({})
    }
  }, [setSearchParams])

  // Fallback profile if chatting with user not in friends list yet
  const [targetUserFallback, setTargetUserFallback] = useState(null)

  useEffect(() => {
    if (!selectedFriendId) {
      setTargetUserFallback(null)
      return
    }
    const found = friends.find((item) => String(item._id || item.id) === String(selectedFriendId))
    if (!found) {
      userService
        .getProfile(selectedFriendId)
        .then((res) => {
          const p = res?.data || res
          if (p) {
            setTargetUserFallback({
              _id: p._id || p.id || selectedFriendId,
              id: p._id || p.id || selectedFriendId,
              full_name:
                p.full_name ||
                p.fullName ||
                `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
                p.username ||
                'Người dùng',
              username: p.username || '',
              avatar: p.avatar || null,
              isOnline: Boolean(p.isOnline),
            })
          }
        })
        .catch(() => {})
    }
  }, [selectedFriendId, friends])

  const allConversations = useMemo(() => {
    if (targetUserFallback && !friends.some((f) => String(f._id || f.id) === String(targetUserFallback._id))) {
      return [targetUserFallback, ...friends]
    }
    return friends
  }, [friends, targetUserFallback])

  // Get current active conversation
  const selectedConversation = useMemo(
    () => allConversations.find((item) => String(item._id || item.id) === String(selectedFriendId)) || null,
    [allConversations, selectedFriendId]
  )

  const [messageInput, setMessageInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null)
  const [longPressedMessage, setLongPressedMessage] = useState(null)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0)
  const longPressTimeout = useRef(null)

  useEffect(() => {
    if (!window.visualViewport) return

    const handleResize = () => {
      setViewportHeight(window.visualViewport.height)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize)

    handleResize()

    return () => {
      window.visualViewport.removeEventListener('resize', handleResize)
      window.visualViewport.removeEventListener('scroll', handleResize)
    }
  }, [])

  const handleTouchStart = (msg) => () => {
    if (window.innerWidth >= 768) return
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current)
    longPressTimeout.current = setTimeout(() => {
      setLongPressedMessage(msg)
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50)
        } catch (_err) {}
      }
    }, 600)
  }

  const handleTouchEnd = () => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current)
  }

  const handleTouchMove = () => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current)
  }

  const { makeCall } = useCallStore()

  const {
    messages: rawMessages,
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

  const messages = useMemo(() => {
    return useChatStore.getState().getViewMessages(currentUserId)
  }, [rawMessages, currentUserId])

  const activeSelectedFriendId = selectedConversation?._id || selectedConversation?.id || null

  useEffect(() => {
    if (activeSelectedFriendId && selectedConversation) {
      openConversation(selectedConversation, token, currentUserId)
    } else {
      closeConversation(getSocket(token))
    }
  }, [activeSelectedFriendId, token, currentUserId, openConversation, closeConversation, selectedConversation])

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

  // Scroll messages viewport to bottom
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
    sendMessage()
  }

  // Filter & sort list of friends based on active search keyword and message recency
  const filteredFriends = useMemo(() => {
    const keyword = String(searchKeyword || '').trim().toLowerCase()
    if (!keyword) return allConversations

    return allConversations.filter((friend) => {
      const fullName = String(friend?.full_name || '').toLowerCase()
      const username = String(friend?.username || '').toLowerCase()
      return fullName.includes(keyword) || username.includes(keyword)
    })
  }, [allConversations, searchKeyword])

  const sortFriendsList = (list) => {
    return [...list].sort((a, b) => {
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
  }

  const sortedFriends = useMemo(() => sortFriendsList(filteredFriends), [filteredFriends])
  const unfilteredSortedFriends = useMemo(() => sortFriendsList(allConversations), [allConversations])

  const isChatActive = selectedFriendId !== null

  return (
    <div
      style={{ height: `${viewportHeight}px` }}
      className="w-screen bg-slate-50 flex overflow-hidden"
    >
      {/* ── Left Pane: Conversations List ── */}
      <ChatSidebar
        isChatActive={isChatActive}
        isFriendsLoading={isFriendsLoading}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        selectedFriendId={selectedFriendId}
        setSelectedFriendId={setSelectedFriendId}
        user={user}
        unfilteredSortedFriends={unfilteredSortedFriends}
        sortedFriends={sortedFriends}
        onBackHome={() => navigate('/')}
      />

      {/* ── Right Pane: Chat Window / Placeholder ── */}
      <ChatWindow
        isChatActive={isChatActive}
        selectedConversation={selectedConversation}
        messages={messages}
        isMessagesLoading={isMessagesLoading}
        currentUserId={currentUserId}
        messagesContainerRef={messagesContainerRef}
        selectedMessageId={selectedMessageId}
        setSelectedMessageId={setSelectedMessageId}
        activeReactionMessageId={activeReactionMessageId}
        setActiveReactionMessageId={setActiveReactionMessageId}
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        showStickers={showStickers}
        setShowStickers={setShowStickers}
        isSending={isSending}
        onBackToList={() => setSelectedFriendId(null)}
        onMakeCall={makeCall}
        onSendMessage={sendMessage}
        onSendSticker={sendSticker}
        onToggleReaction={toggleReaction}
        onInputKeyDown={handleInputKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      />

      {/* Mobile context menu bottom sheet */}
      <ChatMobileContextMenu
        longPressedMessage={longPressedMessage}
        onClose={() => setLongPressedMessage(null)}
        onReaction={toggleReaction}
        onReply={(msg) => setReplyToMessage(msg)}
      />
    </div>
  )
}

export default ChatPage
