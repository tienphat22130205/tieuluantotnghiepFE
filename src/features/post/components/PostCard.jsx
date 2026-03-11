import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleLike } from '../store/postSlice'
import PostCardHeader from './PostCardHeader'
import PostCardActions from './PostCardActions'
import PostCardBody from './PostCardBody'

/**
 * PostCard Component – Card hiển thị 1 bài viết trên Newsfeed.
 * Props: post (Object)
 */
const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [saved, setSaved] = useState(false)

  const isLiked = post.likes?.includes(user?._id)

  const handleLike = () => dispatch(toggleLike(post._id))
  const handleSave = () => setSaved(!saved)

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
        postId={post._id}
        likesCount={post.likes?.length || 0}
        commentsCount={post.comments_count || 0}
        isLiked={isLiked}
        saved={saved}
        onLike={handleLike}
        onSave={handleSave}
      />

      <PostCardBody post={post} />
    </div>
  )
}

export default PostCard
