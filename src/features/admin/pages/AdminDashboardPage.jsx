import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeed, loadMockPosts } from '@/features/post/store/postSlice'
import { mockFriends, mockPosts, mockToken } from '@/utils/mockData'
import AdminHeader from '../components/AdminHeader'
import OverviewTab from '../components/OverviewTab'
import TweetAnalytics from '../components/TweetAnalytics'
import LikeAnalytics from '../components/LikeAnalytics'
import UserAnalytics from '../components/UserAnalytics'
import UserManagement from '../components/UserManagement'

const tabs = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'tweet-analytics', label: 'Tweet Analytics' },
  { id: 'like-analytics', label: 'Like Analytics' },
  { id: 'user-analytics', label: 'User Analytics' },
  { id: 'user-management', label: 'User Management' },
]

const AdminDashboardPage = () => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('overview')
  const { posts, isLoading } = useSelector((state) => state.posts)
  const { token } = useSelector((state) => state.auth)

  const isDemoMode = token?.startsWith(mockToken)

  useEffect(() => {
    if (posts.length > 0) return

    if (isDemoMode) {
      dispatch(loadMockPosts(mockPosts))
      return
    }

    dispatch(fetchFeed({ page: 1, limit: 20 }))
  }, [dispatch, isDemoMode, posts.length])

  const analytics = useMemo(() => {
    const totalPosts = posts.length
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0)
    const totalUsers = new Set(posts.map((post) => post.user?._id).filter(Boolean)).size + mockFriends.length

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalUsers,
      avgEngagement: totalPosts ? Math.round((totalLikes + totalComments) / totalPosts) : 0,
    }
  }, [posts])

  return (
    <section className="space-y-5">
      <AdminHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <OverviewTab analytics={analytics} posts={posts} isLoading={isLoading} />
      )}

      {activeTab === 'tweet-analytics' && (
        <TweetAnalytics posts={posts} />
      )}

      {activeTab === 'like-analytics' && (
        <LikeAnalytics posts={posts} />
      )}

      {activeTab === 'user-analytics' && (
        <UserAnalytics users={mockFriends} />
      )}

      {activeTab === 'user-management' && (
        <UserManagement users={mockFriends} />
      )}
    </section>
  )
}

export default AdminDashboardPage
