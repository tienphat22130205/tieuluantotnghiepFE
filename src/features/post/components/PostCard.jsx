import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleLike } from '../store/postSlice'
import postService from '../services/postService'
import { mockComments, mockToken } from '@/utils/mockData'
import PostCardHeader from './PostCardHeader'
import PostCardActions from './PostCardActions'
import PostCardBody from './PostCardBody'
import CommentSection from './CommentSection'

/**
 * PostCard Component – Card hiển thị 1 bài viết trên Newsfeed.
 * Props: post (Object)
 */
const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  const isLiked = post.likes?.includes(user?._id)
  const isDemoMode = token === mockToken

  const handleLike = () => dispatch(toggleLike(post._id))
  const handleSave = () => setSaved(!saved)

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      if (isDemoMode) {
        const mock = mockComments[post._id] || []
        setComments(mock)
        setCommentsCount((prev) => Math.max(prev, mock.length))
      } else {
        const data = await postService.getComments(post._id)
        const list = Array.isArray(data) ? data : (data?.comments || [])
        setComments(list)
        setCommentsCount((prev) => Math.max(prev, list.length))
      }
    } catch (err) {
      console.error('Load comments failed:', err)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleToggleComments = async () => {
    const next = !showComments
    setShowComments(next)
    if (next && comments.length === 0) {
      await loadComments()
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
        setComments((prev) => [...prev, optimistic])
      } else {
        const result = await postService.addComment(post._id, content)
        setComments((prev) => [...prev, result.comment || result])
      }
      setCommentsCount((prev) => prev + 1)
      setNewComment('')
    } catch (err) {
      console.error('Add comment failed:', err)
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <PostCardHeader user={post.user} createdAt={post.created_at} />

      {/* Hình ảnh */}
      {post.image_url && (
        <Link to={`/post/${post._id}`}>
          <img
            src={post.image_url}
            alt="Post"
            className="w-full max-h-[500px] object-cover"
            loading="lazy"
          />
        </Link>
      )}

      <PostCardActions
        likesCount={post.likes?.length || 0}
        commentsCount={commentsCount}
        isLiked={isLiked}
        saved={saved}
        onLike={handleLike}
        onSave={handleSave}
        onCommentClick={handleToggleComments}
      />

      <PostCardBody post={post} />

      {showComments && (
        isLoadingComments ? (
          <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Đang tải bình luận...
          </div>
        ) : (
          <CommentSection
            comments={comments}
            commentsCount={commentsCount}
            newComment={newComment}
            isCommenting={isCommenting}
            onCommentChange={setNewComment}
            onSubmitComment={handleSubmitComment}
          />
        )
      )}
    </div>
  )
}

export default PostCard
