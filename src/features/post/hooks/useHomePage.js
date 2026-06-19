import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFeed,
  clearPosts,
  loadMockPosts,
  upsertRealtimePost,
  applyRealtimeLikeEvent,
  applyRealtimeCommentEvent,
  applyRealtimeCommentDeletedEvent,
} from '../store/postSlice'
import { mockPosts, mockToken } from '@/utils/mockData'
import { canViewPost, getUserId, normalizeVisibility } from '@/utils/friendship'
import { getSocket, socketDebugLog } from '@/services/socketClient'

const FEED_PAGE_SIZE = 5

const emitJoinPostRoom = (socket, postId) => {
  if (!socket || !postId) return
  socket.emit('post:join', postId)
  socket.emit('post:join', { postId })
}

const emitLeavePostRoom = (socket, postId) => {
  if (!socket || !postId) return
  socket.emit('post:leave', postId)
  socket.emit('post:leave', { postId })
}

const useHomePage = () => {
  const dispatch = useDispatch()
  const { posts, isLoading, hasMore } = useSelector((state) => state.posts)
  const { user, token } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id
  const [demoPage, setDemoPage] = useState(1)
  const [isSocketFallbackActive, setIsSocketFallbackActive] = useState(false)

  const isDemoMode = token === mockToken

  useEffect(() => {
    dispatch(clearPosts())
    if (isDemoMode) {
      dispatch(loadMockPosts(mockPosts))
    } else {
      dispatch(fetchFeed({ page: 1, limit: FEED_PAGE_SIZE }))
    }
  }, [dispatch, isDemoMode])

  const visiblePostsAll = useMemo(() => posts.filter((post) => {
    if (post?.isDeleted) return false

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
  }), [posts, currentUserId])

  const demoVisibleLimit = demoPage * FEED_PAGE_SIZE
  const visiblePosts = isDemoMode
    ? visiblePostsAll.slice(0, demoVisibleLimit)
    : visiblePostsAll
  const effectiveHasMore = isDemoMode
    ? visiblePostsAll.length > demoVisibleLimit
    : hasMore

  useEffect(() => {
    if (!token || isDemoMode) return

    const socket = getSocket(token)
    if (!socket) return

    const handleNewPost = (payload) => {
      socketDebugLog('event:feed:new-post', payload)
      dispatch(upsertRealtimePost(payload))
    }
    const handleSharedPost = (payload) => {
      socketDebugLog('event:post:shared', payload)
      dispatch(upsertRealtimePost(payload))
    }
    const handleLiked = (payload) => {
      socketDebugLog('event:post:liked', payload)
      dispatch(applyRealtimeLikeEvent({ ...payload, type: 'post:liked' }))
    }
    const handleUnliked = (payload) => {
      socketDebugLog('event:post:unliked', payload)
      dispatch(applyRealtimeLikeEvent({ ...payload, type: 'post:unliked' }))
    }
    const handleCommented = (payload) => {
      socketDebugLog('event:post:commented', payload)
      dispatch(applyRealtimeCommentEvent(payload))
    }
    const handleCommentDeleted = (payload) => {
      socketDebugLog('event:post:comment-deleted', payload)
      dispatch(applyRealtimeCommentDeletedEvent(payload))
    }

    socket.on('feed:new-post', handleNewPost)
    socket.on('post:shared', handleSharedPost)
    socket.on('post:liked', handleLiked)
    socket.on('post:unliked', handleUnliked)
    socket.on('post:commented', handleCommented)
    socket.on('post:comment-deleted', handleCommentDeleted)

    return () => {
      socket.off('feed:new-post', handleNewPost)
      socket.off('post:shared', handleSharedPost)
      socket.off('post:liked', handleLiked)
      socket.off('post:unliked', handleUnliked)
      socket.off('post:commented', handleCommented)
      socket.off('post:comment-deleted', handleCommentDeleted)
    }
  }, [dispatch, isDemoMode, token])

  useEffect(() => {
    if (!token || isDemoMode) return

    const socket = getSocket(token)
    if (!socket) return
    let fallbackTimer = null

    const activateFallbackAfterGrace = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
      }

      fallbackTimer = window.setTimeout(() => {
        setIsSocketFallbackActive(true)
        socketDebugLog('feed fallback polling activated')
      }, 15000)
    }

    const onConnect = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
        fallbackTimer = null
      }
      setIsSocketFallbackActive(false)
      socketDebugLog('feed socket connected')
    }

    const onDisconnect = (reason) => {
      socketDebugLog('feed socket disconnected', { reason })
      activateFallbackAfterGrace()
    }

    const onConnectError = (error) => {
      socketDebugLog('feed socket connect_error', { message: error?.message })
      activateFallbackAfterGrace()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    if (socket.connected) {
      onConnect()
    } else {
      activateFallbackAfterGrace()
    }

    return () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
      }
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [isDemoMode, token])

  useEffect(() => {
    if (!token || isDemoMode || !isSocketFallbackActive) return

    const runFallbackRefresh = () => {
      socketDebugLog('feed fallback poll tick')
      dispatch(fetchFeed({ page: 1, limit: FEED_PAGE_SIZE }))
    }

    runFallbackRefresh()
    const intervalId = window.setInterval(runFallbackRefresh, 45000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [dispatch, isDemoMode, isSocketFallbackActive, token])

  useEffect(() => {
    if (!token || isDemoMode) return

    const socket = getSocket(token)
    if (!socket) return

    const joinedPostIds = visiblePostsAll
      .map((post) => post?._id || post?.id)
      .filter(Boolean)

    joinedPostIds.forEach((postId) => {
      emitJoinPostRoom(socket, postId)
    })

    return () => {
      joinedPostIds.forEach((postId) => {
        emitLeavePostRoom(socket, postId)
      })
    }
  }, [isDemoMode, token, visiblePostsAll])

  const handleLoadMore = useCallback(() => {
    if (isLoading || !effectiveHasMore) return

    if (isDemoMode) {
      setDemoPage((prev) => prev + 1)
      return
    }

    if (!isDemoMode) {
      dispatch(fetchFeed({ limit: FEED_PAGE_SIZE }))
    }
  }, [dispatch, effectiveHasMore, isDemoMode, isLoading])

  const refetch = useCallback(() => {
    if (isDemoMode) return
    dispatch(clearPosts())
    dispatch(fetchFeed({ page: 1, limit: FEED_PAGE_SIZE }))
  }, [dispatch, isDemoMode])

  return {
    posts: visiblePosts,
    isLoading,
    hasMore: effectiveHasMore,
    user,
    isDemoMode,
    handleLoadMore,
    refetch,
  }
}

export default useHomePage
