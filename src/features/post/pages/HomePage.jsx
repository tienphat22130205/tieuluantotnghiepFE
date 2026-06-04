import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import PostList from '../components/PostList'
import useHomePage from '../hooks/useHomePage'

/**
 * Home Page – Trang chủ hiển thị Newsfeed.
 */
const HomePage = () => {
  const { posts, isLoading, hasMore, user, isDemoMode, handleLoadMore } = useHomePage()
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Bạn'

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Trang chủ</h1>
            <p className="text-sm text-slate-500 font-normal">Xin chào {displayName}, hôm nay bạn muốn chia sẻ gì?</p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 shrink-0 flex-shrink-0 whitespace-nowrap"
          >
            <AiOutlinePlusCircle size={16} />
            Đăng bài
          </Link>
        </div>
      </header>

      <main className="space-y-4">
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
