import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { FiPlus } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import storyService from '../services/storyService'
import CreateStoryModal from './CreateStoryModal'
import StoryViewerModal from './StoryViewerModal'
import { getSocket } from '@/services/socketClient'

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
        const rawStories = data && data.length > 0 ? data : []
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

    const handleStoryViewedSocket = ({ storyId, viewers }) => {
      setStories((prev) =>
        prev.map((s) => {
          if (String(s.id || s._id || '') === String(storyId)) {
            return {
              ...s,
              viewers,
            }
          }
          return s
        })
      )
    }

    socket.on('story:created', handleStoryCreatedSocket)
    socket.on('story:deleted', handleStoryDeletedSocket)
    socket.on('story:viewed', handleStoryViewedSocket)

    return () => {
      socket.off('story:created', handleStoryCreatedSocket)
      socket.off('story:deleted', handleStoryDeletedSocket)
      socket.off('story:viewed', handleStoryViewedSocket)
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

  const handleDeleteStoryFromState = useCallback((storyId) => {
    setStories((prev) => prev.filter((s) => String(s.id || s._id || '') !== String(storyId)))
  }, [])

  const handleStoryViewed = useCallback((storyId) => {
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
  }, [user])

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

    const currentUserId = String(user?.id || user?._id || '')

    // Sort groups:
    // 1. Current user group always first
    // 2. Friends' groups sorted by their latest story's createdAt time (newest first, i.e., descending)
    return groups.sort((a, b) => {
      const isMeA = String(a.userId) === currentUserId
      const isMeB = String(b.userId) === currentUserId

      if (isMeA && !isMeB) return -1
      if (!isMeA && isMeB) return 1

      const timeA = a.latestStory ? new Date(a.latestStory.createdAt).getTime() : 0
      const timeB = b.latestStory ? new Date(b.latestStory.createdAt).getTime() : 0

      return timeB - timeA
    })
  }, [stories, user])

  // Check if a group has any stories that the current user has not viewed yet
  const hasUnviewedStory = (group, currentUserId) => {
    if (!currentUserId) return false
    return group.stories.some((story) => {
      const viewers = story.viewers || []
      return !viewers.some((v) => String(v.user?._id || v.user?.id || v.user) === String(currentUserId))
    })
  }

  return (
    <div className="bg-white rounded-3xl md:rounded-2xl p-0.5 md:p-4 shadow-none md:shadow-sm border-0 md:border md:border-slate-200/80 mb-1 md:mb-4 relative group/bar select-none">
      {/* Desktop Header title */}
      <div className="hidden md:flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Tin ngắn (Stories)</h3>
        <span className="text-xs text-slate-400 font-medium">Vuốt để xem</span>
      </div>

      {/* Scroll left button */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-6 top-[60%] -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <HiChevronLeft size={22} />
        </button>
      )}

      {/* Scroll right button */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-6 top-[60%] -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <HiChevronRight size={22} />
        </button>
      )}

      {/* MOBILE VIEW: Circular Avatar Stories (md:hidden) */}
      <div
        ref={scrollRef}
        className="md:hidden flex items-center gap-4 overflow-x-auto py-2 px-1.5 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Your Loop / Create Story Circle */}
        <div
          onClick={() => setIsCreateOpen(true)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group/circle"
        >
          <div className="relative w-[72px] h-[72px] rounded-full p-0.5 border-2 border-slate-200 group-hover/circle:border-primary-500 transition-colors">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-5.5 h-5.5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-sm">
              <FiPlus size={13} strokeWidth={3} />
            </div>
          </div>
          <span className="text-[12px] font-bold text-slate-900 text-center max-w-[76px] truncate tracking-tight">Your Loop</span>
        </div>

        {/* Friend Stories Circles with Gradient Rings */}
        {userStoryGroups.map((group, index) => {
          const hasNew = hasUnviewedStory(group, user?.id || user?._id)
          const username = group.user.username || group.user.fullName?.split(' ')[0] || 'user'

          return (
            <div
              key={group.userId}
              onClick={() => setViewerIndex(index)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group/circle"
            >
              <div className={`w-[72px] h-[72px] rounded-full p-[2.5px] ${
                hasNew
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600'
                  : 'bg-slate-200'
              }`}>
                <div className="w-full h-full rounded-full p-[2px] bg-white">
                  <img
                    src={group.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`}
                    alt={group.user.fullName}
                    className="w-full h-full rounded-full object-cover group-hover/circle:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              </div>
              <span className="text-[12px] font-semibold text-slate-800 text-center max-w-[76px] truncate tracking-tight">
                {username}
              </span>
            </div>
          )
        })}
      </div>

      {/* DESKTOP VIEW: Original Rectangular Card Stories (hidden md:flex) */}
      <div
        className="hidden md:flex gap-3 overflow-x-auto py-0.5 px-0.5 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Create Story Card */}
        <div
          onClick={() => setIsCreateOpen(true)}
          className="relative w-[120px] h-[185px] flex-shrink-0 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group/card"
        >
          <div className="h-[125px] overflow-hidden bg-slate-100">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute top-[110px] left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center text-white shadow-md group-hover/card:scale-110 transition-transform duration-200">
            <FiPlus size={18} strokeWidth={3} />
          </div>
          <div className="h-[60px] pt-4 px-1.5 pb-2 text-center bg-white">
            <span className="text-[12px] font-semibold text-slate-800 block truncate">Tạo tin</span>
          </div>
        </div>

        {/* Friend Stories Cards */}
        {userStoryGroups.map((group, index) => {
          const hasNew = hasUnviewedStory(group, user?.id || user?._id)
          const latestStory = group.latestStory

          return (
            <div
              key={group.userId}
              onClick={() => setViewerIndex(index)}
              className="relative w-[120px] h-[185px] flex-shrink-0 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group/card border border-slate-200/80"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20 z-10" />

              <div className="w-full h-full bg-slate-900">
                {latestStory.bgColor ? (
                  <div
                    className="w-full h-full flex items-center justify-center p-3 text-center"
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
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={resolveMediaUrl(latestStory.mediaUrl)}
                    alt={group.user.fullName}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="absolute top-2.5 left-2.5 z-20">
                <div className={`rounded-full ring-[2.5px] ${
                  hasNew ? 'ring-primary-500 animate-pulse' : 'ring-white/80'
                } bg-white overflow-hidden w-8 h-8 flex items-center justify-center shadow-md`}>
                  <Avatar
                    src={group.user.avatar}
                    name={group.user.fullName}
                    size="xs"
                    className="w-full h-full border-0 shadow-none"
                  />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2 z-20">
                <span className="text-[11px] font-semibold text-white block truncate drop-shadow-md">
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
