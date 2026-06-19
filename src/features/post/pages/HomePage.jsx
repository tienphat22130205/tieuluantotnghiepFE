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
    <div className="space-y-4">
      <QuickPostBar onOpen={() => setIsCreateOpen(true)} />
      <StoriesBar />

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
