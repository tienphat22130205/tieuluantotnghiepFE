import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import adminModerationService from '../services/adminModerationService'

/**
 * Custom hook quản lý logic Kiểm duyệt Bài viết & Bình luận (Posts & Comments Moderation).
 */
export const useAdminModeration = ({ activeSection, isAdmin }) => {
  // Posts State
  const [posts, setPosts] = useState([])
  const [isPostsLoading, setIsPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState('')
  const [busyPostId, setBusyPostId] = useState(null)
  const [postsFilters, setPostsFilters] = useState({
    sortBy: 'createdAt',
    search: '',
    filterDeleted: false,
  })
  const [postsPagination, setPostsPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  })

  // Comments State
  const [comments, setComments] = useState([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [busyCommentId, setBusyCommentId] = useState(null)
  const [commentsFilters, setCommentsFilters] = useState({
    search: '',
  })
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
  })

  // Load Posts List
  useEffect(() => {
    if (activeSection !== 'posts') return

    let isMounted = true

    const loadPosts = async () => {
      setIsPostsLoading(true)
      setPostsError('')

      try {
        const response = await adminModerationService.listManagedPosts({
          page: postsPagination.page,
          limit: postsPagination.limit,
          sortBy: postsFilters.sortBy,
          search: postsFilters.search,
          filterDeleted: postsFilters.filterDeleted,
        })

        if (!isMounted) return
        setPosts(response.posts)
        setPostsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } catch (error) {
        if (!isMounted) return
        setPosts([])
        setPostsError(error?.message || 'Không thể tải danh sách bài viết để quản lý.')
      } finally {
        if (isMounted) {
          setIsPostsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [
    activeSection,
    postsPagination.page,
    postsPagination.limit,
    postsFilters.sortBy,
    postsFilters.search,
    postsFilters.filterDeleted,
  ])

  // Load Comments List
  useEffect(() => {
    if (activeSection !== 'comments') return

    let isMounted = true

    const loadComments = async () => {
      setIsCommentsLoading(true)
      setCommentsError('')

      try {
        const response = await adminModerationService.listManagedComments({
          page: commentsPagination.page,
          limit: commentsPagination.limit,
          search: commentsFilters.search,
        })

        if (!isMounted) return
        setComments(response.comments)
        setCommentsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } catch (error) {
        if (!isMounted) return
        setComments([])
        setCommentsError(error?.message || 'Không thể tải danh sách bình luận.')
      } finally {
        if (isMounted) {
          setIsCommentsLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      isMounted = false
    }
  }, [activeSection, commentsPagination.limit, commentsPagination.page, commentsFilters.search])

  const handleRefreshPosts = useCallback(async () => {
    setIsPostsLoading(true)
    setPostsError('')

    try {
      if (isAdmin) {
        const response = await adminModerationService.listManagedPosts({
          page: postsPagination.page,
          limit: postsPagination.limit,
          sortBy: postsFilters.sortBy,
          search: postsFilters.search,
          filterDeleted: postsFilters.filterDeleted,
        })

        setPosts(response.posts)
        setPostsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } else {
        const recentPosts = await adminModerationService.listRecentPosts()
        setPosts(recentPosts)
        setPostsPagination((prev) => ({
          ...prev,
          page: 1,
          totalItems: recentPosts.length,
          totalPages: 1,
        }))
      }
    } catch (error) {
      setPostsError(error?.message || 'Không thể tải danh sách bài viết để quản lý.')
    } finally {
      setIsPostsLoading(false)
    }
  }, [
    isAdmin,
    postsPagination.page,
    postsPagination.limit,
    postsFilters.sortBy,
    postsFilters.search,
    postsFilters.filterDeleted,
  ])

  const handleDeletePost = useCallback(
    async (postId, reason) => {
      if (!postId || !reason?.trim()) return

      setBusyPostId(postId)
      setPostsError('')

      try {
        await adminModerationService.deletePostByModerator(postId, reason)
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
        setComments((prevComments) => prevComments.filter((comment) => comment.postId !== postId))
        toast.success('Đã xóa bài vi phạm và gửi thông báo cho người dùng.', { autoClose: 2200 })
      } catch (error) {
        setPostsError(error?.message || 'Không thể xóa bài viết vi phạm.')
        toast.error(error?.message || 'Không thể xóa bài viết vi phạm.', { autoClose: 2800 })
      } finally {
        setBusyPostId(null)
      }
    },
    []
  )

  const handlePostsPageChange = useCallback((nextPage) => {
    setPostsPagination((prev) => {
      const totalPages = Number(prev.totalPages || 1)
      const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
      if (safePage === prev.page) return prev
      return { ...prev, page: safePage }
    })
  }, [])

  const handlePostsFiltersChange = useCallback((changes) => {
    const { page, ...filterChanges } = changes
    setPostsFilters((prev) => ({
      ...prev,
      ...filterChanges,
    }))
    if (typeof page === 'number') {
      setPostsPagination((prev) => ({ ...prev, page }))
    }
  }, [])

  const handleRefreshComments = useCallback(async () => {
    setIsCommentsLoading(true)
    setCommentsError('')
    try {
      const response = await adminModerationService.listManagedComments({
        page: commentsPagination.page,
        limit: commentsPagination.limit,
        search: commentsFilters.search,
      })
      setComments(response.comments)
      setCommentsPagination((prev) => ({ ...prev, ...response.pagination }))
    } catch (error) {
      setCommentsError(error?.message || 'Không thể tải danh sách bình luận.')
    } finally {
      setIsCommentsLoading(false)
    }
  }, [commentsPagination.page, commentsPagination.limit, commentsFilters.search])

  const handleDeleteComment = useCallback(async (comment, reason) => {
    if (!comment?.postId || !comment?.id || !reason?.trim()) return

    setBusyCommentId(comment.id)
    setCommentsError('')

    try {
      await adminModerationService.deleteCommentByModerator({
        postId: comment.postId,
        commentId: comment.id,
        reason,
      })

      setComments((prevComments) => prevComments.filter((item) => item.id !== comment.id))
      setCommentsPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, Number(prev.totalItems || 0) - 1),
      }))
      toast.success('Đã xóa bình luận vi phạm và gửi thông báo cho người dùng.', { autoClose: 2200 })
    } catch (error) {
      setCommentsError(error?.message || 'Không thể xóa bình luận vi phạm.')
      toast.error(error?.message || 'Không thể xóa bình luận vi phạm.', { autoClose: 2800 })
    } finally {
      setBusyCommentId(null)
    }
  }, [])

  const handleCommentsPageChange = useCallback((nextPage) => {
    setCommentsPagination((prev) => {
      const totalPages = Number(prev.totalPages || 1)
      const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
      if (safePage === prev.page) return prev
      return { ...prev, page: safePage }
    })
  }, [])

  const handleCommentsFiltersChange = useCallback((changes) => {
    const { page, ...filterChanges } = changes
    setCommentsFilters((prev) => ({ ...prev, ...filterChanges }))
    if (typeof page === 'number') {
      setCommentsPagination((prev) => ({ ...prev, page }))
    }
  }, [])

  return {
    posts,
    isPostsLoading,
    postsError,
    busyPostId,
    postsFilters,
    postsPagination,
    handleRefreshPosts,
    handleDeletePost,
    handlePostsPageChange,
    handlePostsFiltersChange,
    comments,
    isCommentsLoading,
    commentsError,
    busyCommentId,
    commentsFilters,
    commentsPagination,
    handleRefreshComments,
    handleDeleteComment,
    handleCommentsPageChange,
    handleCommentsFiltersChange,
  }
}

export default useAdminModeration
