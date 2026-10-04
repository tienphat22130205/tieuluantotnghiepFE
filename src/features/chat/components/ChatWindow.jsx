import { AiOutlineArrowLeft, AiOutlineMessage } from 'react-icons/ai'
import { FiPhone, FiVideo } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import formatLastSeenText from '@/utils/formatLastSeenText'
import ChatMessageItem from './ChatMessageItem'
import ChatInputBar from './ChatInputBar'

const ChatWindow = ({
  isChatActive,
  selectedConversation,
  messages,
  isMessagesLoading,
  currentUserId,
  messagesContainerRef,
  selectedMessageId,
  setSelectedMessageId,
  activeReactionMessageId,
  setActiveReactionMessageId,
  replyToMessage,
  setReplyToMessage,
  messageInput,
  setMessageInput,
  showStickers,
  setShowStickers,
  isSending,
  onBackToList,
  onMakeCall,
  onSendMessage,
  onSendImage,
  onSendSticker,
  onToggleReaction,
  onInputKeyDown,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
}) => {
  return (
    <main
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
                type="button"
                onClick={onBackToList}
                className="md:hidden p-1.5 -ml-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
                onClick={() => onMakeCall(selectedConversation, true)}
                className="p-2 rounded-full text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition cursor-pointer"
                title="Gọi video"
              >
                <FiVideo size={20} />
              </button>
              <button
                type="button"
                onClick={() => onMakeCall(selectedConversation, false)}
                className="p-2 rounded-full text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition cursor-pointer"
                title="Gọi thoại"
              >
                <FiPhone size={20} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/30"
          >
            {isMessagesLoading && (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                Đang tải tin nhắn...
              </div>
            )}

            {!isMessagesLoading && messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <p className="text-sm font-medium">Hãy gửi lời chào đầu tiên để bắt đầu cuộc trò chuyện!</p>
              </div>
            )}

            {!isMessagesLoading &&
              messages.map((msg, index) => {
                const msgId = msg._id || msg.id || `local-${index}`
                const isSelected = selectedMessageId === msgId

                return (
                  <ChatMessageItem
                    key={msgId}
                    msg={msg}
                    index={index}
                    totalMessages={messages.length}
                    currentUserId={currentUserId}
                    selectedConversation={selectedConversation}
                    isSelected={isSelected}
                    activeReactionMessageId={activeReactionMessageId}
                    onToggleDetails={() => setSelectedMessageId((prev) => (prev === msgId ? null : msgId))}
                    onReply={(m) => setReplyToMessage(m)}
                    onToggleReaction={onToggleReaction}
                    onOpenReactionPicker={(id) => setActiveReactionMessageId(id)}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onTouchMove={onTouchMove}
                  />
                )
              })}
          </div>

          {/* Input Box */}
          <ChatInputBar
            replyToMessage={replyToMessage}
            selectedConversation={selectedConversation}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            showStickers={showStickers}
            setShowStickers={setShowStickers}
            isSending={isSending}
            onSendMessage={onSendMessage}
            onSendImage={onSendImage}
            onSendSticker={onSendSticker}
            onCancelReply={() => setReplyToMessage(null)}
            onInputKeyDown={onInputKeyDown}
          />
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
    </main>
  )
}

export default ChatWindow
