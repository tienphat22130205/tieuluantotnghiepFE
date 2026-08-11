import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * Avatar Component – Hình đại diện người dùng.
 *
 * Props:
 *   - src:       URL ảnh avatar
 *   - name:      Tên người dùng (hiện chữ cái đầu nếu không có ảnh)
 *   - size:      'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   - to:        Link đến profile (nếu có)
 *   - online:    boolean – Hiện chấm xanh online
 *   - className: Thêm custom classes (vd: ring-4 ring-white)
 */
const Avatar = ({
  src,
  name = '',
  size = 'md',
  to,
  online = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false)

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-36 h-36 text-4xl',
  }

  const avatarSrc = resolveMediaUrl(src)

  // Lấy chữ cái đầu tiên của tên
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const avatarContent = (
    <div className="relative inline-block">
      {avatarSrc && !imgError ? (
        <img
          src={avatarSrc}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]} rounded-full
            bg-blue-100 text-blue-700
            flex items-center justify-center
            font-bold border-2 border-white shadow-sm
            ${className}
          `}
        >
          {initials || '?'}
        </div>
      )}

      {/* Chấm online */}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
      )}
    </div>
  )

  // Nếu có link → wrap bằng Link
  if (to) {
    return (
      <Link to={to} className="hover:opacity-80 transition-opacity">
        {avatarContent}
      </Link>
    )
  }

  return avatarContent
}

export default Avatar
