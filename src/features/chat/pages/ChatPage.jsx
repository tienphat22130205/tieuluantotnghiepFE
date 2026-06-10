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
import formatLastSeenText from '@/utils/formatLastSeenText'
import useChatFriendsInitialData from '@/features/chat/hooks/useChatFriendsInitialData'
import useChatPresenceRealtimeSync from '@/features/chat/hooks/useChatPresenceRealtimeSync'
import useChatDirectConversationRuntime from '@/features/chat/hooks/useChatDirectConversationRuntime'
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


const ChatPage = () => {
  const token = useSelector((state) => state.auth.token)
  const { user } = useSelector((state) => state.auth)
  const currentUserId = String(user?._id || user?.id || '')
  const navigate = useNavigate()

  // Load and sync initial list of friends (chats)
  const { friends, setFriends, isLoading: isFriendsLoading } = useChatFriendsInitialData({ isOpen: true })
  useChatPresenceRealtimeSync({ isOpen: true, token, setFriends })

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
  const longPressTimeout = useRef(null)

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
    isOpen: true,
    selectedConversation,
    setFriends,
    messageInput,
    setMessageInput,
  })

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

  const isChatActive = selectedFriendId !== null

  return (
    <div className="w-screen h-screen bg-slate-50 flex overflow-hidden">
      
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
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

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
            </div>

            {/* Chat Body */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                messages.map((msg) => (
                  <div
                    key={msg._id || `${msg.sender}-${msg.createdAt}`}
                    id={`msg-${msg._id}`}
                    className={`group relative flex items-end gap-2.5 mb-6 ${
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
                    <div className="relative flex flex-col max-w-[65%]">
                      {msg.replyTo && (
                        <div
                          className={`mb-1 px-3 py-1.5 rounded-2xl text-xs flex flex-col max-w-full opacity-85 border select-none cursor-pointer hover:opacity-100 transition-opacity ${
                            msg.sender === 'me'
                              ? 'bg-primary-700/40 text-slate-100 border-primary-500/20 rounded-br-none'
                              : 'bg-slate-100 text-slate-600 border-slate-200 rounded-bl-none'
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
                          <span className="font-bold text-[10px] text-primary-600">
                            {msg.replyTo.sender?._id === currentUserId
                              ? 'Bạn'
                              : msg.replyTo.sender?.firstName
                              ? `${msg.replyTo.sender.firstName} ${msg.replyTo.sender.lastName || ''}`.trim()
                              : 'Người dùng'}
                          </span>
                          <span className="truncate max-w-[200px]">
                            {msg.replyTo.type === 'sticker' ? '[Nhãn dán]' : msg.replyTo.content}
                          </span>
                        </div>
                      )}

                      {msg.type === 'sticker' && msg.sticker ? (
                        <div
                          className="relative my-0.5"
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
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                            msg.sender === 'me'
                              ? 'bg-primary-600 text-white rounded-br-md font-medium'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                          }`}
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

                    <div
                      className={`pointer-events-none absolute bottom-full mb-1 rounded-lg bg-slate-800 text-white px-2 py-1 text-[10px] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap z-10 ${
                        msg.sender === 'me' ? 'right-0' : 'left-8'
                      }`}
                    >
                      {msg.fullTime || msg.time}
                    </div>

                    {/* Display delivery status under last message */}
                    {msg.sender === 'me' && msg.deliveryStatus && (
                      <span className="text-[10px] text-slate-400 absolute top-full mt-1 right-0 font-medium">
                        {msg.deliveryStatus}
                      </span>
                    )}
                  </div>
                ))}
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
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/45 animate-fade-in md:hidden">
          <div className="absolute inset-0" onClick={() => setLongPressedMessage(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl z-10 animate-slide-up pb-8 border-t border-slate-100">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3 px-1">Bày tỏ cảm xúc</p>
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2.5 mb-5 border border-slate-100/50">
              {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    toggleReaction?.(longPressedMessage._id, type)
                    setLongPressedMessage(null)
                  }}
                  className="text-3xl active:scale-130 transition duration-150 p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setReplyToMessage(longPressedMessage)
                  setLongPressedMessage(null)
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:bg-slate-100 cursor-pointer"
              >
                <span className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0">
                  <FaReply size={14} />
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">Phản hồi tin nhắn</span>
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[240px]">
                    "{longPressedMessage.text || (longPressedMessage.type === 'sticker' ? '[Nhãn dán]' : '')}"
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLongPressedMessage(null)}
                className="w-full py-3.5 rounded-xl text-center text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage
