import PostList from '../components/PostList'
import QuickPostBar from '../components/QuickPostBar'
import useHomePage from '../hooks/useHomePage'

/**
 * Home Page – Trang chủ hiển thị Newsfeed.
 */
const HomePage = () => {
  const { posts, isLoading, hasMore, isDemoMode, handleLoadMore } = useHomePage()

  return (
    <div className="space-y-4">
      <QuickPostBar />

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

