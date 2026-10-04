import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useCallStore } from '@/features/chat/store/useCallStore'
import { usePreferences } from '@/context/PreferencesContext'
import ChatMobileContextMenu from '../ChatMobileContextMenu'
import ChatPanelHeader from './ChatPanelHeader'
import ChatPanelMessageItem from './ChatPanelMessageItem'
import ChatPanelInputBar from './ChatPanelInputBar'

const ChatConversationWindow = ({
  isOpen,
  selectedConversation,
  messages = [],
  isMessagesLoading = false,
  isSending = false,
  messageInput = '',
  onBack,
  onClose,
  onSendMessage,
  onSendImage,
  onChangeMessage,
  onSendSticker,
  replyToMessage = null,
  onSetReplyToMessage = () => {},
  isUnread = false,
  onMarkAsRead = () => {},
}) => {
  const { user } = useSelector((state) => state.auth)
  const { makeCall } = useCallStore()
  const { t } = usePreferences()
  const navigate = useNavigate()

  const currentUserId = String(user?._id || user?.id || '')
  const messagesContainerRef = useRef(null)
  const longPressTimeout = useRef(null)

  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null)
  const [longPressedMessage, setLongPressedMessage] = useState(null)
  const [selectedMessageId, setSelectedMessageId] = useState(null)

  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0)
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0)

  // Track visual viewport for mobile keyboards
  useEffect(() => {
    if (!window.visualViewport) return

    const handleResize = () => {
      setViewportHeight(window.visualViewport.height)
      setViewportOffsetTop(window.visualViewport.offsetTop)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize)
    handleResize()

    return () => {
      window.visualViewport.removeEventListener('resize', handleResize)
      window.visualViewport.removeEventListener('scroll', handleResize)
    }
  }, [])

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (!selectedConversation?._id || isMessagesLoading) return
    const container = messagesContainerRef.current
    if (!container) return

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight
    })
  }, [isMessagesLoading, messages, selectedConversation?._id])

  // Mobile long-press handlers
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

  const getStatusText = (status) => {
    if (!status) return ''
    switch (status) {
      case 'Đã xem':
      case 'Seen':
        return t('chat.statusSeen', 'Đã xem')
      case 'Đang gửi':
      case 'Sending...':
        return t('chat.statusSending', 'Đang gửi...')
      case 'Gửi lỗi':
      case 'Failed':
        return t('chat.statusFailed', 'Gửi lỗi')
      case 'Đã gửi':
      case 'Sent':
        return t('chat.statusSent', 'Đã gửi')
      default:
        return status
    }
  }

  const handleExpandToFullChat = () => {
    onClose?.()
    navigate(`/chat?friendId=${selectedConversation._id}`)
  }

  return (
    <div
      style={typeof window !== 'undefined' && window.innerWidth < 768 ? {
        height: `${viewportHeight}px`,
        top: `${viewportOffsetTop}px`,
        bottom: 'auto',
      } : {}}
      onClick={isUnread ? onMarkAsRead : undefined}
      onFocusCapture={isUnread ? onMarkAsRead : undefined}
      className={`fixed inset-0 z-[70] flex flex-col bg-white transition-all duration-300 ease-out md:inset-auto md:right-20 md:bottom-5 md:h-[480px] md:w-[340px] md:border md:border-gray-200 md:rounded-2xl md:shadow-2xl md:origin-bottom-right ${
        isOpen && selectedConversation
          ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
          : 'translate-x-10 translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {selectedConversation && (
        <>
          {/* Header */}
          <ChatPanelHeader
            selectedConversation={selectedConversation}
            onBack={onBack}
            onClose={onClose}
            onMakeCall={makeCall}
            onExpand={handleExpandToFullChat}
            isUnread={isUnread}
          />

          {/* Messages Body */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/40">
            {isMessagesLoading && (
              <div className="h-full flex items-center justify-center text-center text-sm text-gray-500">
                {t('chat.loadingMessages', 'Đang tải tin nhắn...')}
              </div>
            )}

            {!isMessagesLoading && messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center text-sm text-gray-500">
                {t('chat.noMessagesGreet', 'Chưa có tin nhắn nào. Hãy gửi lời chào trước.')}
              </div>
            )}

            {!isMessagesLoading && messages.map((msg, index) => {
              const msgId = msg._id || `${msg.sender}-${msg.createdAt}`
              const isSelected = selectedMessageId === msgId

              return (
                <ChatPanelMessageItem
                  key={msgId}
                  msg={msg}
                  index={index}
                  totalMessages={messages.length}
                  currentUserId={currentUserId}
                  selectedConversation={selectedConversation}
                  isSelected={isSelected}
                  activeReactionMessageId={activeReactionMessageId}
                  setActiveReactionMessageId={setActiveReactionMessageId}
                  onToggleDetails={() => setSelectedMessageId((prev) => (prev === msgId ? null : msgId))}
                  onReply={(m) => onSetReplyToMessage(m)}
                  onReaction={(mId, type) => onToggleReaction?.(mId, type)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  getStatusText={getStatusText}
                />
              )
            })}
          </div>

          {/* Input Bar */}
          <ChatPanelInputBar
            replyToMessage={replyToMessage}
            onClearReply={() => onSetReplyToMessage(null)}
            selectedConversation={selectedConversation}
            messageInput={messageInput}
            onChangeMessage={onChangeMessage}
            onSendMessage={onSendMessage}
            onSendImage={onSendImage}
            onSendSticker={onSendSticker}
            isSending={isSending}
          />

          {/* Mobile context menu bottom sheet */}
          <ChatMobileContextMenu
            longPressedMessage={longPressedMessage}
            onClose={() => setLongPressedMessage(null)}
            onReaction={(mId, type) => onToggleReaction?.(mId, type)}
            onReply={(msg) => onSetReplyToMessage(msg)}
          />
        </>
      )}
    </div>
  )
}

export default ChatConversationWindow
