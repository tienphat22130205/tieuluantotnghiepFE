import { useState, useEffect, useRef } from 'react'
import { FiX, FiChevronLeft, FiChevronRight, FiMusic, FiVolume2, FiVolumeX, FiSend, FiPause, FiPlay, FiPlus, FiSettings, FiTrash } from 'react-icons/fi'
import { Avatar, ConfirmModal } from '@/components/ui'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { toast } from 'react-toastify'
import storyService from '../services/storyService'
import StoryArchiveModal from './StoryArchiveModal'

const getSpotifyEmbedWithAutoplay = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('autoplay=1')) return trimmed;
  const separator = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${separator}autoplay=1`;
};

const StoryViewerModal = ({ isOpen, onClose, groups = [], initialGroupIndex = 0, currentUser, onDeleteStory, onViewStory }) => {
  if (!isOpen || groups.length === 0) return null

  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [floatingEmojis, setFloatingEmojis] = useState([])
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)

  const [isApiReady, setIsApiReady] = useState(!!window.SpotifyIframeApi)
  const iframeApiRef = useRef(window.SpotifyIframeApi || null)
  const embedControllerRef = useRef(null)

  const shouldPause = isPaused || showConfirmDelete || isArchiveOpen



  const activeGroup = groups[currentGroupIndex]
  const activeStories = activeGroup?.stories || []
  const activeStory = activeStories[currentStoryIndex]
  const activeGroupId = activeGroup?.userId ? String(activeGroup.userId) : activeGroup?._id ? String(activeGroup._id) : activeGroup?.id ? String(activeGroup.id) : ''
  const activeStoryId = activeStory?.id ? String(activeStory.id) : activeStory?._id ? String(activeStory._id) : ''

  // Close if active group or story becomes unavailable (e.g., deleted)
  useEffect(() => {
    if (!activeGroup || !activeStory) {
      onClose()
    }
  }, [activeGroupId, activeStoryId, onClose])

  // Reset progress on story change & record view
  useEffect(() => {
    setProgress(0)
    setIsPaused(false)

    if (activeStory) {
      const storyId = activeStory.id || activeStory._id
      if (storyId && !String(storyId).startsWith('story-')) {
        storyService.viewStory(storyId)
          .then(() => {
            onViewStory?.(storyId)
          })
          .catch((err) => {
            console.error('Lỗi khi đánh dấu xem tin:', err)
          })
      }
    }
  }, [currentGroupIndex, currentStoryIndex, activeStoryId, onViewStory])

  // Load Spotify Iframe API
  useEffect(() => {
    if (window.SpotifyIframeApi) {
      iframeApiRef.current = window.SpotifyIframeApi
      setIsApiReady(true)
      return
    }

    const scriptId = 'spotify-iframe-api-script'
    let script = document.getElementById(scriptId)
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://open.spotify.com/embed/iframe-api'
      script.async = true
      document.body.appendChild(script)
    }

    const oldCallback = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (oldCallback) oldCallback(IFrameAPI)
      iframeApiRef.current = IFrameAPI
      window.SpotifyIframeApi = IFrameAPI
      setIsApiReady(true)
    }

    return () => {
      if (window.onSpotifyIframeApiReady === window.onSpotifyIframeApiReady) {
        window.onSpotifyIframeApiReady = oldCallback
      }
    }
  }, [])

  // Initialize and play Spotify embed when story changes
  useEffect(() => {
    if (!activeStory || !activeStory.spotifyUrl || !isApiReady) {
      embedControllerRef.current = null
      return
    }

    let isCancelled = false

    const timer = setTimeout(() => {
      if (isCancelled) return
      const element = document.getElementById('spotify-story-iframe')
      if (element && iframeApiRef.current) {
        iframeApiRef.current.createController(element, {}, (EmbedController) => {
          if (isCancelled) return
          embedControllerRef.current = EmbedController
          try {
            EmbedController.play()
          } catch (e) {
            console.warn('Autoplay failed or was blocked by browser autoplay policy:', e)
          }
        });
      }
    }, 400)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    };
  }, [currentGroupIndex, currentStoryIndex, activeStoryId, activeStory?.spotifyUrl, isApiReady])

  // Sync play/pause state with Spotify controller
  useEffect(() => {
    if (embedControllerRef.current) {
      try {
        if (shouldPause) {
          embedControllerRef.current.pause()
        } else {
          embedControllerRef.current.play()
        }
      } catch (e) {
        console.warn('Failed to toggle play/pause via EmbedController:', e)
      }
    }
  }, [shouldPause])


  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
    } else if (currentGroupIndex > 0) {
      const prevGroup = groups[currentGroupIndex - 1]
      const prevStoriesCount = prevGroup?.stories?.length || 0
      setCurrentGroupIndex((prev) => prev - 1)
      setCurrentStoryIndex(prevStoriesCount > 0 ? prevStoriesCount - 1 : 0)
    } else {
      setProgress(0)
    }
  }

  const handleNext = () => {
    if (currentStoryIndex < activeStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1)
    } else if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1)
      setCurrentStoryIndex(0)
    } else {
      onClose()
    }
  }

  const handleNextRef = useRef(handleNext)
  useEffect(() => { handleNextRef.current = handleNext })

  // Progress Bar – timestamp-based, immune to render freq & drift
  const progressRef = useRef(0)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // Reset when story changes
    progressRef.current = 0
    startTimeRef.current = null
    setProgress(0)
  }, [currentGroupIndex, currentStoryIndex, activeStoryId])

  useEffect(() => {
    if (!activeStory || shouldPause) return

    const storyDuration = (activeStory.duration ?? 5) * 1000

    // Resume from wherever progress was when paused
    const resumeFrom = progressRef.current
    const alreadyElapsed = (resumeFrom / 100) * storyDuration
    startTimeRef.current = Date.now() - alreadyElapsed

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const next = Math.min((elapsed / storyDuration) * 100, 100)
      progressRef.current = next
      setProgress(next)
      if (next >= 100) {
        clearInterval(interval)
        handleNextRef.current()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [currentGroupIndex, currentStoryIndex, shouldPause, activeStoryId])

  if (!activeGroup || !activeStory) return null

  const isMyStory = currentUser && String(activeStory?.user?._id || activeStory?.user?.id || activeStory?.user) === String(currentUser?.id || currentUser?._id)

  const handleDeleteClick = () => {
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false)
    const storyId = activeStory.id || activeStory._id
    try {
      await storyService.deleteStory(storyId)
      toast.success('Đã xóa tin thành công!')
      onDeleteStory?.(storyId)

      // Advancing to next story or group
      if (activeStories.length <= 1) {
        if (groups.length <= 1) {
          onClose()
        } else {
          if (currentGroupIndex < groups.length - 1) {
            // Stay on same group index (as the deleted one will be filtered out from props)
            setCurrentStoryIndex(0)
          } else {
            setCurrentGroupIndex((prev) => Math.max(0, prev - 1))
            setCurrentStoryIndex(0)
          }
        }
      } else {
        if (currentStoryIndex >= activeStories.length - 1) {
          setCurrentStoryIndex((prev) => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Xóa tin thất bại!')
    }
  }

  const handleEmojiClick = (emoji) => {
    const id = `${Date.now()}-${Math.random()}`
    const leftOffset = Math.random() * 60 + 20 // 20% to 80% width
    const rotate = Math.random() * 40 - 20 // -20deg to 20deg
    
    setFloatingEmojis((prev) => [...prev, { id, emoji, leftOffset, rotate }])

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id))
    }, 1500)
  }

  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    handleEmojiClick('💬')
    setReplyText('')
  }

  const reactionEmojis = ['👍', '❤️', '😆', '😮', '😢', '😡']

  return (
    <div className="fixed inset-0 z-50 flex bg-black text-white select-none">
      
      {/* CSS Floating Emoji styles */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100%) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(50%) scale(1.1);
          }
          100% {
            transform: translateY(-400px) scale(0.8);
            opacity: 0;
          }
        }
        .emoji-float {
          animation: floatUp 1.5s ease-out forwards;
        }
      `}</style>

      {/* LEFT SIDEBAR - Story Picker List */}
      <div className="w-[360px] hidden md:flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 shrink-0 z-10">
        
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Đóng bảng tin"
            >
              <FiX size={20} />
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 flex-shrink-0">
              <img src="/Zlogo.png" alt="Zivo" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex justify-between items-end pt-1">
            <h1 className="text-2xl font-bold">Tin</h1>
            <div className="flex gap-2.5 text-xs text-primary-400 font-semibold">
              <span onClick={() => setIsArchiveOpen(true)} className="hover:underline cursor-pointer">Kho lưu trữ</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Cài đặt</span>
            </div>
          </div>
        </div>

        {/* Story List Items grouped by user */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          
          {/* Tin của bạn (Create Shortcut) */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 block mb-2">Tin của bạn</span>
            <div className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-900/60 cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-800">
              <div className="relative w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 shrink-0 shadow border border-slate-700 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                <FiPlus size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-bold block">Tạo tin</span>
                <span className="text-xs text-slate-400 block mt-0.5">Chia sẻ ảnh, video hoặc viết gì đó</span>
              </div>
            </div>
          </div>

          {/* Tất cả tin */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 block mb-2">Tất cả tin</span>
            <div className="space-y-1">
              {groups.map((group, idx) => {
                const isActive = idx === currentGroupIndex
                return (
                  <div
                    key={String(group.userId)}
                    onClick={() => {
                      setCurrentGroupIndex(idx)
                      setCurrentStoryIndex(0)
                    }}
                    className={`flex items-center gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border-l-4 ${
                      isActive
                        ? 'bg-primary-600/10 text-primary-300 border-primary-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]'
                        : 'hover:bg-slate-900/40 border-transparent text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        src={group.user.avatar}
                        name={group.user.fullName}
                        size="md"
                        className={`border-2 transition-all ${
                          isActive ? 'border-primary-500 shadow-lg' : 'border-slate-800'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold block truncate ${isActive ? 'text-primary-300' : 'text-slate-200'}`}>{group.user.fullName}</span>
                      <span className="text-xs text-slate-500 block truncate mt-0.5">
                        {group.stories.length} tin hoạt động
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT/CENTER THEATER VIEWPORT */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center relative h-full">
        
        {/* Navigation - Left Floating Arrow */}
        {(currentStoryIndex > 0 || currentGroupIndex > 0) && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-6 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg backdrop-blur-xs"
          >
            <FiChevronLeft size={24} />
          </button>
        )}

        {/* Navigation - Right Floating Arrow */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-6 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg backdrop-blur-xs"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Interactive Story Container card */}
        <div
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative w-full max-w-[420px] h-[92vh] rounded-2xl overflow-hidden bg-slate-900 flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-slate-800"
        >
          {/* Background Story Content */}
          <div className="absolute inset-0 z-0">
            {activeStory.bgColor ? (
              <div
                className="w-full h-full flex items-center justify-center p-6 text-center"
                style={{ background: activeStory.bgColor }}
              >
                <span
                  className="text-lg md:text-xl font-bold max-w-full break-words whitespace-pre-wrap drop-shadow-md"
                  style={{ color: activeStory.textColor || '#fff' }}
                >
                  {activeStory.textContent}
                </span>
              </div>
            ) : activeStory.mediaType === 'video' ? (
              <video
                src={resolveMediaUrl(activeStory.mediaUrl)}
                className={`w-full h-full object-${activeStory.objectFit || 'cover'}`}
                style={{ filter: activeStory.imageFilter && activeStory.imageFilter !== 'none' ? activeStory.imageFilter : undefined }}
                autoPlay
                muted={isMuted}
                loop
                playsInline
              />
            ) : (
              <img
                src={resolveMediaUrl(activeStory.mediaUrl)}
                alt={activeGroup.user.fullName}
                className={`w-full h-full object-${activeStory.objectFit || 'cover'}`}
                style={{ filter: activeStory.imageFilter && activeStory.imageFilter !== 'none' ? activeStory.imageFilter : undefined }}
              />
            )}
            {/* Top and bottom dark overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/70" />
          </div>

          {/* Top Interface: Dashboards & Info header */}
          <div className="relative z-20 p-4 pb-0 space-y-3">
            
            {/* Dash progress bars (specific to the active user group only) */}
            <div className="flex gap-1.5 w-full">
              {activeStories.map((story, idx) => {
                let dashProgress = 0
                if (idx < currentStoryIndex) dashProgress = 100
                if (idx === currentStoryIndex) dashProgress = progress

                const storyId = story.id || story._id
                return (
                  <div
                    key={String(storyId)}
                    onClick={() => setCurrentStoryIndex(idx)}
                    className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                  >
                    <div
                      className="h-full bg-white"
                      style={{ width: `${dashProgress}%` }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Author info & Theater Mode settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={activeGroup.user.avatar}
                  name={activeGroup.user.fullName}
                  size="sm"
                  className="border-2 border-white/60 shadow"
                />
                <div>
                  <span className="text-sm font-bold text-white block leading-none">
                    {activeGroup.user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-300 block mt-1 leading-none">
                    {activeStory.createdAt}
                  </span>
                  {/* Music title under name and time */}
                  {((activeStory.music && activeStory.music.title) || activeStory.spotifyUrl) && (
                    <div 
                      onClick={() => activeStory.spotifyUrl && window.open(activeStory.spotifyUrl, '_blank')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-white/95 mt-1 hover:underline cursor-pointer select-none drop-shadow-sm"
                      title={activeStory.spotifyUrl ? "Nghe trên Spotify" : ""}
                    >
                      <span className="truncate max-w-[180px]">
                        🎵 {activeStory.music?.title || 'Spotify Song'} - {activeStory.music?.artist || 'Spotify Artist'}
                      </span>
                      <span className="text-[10px] shrink-0 font-bold">&gt;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Header Action controls */}
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs rounded-full p-1 border border-white/5">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                  title={isPaused ? 'Phát' : 'Tạm dừng'}
                >
                  {isPaused ? <FiPlay size={16} /> : <FiPause size={16} />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                  title={isMuted ? 'Bật âm' : 'Tắt âm'}
                >
                  {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                </button>
                {isMyStory && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition cursor-pointer"
                    title="Xóa tin này"
                  >
                    <FiTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Spotify Mini Player – compact, shown at bottom of story */}
          {activeStory.spotifyUrl && (
            <div className="absolute bottom-[130px] left-4 right-4 z-20">
              <iframe
                id="spotify-story-iframe"
                key={activeStory.id || activeStory._id}
                title="Spotify Player"
                src={getSpotifyEmbedWithAutoplay(activeStory.spotifyUrl)}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                style={{ borderRadius: '12px', border: 'none' }}
              />
            </div>
          )}

          {/* Floating animations layer */}
          <div className="absolute inset-x-0 bottom-[140px] top-[140px] pointer-events-none z-30 overflow-hidden">
            {floatingEmojis.map((item) => (
              <div
                key={item.id}
                className="absolute bottom-0 emoji-float text-4xl"
                style={{
                  left: `${item.leftOffset}%`,
                  transform: `rotate(${item.rotate}deg)`,
                }}
              >
                {item.emoji}
              </div>
            ))}
          </div>

          {/* Bottom Interface: Messages & Emoji Panel */}
          <div className="relative z-20 p-4 space-y-3.5">
            
            {/* Quick emoji reaction row */}
            <div className="flex gap-2.5 justify-center py-1.5 bg-slate-950/40 backdrop-blur-xs rounded-full border border-slate-800/50 max-w-[340px] mx-auto px-4 shadow">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-3xl hover:scale-130 active:scale-95 transition-transform duration-100 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* DM Chat input */}
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Gửi tin nhắn..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-10 h-10 rounded-full bg-primary-600 disabled:bg-white/10 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 transition duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                <FiSend size={15} />
              </button>
            </form>

          </div>

        </div>

        {/* Mini close button (mobile fallback) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden z-30 p-2 rounded-full bg-black/60 text-white cursor-pointer"
        >
          <FiX size={18} />
        </button>

      </div>

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        message="Bạn có chắc chắn muốn xóa tin này không? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />

      {/* Archive Modal */}
      <StoryArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onDeleteStoryFromParent={onDeleteStory}
      />
    </div>
  )
}

export default StoryViewerModal
