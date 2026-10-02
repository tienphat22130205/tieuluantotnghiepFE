export const formatMessageAge = (value) => {
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

export const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

export const getStatusLabel = (status) => {
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
