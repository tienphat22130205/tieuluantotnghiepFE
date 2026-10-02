import { Avatar } from '@/components/ui'
import { FaReply } from 'react-icons/fa'
import { FiPhone, FiVideo, FiPhoneOff, FiPhoneMissed } from 'react-icons/fi'
import { AiOutlineSmile } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { REACTION_EMOJIS, getStatusLabel } from '../constants/chatConstants'

const ChatMessageItem = ({
  msg,
  index,
  totalMessages,
  currentUserId,
  selectedConversation,
  isSelected,
  activeReactionMessageId,
  onToggleDetails,
  onReply,
  onToggleReaction,
  onOpenReactionPicker,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
}) => {
  const msgId = msg._id || msg.id || `local-${index}`
  const isLast = index === totalMessages - 1

  return (
    <div className="flex flex-col w-full">
      {/* Centered time when selected */}
      {isSelected && (
        <div className="w-full flex justify-center mb-2.5 select-none animate-fade-in">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/50 shadow-sm">
            {msg.fullTime || msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
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
            src={selectedConversation?.avatar}
            name={selectedConversation?.full_name}
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
                  {msg.sender === 'me' ? 'Bạn' : selectedConversation?.full_name} đã trả lời{' '}
                  {msg.replyTo.sender?._id === currentUserId
                    ? msg.sender === 'me' ? 'chính mình' : 'bạn'
                    : selectedConversation?.full_name}
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
              onClick={onToggleDetails}
              onTouchStart={onTouchStart?.(msg)}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchMove}
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
              onClick={onToggleDetails}
              onTouchStart={onTouchStart?.(msg)}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchMove}
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
              onClick={onToggleDetails}
              onTouchStart={onTouchStart?.(msg)}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchMove}
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
            onClick={() => onReply(msg)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 bg-white shadow-sm border border-gray-200 cursor-pointer"
            title="Phản hồi"
          >
            <FaReply size={12} />
          </button>

          <button
            type="button"
            onClick={() => onOpenReactionPicker(msg._id)}
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
                    onToggleReaction(msg._id, type)
                    onOpenReactionPicker(null)
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
}

export default ChatMessageItem
