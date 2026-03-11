import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { LoadingSpinner } from '@/components/ui'
import postService from '../services/postService'
import { toggleLike } from '../store/postSlice'
import PostContent from '../components/PostContent'
import CommentSection from '../components/CommentSection'

/**
 * PostDetail Page – Xem chi tiết bài viết + bình luận.
 */
const PostDetailPage = () => {
  const { postId } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCommenting, setIsCommenting] = useState(false)

  // Fetch post + comments
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [postData, commentsData] = await Promise.all([
          postService.getById(postId),
          postService.getComments(postId),
        ])
        setPost(postData)
        setComments(commentsData)
      } catch (err) {
        console.error('Post detail error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [postId])

  // Like
  const handleLike = () => {
    dispatch(toggleLike(postId))
    setPost((prev) => {
      const liked = prev.likes.includes(user._id)
      return {
        ...prev,
        likes: liked
          ? prev.likes.filter((id) => id !== user._id)
          : [...prev.likes, user._id],
      }
    })
  }

  // Gửi comment
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsCommenting(true)
    try {
      const result = await postService.addComment(postId, newComment.trim())
      setComments([...comments, result.comment || result])
      setNewComment('')
      setPost((prev) => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1,
      }))
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setIsCommenting(false)
    }
  }

  if (isLoading) return <LoadingSpinner text="Đang tải bài viết..." />

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Không tìm thấy bài viết.</p>
        <Link to="/" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    )
  }

  const isLiked = post.likes?.includes(user?._id)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Nút quay lại */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
      >
        <AiOutlineArrowLeft size={16} />
        Quay lại
      </Link>

      {/* Bài viết */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <PostContent post={post} isLiked={isLiked} onLike={handleLike} />
        <CommentSection
          comments={comments}
          commentsCount={post.comments_count}
          newComment={newComment}
          isCommenting={isCommenting}
          onCommentChange={setNewComment}
          onSubmitComment={handleSubmitComment}
        />
      </div>
    </div>
  )
}

export default PostDetailPage
