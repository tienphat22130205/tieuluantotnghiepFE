import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineMessage,
  AiOutlineShareAlt,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlinePlus,
  AiOutlineCheck,
  AiOutlineSound,
  AiFillSound,
  AiOutlineFire,
  AiOutlineCompass,
} from 'react-icons/ai'
import {
  BsPlay,
  BsPause,
  BsLightningCharge,
  BsBookmark,
  BsBookmarkFill,
  BsMusicNoteBeamed,
} from 'react-icons/bs'
import { FaUserFriends } from 'react-icons/fa'
import { MdOutlineExplore, MdOndemandVideo } from 'react-icons/md'
import { FiTrendingUp, FiCheckCircle } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'

const FALLBACK_VIDEOS = [
  {
    id: 'sample-video-1',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-4712-large.mp4',
    title: 'Một ngày dạo quanh phố phường Hà Nội yên bình ngày cuối thu 🍁✨ #hanoi #vibes #travelvietnam',
    user: { name: 'Thanh Tùng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', username: 'thanhtung.travel' },
    likes: 1250, commentsCount: 89, shares: 45,
    tag: 'hanoi',
  },
  {
    id: 'sample-video-2',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-on-a-table-in-a-coffee-shop-4011-large.mp4',
    title: 'Cốc cà phê ấm nóng ngày mưa rả rích ☕️🌧️ Bình yên nhỏ nhoi góc quán quen. #coffee #chill #rainyday',
    user: { name: 'Minh Thư', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thu', username: 'thu.coffee' },
    likes: 840, commentsCount: 42, shares: 18,
    tag: 'coffee',
  },
  {
    id: 'sample-video-3',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    title: 'Góc nhỏ Đà Lạt mộng mơ, trốn thành phố xô bồ tìm bình yên 🌲🍃 #dalat #dalatlife #healing',
    user: { name: 'Khánh Linh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', username: 'linh.dalat' },
    likes: 2305, commentsCount: 148, shares: 92,
    tag: 'dalat',
  },
  {
    id: 'sample-video-4',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    title: 'Ngắm hoàng hôn rực rỡ buông xuống bãi biển Nha Trang thơ mộng 🌅🌊 #sunset #beachlife #travel',
    user: { name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=nam', username: 'nam.ocean' },
    likes: 1520, commentsCount: 75, shares: 38,
    tag: 'sunset',
  },
  {
    id: 'sample-video-5',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-on-the-grass-in-a-park-41312-large.mp4',
    title: 'Chú cún con Golden đáng yêu chạy nhảy giữa vườn hoa đầy nắng 🐶🌸 #doglover #pet #goldenretriever',
    user: { name: 'Bảo Ngọc', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', username: 'ngoc.golden' },
    likes: 3110, commentsCount: 230, shares: 115,
    tag: 'pets',
  },
  {
    id: 'sample-video-6',
    link: 'https://assets.mixkit.co/videos/preview/mixkit-preparing-food-in-a-kitchen-41484-large.mp4',
    title: 'Nấu ăn cực chill cuối tuần: Mỳ Ý sốt kem nấm béo ngậy siêu dễ làm 🍝🧀 #cooking #foodie #chill',
    user: { name: 'Chef Duy Anh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', username: 'duyanh.cook' },
    likes: 912, commentsCount: 56, shares: 24,
    tag: 'cooking',
  },
]

const FEATURED_CREATORS = [
  { id: 1, name: 'Thanh Tùng', username: 'thanhtung.travel', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', followers: '124K' },
  { id: 2, name: 'Khánh Linh', username: 'linh.dalat', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', followers: '89K' },
  { id: 3, name: 'Chef Duy Anh', username: 'duyanh.cook', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', followers: '210K' },
  { id: 4, name: 'Bảo Ngọc', username: 'ngoc.golden', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', followers: '56K' },
]

const TRENDING_HASHTAGS = [
  { tag: '#Hanoi', count: '12.4K' },
  { tag: '#Coffee', count: '8.9K' },
  { tag: '#DaLat', count: '24.1K' },
  { tag: '#Sunset', count: '15.7K' },
  { tag: '#Cooking', count: '9.3K' },
  { tag: '#Pets', count: '31.2K' },
]

const INITIAL_COMMENTS = {
  'sample-video-1': [
    { id: 1, name: 'Hương Giang', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=giang', text: 'Nhìn Hà Nội bình yên quá bạn ơi! Góc quay màu phim đẹp xuất sắc ❤️' },
    { id: 2, name: 'Đức Huy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=huy', text: 'Màu video đẹp thật sự, bạn dùng app hay máy gì quay thế?' },
  ],
  'sample-video-2': [
    { id: 1, name: 'Thùy Dương', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duong', text: 'Mưa lạnh ngắm video này ấm áp hẳn ☕️' },
  ],
  'sample-video-3': [
    { id: 1, name: 'Tuấn Đạt', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dat', text: 'Đà Lạt luôn là chân ái của sự bình yên.' },
    { id: 2, name: 'Phan Vy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vy', text: 'Chỗ này ở khu vực nào Đà Lạt thế thớt?' },
  ],
}

const TAB_ITEMS = [
  { key: 'for-you', label: 'Dành cho bạn', icon: BsLightningCharge },
  { key: 'trending', label: 'Xu hướng', icon: FiTrendingUp },
  { key: 'following', label: 'Đang theo dõi', icon: FaUserFriends },
  { key: 'relax', label: 'Thư giãn & Chill', icon: BsMusicNoteBeamed },
]

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
        FALLBACK_VIDEOS.forEach(v => { likes[v.id] = v.likes })
        setLikesCount(likes)
        setIsLoading(false)
        return
      }
      try {
        const res = await axios.get('https://api.pexels.com/videos/popular?per_page=12', {
          headers: { Authorization: apiKey },
        })
        const fetched = res.data.videos.map((vid, idx) => {
          const file = vid.video_files.find(f => f.quality === 'sd' || f.width <= 720) || vid.video_files[0]
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
        list.forEach(v => { likes[v.id] = v.likes })
        setLikesCount(likes)
      } catch {
        setVideos(FALLBACK_VIDEOS)
        const likes = {}
        FALLBACK_VIDEOS.forEach(v => { likes[v.id] = v.likes })
        setLikesCount(likes)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const handleLike = (videoId) => {
    const isLiked = likedVideos[videoId]
    setLikedVideos(prev => ({ ...prev, [videoId]: !isLiked }))
    setLikesCount(prev => ({ ...prev, [videoId]: isLiked ? prev[videoId] - 1 : prev[videoId] + 1 }))
  }

  const handleSave = (videoId) => {
    const isSaved = savedVideos[videoId]
    setSavedVideos(prev => ({ ...prev, [videoId]: !isSaved }))
    toast.success(!isSaved ? 'Đã lưu video vào bộ sưu tập!' : 'Đã bỏ lưu video.', { autoClose: 1800 })
  }

  const handleToggleFollow = (username) => {
    setFollowedUsers(prev => {
      const nextState = !prev[username]
      toast.info(nextState ? `Đã theo dõi @${username}` : `Đã bỏ theo dõi @${username}`, { autoClose: 1600 })
      return { ...prev, [username]: nextState }
    })
  }

  const handleShare = (video) => {
    navigator.clipboard.writeText(video.link)
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
      avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=user`,
      text: newCommentText.trim(),
    }
    setComments(prev => ({ ...prev, [videoId]: [newComment, ...(prev[videoId] || [])] }))
    setNewCommentText('')
    toast.success('Đã gửi bình luận!', { autoClose: 1500 })
  }

  const activeComments = activeCommentVideoId
    ? (comments[activeCommentVideoId] || INITIAL_COMMENTS[activeCommentVideoId] || [])
    : []

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden relative">

      {/* ── Left Sidebar (Desktop Navigation & Creator Highlights) ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-100 py-5 px-4 shrink-0 overflow-y-auto">
        {/* Watch Brand */}
        <div className="flex items-center gap-2.5 px-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <MdOndemandVideo size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-primary-600">
              Zivo Watch
            </h2>
            <p className="text-[11px] font-medium text-slate-400">Video ngắn & Reels</p>
          </div>
        </div>

        {/* Primary Tabs Navigation */}
        <nav className="space-y-1.5 mb-6">
          {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setSelectedTag(null)
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === key && !selectedTag
                  ? 'bg-primary-50 text-primary-700 shadow-xs border-l-4 border-primary-600 rounded-l-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={activeTab === key && !selectedTag ? 'text-primary-600' : 'text-slate-400'} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Trending Hashtags */}
        <div className="border-t border-slate-100 pt-4 mb-6">
          <div className="flex items-center gap-1.5 px-2 mb-2.5">
            <AiOutlineFire size={15} className="text-amber-500" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chủ đề thịnh hành</p>
          </div>
          <div className="flex flex-wrap gap-1.5 px-1">
            {TRENDING_HASHTAGS.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag)
                  toast.info(`Lọc theo chủ đề ${tag}`, { autoClose: 1500 })
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tag} <span className="text-[10px] opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Creators */}
        <div className="border-t border-slate-100 pt-4 mt-auto">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
            Tác giả gợi ý
          </p>
          <div className="space-y-3 px-1">
            {FEATURED_CREATORS.map(creator => (
              <div key={creator.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={creator.avatar} name={creator.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-none">{creator.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{creator.followers} theo dõi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFollow(creator.username)}
                  className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    followedUsers[creator.username]
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {followedUsers[creator.username] ? 'Đang theo' : '+ Theo dõi'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Stream Section (Center Feed) ── */}
      <main className="flex-1 flex flex-col bg-slate-950/95 relative min-w-0">

        {/* Mobile Top Filter Header */}
        <header className="flex lg:hidden items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200/80 backdrop-blur-md sticky top-0 z-20">
          <span className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Watch
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {TAB_ITEMS.slice(0, 3).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer ${
                  activeTab === key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-white">
            <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-primary-500 animate-spin" />
            <p className="text-sm text-slate-300 font-medium animate-pulse">Đang tải video thịnh hành...</p>
          </div>
        ) : (
          /* Snap-scroll Video Stream */
          <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none flex flex-col items-center py-4 gap-6 px-2 sm:px-4">
            {videos.map(vid => (
              <VideoItem
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
      <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-slate-100 p-4 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <AiOutlineCompass size={18} className="text-primary-600" />
            <h3 className="text-sm font-bold text-slate-900">Gợi ý tiếp theo</h3>
          </div>
          <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {videos.length} clips
          </span>
        </div>

        {/* Video Playlist Quick Cards */}
        <div className="space-y-2.5">
          {videos.slice(0, 6).map((vid, i) => (
            <div
              key={`thumb-${vid.id}`}
              onClick={() => handleScrollToVideo(vid.id)}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer group"
            >
              {/* Thumbnail Container */}
              <div className="relative w-18 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-sm group-hover:scale-102 transition-transform">
                <video
                  src={vid.link}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                    <BsPlay size={14} className="translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  #{i + 1}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                  {vid.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Avatar src={vid.user.avatar} name={vid.user.name} size="xs" />
                  <span className="text-[11px] text-slate-500 font-medium truncate">{vid.user.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-semibold">
                  <span>❤️ {likesCount[vid.id] || vid.likes}</span>
                  <span>💬 {vid.commentsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Creator Hub Callout Card */}
        <div className="mt-auto pt-4">
          <div className="rounded-2xl p-4 bg-primary-600 text-white shadow-lg shadow-primary-500/20">
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">Sáng tạo nội dung</p>
            <h4 className="text-sm font-bold mt-1">Đăng video ngắn trên Zivo</h4>
            <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
              Chia sẻ khoảnh khắc đẹp đến hàng triệu người xem mỗi ngày.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Slide-over Comment Drawer ── */}
      {activeCommentVideoId && (
        <div className="absolute inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <button
            className="flex-1 bg-black/40 backdrop-blur-xs cursor-default transition-opacity"
            onClick={() => setActiveCommentVideoId(null)}
            aria-label="Đóng bình luận"
          />

          {/* Comment Panel */}
          <div className="w-full max-w-[380px] h-full bg-white border-l border-slate-200/90 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <AiOutlineMessage size={18} className="text-primary-600" />
                Bình luận ({activeComments.length})
              </h3>
              <button
                type="button"
                onClick={() => setActiveCommentVideoId(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
              {activeComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 py-16">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <AiOutlineMessage size={28} />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Chưa có bình luận nào</p>
                  <p className="text-[11px] text-slate-400 text-center">Hãy là người đầu tiên chia sẻ cảm nghĩ về video này!</p>
                </div>
              ) : (
                activeComments.map(comm => (
                  <div key={comm.id} className="flex gap-3 items-start group">
                    <Avatar src={comm.avatar} name={comm.name} size="sm" />
                    <div className="flex-1 bg-slate-50 border border-slate-100/90 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                      <p className="font-bold text-slate-900 text-[12px]">{comm.name}</p>
                      <p className="text-slate-700 text-xs mt-1 leading-relaxed">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2.5 shrink-0">
              <Avatar src={currentUser?.avatar} name={currentUser?.full_name || 'Bạn'} size="sm" />
              <input
                type="text"
                placeholder="Thêm bình luận cho video..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                className="flex-1 bg-slate-100/80 border border-transparent focus:border-primary-500 focus:bg-white text-slate-900 rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder:text-slate-400 transition-all"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full p-2.5 transition cursor-pointer shadow-sm disabled:cursor-not-allowed"
              >
                <AiOutlineSend size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── Enhanced VideoItem ─────────────────── */
const VideoItem = ({
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
      entries => {
        entries.forEach(entry => {
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
    return () => { if (videoRef.current) observer.unobserve(videoRef.current) }
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

export default WatchPage
