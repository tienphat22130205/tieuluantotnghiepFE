import {
  AiFillLike,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineMessage,
  AiOutlineShareAlt,
  AiOutlineSmile,
  AiOutlineSend,
} from 'react-icons/ai'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

const PostCardActions = ({
  post,
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  saved = false,
  onLike,
  onSave,
  onCommentClick,
  onShareClick,
  onEmojiClick,
  isOverlay = false,
}) => {
  const [heartBursts, setHeartBursts] = useState([])

  const heartOffsets = useMemo(
    () => [
      { x: -18, y: -56 },
      { x: -4, y: -70 },
      { x: 12, y: -60 },
    ],
    []
  )

  const handleLikeClick = () => {
    onLike?.()

    if (!isLiked) {
      const burstId = Date.now()
      setHeartBursts((prev) => [...prev, burstId])
      setTimeout(() => {
        setHeartBursts((prev) => prev.filter((id) => id !== burstId))
      }, 700)
    }
  }

  const formattedLikes = useMemo(() => {
    if (!likesCount || likesCount <= 0) return '0 Liked'
    if (likesCount >= 1000) return `${(likesCount / 1000).toFixed(1)}k Liked`
    return `${likesCount} Liked`
  }, [likesCount])

  // Extract real liked user avatars if populated in post.likes or post.likedUsers
  const realLikerAvatars = useMemo(() => {
    const rawLikes = post?.likes || post?.likedUsers || []
    if (!Array.isArray(rawLikes)) return []

    return rawLikes
      .filter((item) => item && typeof item === 'object' && (item.avatar || item.profile_pic))
      .slice(0, 3)
      .map((u) => u.avatar || u.profile_pic)
  }, [post?.likes, post?.likedUsers])

  return (
    <div className="flex items-center gap-2 md:gap-3 px-1 py-0.5">
      {/* Left Action Buttons (Heart, Comment, Share, Emoji) */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Like Heart Button */}
        <motion.button
          onClick={handleLikeClick}
          className={`p-1 transition-colors cursor-pointer ${
            isLiked ? 'text-red-500' : 'text-slate-800 hover:text-red-500'
          } relative`}
          whileTap={{ scale: 0.88 }}
          animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.28 }}
          title="Thích"
        >
          <motion.span
            animate={isLiked ? { rotate: [0, -14, 14, 0] } : { rotate: 0 }}
            transition={{ duration: 0.35 }}
          >
            {isLiked ? <AiFillHeart size={24} className="text-red-500" /> : <AiOutlineHeart size={24} />}
          </motion.span>

          <AnimatePresence>
            {heartBursts.map((burstId) => (
              <motion.div
                key={burstId}
                className="absolute left-2 bottom-2 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              >
                {heartOffsets.map((offset, index) => (
                  <motion.span
                    key={`${burstId}-${index}`}
                    className="absolute text-red-500"
                    initial={{ x: 0, y: 0, scale: 0.6, opacity: 1 }}
                    animate={{
                      x: offset.x,
                      y: offset.y,
                      scale: 1,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.65, ease: 'easeOut', delay: index * 0.04 }}
                  >
                    <AiFillHeart size={14} />
                  </motion.span>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={onCommentClick}
          className="p-1 text-slate-800 hover:text-primary-600 transition-colors cursor-pointer flex items-center gap-1"
          title="Bình luận"
        >
          <AiOutlineMessage size={23} />
          {commentsCount > 0 && <span className="text-xs font-semibold text-slate-700">{commentsCount}</span>}
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={onShareClick}
          className="p-1 text-slate-800 hover:text-primary-600 transition-colors cursor-pointer"
          title="Chia sẻ"
        >
          <AiOutlineSend size={21} className="-rotate-12" />
        </button>
      </div>

      {/* Likers Stack & Count Badge (for text-only posts) */}
      {!post?.images?.length && !post?.image_url && likesCount > 0 && (
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-slate-50 cursor-pointer"
          onClick={onCommentClick}
        >
          {realLikerAvatars.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {realLikerAvatars.map((src, i) => (
                <img
                  key={i}
                  className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                  src={src}
                  alt={`Liker ${i + 1}`}
                />
              ))}
            </div>
          )}
          <span className="text-[11px] font-bold text-slate-800">{formattedLikes}</span>
        </div>
      )}
    </div>
  )
}

export default PostCardActions
