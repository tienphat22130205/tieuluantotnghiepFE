import { useState, useRef, useEffect, useMemo } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { FiPlus } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import storyService from '../services/storyService'
import CreateStoryModal from './CreateStoryModal'
import StoryViewerModal from './StoryViewerModal'
import { getSocket } from '@/services/socketClient'

import { mockStoriesData } from '../data/mockStories'

const StoriesBar = () => {
  const { user, token } = useAuth()
  const [stories, setStories] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(null) // null if not viewing
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  
  const scrollRef = useRef(null)

  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Bạn'

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await storyService.getStories()
        const rawStories = data && data.length > 0 ? data : mockStoriesData
        const mapped = rawStories.map((story) => {
          const u = story.user || {}
          const fullName = u.fullName || u.full_name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Người dùng'
          return {
            ...story,
            id: story._id || story.id,
            user: {
              ...u,
              fullName,
            },
          }
        })
        setStories(mapped)
      } catch (err) {
        console.error('Lỗi khi tải bảng tin:', err)
      }
    }
    fetchStories()
  }, [])

  // Listen to real-time socket events for story changes
  useEffect(() => {
    if (!token) return

    const socket = getSocket(token)
    if (!socket) return

    const handleStoryCreatedSocket = (newStory) => {
      setStories((prev) => {
        const storyId = String(newStory._id || newStory.id || '')
        if (prev.some((s) => String(s.id || s._id || '') === storyId)) return prev

        const u = newStory.user || {}
        const fullName = u.fullName || u.full_name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Người dùng'
        const mapped = {
          ...newStory,
          id: storyId,
          user: {
            ...u,
            fullName,
          },
        }
        return [mapped, ...prev]
      })
    }

    const handleStoryDeletedSocket = ({ storyId }) => {
      setStories((prev) => prev.filter((s) => String(s.id || s._id || '') !== String(storyId)))
    }

    socket.on('story:created', handleStoryCreatedSocket)
    socket.on('story:deleted', handleStoryDeletedSocket)

    return () => {
      socket.off('story:created', handleStoryCreatedSocket)
      socket.off('story:deleted', handleStoryDeletedSocket)
    }
  }, [token])

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkArrows)
      checkArrows()
      const timer = setTimeout(checkArrows, 500)
      return () => {
        el.removeEventListener('scroll', checkArrows)
        clearTimeout(timer)
      }
    }
  }, [stories])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      const offset = direction === 'left' ? -clientWidth * 0.7 : clientWidth * 0.7
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handleStoryCreated = (newStory) => {
    const storyId = String(newStory._id || newStory.id || '')
    const u = newStory.user || {}
    const fullName = u.fullName || u.full_name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || displayName
    const mapped = {
      ...newStory,
      id: storyId,
      user: {
        ...u,
        fullName,
      },
    }
    setStories((prev) => {
      if (prev.some((s) => String(s.id || s._id || '') === storyId)) return prev
      return [mapped, ...prev]
    })
  }

  const handleDeleteStoryFromState = (storyId) => {
    setStories((prev) => prev.filter((s) => String(s.id || s._id || '') !== String(storyId)))
  }

  const handleStoryViewed = (storyId) => {
    setStories((prev) =>
      prev.map((s) => {
        if (String(s.id || s._id || '') === String(storyId)) {
          const currentUserId = user?.id || user?._id
          const viewers = s.viewers || []
          if (!viewers.some((v) => String(v.user?._id || v.user?.id || v.user) === String(currentUserId))) {
            return {
              ...s,
              viewers: [...viewers, { user: currentUserId, viewedAt: new Date().toISOString() }],
            }
          }
        }
        return s
      })
    )
  }

  // Group stories by User ID
  const groupStoriesByUser = (flatStories) => {
    const groups = {}
    const seenStoryIds = new Set()

    flatStories.forEach((story) => {
      const storyId = String(story._id || story.id || '')
      if (!storyId || seenStoryIds.has(storyId)) return
      seenStoryIds.add(storyId)

      const u = story.user || {}
      const userId = String(u._id || u.id || (typeof story.user === 'string' ? story.user : '') || '')
      if (!userId) return

      if (!groups[userId]) {
        groups[userId] = {
          userId,
          user: typeof u === 'object' ? u : { _id: userId, fullName: 'Người dùng' },
          stories: [],
          latestStory: story,
        }
      }
      groups[userId].stories.push(story)

      // Get the latest story as the cover
      const currentLatestTime = new Date(groups[userId].latestStory.createdAt).getTime()
      const storyTime = new Date(story.createdAt).getTime()
      if (storyTime > currentLatestTime) {
        groups[userId].latestStory = story
      }
    })
    return Object.values(groups)
  }

  const userStoryGroups = useMemo(() => {
    const groups = groupStoriesByUser(stories)
    // Sort each group's stories oldest to newest (ascending) for chronological playback
    groups.forEach((group) => {
      group.stories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })
    return groups
  }, [stories])

  // Check if a group has any stories that the current user has not viewed yet
  const hasUnviewedStory = (group, currentUserId) => {
    if (!currentUserId) return false
    return group.stories.some((story) => {
      const viewers = story.viewers || []
      return !viewers.some((v) => String(v.user?._id || v.user?.id || v.user) === String(currentUserId))
    })
  }

  return (
    <div className="relative group/bar select-none">
      {/* Scroll left button */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-100 text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <HiChevronLeft size={24} />
        </button>
      )}

      {/* Scroll right button */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-slate-100 text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <HiChevronRight size={24} />
        </button>
      )}

      {/* Stories list container */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Create Story Card */}
        <div
          onClick={() => setIsCreateOpen(true)}
          className="relative w-[115px] h-[190px] flex-shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group/card"
        >
          <div className="h-[130px] overflow-hidden bg-slate-100">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-500 font-bold text-xl">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute top-[115px] left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-primary-600 border-[3px] border-white flex items-center justify-center text-white shadow group-hover/card:scale-110 transition-transform duration-200">
            <FiPlus size={20} strokeWidth={3} />
          </div>
          <div className="h-[60px] pt-4 px-2 pb-2 text-center bg-white">
            <span className="text-[12px] font-semibold text-slate-800 block truncate">Tạo tin</span>
          </div>
        </div>

        {/* Friend Stories */}
        {userStoryGroups.map((group, index) => {
          const hasNew = hasUnviewedStory(group, user?.id || user?._id)
          const latestStory = group.latestStory

          return (
            <div
              key={group.userId}
              onClick={() => {
                setViewerIndex(index)
              }}
              className="relative w-[115px] h-[190px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group/card border border-slate-100"
            >
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10" />

              {/* Story Background */}
              <div className="w-full h-full bg-slate-900">
                {latestStory.bgColor ? (
                  <div
                    className="w-full h-full flex items-center justify-center p-3.5 text-center"
                    style={{ background: latestStory.bgColor }}
                  >
                    <span
                      className="text-[10px] font-extrabold line-clamp-4 break-words drop-shadow"
                      style={{ color: latestStory.textColor || '#fff' }}
                    >
                      {latestStory.textContent}
                    </span>
                  </div>
                ) : latestStory.mediaType === 'video' ? (
                  <video
                    src={resolveMediaUrl(latestStory.mediaUrl)}
                    className={`w-full h-full object-${latestStory.objectFit || 'cover'} group-hover/card:scale-105 transition-transform duration-500`}
                    style={{ filter: latestStory.imageFilter && latestStory.imageFilter !== 'none' ? latestStory.imageFilter : undefined }}
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={resolveMediaUrl(latestStory.mediaUrl)}
                    alt={group.user.fullName}
                    className={`w-full h-full object-${latestStory.objectFit || 'cover'} group-hover/card:scale-105 transition-transform duration-500`}
                    style={{ filter: latestStory.imageFilter && latestStory.imageFilter !== 'none' ? latestStory.imageFilter : undefined }}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Author Avatar with blue or gray ring */}
              <div className="absolute top-3 left-3 z-15">
                <div className={`rounded-full ring-[3px] ${
                  hasNew ? 'ring-primary-500 animate-pulse' : 'ring-slate-400/70'
                } ring-offset-1 ring-offset-transparent bg-white overflow-hidden w-9 h-9 flex items-center justify-center shadow-md`}>
                  <Avatar
                    src={group.user.avatar}
                    name={group.user.fullName}
                    size="sm"
                    className="w-full h-full border-0 shadow-none"
                  />
                </div>
              </div>

              {/* Background Music sticker indicator */}
              {group.stories.some((s) => s.music?.title || s.spotifyUrl) && (
                <div className="absolute top-3 right-3 z-15 bg-black/40 backdrop-blur-xs rounded-full p-1 text-[9px] text-white flex items-center justify-center">
                  🎵
                </div>
              )}

              {/* Author Name */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-15">
                <span className="text-[12px] font-medium text-white block truncate drop-shadow-md">
                  {group.user.fullName}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Creation Modal */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleStoryCreated}
      />

      {/* Viewer Modal */}
      {viewerIndex !== null && (
        <StoryViewerModal
          isOpen={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          groups={userStoryGroups}
          initialGroupIndex={viewerIndex}
          currentUser={user}
          onDeleteStory={handleDeleteStoryFromState}
          onViewStory={handleStoryViewed}
        />
      )}
    </div>
  )
}

export default StoriesBar
