import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { fetchFeed, clearPosts, loadMockPosts } from '../store/postSlice'
import { mockPosts, mockToken } from '@/utils/mockData'
import ProfileSidebar from '../components/ProfileSidebar'
import PostList from '../components/PostList'

/**
 * Home Page – Trang chủ hiển thị Newsfeed.
 */
const HomePage = () => {
  const dispatch = useDispatch()
  const { posts, isLoading, hasMore } = useSelector((state) => state.posts)
  const { user, token } = useSelector((state) => state.auth)

  const isDemoMode = token?.startsWith(mockToken)

  // Fetch feed khi mount
  useEffect(() => {
    dispatch(clearPosts())
    if (isDemoMode) {
      dispatch(loadMockPosts(mockPosts))
    } else {
      dispatch(fetchFeed({ page: 1 }))
    }
  }, [dispatch, isDemoMode])

  // Load thêm bài viết
  const handleLoadMore = () => {
    if (!isLoading && hasMore && !isDemoMode) {
      dispatch(fetchFeed({}))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar trái */}
      <ProfileSidebar user={user} />

      {/* Newsfeed chính */}
      <main className="lg:col-span-2 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Bảng tin</h1>
          <Link
            to="/create"
            className="lg:hidden flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
          >
            <AiOutlinePlusCircle size={16} />
            Đăng bài
          </Link>
        </div>

        {/* Danh sách bài viết */}
        <PostList
          posts={posts}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isDemoMode={isDemoMode}
        />
      </main>
    </div>
  )
}

export default HomePage
