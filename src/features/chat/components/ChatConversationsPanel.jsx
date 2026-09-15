import useChatFriendsPresencePanelState from '../hooks/useChatFriendsPresencePanelState'
import ChatFriendsListPanel from './panel/ChatFriendsListPanel'
import ChatConversationWindow from './panel/ChatConversationWindow'
import FloatingChatHeads from './FloatingChatHeads'

const ChatConversationsPanel = ({ isOpen, onClose }) => {
  const {
    isLoading,
    sortedFriends,
    unfilteredSortedFriends,
    selectedConversation,
    messages,
    isMessagesLoading,
    isSending,
    messageInput,
    searchKeyword,
    sendMessage,
    sendSticker,
    toggleReaction,
    setMessageInput,
    setSearchKeyword,
    handleClosePanel,
    handleMinimize,
    handleCloseConversation,
    handleSelectFriend,
    replyToMessage,
    setReplyToMessage,
  } = useChatFriendsPresencePanelState({ isOpen, onClose })

  return (
    <>
      {/* Nền mờ chỉ xuất hiện khi mở Drawer danh sách bạn bè */}
      <div
        onClick={handleClosePanel}
        className={`hidden md:block fixed inset-0 bg-black/10 transition-opacity duration-300 ${
          isOpen && !selectedConversation
            ? 'opacity-100 z-40 pointer-events-auto'
            : 'opacity-0 -z-10 pointer-events-none'
        }`}
      />

      {/* Drawer Danh sách các cuộc trò chuyện */}
      <ChatFriendsListPanel
        isOpen={isOpen}
        selectedConversation={selectedConversation}
        isLoading={isLoading}
        sortedFriends={sortedFriends}
        unfilteredSortedFriends={unfilteredSortedFriends}
        searchKeyword={searchKeyword}
        onChangeSearch={setSearchKeyword}
        onClose={handleClosePanel}
        onSelectFriend={handleSelectFriend}
      />

      {/* Cửa sổ Trò chuyện: Mũi tên (←) thu nhỏ thành bong bóng, Dấu (X) xóa hoàn toàn */}
      <ChatConversationWindow
        isOpen={Boolean(selectedConversation)}
        selectedConversation={selectedConversation}
        messages={messages}
        isMessagesLoading={isMessagesLoading}
        isSending={isSending}
        messageInput={messageInput}
        onBack={handleMinimize}
        onClose={handleCloseConversation}
        onSendMessage={sendMessage}
        onChangeMessage={setMessageInput}
        onSendSticker={sendSticker}
        onToggleReaction={toggleReaction}
        replyToMessage={replyToMessage}
        onSetReplyToMessage={setReplyToMessage}
      />

      {/* Bong bóng Chat (Chat Heads) ở góc dưới bên phải màn hình */}
      <FloatingChatHeads onOpenNewChat={() => window.dispatchEvent(new CustomEvent('chat:open'))} />
    </>
  )
}

export default ChatConversationsPanel
