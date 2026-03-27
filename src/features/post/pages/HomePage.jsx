import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import ProfileSidebar from '../components/ProfileSidebar'
import PostList from '../components/PostList'
import useHomePage from '../hooks/useHomePage'

/**
 * Home Page – Trang chủ hiển thị Newsfeed.
 */
const HomePage = () => {
  const { posts, isLoading, hasMore, user, isDemoMode, handleLoadMore } = useHomePage()

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
