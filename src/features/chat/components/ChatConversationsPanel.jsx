import useChatFriendsPresencePanelState from '../hooks/useChatFriendsPresencePanelState'
import ChatFriendsListPanel from './panel/ChatFriendsListPanel'
import ChatConversationWindow from './panel/ChatConversationWindow'

const ChatConversationsPanel = ({ isOpen, onClose }) => {
  const {
    isLoading,
    sortedFriends,
    selectedConversation,
    messages,
    isMessagesLoading,
    isSending,
    messageInput,
    searchKeyword,
    sendMessage,
    setMessageInput,
    setSearchKeyword,
    handleClosePanel,
    handleBackToList,
    handleSelectFriend,
  } = useChatFriendsPresencePanelState({ isOpen, onClose })

  return (
    <>
      <div
        onClick={handleClosePanel}
        className={`hidden md:block fixed inset-0 bg-black/10 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 z-40 pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'
        }`}
      />

      <ChatFriendsListPanel
        isOpen={isOpen}
        selectedConversation={selectedConversation}
        isLoading={isLoading}
        sortedFriends={sortedFriends}
        searchKeyword={searchKeyword}
        onChangeSearch={setSearchKeyword}
        onClose={handleClosePanel}
        onSelectFriend={handleSelectFriend}
      />

      <ChatConversationWindow
        isOpen={isOpen}
        selectedConversation={selectedConversation}
        messages={messages}
        isMessagesLoading={isMessagesLoading}
        isSending={isSending}
        messageInput={messageInput}
        onBack={handleBackToList}
        onClose={handleClosePanel}
        onSendMessage={sendMessage}
        onChangeMessage={setMessageInput}
      />
    </>
  )
}

export default ChatConversationsPanel
