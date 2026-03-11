import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import PostCard from './PostCard'
import { LoadingSpinner } from '@/components/ui'

/**
 * PostList – Danh sách bài viết trên Newsfeed.
 * Props: posts, isLoading, hasMore, onLoadMore, isDemoMode
 */
const PostList = ({ posts, isLoading, hasMore, onLoadMore, isDemoMode }) => {
  if (posts.length > 0) {
    return (
      <>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}

        {/* Nút Load More */}
        {hasMore && !isDemoMode && (
          <div className="text-center py-4">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-sm text-primary-600 font-medium hover:underline disabled:opacity-50"
            >
              {isLoading ? 'Đang tải...' : 'Xem thêm bài viết'}
            </button>
          </div>
        )}
      </>
    )
  }

  if (isLoading) {
    return <LoadingSpinner text="Đang tải bảng tin..." />
  }

  // Empty state
  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-5xl mb-4">📝</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Chưa có bài viết nào
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Hãy theo dõi mọi người hoặc tạo bài viết đầu tiên!
      </p>
      <Link
        to="/create"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
      >
        <AiOutlinePlusCircle size={18} />
        Tạo bài viết
      </Link>
    </div>
  )
}

export default PostList
