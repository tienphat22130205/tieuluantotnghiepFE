import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * Avatar Component – Hình đại diện người dùng (luôn là hình tròn hoàn hảo).
 *
 * Props:
 *   - src:       URL ảnh avatar
 *   - name:      Tên người dùng (hiện chữ cái đầu nếu không có ảnh)
 *   - size:      'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
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
    xs: 'w-6 h-6 min-w-6 min-h-6 text-xs',
    sm: 'w-8 h-8 min-w-8 min-h-8 text-sm',
    md: 'w-10 h-10 min-w-10 min-h-10 text-sm',
    lg: 'w-14 h-14 min-w-14 min-h-14 text-lg',
    xl: 'w-20 h-20 min-w-20 min-h-20 text-2xl',
    '2xl': 'w-24 h-24 sm:w-36 sm:h-36 min-w-24 min-h-24 sm:min-w-36 sm:min-h-36 text-3xl sm:text-4xl',
  }

  const avatarSrc = resolveMediaUrl(src)

  // Lấy chữ cái đầu tiên của tên
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const dotSizes = {
    xs: 'w-2 h-2 border-[1.5px]',
    sm: 'w-2.5 h-2.5 border-2',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4.5 h-4.5 border-[2.5px]',
    '2xl': 'w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-[3px]',
  }

  const dotSizeClass = dotSizes[size] || dotSizes.md
  const defaultSizeClass = className.includes('w-') ? '' : (sizes[size] || sizes.md)

  const avatarContent = (
    <div
      className={`relative inline-flex shrink-0 aspect-square items-center justify-center rounded-full border-0 outline-none ring-0 select-none ${defaultSizeClass} ${className}`}
      style={{ border: 'none', outline: 'none' }}
    >
      {/* Khung avatar tròn hoàn hảo (overflow-hidden nằm tại đây để không cắt xén chấm online) */}
      <div
        className="w-full h-full aspect-square rounded-full overflow-hidden flex items-center justify-center shrink-0 border-0 outline-none ring-0"
        style={{ border: 'none', outline: 'none' }}
      >
        {avatarSrc && !imgError ? (
          <img
            src={avatarSrc}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full aspect-square rounded-full object-cover border-0 outline-none ring-0 block shrink-0"
            style={{ border: 'none', outline: 'none' }}
          />
        ) : (
          <div
            className="w-full h-full aspect-square rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold border-0 outline-none ring-0 shrink-0"
            style={{ border: 'none', outline: 'none' }}
          >
            {initials || '?'}
          </div>
        )}
      </div>

      {/* Chấm online hoàn chỉnh, không bị bo cắt góc */}
      {online && (
        <span
          className={`absolute bottom-0 right-0 bg-emerald-500 border-white dark:border-slate-900 rounded-full z-10 shadow-xs pointer-events-none ${dotSizeClass}`}
        />
      )}
    </div>
  )

  // Nếu có link → wrap bằng Link
  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex shrink-0 aspect-square items-center justify-center rounded-full hover:opacity-80 transition-opacity border-0 outline-none ring-0"
        style={{ border: 'none', outline: 'none' }}
      >
        {avatarContent}
      </Link>
    )
  }

  return avatarContent
}

export default Avatar
