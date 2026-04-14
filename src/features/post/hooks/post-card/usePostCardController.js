import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { deletePost, toggleLike, upsertRealtimePost } from '../../store/postSlice'
import postService from '../../services/postService'
import { mockComments, mockToken } from '@/utils/mockData'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { getSocket, socketDebugLog } from '@/services/socketClient'

const normalizeCommentUser = (rawUser, currentUser) => {
  const raw = rawUser && typeof rawUser === 'object' ? rawUser : null
  const nested = raw?.user && typeof raw.user === 'object' ? raw.user : null

  const source = raw || nested
  if (!source) {
    const rawUserId = typeof rawUser === 'string' || typeof rawUser === 'number' ? rawUser : null
    const currentUserId = currentUser?._id || currentUser?.id
    const isCurrentUserComment = Boolean(rawUserId && currentUserId && String(rawUserId) === String(currentUserId))

    return {
      _id: rawUserId || null,
      username: isCurrentUserComment ? currentUser?.username || null : null,
      full_name: isCurrentUserComment
        ? currentUser?.full_name || currentUser?.fullName || currentUser?.username || null
        : null,
      avatar: isCurrentUserComment ? currentUser?.avatar || null : null,
    }
  }

  const fullName = source.full_name || source.fullName || source.name
  const firstLast = `${source.first_name || source.firstName || ''} ${source.last_name || source.lastName || ''}`.trim()

  return {
    ...source,
    _id: source._id || source.id || source.user_id || null,
    username: source.username || source.userName || null,
    full_name: fullName || firstLast || source.username || null,
    avatar: source.avatar || source.profile_pic || null,
  }
}

const normalizeComment = (comment, currentUser) => {
  if (!comment) return null

  const rawUser = comment.user || comment.author || comment.sender || comment.fromUser || comment.userId || null
  const normalizedUser = normalizeCommentUser(rawUser, currentUser)

  return {
    ...comment,
    _id: comment._id || comment.id,
    created_at: comment.created_at || comment.createdAt,
    content: comment.content || comment.text || '',
    user: {
      ...normalizedUser,
      _id: normalizedUser?._id || comment.user_id || comment.userId || null,
      username: normalizedUser?.username || comment.username || comment.userName || null,
      full_name:
        normalizedUser?.full_name
        || comment.full_name
        || comment.fullName
        || comment.authorName
        || comment.username
        || comment.userName
        || null,
      avatar: normalizedUser?.avatar || comment.avatar || comment.user_avatar || comment.authorAvatar || null,
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

const usePostCardController = (post) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)

  const [saved, setSaved] = useState(false)
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : [])
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [hasTriedLoadComments, setHasTriedLoadComments] = useState(false)

  const currentUserId = user?._id || user?.id
  const isLiked = post.isLiked ?? (post.likes?.includes(currentUserId) || false)
  const isDemoMode = token === mockToken
  const postAuthorId = post?.user?._id || post?.user?.id
  const canManage = Boolean(currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId))

  useEffect(() => {
    if (Array.isArray(post.comments)) {
      setComments(post.comments.map((item) => normalizeComment(item, user)).filter(Boolean))
      if (post.comments.length > 0) {
        setHasTriedLoadComments(true)
      }
    }
  }, [post.comments, user])

  useEffect(() => {
    if (typeof post.comments_count === 'number') {
      setCommentsCount(post.comments_count)
    }
  }, [post.comments_count])

  const uniquePostImages = useMemo(() => {
    const postImages = [
      ...(Array.isArray(post.images) ? post.images : []),
      ...(post.image_url ? [post.image_url] : []),
    ]
      .map((image) => resolveMediaUrl(image))
      .filter(Boolean)

    return [...new Set(postImages)]
  }, [post.images, post.image_url])

  const handleLike = () => dispatch(toggleLike({ postId: post._id, isLiked, currentUserId }))
  const handleSave = () => setSaved((prev) => !prev)
  const handleEditPost = () => navigate(`/post/${post._id}/edit`)

  const handleImageClick = (index, e) => {
    e.preventDefault()
    e.stopPropagation()
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleLightboxClose = () => {
    setLightboxOpen(false)
  }

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? uniquePostImages.length - 1 : prev - 1))
  }

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === uniquePostImages.length - 1 ? 0 : prev + 1))
  }

  const handleDeletePost = () => {
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    setIsConfirmDeleteOpen(false)
    try {
      await dispatch(deletePost(post._id)).unwrap()
      toast.success('Xóa bài viết thành công!')
    } catch (_err) {
      toast.error('Xóa bài viết thất bại!')
    }
  }

  const cancelDelete = () => {
    setIsConfirmDeleteOpen(false)
  }

  const loadComments = useCallback(async () => {
    try {
      if (isDemoMode) {
        const mock = mockComments[post._id] || []
        const normalizedMock = mock.map((item) => normalizeComment(item, user)).filter(Boolean)
        setComments(normalizedMock)
        setCommentsCount(normalizedMock.length)
      } else {
        let list
        try {
          list = await postService.getComments(post._id)
        } catch (_getErr) {
          try {
            const postResponse = await postService.getById(post._id)
            const postPayload = postResponse?.data || postResponse?.post || postResponse || {}
            list = Array.isArray(postPayload?.comments)
              ? postPayload.comments
              : Array.isArray(postPayload?.data?.comments)
                ? postPayload.data.comments
                : []
          } catch {
            list = []
          }
        }

        const normalizedList = list.map((item) => normalizeComment(item, user)).filter(Boolean)
        const baselineCount = Number(post.comments_count || 0)

        if (normalizedList.length > 0) {
          setComments(normalizedList)
          setCommentsCount(Math.max(normalizedList.length, baselineCount))
        } else {
          setComments((prev) => (prev.length > 0 || baselineCount > 0 ? prev : []))
          setCommentsCount((prev) => Math.max(prev, baselineCount))
        }
      }
    } finally {
      setHasTriedLoadComments(true)
    }
  }, [isDemoMode, post._id, post.comments_count, user])

  useEffect(() => {
    if (!isDetailModalOpen || isDemoMode || !post?._id) return

    loadComments()

    const intervalId = window.setInterval(() => {
      loadComments()
    }, 2000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isDemoMode, isDetailModalOpen, loadComments, post?._id])

  useEffect(() => {
    if (!isDetailModalOpen || !token || isDemoMode || !post?._id) return

    const socket = getSocket(token)
    if (!socket) return

    const roomPostId = post._id || post.id
    emitJoinPostRoom(socket, roomPostId)

    const handleCommented = (payload) => {
      if (String(resolveEventPostId(payload)) !== String(roomPostId)) return

      socketDebugLog('event:post:commented:modal', payload)

      const incomingComment = normalizeComment(payload?.comment || payload?.data?.comment, user)
      const eventCommentCount = Number(payload?.commentCount ?? payload?.commentsCount ?? payload?.comments_count)

      if (incomingComment?._id) {
        setComments((prev) => {
          return mergeIncomingComment(prev, incomingComment)
        })
      } else if (incomingComment) {
        setComments((prev) => mergeIncomingComment(prev, incomingComment))
      }

      if (Number.isFinite(eventCommentCount)) {
        setCommentsCount(eventCommentCount)
      } else if (incomingComment?._id) {
        setCommentsCount((prev) => prev + 1)
      } else {
        // Fallback when socket payload does not contain full comment object.
        loadComments()
      }
    }

    const handleCommentDeleted = (payload) => {
      if (String(resolveEventPostId(payload)) !== String(roomPostId)) return

      socketDebugLog('event:post:comment-deleted:modal', payload)

      const deletedCommentId = resolveDeletedCommentId(payload)
      if (deletedCommentId) {
        setComments((prev) => prev.filter((comment) => String(comment?._id || comment?.id) !== String(deletedCommentId)))
      } else {
        loadComments()
      }

      const eventCommentCount = Number(payload?.commentCount ?? payload?.commentsCount ?? payload?.comments_count)
      if (Number.isFinite(eventCommentCount)) {
        setCommentsCount(eventCommentCount)
      } else {
        setCommentsCount((prev) => Math.max(0, prev - 1))
      }
    }

    socket.on('post:commented', handleCommented)
    socket.on('post:comment-deleted', handleCommentDeleted)

    return () => {
      emitLeavePostRoom(socket, roomPostId)
      socket.off('post:commented', handleCommented)
      socket.off('post:comment-deleted', handleCommentDeleted)
    }
  }, [isDemoMode, isDetailModalOpen, loadComments, post?._id, post?.id, token, user])

  const openPostDetail = async () => {
    setIsDetailModalOpen(true)
    if (comments.length === 0 && !hasTriedLoadComments) {
      await loadComments()
    }
  }

  const closePostDetail = () => {
    setIsDetailModalOpen(false)
  }

  const openShareModal = () => {
    setIsShareModalOpen(true)
  }

  const closeShareModal = () => {
    if (isSharing) return
    setIsShareModalOpen(false)
  }

  const handleSharePost = async (payload) => {
    setIsSharing(true)
    try {
      const response = await postService.sharePost(post._id, payload)
      const sharedPost = response?.data || response?.post || response || {}

      if (sharedPost?._id || sharedPost?.id) {
        dispatch(upsertRealtimePost(sharedPost))
      }

      if (sharedPost?.postType === 'share' || sharedPost?.sharedPost) {
        toast.success('Chia sẻ bài viết thành công!')
      } else {
        toast.success('Đã gửi chia sẻ.')
      }
      setIsShareModalOpen(false)
    } catch (err) {
      toast.error(err?.message || 'Chia sẻ bài viết thất bại!')
      setIsShareModalOpen(false)
    } finally {
      setIsSharing(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    const content = newComment.trim()
    if (!content) return

    setIsCommenting(true)
    try {
      if (isDemoMode) {
        const optimistic = {
          _id: `demo-cmt-${Date.now()}`,
          user,
          content,
          created_at: new Date().toISOString(),
        }
        setComments((prev) => mergeIncomingComment(prev, optimistic))
      } else {
        const result = await postService.addComment(post._id, content)
        const incomingComment = normalizeComment(result?.comment, user)
        if (incomingComment) {
          setComments((prev) => mergeIncomingComment(prev, incomingComment))
        }
        if (typeof result?.commentCount === 'number') {
          setCommentsCount(result.commentCount)
        } else {
          setCommentsCount((prev) => prev + 1)
        }
      }
      setNewComment('')
    } catch (err) {
      console.error('Add comment failed:', err)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!commentId || isDemoMode) return

    setDeletingCommentId(commentId)
    try {
      const result = await postService.deleteComment(post._id, commentId)
      setComments((prev) => prev.filter((comment) => comment?._id !== commentId))
      if (typeof result?.commentCount === 'number') {
        setCommentsCount(result.commentCount)
      } else {
        setCommentsCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Delete comment failed:', err)
      toast.error('Xoa binh luan that bai!')
    } finally {
      setDeletingCommentId(null)
    }
  }

  return {
    user,
    currentUserId,
    canManage,
    isLiked,
    saved,
    comments,
    commentsCount,
    newComment,
    isCommenting,
    deletingCommentId,
    lightboxOpen,
    lightboxIndex,
    isConfirmDeleteOpen,
    isDetailModalOpen,
    isShareModalOpen,
    isSharing,
    uniquePostImages,
    handleLike,
    handleSave,
    handleEditPost,
    handleImageClick,
    handleLightboxClose,
    handleLightboxPrev,
    handleLightboxNext,
    handleDeletePost,
    confirmDelete,
    cancelDelete,
    openPostDetail,
    closePostDetail,
    openShareModal,
    closeShareModal,
    handleSharePost,
    setNewComment,
    handleSubmitComment,
    handleDeleteComment,
  }
}

export default usePostCardController
