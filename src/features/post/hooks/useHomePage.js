import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeed, clearPosts, loadMockPosts } from '../store/postSlice'
import { mockPosts, mockToken } from '@/utils/mockData'

const useHomePage = () => {
  const dispatch = useDispatch()
  const { posts, isLoading, hasMore } = useSelector((state) => state.posts)
  const { user, token } = useSelector((state) => state.auth)

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

  return {
    posts,
    isLoading,
    hasMore,
    user,
    isDemoMode,
    handleLoadMore,
  }
}

export default useHomePage
