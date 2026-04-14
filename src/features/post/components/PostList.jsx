import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import PostCard from './PostCard'
import { LoadingSpinner } from '@/components/ui'

/**
 * PostList – Danh sách bài viết trên Newsfeed.
 * Props: posts, isLoading, hasMore, onLoadMore, isDemoMode
 */
const PostList = ({ posts, isLoading, hasMore, onLoadMore, isDemoMode }) => {
  const sentinelRef = useRef(null)
  const hasUserScrolledRef = useRef(false)
  const hasTriggeredForCurrentViewRef = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 120) {
        hasUserScrolledRef.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!hasMore) return

    const sentinelNode = sentinelRef.current
    if (!sentinelNode) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) return

        if (!entry.isIntersecting) {
          hasTriggeredForCurrentViewRef.current = false
          return
        }

        if (!hasUserScrolledRef.current) return
        if (hasTriggeredForCurrentViewRef.current) return

        if (!isLoading) {
          hasTriggeredForCurrentViewRef.current = true
          onLoadMore()
        }
      },
      {
        root: null,
        rootMargin: '80px 0px',
        threshold: 0.15,
      }
    )

    observer.observe(sentinelNode)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, onLoadMore])

  if (posts.length > 0) {
    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex min-h-[48px] items-center justify-center py-3">
            {isLoading && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500" />
                Đang tải thêm
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner text="Đang tải bảng tin..." />
  }

  // Empty state
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-5xl mb-4">📝</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Chưa có bài viết nào
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Hãy theo dõi mọi người hoặc tạo bài viết đầu tiên!
      </p>
      <Link
        to="/create"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-full text-sm font-semibold hover:bg-primary-700 transition"
      >
        <AiOutlinePlusCircle size={18} />
        Tạo bài viết
      </Link>
    </div>
  )
}

export default PostList
