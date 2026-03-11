/**
 * Loading Spinner – Hiển thị khi đang tải dữ liệu.
 *
 * Props:
 *   - size: 'sm' | 'md' | 'lg'
 *   - text: Dòng chữ hiển thị dưới spinner (tùy chọn)
 */
const LoadingSpinner = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`
          ${sizes[size]} border-4 border-gray-200 border-t-primary-600
          rounded-full animate-spin
        `}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
