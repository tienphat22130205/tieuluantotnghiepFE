import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'
import formatLastSeenText from '@/utils/formatLastSeenText'

const formatMessageAge = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

const ChatFriendsListItem = ({ friend, onSelectFriend }) => {
  const { t } = usePreferences()
  const unreadCount = Number(friend.newMessagesCount || 0)
  const hasUnread = unreadCount > 0
  const rawPreview = friend.lastMessagePreview
  const previewText = rawPreview
    ? rawPreview.startsWith('Bạn: ')
      ? `${t('chat.you', 'Bạn:')} ${rawPreview.slice(5)}`
      : rawPreview
    : hasUnread
    ? `${unreadCount} ${t('chat.messages', 'tin nhắn')}`
    : t('chat.noMessages', 'Chưa có tin nhắn')
  const messageAge = formatMessageAge(friend.lastMessageAt)
  const previewWithAge = messageAge && rawPreview ? `${previewText} · ${messageAge}` : previewText

  return (
    <button
      key={friend._id}
      type="button"
      onClick={() => onSelectFriend(friend._id)}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left cursor-pointer"
    >
      <Avatar
        src={friend.avatar}
        name={friend.full_name}
        size="md"
        online={friend.isOnline}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-base truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-medium text-gray-900'}`}>
          {friend.full_name}
        </p>
        <p className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-800' : 'text-gray-500'}`}>
          {previewWithAge}
        </p>
      </div>
      {hasUnread && (
        <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
      )}
      {!hasUnread && (
        <span
          className={`text-[11px] font-medium whitespace-nowrap ${
            friend.isOnline ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          {friend.isOnline ? 'Đang hoạt động' : formatLastSeenText(friend.lastSeen)}
        </span>
      )}
    </button>
  )
}

export default ChatFriendsListItem
