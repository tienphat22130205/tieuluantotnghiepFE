import {
  AiFillLike,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineShareAlt,
} from 'react-icons/ai'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

/**
 * PostCardActions – Nút tương tác: Like, Comment, Share, Save.
 * Props: likesCount, commentsCount, isLiked, saved, onLike, onSave, onCommentClick
 */
const PostCardActions = ({
  likesCount,
  commentsCount,
  isLiked,
  saved,
  onLike,
  onSave,
  onCommentClick,
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

  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Like */}
        <motion.button
          onClick={handleLikeClick}
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          } relative`}
          whileTap={{ scale: 0.88 }}
          animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.28 }}
        >
          <motion.span
            animate={isLiked ? { rotate: [0, -14, 14, 0] } : { rotate: 0 }}
            transition={{ duration: 0.35 }}
          >
            {isLiked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
          </motion.span>
          <span className="text-sm font-medium">{likesCount}</span>

          <AnimatePresence>
            {heartBursts.map((burstId) => (
              <motion.div
                key={burstId}
                className="absolute left-3 bottom-3 pointer-events-none"
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
                    <AiFillLike size={14} />
                  </motion.span>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.button>

        {/* Comment */}
        <button
          onClick={onCommentClick}
          className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <AiOutlineComment size={22} />
          <span className="text-sm font-medium">{commentsCount}</span>
        </button>

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
