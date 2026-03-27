const trimTrailingSlash = (value) => value.replace(/\/$/, '')

const getApiOrigin = () => {
  const envApiUrl = import.meta.env.VITE_API_URL

  if (envApiUrl) {
    return trimTrailingSlash(envApiUrl)
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000`
  }

  return 'http://localhost:5000'
}

/**
 * Chuẩn hóa URL ảnh trả từ backend.
 * - URL tuyệt đối: giữ nguyên
 * - Đường dẫn tương đối (/uploads/...): ghép với API origin
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  if (/^(https?:\/\/|blob:|data:)/i.test(url)) {
    return url
  }

  if (url.startsWith('/')) {
    return `${getApiOrigin()}${url}`
  }

  return `${getApiOrigin()}/${url}`
}

export default resolveMediaUrl
