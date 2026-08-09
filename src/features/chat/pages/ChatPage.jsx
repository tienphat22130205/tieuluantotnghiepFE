import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  AiOutlineSearch,
  AiOutlineSend,
  AiOutlineMessage,
  AiOutlineArrowLeft,
  AiOutlineExpand,
  AiOutlineSmile,
  AiOutlineClose,
} from 'react-icons/ai'

import { Avatar } from '@/components/ui'
import { FaReply } from 'react-icons/fa'
import { FiPhone, FiVideo, FiPhoneOff, FiPhoneMissed } from 'react-icons/fi'
import formatLastSeenText from '@/utils/formatLastSeenText'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import useChatFriendsInitialData from '@/features/chat/hooks/useChatFriendsInitialData'
import { useChatStore } from '@/features/chat/store/useChatStore'
import { useCallStore } from '@/features/chat/store/useCallStore'
import { usePresenceStore } from '@/features/chat/store/usePresenceStore'
import { getSocket } from '@/services/socketClient'
import StickerPicker from '../components/StickerPicker'

const formatMessageAge = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes} phút`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày`
}

const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}


const getStatusLabel = (status) => {
  if (!status) return ''
  switch (status) {
    case 'Đã xem':
      return 'Seen'
    case 'Đang gửi':
      return 'Sending...'
    case 'Gửi lỗi':
      return 'Failed'
    case 'Đã gửi':
      return 'Sent'
    default:
      return status
  }
}

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
  const friendIdFromUrl = searchParams.get('friendId')
  const selectedFriendId = friendIdFromUrl || null

  const setSelectedFriendId = useCallback((friendId) => {
    if (friendId) {
      setSearchParams({ friendId })
    } else {
      setSearchParams({})
    }
  }, [setSearchParams])

  // Get current active conversation
  const selectedConversation = useMemo(
    () => friends.find((item) => String(item._id) === String(selectedFriendId)) || null,
    [friends, selectedFriendId]
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

  const handleTouchStart = (msg) => (e) => {
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
  }, [activeSelectedFriendId, token, currentUserId])

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

  const isChatActive = selectedFriendId !== null

  return (
    <div
      style={{ height: `${viewportHeight}px` }}
      className="w-screen bg-slate-50 flex overflow-hidden"
    >
      
      {/* ── Left Pane: Conversations List ── */}
      <div
        className={`w-full md:w-80 lg:w-[360px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full ${
          isChatActive ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              title="Quay lại trang chủ"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <AiOutlineArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-slate-900">Đoạn chat</h1>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2">
            <AiOutlineSearch size={16} className="text-slate-400" />
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Horizontal Friends List */}
        {!isFriendsLoading && unfilteredSortedFriends.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-4 overflow-x-auto border-b border-slate-100 bg-white shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Create Story Placeholder */}
            <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
              <div className="relative">
                <Avatar
                  src={user?.avatar}
                  name={user?.full_name}
                  size="lg"
                  online={false}
                  className="ring-2 ring-slate-100 group-hover:scale-105 transition"
                />
                <div className="absolute bottom-0 right-0 bg-primary-600 border border-white rounded-full p-0.5 flex items-center justify-center text-white">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium max-w-[64px] text-center truncate mt-0.5">
                Tạo tin
              </span>
            </div>

            {/* Friends Loop */}
            {unfilteredSortedFriends.map((friend) => {
              const displayName = friend.full_name?.split(' ').slice(-2).join(' ') || friend.username || 'Bạn bè'
              return (
                <button
                  key={`h-page-${friend._id}`}
                  type="button"
                  onClick={() => setSelectedFriendId(friend._id)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group focus:outline-none"
                >
                  <div className="relative">
                    <Avatar
                      src={friend.avatar}
                      name={friend.full_name}
                      size="lg"
                      online={friend.isOnline}
                      className="group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-slate-700 font-medium max-w-[64px] text-center truncate mt-0.5">
                    {displayName}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isFriendsLoading && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Đang tải danh sách...
            </div>
          )}

          {!isFriendsLoading && sortedFriends.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              {searchKeyword.trim() ? 'Không tìm thấy kết quả.' : 'Chưa có bạn bè nào.'}
            </div>
          )}

          {!isFriendsLoading &&
            sortedFriends.map((friend) => {
              const unreadCount = Number(friend.newMessagesCount || 0)
              const hasUnread = unreadCount > 0
              const isSelected = String(friend._id) === String(selectedFriendId)
              const previewText = hasUnread
                ? `${unreadCount} tin nhắn mới`
                : friend.lastMessagePreview
                ? friend.lastMessagePreview
                : 'Chưa có tin nhắn'
              const messageAge = formatMessageAge(friend.lastMessageAt)
              const previewWithAge = messageAge ? `${previewText} · ${messageAge}` : previewText

              return (
                <button
                  key={friend._id}
                  type="button"
                  onClick={() => setSelectedFriendId(friend._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition text-left ${
                    isSelected ? 'bg-primary-50/70 border-l-4 border-primary-600 pl-3' : 'hover:bg-slate-50'
                  }`}
                >
                  <Avatar
                    src={friend.avatar}
                    name={friend.full_name}
                    size="md"
                    online={friend.isOnline}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <p
                        className={`text-sm truncate ${
                          hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {friend.full_name}
                      </p>
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        hasUnread ? 'font-bold text-primary-700' : 'text-slate-500'
                      }`}
                    >
                      {previewWithAge}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-600 shrink-0" />
                  )}
                </button>
              )
            })}
        </div>
      </div>

      {/* ── Right Pane: Chat Window / Placeholder ── */}
      <div
        className={`flex-1 bg-slate-50/50 flex flex-col h-full ${
          !isChatActive ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedFriendId(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Quay lại danh sách"
                >
                  <AiOutlineArrowLeft size={20} />
                </button>
                <Avatar
                  src={selectedConversation.avatar}
                  name={selectedConversation.full_name}
                  size="md"
                  online={selectedConversation.isOnline}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {selectedConversation.full_name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedConversation.isOnline
                      ? 'Đang hoạt động'
                      : formatLastSeenText(selectedConversation.lastSeen)}
                  </p>
                </div>
              </div>

              {/* Call buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => makeCall(selectedConversation, true)}
                  className="p-2 rounded-full text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition cursor-pointer"
                  title="Gọi video"
                >
                  <FiVideo size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => makeCall(selectedConversation, false)}
                  className="p-2 rounded-full text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition cursor-pointer"
                  title="Gọi thoại"
                >
                  <FiPhone size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30">
              {isMessagesLoading && (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">
                  Đang tải tin nhắn...
                </div>
              )}

              {!isMessagesLoading && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                    <AiOutlineMessage size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Chưa có tin nhắn</h3>
                  <p className="text-xs text-slate-500 max-w-[200px]">
                    Hãy gửi lời chào đầu tiên để bắt đầu trò chuyện.
                  </p>
                </div>
              )}

              {!isMessagesLoading &&
                messages.map((msg, index) => {
                  const msgId = msg._id || `${msg.sender}-${msg.createdAt}`
                  const isSelected = selectedMessageId === msgId
                  const isLast = index === messages.length - 1
                  const handleToggleMessageDetails = () => {
                    setSelectedMessageId((prev) => (prev === msgId ? null : msgId))
                  }

                  return (
                    <div key={msgId} className="flex flex-col w-full">
                      {/* Centered time when selected */}
                      {isSelected && (
                        <div className="w-full flex justify-center mb-2.5 select-none animate-fade-in">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/50 shadow-sm">
                            {msg.fullTime || msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '')}
                          </span>
                        </div>
                      )}

                      <div
                        id={`msg-${msg._id}`}
                        className={`group relative flex items-end gap-2.5 mb-4 ${
                          msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {msg.sender !== 'me' && (
                          <Avatar
                            src={selectedConversation.avatar}
                            name={selectedConversation.full_name}
                            size="xs"
                            online={false}
                            className="mb-1 shrink-0"
                          />
                        )}

                        {/* Message Bubble or Sticker Content */}
                        <div className={`relative flex flex-col max-w-[65%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                          {msg.replyTo && (
                            <>
                              {/* Reply Label */}
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1 select-none whitespace-nowrap">
                                <FaReply size={10} className="scale-x-[-1]" />
                                <span>
                                  {msg.sender === 'me' ? 'Bạn' : (selectedConversation.full_name)} đã trả lời{' '}
                                  {msg.replyTo.sender?._id === currentUserId
                                    ? (msg.sender === 'me' ? 'chính mình' : 'bạn')
                                    : (selectedConversation.full_name)}
                                </span>
                              </div>

                              {/* Parent Message Bubble */}
                              <div
                                className={`mb-1 px-3 py-1.5 rounded-2xl text-xs max-w-full opacity-60 border select-none cursor-pointer hover:opacity-85 transition bg-slate-100 text-slate-600 border-slate-200 ${
                                  msg.sender === 'me' ? 'rounded-br-none' : 'rounded-bl-none'
                                }`}
                                onClick={() => {
                                  const element = document.getElementById(`msg-${msg.replyTo._id}`)
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    element.classList.add('bg-primary-50', 'animate-pulse')
                                    setTimeout(() => {
                                      element.classList.remove('bg-primary-50', 'animate-pulse')
                                    }, 1500)
                                  }
                                }}
                              >
                                <p className="truncate max-w-[200px] leading-tight">
                                  {msg.replyTo.type === 'sticker' ? '[Nhãn dán]' : msg.replyTo.content}
                                </p>
                              </div>
                            </>
                          )}

                          {msg.storyReply && msg.storyReply.storyId && (
                            <div
                              className={`mb-1 relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 group/story shadow-sm select-none cursor-pointer hover:brightness-95 transition-all ${
                                msg.sender === 'me' ? 'rounded-br-none' : 'rounded-bl-none'
                              }`}
                              style={{
                                width: '100px',
                                height: '150px',
                              }}
                            >
                              {msg.storyReply.bgColor ? (
                                <div
                                  className="w-full h-full flex items-center justify-center p-2 text-center"
                                  style={{ background: msg.storyReply.bgColor }}
                                >
                                  <span className="text-[8px] font-bold line-clamp-6 break-words text-white">
                                    {msg.storyReply.textContent}
                                  </span>
                                </div>
                              ) : msg.storyReply.mediaType === 'video' ? (
                                <video
                                  src={resolveMediaUrl(msg.storyReply.mediaUrl)}
                                  className="w-full h-full object-cover filter blur-[1.5px] opacity-80"
                                  muted
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={resolveMediaUrl(msg.storyReply.mediaUrl)}
                                  alt="Story reply preview"
                                  className="w-full h-full object-cover filter blur-[1.5px] opacity-80"
                                />
                              )}

                              {/* Blurry gradient / overlay */}
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex flex-col justify-between p-2">
                                <span className="text-[8px] text-white/95 font-bold bg-black/55 rounded-full px-1.5 py-0.5 self-start border border-white/5 whitespace-nowrap">
                                  Phản hồi tin
                                </span>
                                <span className="text-[7px] text-slate-300 font-medium truncate">
                                  {msg.storyReply.mediaType === 'video' ? 'Video' : msg.storyReply.bgColor ? 'Văn bản' : 'Hình ảnh'}
                                </span>
                              </div>
                            </div>
                          )}

                          {msg.type === 'call' || (msg.text && msg.text.includes('Cuộc gọi')) ? (
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold border flex items-center gap-2 shadow-sm select-none cursor-pointer hover:opacity-90 transition ${
                                msg.text?.includes('nhỡ') || msg.text?.includes('từ chối')
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : msg.sender === 'me'
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                              onClick={handleToggleMessageDetails}
                              onTouchStart={handleTouchStart(msg)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                            >
                              {msg.text?.includes('video') ? (
                                <FiVideo size={16} />
                              ) : msg.text?.includes('nhỡ') ? (
                                <FiPhoneMissed size={16} />
                              ) : msg.text?.includes('từ chối') ? (
                                <FiPhoneOff size={16} />
                              ) : (
                                <FiPhone size={16} />
                              )}
                              <span>{msg.text}</span>
                            </div>
                          ) : msg.type === 'sticker' && msg.sticker ? (
                            <div
                              className="relative my-0.5 cursor-pointer hover:opacity-90 active:scale-98 transition select-none"
                              onClick={handleToggleMessageDetails}
                              onTouchStart={handleTouchStart(msg)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                            >
                              <img
                                src={msg.sticker}
                                alt="Sticker"
                                className={`object-contain select-none rounded-lg ${
                                  msg.sticker.includes('giphy.com')
                                    ? 'max-w-[200px] max-h-[200px] md:max-w-[240px] md:max-h-[240px] shadow-sm border border-slate-100 bg-slate-50/20 p-1'
                                    : 'w-24 h-24'
                                }`}
                              />
                            </div>
                          ) : (
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed cursor-pointer hover:opacity-95 active:scale-98 transition ${
                                msg.sender === 'me'
                                  ? 'bg-primary-600 text-white rounded-br-md font-medium'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                              }`}
                              onClick={handleToggleMessageDetails}
                              onTouchStart={handleTouchStart(msg)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                            >
                              <p className="whitespace-pre-wrap break-all">{msg.text}</p>
                            </div>
                          )}

                          {/* Reactions list pill under message bubble */}
                          {Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
                            <div
                              className={`absolute bottom-[-10px] bg-white border border-slate-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 text-[10px] select-none z-10 cursor-pointer ${
                                msg.sender === 'me' ? 'right-3' : 'left-3'
                              }`}
                              title={msg.reactions.map((r) => `${r.user?.username || 'Người dùng'}: ${REACTION_EMOJIS[r.type]}`).join('\n')}
                            >
                              <span>
                                {Array.from(new Set(msg.reactions.map((r) => REACTION_EMOJIS[r.type]))).slice(0, 3).join('')}
                              </span>
                              {msg.reactions.length > 1 && (
                                <span className="text-gray-500 font-bold ml-0.5">{msg.reactions.length}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Reaction Trigger Button (visible on hover) */}
                        <div
                          className={`opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center px-0.5 shrink-0 gap-1 relative ${
                            msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setReplyToMessage(msg)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 bg-white shadow-sm border border-gray-200 cursor-pointer"
                            title="Phản hồi"
                          >
                            <FaReply size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveReactionMessageId(
                                activeReactionMessageId === msg._id ? null : msg._id
                              )
                            }
                            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 bg-white shadow-sm border border-gray-200 cursor-pointer"
                            title="Bày tỏ cảm xúc"
                          >
                            <AiOutlineSmile size={15} />
                          </button>

                          {/* Reactions bar popover */}
                          {activeReactionMessageId === msg._id && (
                            <div
                              className={`absolute bottom-full mb-1.5 bg-white border border-gray-200 rounded-full shadow-lg px-2.5 py-1 flex items-center gap-2 z-[90] ${
                                msg.sender === 'me' ? 'right-0' : 'left-0'
                              }`}
                            >
                              {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    toggleReaction?.(msg._id, type)
                                    setActiveReactionMessageId(null)
                                  }}
                                  className="hover:scale-130 active:scale-95 transition text-base cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display delivery status under selected/last message */}
                      {msg.sender === 'me' && msg.deliveryStatus && (
                        <div className={`w-full flex justify-end transition-all duration-200 select-none ${
                          isSelected || isLast ? 'h-4 opacity-100 mb-2' : 'h-0 opacity-0 overflow-hidden pointer-events-none'
                        }`}>
                          <span className="text-[10px] text-slate-400 font-medium pr-3.5">
                            {getStatusLabel(msg.deliveryStatus)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Input Box */}
            <div className="border-t border-slate-200 p-4 bg-white">
              {replyToMessage && (
                <div className="flex items-center justify-between rounded-xl bg-slate-150 px-4 py-2 text-xs text-slate-700 mb-2.5 border border-slate-200/50 animate-fade-in">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block">
                      Đang trả lời {replyToMessage.sender === 'me' ? 'chính mình' : selectedConversation.full_name}
                    </span>
                    <span className="truncate text-slate-500 block">
                      {replyToMessage.type === 'sticker' ? '[Nhãn dán]' : replyToMessage.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyToMessage(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 cursor-pointer transition shrink-0 ml-2"
                  >
                    <AiOutlineClose size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-4 pr-2 py-1.5 relative">
                <button
                  type="button"
                  onClick={() => setShowStickers((prev) => !prev)}
                  className={`p-1.5 text-gray-400 hover:text-primary-600 transition shrink-0 cursor-pointer ${showStickers ? 'text-primary-600' : ''}`}
                  title="Nhãn dán"
                >
                  <AiOutlineSmile size={20} />
                </button>

                {/* Sticker picker popover */}
                {showStickers && (
                  <StickerPicker
                    onSelectSticker={(url) => {
                      sendSticker?.(url)
                      setShowStickers(false)
                    }}
                    onClose={() => setShowStickers(false)}
                    className="absolute bottom-full left-0 mb-3"
                  />
                )}

                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Nhập tin nhắn..."
                  className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  disabled={isSending || !String(messageInput || '').trim()}
                  onClick={sendMessage}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <AiOutlineSend size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4 shadow-sm border border-primary-100">
              <AiOutlineMessage size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Hộp thư Zivo</h2>
            <p className="text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
              Chọn một người bạn từ danh sách bên trái hoặc truy cập trang cá nhân của họ để bắt đầu trò chuyện.
            </p>
          </div>
        )}
      </div>

      {/* Mobile context menu bottom sheet */}
      {longPressedMessage && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end bg-black/60 animate-fade-in md:hidden">
          {/* Overlay to close */}
          <div className="absolute inset-0" onClick={() => setLongPressedMessage(null)} />
          
          <div className="relative z-10 w-full bg-[#1c1c1e] rounded-t-3xl px-5 pt-6 pb-8 shadow-2xl border-t border-zinc-800 animate-slide-up flex flex-col gap-6">
            
            {/* Handle/bar at top */}
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-2" />

            {/* Emoji Reactions pill */}
            <div className="flex items-center justify-between bg-zinc-800/80 backdrop-blur-md rounded-full px-4 py-2.5 mx-auto max-w-md w-full border border-zinc-700/50 shadow-lg">
              {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    toggleReaction?.(longPressedMessage._id, type)
                    setLongPressedMessage(null)
                  }}
                  className="text-2xl active:scale-140 hover:scale-110 transition p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                className="text-zinc-400 bg-zinc-700/50 hover:bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition"
                title="Thêm cảm xúc"
              >
                <span className="text-lg font-bold leading-none">+</span>
              </button>
            </div>

            {/* Action buttons row */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setReplyToMessage(longPressedMessage)
                  setLongPressedMessage(null)
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
              >
                <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-primary-400">
                  <FaReply size={16} />
                </div>
                <span className="text-xs font-semibold">Reply</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(longPressedMessage.text || '')
                  setLongPressedMessage(null)
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
              >
                <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold">Copy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  // Translate placeholder
                  setLongPressedMessage(null)
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
              >
                <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 0A18.015 18.015 0 0110 14.828M10 14.828a18.01 18.01 0 01-3.588-5.83M10 14.828l-1.84 3.7m0 0a17.98 17.98 0 01-1.301-3.7m1.301 3.7H3m18-3H15v1.5a1.5 1.5 0 001.5 1.5H19v2.5M15 19v-4.5"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold">Translate</span>
              </button>

              <button
                type="button"
                onClick={() => setLongPressedMessage(null)}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/30 transition cursor-pointer"
              >
                <div className="p-3 bg-zinc-800/60 rounded-full flex items-center justify-center text-amber-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold">More</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage
