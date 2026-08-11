import { useState } from 'react'
import PostList from '../components/PostList'
import QuickPostBar from '../components/QuickPostBar'
import CreatePostModal from '../components/CreatePostModal'
import useHomePage from '../hooks/useHomePage'
import { StoriesBar } from '@/features/story'

/**
 * Home Page – Trang chủ hiển thị Newsfeed.
 */
const HomePage = () => {
  const { posts, isLoading, hasMore, isDemoMode, handleLoadMore, refetch } = useHomePage()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-3 md:space-y-4">
      {/* MOBILE: Circular StoriesBar on top of Home Feed (md:hidden) */}
      <div className="md:hidden">
        <StoriesBar />
      </div>

      {/* DESKTOP: Quick Post Bar (hidden md:block) */}
      <div className="hidden md:block">
        <QuickPostBar onOpen={() => setIsCreateOpen(true)} />
      </div>

      <main className="space-y-4">
        <PostList
          posts={posts}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isDemoMode={isDemoMode}
        />
      </main>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostSuccess={() => refetch?.()}
      />
    </div>
  )
}

export default HomePage
