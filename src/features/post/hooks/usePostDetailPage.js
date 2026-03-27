import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import postService from '../services/postService'
import { toggleLike } from '../store/postSlice'

const extractPostPayload = (payload) => payload?.data || payload?.post || payload
const extractCommentsPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.comments)) return payload.comments
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.comments)) return payload.data.comments
  return []
}

const normalizeComment = (comment, currentUser) => {
  if (!comment) return null
  const rawUser = comment.user
  const normalizedUser = typeof rawUser === 'object' && rawUser !== null
    ? rawUser
    : {
        _id: rawUser || currentUser?._id || currentUser?.id,
        username: currentUser?.username,
        full_name: currentUser?.full_name || currentUser?.fullName,
        avatar: currentUser?.avatar,
      }

  return {
    ...comment,
    _id: comment._id || comment.id,
    created_at: comment.created_at || comment.createdAt,
    user: normalizedUser,
  }
}

const usePostDetailPage = (postId) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCommenting, setIsCommenting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [postData, commentsData] = await Promise.all([
          postService.getById(postId),
          postService.getComments(postId),
        ])
        setPost(extractPostPayload(postData))
        setComments(extractCommentsPayload(commentsData).map((comment) => normalizeComment(comment, user)).filter(Boolean))
      } catch (err) {
        console.error('Post detail error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId, user])

  const handleLike = () => {
    const currentUserId = user?._id || user?.id
    const likedNow = post?.isLiked ?? post?.liked ?? (Array.isArray(post?.likes) && post.likes.includes(currentUserId))
    dispatch(toggleLike({ postId, isLiked: likedNow, currentUserId }))
    setPost((prev) => {
      if (!prev) return prev
      const currentlyLiked = prev.isLiked ?? prev.liked ?? (Array.isArray(prev.likes) && prev.likes.includes(currentUserId))
      return {
        ...prev,
        isLiked: !currentlyLiked,
        liked: !currentlyLiked,
        likes: currentlyLiked
          ? (prev.likes || []).filter((id) => id !== currentUserId)
          : [...(prev.likes || []), currentUserId],
      }
    })
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content) return

    setIsCommenting(true)
    try {
      const result = await postService.addComment(postId, content)
      const comment = normalizeComment(result?.comment, user)
      if (comment) {
        setComments((prev) => [...prev, comment])
      }
      setNewComment('')
      setPost((prev) => (prev ? {
        ...prev,
        comments_count: typeof result?.commentCount === 'number'
          ? result.commentCount
          : (prev.comments_count || 0) + 1,
      } : prev))
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return

    setDeletingCommentId(commentId)
    try {
      const result = await postService.deleteComment(postId, commentId)
      setComments((prev) => prev.filter((comment) => comment?._id !== commentId))
      setPost((prev) => (prev ? {
        ...prev,
        comments_count: typeof result?.commentCount === 'number'
          ? result.commentCount
          : Math.max(0, (prev.comments_count || 0) - 1),
      } : prev))
    } catch (err) {
      console.error('Delete comment error:', err)
    } finally {
      setDeletingCommentId(null)
    }
  }

  const isLiked = useMemo(() => {
    const currentUserId = user?._id || user?.id
    return post?.isLiked ?? post?.liked ?? (Array.isArray(post?.likes) && post.likes.includes(currentUserId))
  }, [post, user])

  return {
    post,
    comments,
    newComment,
    isLoading,
    isCommenting,
    deletingCommentId,
    isLiked,
    user,
    setNewComment,
    handleLike,
    handleSubmitComment,
    handleDeleteComment,
  }
}

export default usePostDetailPage
