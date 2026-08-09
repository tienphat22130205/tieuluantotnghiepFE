/**
 * PageLoadingFallback – Hiển thị khi lazy-loaded page đang tải.
 * Sử dụng CSS animation thuần (không framer-motion) để tránh thêm JS vào critical path.
 */
const PageLoadingFallback = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.3s]" />
          <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]" />
          <span className="inline-block h-2.5 w-2.5 animate-bounce rounded-full bg-primary-300" />
        </div>
        <p className="text-sm font-medium text-slate-400 select-none">Đang tải...</p>
      </div>
    </div>
  )
}

export default PageLoadingFallback
