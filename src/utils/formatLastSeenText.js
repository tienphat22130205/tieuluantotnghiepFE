const formatLastSeenText = (value) => {
  if (!value) return 'Hoạt động gần đây'

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Hoạt động gần đây'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) return `Hoạt động ${diffMinutes} phút trước`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Hoạt động ${diffHours} giờ trước`

  const diffDays = Math.floor(diffHours / 24)
  return `Hoạt động ${diffDays} ngày trước`
}

export default formatLastSeenText
