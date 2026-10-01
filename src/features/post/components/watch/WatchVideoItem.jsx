import { useState, useEffect, useRef } from 'react'
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineMessage,
  AiOutlineShareAlt,
  AiOutlinePlus,
  AiOutlineCheck,
  AiOutlineSound,
  AiFillSound,
} from 'react-icons/ai'
import {
  BsPlay,
  BsPause,
  BsBookmark,
  BsBookmarkFill,
  BsMusicNoteBeamed,
} from 'react-icons/bs'
import { FiCheckCircle } from 'react-icons/fi'
import { Avatar } from '@/components/ui'

const WatchVideoItem = ({
  video,
  isMuted,
  setIsMuted,
  isLiked,
  isSaved,
  isFollowed,
  likesCount,
  commentsCount,
  onLike,
  onSave,
  onFollow,
  onShare,
  onOpenComments,
}) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [progress, setProgress] = useState(0)

  // Autoplay via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
          } else {
            videoRef.current?.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.6 }
    )
    if (videoRef.current) observer.observe(videoRef.current)
    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current)
    }
  }, [])

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      setProgress((current / duration) * 100)
    }
  }

  const handlePlayToggle = () => {
    if (isPlaying) {
      videoRef.current?.pause()
      setIsPlaying(false)
      setShowOverlay(true)
      setTimeout(() => setShowOverlay(false), 600)
    } else {
      videoRef.current?.play().then(() => {
        setIsPlaying(true)
        setShowOverlay(true)
        setTimeout(() => setShowOverlay(false), 600)
      }).catch(() => {})
    }
  }

  const formatCount = (n) => {
    if (!n && n !== 0) return '0'
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return String(n)
  }

  return (
    <div
      id={video.id}
      className="snap-center shrink-0 w-full max-w-[440px] md:max-w-[460px] h-[calc(100vh-10rem)] md:h-[calc(100vh-8.5rem)] relative rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-800/80 group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.link}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayToggle}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Rich Multi-stop Dark Gradient Overlays for optimal readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      {/* Play/Pause Center Indicator */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-xl">
            {isPlaying ? <BsPlay size={36} className="translate-x-0.5" /> : <BsPause size={36} />}
          </div>
        </div>
      )}

      {/* Top Controls: Sound Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full p-2.5 transition-all border border-white/15 cursor-pointer shadow-md hover:scale-105 active:scale-95"
          title={isMuted ? 'Mở tiếng' : 'Tắt tiếng'}
        >
          {isMuted ? <AiOutlineSound size={18} /> : <AiFillSound size={18} className="text-primary-400" />}
        </button>
      </div>

      {/* Right Floating Action Pocket */}
      <div className="absolute right-3.5 bottom-16 flex flex-col items-center gap-4 z-20">
        {/* Like Button */}
        <button onClick={onLike} className="flex flex-col items-center gap-1 cursor-pointer group/btn" aria-label="Thích">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-lg ${
            isLiked
              ? 'bg-red-500 text-white scale-110 shadow-red-500/40 animate-like-heart'
              : 'bg-black/40 text-white hover:bg-black/60 border border-white/15 group-hover/btn:scale-105'
          }`}>
            {isLiked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
          </div>
          <span className="text-white text-[11px] font-black drop-shadow-md">{formatCount(likesCount)}</span>
        </button>

        {/* Comment Button */}
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1 cursor-pointer group/btn" aria-label="Bình luận">
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all shadow-lg group-hover/btn:scale-105">
            <AiOutlineMessage size={21} />
          </div>
          <span className="text-white text-[11px] font-black drop-shadow-md">{formatCount(commentsCount)}</span>
        </button>

        {/* Save / Bookmark Button */}
        <button onClick={onSave} className="flex flex-col items-center gap-1 cursor-pointer group/btn" aria-label="Lưu">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
            isSaved
              ? 'bg-amber-500 text-white scale-105 shadow-amber-500/40'
              : 'bg-black/40 hover:bg-black/60 text-white border border-white/15 group-hover/btn:scale-105'
          }`}>
            {isSaved ? <BsBookmarkFill size={18} /> : <BsBookmark size={18} />}
          </div>
          <span className="text-white text-[11px] font-bold drop-shadow-md">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
        </button>

        {/* Share Button */}
        <button onClick={onShare} className="flex flex-col items-center gap-1 cursor-pointer group/btn" aria-label="Chia sẻ">
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all shadow-lg group-hover/btn:scale-105">
            <AiOutlineShareAlt size={22} />
          </div>
          <span className="text-white text-[11px] font-bold drop-shadow-md">Chia sẻ</span>
        </button>
      </div>

      {/* Bottom Metadata & Author Info */}
      <div className="absolute left-4 bottom-4 right-18 z-20 space-y-2.5 text-white pointer-events-auto">
        {/* Author Header */}
        <div className="flex items-center gap-2.5">
          <Avatar src={video.user.avatar} name={video.user.name} size="md" className="ring-2 ring-white/80 shadow-md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="font-extrabold text-white text-sm truncate leading-none drop-shadow-sm">{video.user.name}</p>
              <FiCheckCircle size={13} className="text-primary-400 shrink-0" />
            </div>
            <p className="text-white/70 text-[11px] mt-0.5">@{video.user.username}</p>
          </div>
          <button
            onClick={onFollow}
            className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 border cursor-pointer ${
              isFollowed
                ? 'bg-white/20 text-white border-white/30 backdrop-blur-md'
                : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-500 shadow-md shadow-primary-600/40'
            }`}
          >
            {isFollowed ? <><AiOutlineCheck size={11} /> Đang theo</> : <><AiOutlinePlus size={11} /> Theo dõi</>}
          </button>
        </div>

        {/* Video Caption */}
        <p className="text-white/95 text-xs leading-relaxed line-clamp-2 font-medium drop-shadow-md">
          {video.title}
        </p>

        {/* Audio Ticker Badge */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 w-max max-w-[85%] shadow-sm">
          <BsMusicNoteBeamed size={11} className="text-primary-400 animate-pulse shrink-0" />
          <div className="overflow-hidden w-36 h-3.5 relative">
            <div className="absolute whitespace-nowrap text-[11px] text-white/90 font-semibold animate-marquee">
              Âm thanh gốc · {video.user.name}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-30">
        <div
          className="h-full bg-primary-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default WatchVideoItem
