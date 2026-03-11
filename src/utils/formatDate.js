/**
 * Format ngày giờ để hiển thị trên giao diện.
 *
 * Ví dụ:
 *   formatDate('2026-02-08T10:30:00Z')  →  '08/02/2026'
 *   timeAgo('2026-02-08T10:30:00Z')     →  '2 giờ trước'
 */

// Format chuẩn: dd/mm/yyyy
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Format đầy đủ: dd/mm/yyyy hh:mm
export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Thời gian tương đối: "vừa xong", "5 phút trước", "2 ngày trước"
export const timeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'năm', seconds: 31536000 },
    { label: 'tháng', seconds: 2592000 },
    { label: 'tuần', seconds: 604800 },
    { label: 'ngày', seconds: 86400 },
    { label: 'giờ', seconds: 3600 },
    { label: 'phút', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label} trước`
    }
  }

  return 'Vừa xong'
}
