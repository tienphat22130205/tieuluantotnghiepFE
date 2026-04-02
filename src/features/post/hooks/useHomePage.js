import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeed, clearPosts, loadMockPosts } from '../store/postSlice'
import { mockPosts, mockToken } from '@/utils/mockData'
import { canViewPost, getUserId, normalizeVisibility } from '@/utils/friendship'

const useHomePage = () => {
  const dispatch = useDispatch()
  const { posts, isLoading, hasMore } = useSelector((state) => state.posts)
  const { user, token } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  const isDemoMode = token?.startsWith(mockToken)

  useEffect(() => {
    dispatch(clearPosts())
    if (isDemoMode) {
      dispatch(loadMockPosts(mockPosts))
    } else {
      dispatch(fetchFeed({ page: 1 }))
    }
  }, [dispatch, isDemoMode])

  const handleLoadMore = () => {
    if (!isLoading && hasMore && !isDemoMode) {
      dispatch(fetchFeed({}))
    }
  }

  const visiblePosts = posts.filter((post) => {
    const visibility = normalizeVisibility(post?.visibility)

    if (visibility !== 'friends') {
      return canViewPost(post, { currentUserId })
    }

    const ownerId = getUserId(post?.user || post?.author || post?.author_id || post?.user_id)
    const isOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId))

    if (isOwner) return true
    if (post?.canView === false) return false

    // Friends visibility for feed should be enforced by backend.
    // Keep this fallback permissive unless backend explicitly marks canView=false.
    return true
  })

  return {
    posts: visiblePosts,
    isLoading,
    hasMore,
    user,
    isDemoMode,
    handleLoadMore,
  }
}

export default useHomePage
