import { useMemo, useState } from 'react'
import {
  AiOutlineClockCircle,
  AiOutlineClose,
  AiOutlineArrowLeft,
  AiOutlineSend,
} from 'react-icons/ai'
import { Avatar } from '@/components/ui'

const mockConversations = [
  { id: 1, name: 'Tiến Phát', message: 'Hello bro, tối nay code tiếp không?', avatar: 'https://i.pravatar.cc/150?img=33', online: true },
  { id: 2, name: 'Khánh Huyền', message: 'Mình vừa gửi tài liệu rồi nha', avatar: 'https://i.pravatar.cc/150?img=47', online: false },
  { id: 3, name: 'Lê Huyền', message: 'UI login nhìn ổn rồi đó', avatar: 'https://i.pravatar.cc/150?img=44', online: true },
  { id: 4, name: 'Thảo Nhiên', message: 'Mai họp nhóm lúc 8h nhé', avatar: 'https://i.pravatar.cc/150?img=15', online: false },
]

const mockMessages = {
  1: [
    { id: 'm1', sender: 'them', text: 'Hello bro, tối nay code tiếp không?', time: '20:10' },
    { id: 'm2', sender: 'me', text: 'Có nha, mình đang làm phần chat UI đây.', time: '20:11' },
    { id: 'm3', sender: 'them', text: 'Ok ngon, có gì gửi mình review nhé.', time: '20:12' },
  ],
  2: [
    { id: 'm4', sender: 'them', text: 'Mình vừa gửi tài liệu rồi nha', time: '19:35' },
    { id: 'm5', sender: 'me', text: 'Mình nhận được rồi, cảm ơn bạn.', time: '19:36' },
  ],
  3: [
    { id: 'm6', sender: 'them', text: 'UI login nhìn ổn rồi đó', time: '18:20' },
    { id: 'm7', sender: 'me', text: 'Oke để mình polish thêm 1 chút.', time: '18:22' },
  ],
  4: [
    { id: 'm8', sender: 'them', text: 'Mai họp nhóm lúc 8h nhé', time: '17:10' },
    { id: 'm9', sender: 'me', text: 'Ok đúng 8h mình có mặt.', time: '17:11' },
  ],
}

const ChatConversationsPanel = ({ isOpen, onClose }) => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageInput, setMessageInput] = useState('')

  const selectedMessages = useMemo(() => {
    if (!selectedConversation) return []
    return mockMessages[selectedConversation.id] || []
  }, [selectedConversation])

  const handleClose = () => {
    setSelectedConversation(null)
    setMessageInput('')
    onClose()
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
    setMessageInput('')
  }

  return (
    <>
      <div
        onClick={handleClose}
        className={`hidden md:block fixed inset-0 bg-black/10 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 z-40 pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'
        }`}
      />

      <div
        className={`hidden md:flex fixed top-14 right-0 h-[calc(100vh-56px)] w-[360px] bg-white border-l border-gray-200 shadow-2xl z-[60] flex-col transition-transform duration-300 ease-out ${
          isOpen && !selectedConversation ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Đoạn chat</h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <AiOutlineClose size={16} />
          </button>
        </div>

        <div className="overflow-y-auto py-1">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left cursor-pointer"
            >
              <Avatar
                src={conversation.avatar}
                name={conversation.name}
                size="md"
                online={conversation.online}
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-gray-900 truncate">{conversation.name}</p>
                <p className="text-sm text-gray-500 truncate">{conversation.message}</p>
              </div>
              <AiOutlineClockCircle size={14} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      <div
        className={`hidden md:flex fixed right-4 bottom-4 h-[460px] w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[70] flex-col transition-all duration-300 ease-out origin-bottom-right ${
          isOpen && selectedConversation ? 'translate-x-0 translate-y-0 opacity-100 scale-100' : 'translate-x-10 translate-y-6 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {selectedConversation && (
          <>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToList}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <AiOutlineArrowLeft size={18} />
                </button>
                <Avatar
                  src={selectedConversation.avatar}
                  name={selectedConversation.name}
                  size="sm"
                  online={selectedConversation.online}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedConversation.name}</p>
                  <p className="text-xs text-gray-500">{selectedConversation.online ? 'Đang hoạt động' : 'Hoạt động gần đây'}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <AiOutlineClose size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/40">
              {selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender === 'me'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`mt-1 text-[11px] ${msg.sender === 'me' ? 'text-primary-100' : 'text-gray-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-3">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button className="p-1.5 text-primary-600 hover:text-primary-700 transition">
                  <AiOutlineSend size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default ChatConversationsPanel
