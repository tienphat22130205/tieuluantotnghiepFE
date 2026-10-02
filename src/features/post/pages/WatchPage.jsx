import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '@/features/auth'
import {
  FALLBACK_VIDEOS,
  INITIAL_COMMENTS,
} from '../constants/watchConstants'
import WatchSidebar from '../components/watch/WatchSidebar'
import WatchMobileHeader from '../components/watch/WatchMobileHeader'
import WatchPlaylistSidebar from '../components/watch/WatchPlaylistSidebar'
import WatchCommentsDrawer from '../components/watch/WatchCommentsDrawer'
import WatchVideoItem from '../components/watch/WatchVideoItem'

const WatchPage = () => {
  const { user: currentUser } = useAuth()
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [likedVideos, setLikedVideos] = useState({})
  const [savedVideos, setSavedVideos] = useState({})
  const [followedUsers, setFollowedUsers] = useState({})
  const [likesCount, setLikesCount] = useState({})
  const [comments, setComments] = useState(INITIAL_COMMENTS)
  const [activeCommentVideoId, setActiveCommentVideoId] = useState(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('for-you')
  const [selectedTag, setSelectedTag] = useState(null)

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true)
      const apiKey = import.meta.env.VITE_PEXELS_API_KEY
      if (!apiKey) {
        setVideos(FALLBACK_VIDEOS)
        const likes = {}
        FALLBACK_VIDEOS.forEach((v) => {
          likes[v.id] = v.likes
        })
        setLikesCount(likes)
        setIsLoading(false)
        return
      }
      try {
        const res = await axios.get('https://api.pexels.com/videos/popular?per_page=12', {
          headers: { Authorization: apiKey },
        })
        const fetched = res.data.videos.map((vid, idx) => {
          const file = vid.video_files.find((f) => f.quality === 'sd' || f.width <= 720) || vid.video_files[0]
          return {
            id: `pexels-${vid.id}`,
            link: file?.link || '',
            title: `Khám phá video phong cảnh tuyệt đẹp cùng cộng đồng Zivo. #${vid.user.name.replace(/\s+/g, '')} #watch #vibes`,
            user: {
              name: vid.user.name,
              avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(vid.user.name)}`,
              username: vid.user.name.toLowerCase().replace(/\s+/g, '.'),
            },
            likes: Math.floor(Math.random() * 2000) + 200,
            commentsCount: Math.floor(Math.random() * 100) + 10,
            shares: Math.floor(Math.random() * 50) + 5,
            tag: idx % 2 === 0 ? 'nature' : 'travel',
          }
        })
        const list = fetched.length > 0 ? fetched : FALLBACK_VIDEOS
        setVideos(list)
        const likes = {}
        list.forEach((v) => {
          likes[v.id] = v.likes
        })
        setLikesCount(likes)
      } catch {
        setVideos(FALLBACK_VIDEOS)
        const likes = {}
        FALLBACK_VIDEOS.forEach((v) => {
          likes[v.id] = v.likes
        })
        setLikesCount(likes)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const handleLike = (videoId) => {
    const isLiked = likedVideos[videoId]
    setLikedVideos((prev) => ({ ...prev, [videoId]: !isLiked }))
    setLikesCount((prev) => ({ ...prev, [videoId]: isLiked ? prev[videoId] - 1 : prev[videoId] + 1 }))
  }

  const handleSave = (videoId) => {
    const isSaved = savedVideos[videoId]
    setSavedVideos((prev) => ({ ...prev, [videoId]: !isSaved }))
    toast.success(!isSaved ? 'Đã lưu video vào bộ sưu tập!' : 'Đã bỏ lưu video.', { autoClose: 1800 })
  }

  const handleToggleFollow = (username) => {
    setFollowedUsers((prev) => {
      const nextState = !prev[username]
      toast.info(nextState ? `Đã theo dõi @${username}` : `Đã bỏ theo dõi @${username}`, { autoClose: 1600 })
      return { ...prev, [username]: nextState }
    })
  }

  const handleShare = (video) => {
    navigator.clipboard?.writeText(video.link)
    toast.success('Đã sao chép liên kết video!', { autoClose: 2000 })
  }

  const handleScrollToVideo = (videoId) => {
    const el = document.getElementById(videoId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    const videoId = activeCommentVideoId
    const newComment = {
      id: Date.now(),
      name: currentUser?.full_name || currentUser?.fullName || 'Người dùng',
      avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user',
      text: newCommentText.trim(),
    }
    setComments((prev) => ({ ...prev, [videoId]: [newComment, ...(prev[videoId] || [])] }))
    setNewCommentText('')
    toast.success('Đã gửi bình luận!', { autoClose: 1500 })
  }

  const activeComments = activeCommentVideoId
    ? comments[activeCommentVideoId] || INITIAL_COMMENTS[activeCommentVideoId] || []
    : []

  // Filter and sort videos based on activeTab and selectedTag
  const displayedVideos = videos
    .filter((vid) => {
      if (selectedTag) {
        const tagLower = selectedTag.replace('#', '').toLowerCase()
        const matchesTag = vid.tag?.toLowerCase().includes(tagLower)
        const matchesTitle = vid.title?.toLowerCase().includes(tagLower)
        if (!matchesTag && !matchesTitle) return false
      }
      if (activeTab === 'following') {
        return !!followedUsers[vid.user.username]
      }
      if (activeTab === 'relax') {
        const relaxTags = ['sunset', 'nature', 'ocean', 'chill']
        return relaxTags.includes(vid.tag?.toLowerCase()) || vid.title?.toLowerCase().includes('bình yên')
      }
      return true
    })
    .sort((a, b) => {
      if (activeTab === 'trending') {
        const likesA = likesCount[a.id] ?? a.likes
        const likesB = likesCount[b.id] ?? b.likes
        return likesB - likesA
      }
      return 0
    })

  // Keyboard navigation for video switching (ArrowUp / ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeCommentVideoId) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const container = document.getElementById('watch-feed-container')
        if (!container) return
        const delta = e.key === 'ArrowDown' ? container.clientHeight * 0.85 : -container.clientHeight * 0.85
        container.scrollBy({ top: delta, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCommentVideoId])

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5.5rem)] bg-slate-100/70 dark:bg-slate-950 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-md dark:shadow-2xl overflow-hidden relative transition-colors duration-200">
      {/* ── Left Sidebar (Desktop Navigation & Creator Highlights) ── */}
      <WatchSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        followedUsers={followedUsers}
        onToggleFollow={handleToggleFollow}
      />

      {/* ── Main Stream Section (Center Feed) ── */}
      <main className="flex-1 flex flex-col bg-slate-100/70 dark:bg-slate-950 relative min-w-0 h-full overflow-hidden transition-colors duration-200">
        {/* Mobile Top Filter Header */}
        <WatchMobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-slate-700 dark:text-white">
            <div className="w-12 h-12 rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-primary-500 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium animate-pulse">Đang tải video thịnh hành...</p>
          </div>
        ) : displayedVideos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center text-slate-800 dark:text-white">
            <div className="w-16 h-16 rounded-full bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 text-2xl font-bold shadow-xs">
              🎬
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Chưa có video nào</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                {activeTab === 'following'
                  ? 'Bạn chưa theo dõi tác giả nào hoặc họ chưa đăng video. Hãy bấm theo dõi các tác giả ở cột bên trái nhé!'
                  : 'Không tìm thấy video phù hợp với bộ lọc hiện tại.'}
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('for-you')
                setSelectedTag(null)
              }}
              className="px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer outline-none focus:outline-none focus:ring-0"
            >
              Xem tất cả video
            </button>
          </div>
        ) : (
          /* Snap-scroll Video Stream */
          <div
            id="watch-feed-container"
            className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none flex flex-col items-center py-6 gap-8 px-2 sm:px-4"
          >
            {displayedVideos.map((vid) => (
              <WatchVideoItem
                key={vid.id}
                video={vid}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isLiked={likedVideos[vid.id]}
                isSaved={savedVideos[vid.id]}
                isFollowed={followedUsers[vid.user.username]}
                likesCount={likesCount[vid.id]}
                commentsCount={(comments[vid.id] || INITIAL_COMMENTS[vid.id] || []).length || vid.commentsCount}
                onLike={() => handleLike(vid.id)}
                onSave={() => handleSave(vid.id)}
                onFollow={() => handleToggleFollow(vid.user.username)}
                onShare={() => handleShare(vid)}
                onOpenComments={() => setActiveCommentVideoId(vid.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Right Sidebar on Desktop (Up Next & Trending Playlist) ── */}
      <WatchPlaylistSidebar
        videos={displayedVideos.length > 0 ? displayedVideos : videos}
        likesCount={likesCount}
        onScrollToVideo={handleScrollToVideo}
      />

      {/* ── Slide-over Comment Drawer ── */}
      <WatchCommentsDrawer
        activeCommentVideoId={activeCommentVideoId}
        activeComments={activeComments}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        currentUser={currentUser}
        onClose={() => setActiveCommentVideoId(null)}
        onSubmitComment={handleAddComment}
      />
    </div>
  )
}

export default WatchPage
