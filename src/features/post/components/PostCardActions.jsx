import { Link } from 'react-router-dom'
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineShareAlt,
} from 'react-icons/ai'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'

/**
 * PostCardActions – Nút tương tác: Like, Comment, Share, Save.
 * Props: postId, likesCount, commentsCount, isLiked, saved, onLike, onSave
 */
const PostCardActions = ({
  postId,
  likesCount,
  commentsCount,
  isLiked,
  saved,
  onLike,
  onSave,
}) => {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Like */}
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          {isLiked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        {/* Comment */}
        <Link
          to={`/post/${postId}`}
          className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <AiOutlineComment size={22} />
          <span className="text-sm font-medium">{commentsCount}</span>
        </Link>

        {/* Share */}
        <button className="text-gray-500 hover:text-primary-600 transition-colors">
          <AiOutlineShareAlt size={22} />
        </button>
      </div>

      {/* Bookmark / Save */}
      <button
        onClick={onSave}
        className={`transition-colors ${
          saved ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
        }`}
      >
        {saved ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
      </button>
    </div>
  )
}

export default PostCardActions
