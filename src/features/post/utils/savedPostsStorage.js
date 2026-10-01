import { getStoredAuthUser } from '@/utils/authStorage'
import postService from '../services/postService'

/**
 * Tạo storage key riêng biệt theo từng userId để tránh bị lẫn bài viết giữa các tài khoản khác nhau
 */
const getSavedPostsKey = () => {
  try {
    const raw = getStoredAuthUser()
    if (!raw) return 'zivo_saved_posts_guest'
    const u = typeof raw === 'string' ? JSON.parse(raw) : raw
    const userId = u?._id || u?.id
    return userId ? `zivo_saved_posts_${userId}` : 'zivo_saved_posts_guest'
  } catch {
    return 'zivo_saved_posts_guest'
  }
}

/**
 * Lấy toàn bộ danh sách bài viết đã lưu của tài khoản hiện tại từ localStorage
 */
export const getSavedPosts = () => {
  try {
    const key = getSavedPostsKey()
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error reading saved posts:', error)
    return []
  }
}

/**
 * Đồng bộ danh sách bài viết đã lưu từ Backend API vào localStorage
 */
export const fetchSavedPostsFromApi = async () => {
  try {
    const response = await postService.getSaved(1, 100)
    const payload = response?.data || response
    const items = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data?.items)
      ? payload.data.items
      : Array.isArray(payload)
      ? payload
      : []

    const key = getSavedPostsKey()
    localStorage.setItem(key, JSON.stringify(items))

    window.dispatchEvent(
      new CustomEvent('zivo_saved_posts_updated', {
        detail: { list: items },
      })
    )

    return items
  } catch (error) {
    console.warn('Could not sync saved posts from server:', error?.message)
    return getSavedPosts()
  }
}

/**
 * Kiểm tra xem 1 bài viết đã được lưu chưa
 */
export const isPostSaved = (postId) => {
  if (!postId) return false
  const list = getSavedPosts()
  return list.some((p) => String(p._id || p.id) === String(postId))
}

/**
 * Lưu hoặc bỏ lưu 1 bài viết cho tài khoản hiện tại (Cập nhật LocalStorage và gọi Backend API)
 */
export const toggleSavePost = (post) => {
  if (!post) return { saved: false, list: [] }
  const postId = String(post._id || post.id)
  const current = getSavedPosts()
  const exists = current.some((p) => String(p._id || p.id) === postId)

  let next
  if (exists) {
    next = current.filter((p) => String(p._id || p.id) !== postId)
  } else {
    // Thêm vào đầu mảng với thời điểm lưu
    next = [{ ...post, savedAt: new Date().toISOString() }, ...current]
  }

  // 1. Cập nhật ngay vào LocalStorage (Optimistic update)
  try {
    const key = getSavedPostsKey()
    localStorage.setItem(key, JSON.stringify(next))
    // Dispatch custom event để đồng bộ tức thì trên toàn giao diện
    window.dispatchEvent(
      new CustomEvent('zivo_saved_posts_updated', {
        detail: { postId, saved: !exists, list: next },
      })
    )
  } catch (err) {
    console.error('Error persisting saved posts locally:', err)
  }

  // 2. Gửi request lên Backend Database để lưu trữ vĩnh viễn
  postService.toggleSave(postId).catch((apiError) => {
    console.error('Failed to sync bookmark with backend:', apiError)
  })

  return { saved: !exists, list: next }
}
