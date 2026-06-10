import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import postService from '../services/postService'
import { toggleLike } from '../store/postSlice'
import { getSocket } from '@/services/socketClient'

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
  const rawUser = comment.user || comment.author || comment.sender || comment.fromUser || comment.userId
  const rawObj = typeof rawUser === 'object' && rawUser !== null ? rawUser : null
  const nested = rawObj?.user && typeof rawObj.user === 'object' ? rawObj.user : null
  const source = rawObj || nested
  const firstLastName = source
    ? `${source.first_name || source.firstName || ''} ${source.last_name || source.lastName || ''}`.trim()
    : ''
  const normalizedUser = source
    ? {
        ...source,
        _id: source._id || source.id || source.user_id,
        username: source.username || source.userName,
        full_name: source.full_name || source.fullName || source.name || firstLastName || source.username,
        avatar: source.avatar || source.profile_pic || null,
      }
    : {
        _id: rawUser || comment.user_id || comment.userId || null,
        username: comment.username || comment.userName || null,
        full_name: comment.full_name || comment.fullName || comment.authorName || comment.username || comment.userName || null,
        avatar: comment.avatar || comment.user_avatar || comment.authorAvatar || null,
      }

  const rawUserId = rawUser || comment.user_id || comment.userId || null
  const currentUserId = currentUser?._id || currentUser?.id
  const isCurrentUserComment = Boolean(rawUserId && currentUserId && String(rawUserId) === String(currentUserId))

  return {
    ...comment,
    _id: comment._id || comment.id,
    created_at: comment.created_at || comment.createdAt,
    user: {
      ...normalizedUser,
      _id: normalizedUser?._id || rawUserId || null,
      username: normalizedUser?.username || (isCurrentUserComment ? currentUser?.username || null : null),
      full_name:
        normalizedUser?.full_name
        || (isCurrentUserComment
          ? currentUser?.full_name || currentUser?.fullName || currentUser?.username || null
          : null),
      avatar: normalizedUser?.avatar || (isCurrentUserComment ? currentUser?.avatar || null : null),
    },
  }
}

const resolveEventPostId = (payload = {}) =>
  payload?.postId
  || payload?.post?._id
  || payload?.post?.id
  || payload?.data?.postId
  || payload?.data?.post?._id
  || payload?.data?.post?.id
  || payload?._id
  || payload?.id
  || null

const resolveDeletedCommentId = (payload = {}) =>
  payload?.deletedCommentId
  || payload?.commentId
  || payload?.comment?._id
  || payload?.comment?.id
  || payload?.data?.deletedCommentId
  || payload?.data?.commentId
  || null

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

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const getCommentUserId = (comment) => comment?.user?._id || comment?.user?.id || comment?.user_id || comment?.userId || null

const commentsLikelySame = (a, b) => {
  const aUserId = getCommentUserId(a)
  const bUserId = getCommentUserId(b)
  const sameUser = Boolean(aUserId && bUserId && String(aUserId) === String(bUserId))
  if (!sameUser) return false

  if (normalizeText(a?.content) !== normalizeText(b?.content)) return false

  const aTime = new Date(a?.created_at || a?.createdAt || 0).getTime()
  const bTime = new Date(b?.created_at || b?.createdAt || 0).getTime()
  if (!Number.isFinite(aTime) || !Number.isFinite(bTime)) return true

  return Math.abs(aTime - bTime) <= 15000
}

const mergeIncomingComment = (prevComments, incomingComment) => {
  if (!incomingComment) return prevComments

  const incomingId = incomingComment?._id || incomingComment?.id
  if (incomingId) {
    const existingById = prevComments.findIndex((item) => String(item?._id || item?.id) === String(incomingId))
    if (existingById !== -1) {
      const next = [...prevComments]
      next[existingById] = { ...next[existingById], ...incomingComment }
      return next
    }
  }

  const existingByFingerprint = prevComments.findIndex((item) => commentsLikelySame(item, incomingComment))
  if (existingByFingerprint !== -1) {
    const next = [...prevComments]
    next[existingByFingerprint] = { ...next[existingByFingerprint], ...incomingComment }
    return next
  }

  return [...prevComments, incomingComment]
}

const usePostDetailPage = (postId) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const token = useSelector((state) => state.auth.token)

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCommenting, setIsCommenting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [replyToComment, setReplyToComment] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [postData, commentsData] = await Promise.all([
          postService.getById(postId),
          postService.getComments(postId),
        ])
        const postPayload = extractPostPayload(postData)
        setPost(postPayload)

        let normalizedComments = extractCommentsPayload(commentsData)
          .map((comment) => normalizeComment(comment, user))
          .filter(Boolean)

        if (normalizedComments.length === 0) {
          const fallbackFromPost = Array.isArray(postPayload?.comments)
            ? postPayload.comments
            : Array.isArray(postPayload?.data?.comments)
              ? postPayload.data.comments
              : []
          normalizedComments = fallbackFromPost
            .map((comment) => normalizeComment(comment, user))
            .filter(Boolean)
        }

        setComments((prev) => (normalizedComments.length > 0 ? normalizedComments : prev))
      } catch (err) {
        console.error('Post detail error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId, user])

  useEffect(() => {
    if (!postId || !token) return

    const intervalId = window.setInterval(async () => {
      try {
        const commentsData = await postService.getComments(postId)
        const normalized = extractCommentsPayload(commentsData)
          .map((comment) => normalizeComment(comment, user))
          .filter(Boolean)

        if (normalized.length > 0) {
          setComments(normalized)
          setPost((prev) => (prev ? { ...prev, comments_count: Math.max(normalized.length, prev.comments_count || 0) } : prev))
        }
      } catch {
        // Keep current comments when polling fails.
      }
    }, 2000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [postId, token, user])

  useEffect(() => {
    if (!token || !postId) return

    const socket = getSocket(token)
    if (!socket) return

    emitJoinPostRoom(socket, postId)

    const handleLiked = (payload) => {
      if (String(resolveEventPostId(payload)) !== String(postId)) return

      const likeCount = Number(payload?.likeCount ?? payload?.likesCount ?? payload?.likes_count)
      setPost((prev) => {
        if (!prev) return prev
        if (Number.isFinite(likeCount)) {
          return {
            ...prev,
            likeCount,
            likes: Array.from({ length: Math.max(0, likeCount) }, (_, i) => `like-${i}`),
          }
        }
        return {
          ...prev,
          likeCount: (prev.likeCount ?? prev.likes?.length ?? 0) + 1,
        }
      })
    }

    const handleUnliked = (payload) => {
      if (String(resolveEventPostId(payload)) !== String(postId)) return

      const likeCount = Number(payload?.likeCount ?? payload?.likesCount ?? payload?.likes_count)
      setPost((prev) => {
        if (!prev) return prev
        if (Number.isFinite(likeCount)) {
          return {
            ...prev,
            likeCount,
            likes: Array.from({ length: Math.max(0, likeCount) }, (_, i) => `like-${i}`),
          }
        }
        return {
          ...prev,
          likeCount: Math.max(0, (prev.likeCount ?? prev.likes?.length ?? 0) - 1),
        }
      })
    }

    const handleCommented = (payload) => {
      if (String(resolveEventPostId(payload)) !== String(postId)) return

      const incomingComment = normalizeComment(payload?.comment || payload?.data?.comment, user)
      const eventCommentCount = Number(payload?.commentCount ?? payload?.commentsCount ?? payload?.comments_count)

      if (incomingComment?._id) {
        setComments((prev) => {
          return mergeIncomingComment(prev, incomingComment)
        })
      } else if (incomingComment) {
        setComments((prev) => mergeIncomingComment(prev, incomingComment))
      }

      setPost((prev) => {
        if (!prev) return prev
        if (Number.isFinite(eventCommentCount)) {
          return { ...prev, comments_count: eventCommentCount }
        }
        return { ...prev, comments_count: (prev.comments_count || 0) + 1 }
      })
    }

    const handleCommentDeleted = (payload) => {
      if (String(resolveEventPostId(payload)) !== String(postId)) return

      const deletedCommentId = resolveDeletedCommentId(payload)
      if (deletedCommentId) {
        setComments((prev) => prev.filter((comment) => String(comment?._id || comment?.id) !== String(deletedCommentId)))
      }

      const eventCommentCount = Number(payload?.commentCount ?? payload?.commentsCount ?? payload?.comments_count)
      setPost((prev) => {
        if (!prev) return prev
        if (Number.isFinite(eventCommentCount)) {
          return { ...prev, comments_count: eventCommentCount }
        }
        return { ...prev, comments_count: Math.max(0, (prev.comments_count || 0) - 1) }
      })
    }

    socket.on('post:comment-deleted', handleCommentDeleted)
    socket.on('post:liked', handleLiked)
    socket.on('post:unliked', handleUnliked)
    socket.on('post:commented', handleCommented)

    return () => {
      emitLeavePostRoom(socket, postId)
      socket.off('post:comment-deleted', handleCommentDeleted)
      socket.off('post:liked', handleLiked)
      socket.off('post:unliked', handleUnliked)
      socket.off('post:commented', handleCommented)
    }
  }, [postId, token, user])

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
      const parentCommentId = replyToComment?._id || replyToComment?.id || null
      const result = await postService.addComment(postId, content, parentCommentId)
      const comment = normalizeComment(result?.comment, user)
      if (comment) {
        setComments((prev) => mergeIncomingComment(prev, comment))
      }
      setNewComment('')
      setReplyToComment(null)
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
    replyToComment,
    setReplyToComment,
  }
}

export default usePostDetailPage
