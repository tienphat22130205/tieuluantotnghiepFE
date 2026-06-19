import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import useGroupChat from '../hooks/useGroupChat'
import { Avatar } from '@/components/ui'
import { AiOutlineSend } from 'react-icons/ai'

const GroupChat = ({ groupId }) => {
  const { messages, sendMessage } = useGroupChat(groupId)
  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    try {
      await sendMessage(text)
      setText('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[550px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <span className="text-3xl">💬</span>
            <p className="text-xs font-normal">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const sender = msg.sender || {}
            const senderId = sender._id || sender.id || msg.sender
            const isMe = String(senderId) === String(currentUserId)
            
            // Show avatar & name if not me and previous message is not by same sender
            const prevMsg = index > 0 ? messages[index - 1] : null
            const prevSenderId = prevMsg ? (prevMsg.sender?._id || prevMsg.sender?.id || prevMsg.sender) : null
            const showSenderHeader = !isMe && String(senderId) !== String(prevSenderId)

            return (
              <div key={msg._id || msg.id || index} className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {/* Other user avatar */}
                {!isMe && (
                  <div className="w-8 shrink-0 pt-0.5">
                    {showSenderHeader ? (
                      <Avatar src={sender.avatar} name={sender.full_name} size="sm" />
                    ) : (
                      <div className="w-8 h-8" /> // Spacer for alignment
                    )}
                  </div>
                )}

                {/* Message Box */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {showSenderHeader && (
                    <span className="text-[10px] font-bold text-slate-500 mb-0.5 ml-1">
                      {sender.full_name || 'Thành viên'}
                    </span>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-2 text-xs font-normal shadow-xs ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-all">{msg.content}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-white/75' : 'text-slate-400'}`}>
                      {formatTime(msg.createdAt || msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập nội dung tin nhắn..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition shrink-0 shadow-md shadow-primary-500/10"
        >
          <AiOutlineSend size={16} />
        </button>
      </form>
    </div>
  )
}

export default GroupChat
