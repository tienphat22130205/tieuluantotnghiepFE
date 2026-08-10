import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { ConfirmModal } from '@/components/ui'
import { toast } from 'react-toastify'
import storyService from '../services/storyService'
import chatService from '@/features/chat/services/chatService'
import StoryArchiveModal from './StoryArchiveModal'
import StorySidebar from './StorySidebar'
import StoryCard from './StoryCard'
import StoryViewersBottomSheet from './StoryViewersBottomSheet'

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
  const [showViewersList, setShowViewersList] = useState(false)

  const [isApiReady, setIsApiReady] = useState(!!window.SpotifyIframeApi)
  const iframeApiRef = useRef(window.SpotifyIframeApi || null)
  const embedControllerRef = useRef(null)

  const shouldPause = isPaused || showConfirmDelete || isArchiveOpen || showViewersList



  const onViewStoryRef = useRef(onViewStory)
  useEffect(() => {
    onViewStoryRef.current = onViewStory
  })

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
    setShowViewersList(false)

    if (activeStory) {
      const storyId = activeStory.id || activeStory._id
      if (storyId && !String(storyId).startsWith('story-')) {
        storyService.viewStory(storyId)
          .then(() => {
            onViewStoryRef.current?.(storyId)
          })
          .catch((err) => {
            console.error('Lỗi khi đánh dấu xem tin:', err)
          })
      }
    }
  }, [currentGroupIndex, currentStoryIndex, activeStoryId])

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

  const sendStoryReply = async (text, isReaction = false) => {
    if (!activeStory || !activeStory.user) return

    const storyCreatorId = activeStory.user._id || activeStory.user.id || activeStory.user
    if (!storyCreatorId) return

    try {
      // 1. Get or create conversation
      const conversationRes = await chatService.createOrGetDirectConversation(storyCreatorId)
      const conversation = conversationRes?.data || conversationRes
      const conversationId = conversation?.id || conversation?._id

      if (!conversationId) {
        throw new Error('Không thể tạo cuộc trò chuyện')
      }

      // 2. Prepare message content & storyReply metadata
      const content = text
      const storyReply = {
        storyId: activeStory._id || activeStory.id,
        mediaUrl: activeStory.mediaUrl || '',
        mediaType: activeStory.mediaType || 'text',
        textContent: activeStory.textContent || '',
        bgColor: activeStory.bgColor || '',
      }

      // 3. Send message
      await chatService.sendMessage(conversationId, content, { storyReply })
      
      if (isReaction) {
        toast.success(`Đã bày tỏ cảm xúc ${text}`)
      } else {
        toast.success('Đã gửi phản hồi thành công!')
      }
    } catch (err) {
      console.error('Lỗi khi gửi phản hồi Story:', err)
      toast.error('Gửi phản hồi thất bại!')
    }
  }

  const handleEmojiClick = async (emoji) => {
    const id = `${Date.now()}-${Math.random()}`
    const leftOffset = Math.random() * 60 + 20 // 20% to 80% width
    const rotate = Math.random() * 40 - 20 // -20deg to 20deg
    
    setFloatingEmojis((prev) => [...prev, { id, emoji, leftOffset, rotate }])

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id))
    }, 1500)

    if (!isMyStory && activeStory && emoji !== '💬') {
      const storyId = activeStory.id || activeStory._id
      try {
        await storyService.reactStory(storyId, emoji)
        toast.success(`Đã bày tỏ cảm xúc ${emoji}`)
      } catch (err) {
        console.error('Lỗi khi bày tỏ cảm xúc Story:', err)
      }
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    const textToSend = replyText
    setReplyText('')
    handleEmojiClick('💬')
    await sendStoryReply(textToSend, false)
  }

  const reactionEmojis = ['👍', '❤️', '😆', '😮', '😢', '😡']

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex bg-black text-white select-none">
      
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
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* LEFT SIDEBAR - Story Picker List */}
      <StorySidebar
        groups={groups}
        currentGroupIndex={currentGroupIndex}
        setCurrentGroupIndex={setCurrentGroupIndex}
        setCurrentStoryIndex={setCurrentStoryIndex}
        onClose={onClose}
        setIsArchiveOpen={setIsArchiveOpen}
      />

      {/* RIGHT/CENTER THEATER VIEWPORT */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center relative h-full">
        
        {/* Navigation - Left Floating Arrow */}
        {(currentStoryIndex > 0 || currentGroupIndex > 0) && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 lg:left-4 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-slate-950/40 hover:bg-slate-900/80 border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg backdrop-blur-xs"
          >
            <FiChevronLeft size={24} />
          </button>
        )}

        {/* Navigation - Right Floating Arrow */}
        {(currentStoryIndex < activeStories.length - 1 || currentGroupIndex < groups.length - 1) && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 lg:right-4 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-slate-950/40 hover:bg-slate-900/80 border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg backdrop-blur-xs"
          >
            <FiChevronRight size={24} />
          </button>
        )}

        {/* Floating Emoji Animations overlay */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {floatingEmojis.map((item) => (
            <div
              key={item.id}
              className="absolute bottom-16 text-3xl emoji-float"
              style={{
                left: `${item.leftOffset}%`,
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* ACTIVE STORY CARD FRAME */}
        <StoryCard
          activeStory={activeStory}
          activeStories={activeStories}
          activeGroup={activeGroup}
          currentStoryIndex={currentStoryIndex}
          setCurrentStoryIndex={setCurrentStoryIndex}
          progress={progress}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isMyStory={isMyStory}
          handleDeleteClick={handleDeleteClick}
          floatingEmojis={floatingEmojis}
          handleEmojiClick={handleEmojiClick}
          replyText={replyText}
          setReplyText={setReplyText}
          handleSendReply={handleSendReply}
          reactionEmojis={reactionEmojis}
          setShowViewersList={setShowViewersList}
          shouldPause={shouldPause}
        />

        {/* Mobile Viewers Sheet Trigger Button (Bottom bar) */}
        {isMyStory && (
          <button
            type="button"
            onClick={() => setShowViewersList(true)}
            className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition cursor-pointer"
          >
            <span>👀 {activeStory?.viewers?.length || 0} lượt xem</span>
          </button>
        )}

        {/* Mobile Viewers Bottom Sheet Overlay */}
        {showViewersList && (
          <StoryViewersBottomSheet
            story={activeStory}
            onClose={() => setShowViewersList(false)}
          />
        )}

        {/* Floating Desktop Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
          title="Đóng"
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
    </div>,
    document.body
  )
}

export default StoryViewerModal
