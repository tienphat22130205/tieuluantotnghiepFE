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
  const [isBuffering, setIsBuffering] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false)
  const lastTapRef = useRef(0)

  // Autoplay via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current
              ?.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false))
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
  }, [video.link])

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      setProgress((current / duration) * 100)
    }
  }

  const handlePlayToggle = () => {
    if (hasError) {
      setHasError(false)
      if (videoRef.current) {
        videoRef.current.load()
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      }
      return
    }

    if (isPlaying) {
      videoRef.current?.pause()
      setIsPlaying(false)
      setShowOverlay(true)
      setTimeout(() => setShowOverlay(false), 700)
    } else {
      videoRef.current
        ?.play()
        .then(() => {
          setIsPlaying(true)
          setShowOverlay(true)
          setTimeout(() => setShowOverlay(false), 700)
        })
        .catch(() => {})
    }
  }

  // Handle double-tap to like
  const handleVideoAreaClick = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) onLike()
      setShowDoubleTapHeart(true)
      setTimeout(() => setShowDoubleTapHeart(false), 800)
      lastTapRef.current = 0
    } else {
      lastTapRef.current = now
      handlePlayToggle()
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
      className="snap-center shrink-0 flex items-end justify-center gap-3 sm:gap-4 my-2 select-none relative"
    >
      {/* ── Main Video Card ── */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-slate-800/80 w-[min(380px,88vw)] sm:w-[380px] md:w-[400px] h-[min(650px,calc(100vh-8.5rem))] aspect-[9/16]">
        {/* Ambient Blur Backdrop (ensures landscape or any ratio video looks cinematic without black voids) */}
        {video.poster && (
          <img
            src={video.poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40 pointer-events-none"
          />
        )}

        {/* Video Element */}
        {hasError ? (
          <div
            onClick={handlePlayToggle}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 cursor-pointer"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-red-400">
                <BsPlay size={32} />
              </div>
              <p className="text-sm font-semibold text-slate-200">Không thể tải video này</p>
              <span className="text-xs text-primary-400 font-bold underline">Bấm để tải lại</span>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={video.link}
            poster={video.poster}
            preload="metadata"
            loop
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onError={() => {
              setIsBuffering(false)
              setHasError(true)
            }}
            onClick={handleVideoAreaClick}
            className="relative z-10 w-full h-full object-cover sm:object-contain cursor-pointer"
          />
        )}

        {/* Multi-stop Dark Gradient Overlays for optimal text legibility */}
        <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/95 via-black/25 to-black/35 pointer-events-none" />

        {/* Buffering Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full border-3 border-white/20 border-t-primary-500 animate-spin" />
          </div>
        )}

        {/* Double Tap Floating Heart */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-ping duration-500">
            <AiFillHeart size={96} className="text-red-500 drop-shadow-[0_10px_25px_rgba(239,68,68,0.7)]" />
          </div>
        )}

        {/* Play/Pause Center Indicator */}
        {showOverlay && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-xl">
              {isPlaying ? <BsPlay size={36} className="translate-x-0.5" /> : <BsPause size={36} />}
            </div>
          </div>
        )}

        {/* Paused Static Floating Icon if video is paused and not buffering */}
        {!isPlaying && !isBuffering && !hasError && !showOverlay && (
          <div
            onClick={handlePlayToggle}
            className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 border border-white/20">
              <BsPlay size={38} className="translate-x-0.5 text-white" />
            </div>
          </div>
        )}

        {/* Top Controls: Sound Toggle */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsMuted(!isMuted)
            }}
            className="outline-none focus:outline-none focus:ring-0 active:outline-none bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full p-2.5 transition-all border border-white/20 cursor-pointer shadow-md hover:scale-105 active:scale-95"
            title={isMuted ? 'Mở tiếng' : 'Tắt tiếng'}
          >
            {isMuted ? <AiOutlineSound size={18} /> : <AiFillSound size={18} className="text-primary-400" />}
          </button>
        </div>

        {/* Bottom Metadata & Author Info */}
        <div className="absolute left-3.5 bottom-3.5 right-14 sm:right-3.5 z-20 space-y-2 text-white pointer-events-auto">
          {/* Author Header */}
          <div className="flex items-center gap-2.5">
            <Avatar src={video.user.avatar} name={video.user.name} size="sm" className="ring-2 ring-white/80 shadow-md shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="font-extrabold text-white text-xs sm:text-sm truncate leading-none drop-shadow-sm">{video.user.name}</p>
                <FiCheckCircle size={12} className="text-primary-400 shrink-0" />
              </div>
              <p className="text-white/70 text-[10px] sm:text-[11px] mt-0.5">@{video.user.username}</p>
            </div>
            <button
              onClick={onFollow}
              className={`shrink-0 outline-none focus:outline-none focus:ring-0 active:outline-none flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all duration-200 border cursor-pointer ${
                isFollowed
                  ? 'bg-white/20 text-white border-white/30 backdrop-blur-md'
                  : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-500 shadow-md shadow-primary-600/40'
              }`}
            >
              {isFollowed ? <><AiOutlineCheck size={10} /> Đang theo</> : <><AiOutlinePlus size={10} /> Theo dõi</>}
            </button>
          </div>

          {/* Video Caption */}
          <p className="text-white/95 text-xs leading-relaxed line-clamp-2 font-medium drop-shadow-md">
            {video.title}
          </p>

          {/* Audio Ticker Badge */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1 w-max max-w-full shadow-sm">
            <BsMusicNoteBeamed size={11} className="text-primary-400 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-white/90 font-medium truncate">
              Âm thanh gốc · {video.user.name}
            </span>
          </div>
        </div>

        {/* Playback Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-30">
          <div
            className="h-full bg-primary-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mobile floating action pocket inside video (< sm screens) */}
        <div className="sm:hidden absolute right-2 bottom-14 flex flex-col items-center gap-3.5 z-25">
          {/* Like */}
          <button onClick={onLike} className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1 cursor-pointer">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
              isLiked ? 'bg-red-500 text-white scale-110 shadow-red-500/40' : 'bg-black/50 text-white border border-white/20'
            }`}>
              {isLiked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
            </div>
            <span className="text-white text-[10px] font-black drop-shadow-md">{formatCount(likesCount)}</span>
          </button>

          {/* Comment */}
          <button onClick={onOpenComments} className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
              <AiOutlineMessage size={19} />
            </div>
            <span className="text-white text-[10px] font-black drop-shadow-md">{formatCount(commentsCount)}</span>
          </button>

          {/* Save */}
          <button onClick={onSave} className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1 cursor-pointer">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
              isSaved ? 'bg-amber-500 text-white scale-105 shadow-amber-500/40' : 'bg-black/50 text-white border border-white/20'
            }`}>
              {isSaved ? <BsBookmarkFill size={16} /> : <BsBookmark size={16} />}
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
          </button>

          {/* Share */}
          <button onClick={onShare} className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
              <AiOutlineShareAlt size={19} />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md">Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* ── Desktop Right Floating Action Pocket (Beside Video - TikTok Style) ── */}
      <div className="hidden sm:flex flex-col items-center gap-4 pb-2 z-20">
        {/* Like Button */}
        <button
          type="button"
          onClick={onLike}
          className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1.5 cursor-pointer group"
          aria-label="Thích"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-md ${
            isLiked
              ? 'bg-red-500 text-white scale-110 shadow-red-500/50'
              : 'bg-white/90 dark:bg-slate-800/80 text-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 group-hover:scale-110'
          }`}>
            {isLiked ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
          </div>
          <span className="text-slate-600 dark:text-slate-300 text-xs font-black drop-shadow-xs">{formatCount(likesCount)}</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={onOpenComments}
          className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1.5 cursor-pointer group"
          aria-label="Bình luận"
        >
          <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center backdrop-blur-md border border-slate-200/90 dark:border-slate-700 transition-all duration-200 shadow-md group-hover:scale-110">
            <AiOutlineMessage size={22} />
          </div>
          <span className="text-slate-600 dark:text-slate-300 text-xs font-black drop-shadow-xs">{formatCount(commentsCount)}</span>
        </button>

        {/* Save / Bookmark Button */}
        <button
          type="button"
          onClick={onSave}
          className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1.5 cursor-pointer group"
          aria-label="Lưu"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-md ${
            isSaved
              ? 'bg-amber-500 text-white scale-105 shadow-amber-500/50'
              : 'bg-white/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200/90 dark:border-slate-700 group-hover:scale-110'
          }`}>
            {isSaved ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
          </div>
          <span className="text-slate-600 dark:text-slate-300 text-xs font-bold drop-shadow-xs">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={onShare}
          className="outline-none focus:outline-none focus:ring-0 active:outline-none flex flex-col items-center gap-1.5 cursor-pointer group"
          aria-label="Chia sẻ"
        >
          <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center backdrop-blur-md border border-slate-200/90 dark:border-slate-700 transition-all duration-200 shadow-md group-hover:scale-110">
            <AiOutlineShareAlt size={22} />
          </div>
          <span className="text-slate-600 dark:text-slate-300 text-xs font-bold drop-shadow-xs">Chia sẻ</span>
        </button>
      </div>
    </div>
  )
}

export default WatchVideoItem
