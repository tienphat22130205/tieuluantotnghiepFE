/**
 * Button Component – Nút bấm dùng chung toàn project.
 *
 * Props:
 *   - children:  Nội dung hiển thị
 *   - variant:   'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
 *   - size:      'sm' | 'md' | 'lg'
 *   - fullWidth: boolean – Chiếm full chiều rộng
 *   - isLoading: boolean – Hiện spinner khi đang xử lý
 *   - disabled:  boolean
 *   - ...rest:   Các prop HTML gốc (onClick, type, …)
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  // ── Variant styles ──
  const variants = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary:
      'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400',
    outline:
      'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    ghost:
      'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  }

  // ── Size styles ──
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg cursor-pointer
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...rest}
    >
      {/* Spinner khi loading */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button
