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
} from 'react-icons/ai'
import { BsPlay, BsPause, BsLightningCharge } from 'react-icons/bs'
import { MdOutlineExplore } from 'react-icons/md'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'

const FALLBACK_VIDEOS = [
  {
    id: 'pexels-6963395',
    link: 'https://videos.pexels.com/video-files/6963395/6963395-sd_540_960_25fps.mp4',
    title: 'Một ngày dạo quanh phố phường Hà Nội yên bình ngày cuối thu 🍁✨ #hanoi #vibes #travelvietnam',
    user: { name: 'Thanh Tùng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung', username: 'thanhtung.travel' },
    likes: 1250, commentsCount: 89, shares: 45,
  },
  {
    id: 'pexels-3209828',
    link: 'https://videos.pexels.com/video-files/3209828/3209828-sd_540_960_25fps.mp4',
    title: 'Cốc cà phê ấm nóng ngày mưa rả rích ☕️🌧️ Bình yên nhỏ nhoi góc quán quen. #coffee #chill #rainyday',
    user: { name: 'Minh Thư', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thu', username: 'thu.coffee' },
    likes: 840, commentsCount: 42, shares: 18,
  },
  {
    id: 'pexels-5858087',
    link: 'https://videos.pexels.com/video-files/5858087/5858087-sd_540_960_25fps.mp4',
    title: 'Góc nhỏ Đà Lạt mộng mơ, trốn thành phố xô bồ tìm bình yên 🌲🍃 #dalat #dalatlife #healing',
    user: { name: 'Khánh Linh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh', username: 'linh.dalat' },
    likes: 2305, commentsCount: 148, shares: 92,
  },
  {
    id: 'pexels-3195325',
    link: 'https://videos.pexels.com/video-files/3195325/3195325-sd_540_960_25fps.mp4',
    title: 'Ngắm hoàng hôn rực rỡ buông xuống bãi biển Nha Trang thơ mộng 🌅🌊 #sunset #beachlife #travel',
    user: { name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=nam', username: 'nam.ocean' },
    likes: 1520, commentsCount: 75, shares: 38,
  },
  {
    id: 'pexels-8088622',
    link: 'https://videos.pexels.com/video-files/8088622/8088622-sd_540_960_25fps.mp4',
    title: 'Chú cún con Golden đáng yêu chạy nhảy giữa vườn hoa đầy nắng 🐶🌸 #doglover #pet #goldenretriever',
    user: { name: 'Bảo Ngọc', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc', username: 'ngoc.golden' },
    likes: 3110, commentsCount: 230, shares: 115,
  },
  {
    id: 'pexels-6981242',
    link: 'https://videos.pexels.com/video-files/6981242/6981242-sd_540_960_25fps.mp4',
    title: 'Nấu ăn cực chill cuối tuần: Mỳ Ý sốt kem nấm béo ngậy siêu dễ làm 🍝🧀 #cooking #foodie #chill',
    user: { name: 'Chef Duy Anh', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh', username: 'duyanh.cook' },
    likes: 912, commentsCount: 56, shares: 24,
  },
]

const INITIAL_COMMENTS = {
  'pexels-6963395': [
    { id: 1, name: 'Hương Giang', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=giang', text: 'Nhìn Hà Nội bình yên quá bạn ơi!' },
    { id: 2, name: 'Đức Huy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=huy', text: 'Màu video đẹp thật sự, bạn dùng máy gì quay thế?' },
  ],
  'pexels-3209828': [
    { id: 1, name: 'Thùy Dương', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duong', text: 'Mưa lạnh ngắm video này ấm áp hẳn.' },
  ],
  'pexels-5858087': [
    { id: 1, name: 'Tuấn Đạt', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dat', text: 'Đà Lạt luôn là chân ái của sự bình yên.' },
    { id: 2, name: 'Phan Vy', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vy', text: 'Chỗ này ở khu vực nào Đà Lạt thế thớt?' },
  ],
}

const TAB_ITEMS = [
  { key: 'for-you', label: 'Dành cho bạn', icon: BsLightningCharge },
  { key: 'trending', label: 'Xu hướng', icon: MdOutlineExplore },
]

const WatchPage = () => {
  const { user: currentUser } = useAuth()
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [likedVideos, setLikedVideos] = useState({})
  const [likesCount, setLikesCount] = useState({})
  const [comments, setComments] = useState(INITIAL_COMMENTS)
  const [activeCommentVideoId, setActiveCommentVideoId] = useState(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('for-you')

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
        const fetched = res.data.videos.map(vid => {
          const file = vid.video_files.find(f => f.quality === 'sd' || f.width <= 720) || vid.video_files[0]
          return {
            id: `pexels-${vid.id}`,
            link: file?.link || '',
            title: `Khám phá video tuyệt đẹp từ Pexels. #${vid.user.name.replace(/\s+/g, '')} #shorts`,
            user: {
              name: vid.user.name,
              avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(vid.user.name)}`,
              username: vid.user.name.toLowerCase().replace(/\s+/g, '.'),
            },
            likes: Math.floor(Math.random() * 2000) + 200,
            commentsCount: Math.floor(Math.random() * 100) + 10,
            shares: Math.floor(Math.random() * 50) + 5,
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

  const handleShare = (video) => {
    navigator.clipboard.writeText(video.link)
    toast.success('Đã sao chép liên kết video!', { autoClose: 2000 })
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
  }

  const activeComments = activeCommentVideoId
    ? (comments[activeCommentVideoId] || INITIAL_COMMENTS[activeCommentVideoId] || [])
    : []

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-6rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-100 py-5 px-3 shrink-0">
        <h2 className="text-lg font-extrabold text-slate-900 px-3 mb-4 tracking-tight">Watch</h2>
        <nav className="space-y-1">
          {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === key
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={17} className={activeTab === key ? 'text-primary-600' : 'text-slate-400'} />
              {label}
            </button>
          ))}
        </nav>

        {/* Divider + info */}
        <div className="mt-5 border-t border-slate-100 pt-4 px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Gợi ý cho bạn</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Nội dung video từ cộng đồng và Pexels Creator Network.
          </p>
        </div>
      </aside>

      {/* ── Main Feed ── */}
      <main className="flex-1 flex flex-col bg-slate-50 relative min-w-0">

        {/* Mobile header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-10">
          <span className="text-base font-extrabold text-slate-900 tracking-tight">Watch</span>
          <div className="flex gap-1.5">
            {TAB_ITEMS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                  activeTab === key
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Đang tải video...</p>
          </div>
        ) : (
          // Snap scroll container - videos displayed one at a time
          <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none flex flex-col items-center py-3 gap-3 px-3 md:px-6">
            {videos.map(vid => (
              <VideoItem
                key={vid.id}
                video={vid}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isLiked={likedVideos[vid.id]}
                likesCount={likesCount[vid.id]}
                commentsCount={(comments[vid.id] || INITIAL_COMMENTS[vid.id] || []).length || vid.commentsCount}
                onLike={() => handleLike(vid.id)}
                onShare={() => handleShare(vid)}
                onOpenComments={() => setActiveCommentVideoId(vid.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Comment Drawer ── */}
      {activeCommentVideoId && (
        <div className="absolute inset-0 z-50 flex justify-end">
          {/* backdrop */}
          <button
            className="flex-1 bg-black/30 backdrop-blur-xs cursor-default"
            onClick={() => setActiveCommentVideoId(null)}
            aria-label="Đóng bình luận"
          />

          {/* Panel */}
          <div className="w-full max-w-[360px] h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Bình luận ({activeComments.length})
              </h3>
              <button
                type="button"
                onClick={() => setActiveCommentVideoId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <AiOutlineClose size={16} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {activeComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 py-12">
                  <AiOutlineMessage size={32} className="opacity-40" />
                  <p className="text-xs font-medium text-center">Chưa có bình luận nào.<br />Hãy là người đầu tiên!</p>
                </div>
              ) : (
                activeComments.map(comm => (
                  <div key={comm.id} className="flex gap-2.5 items-start">
                    <Avatar src={comm.avatar} name={comm.name} size="sm" />
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="font-bold text-slate-800 text-[11px]">{comm.name}</p>
                      <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleAddComment} className="px-3 py-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0">
              <Avatar src={currentUser?.avatar} name={currentUser?.full_name || 'Bạn'} size="sm" />
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full p-2 transition shrink-0"
              >
                <AiOutlineSend size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── VideoItem ─────────────────── */
const VideoItem = ({ video, isMuted, setIsMuted, isLiked, likesCount, commentsCount, onLike, onShare, onOpenComments }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)

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
      { threshold: 0.65 }
    )
    if (videoRef.current) observer.observe(videoRef.current)
    return () => { if (videoRef.current) observer.unobserve(videoRef.current) }
  }, [])

  const handlePlayToggle = () => {
    if (isPlaying) {
      videoRef.current?.pause()
      setIsPlaying(false)
      setShowOverlay(true)
      setTimeout(() => setShowOverlay(false), 700)
    } else {
      videoRef.current?.play().then(() => { setIsPlaying(true); setShowOverlay(true); setTimeout(() => setShowOverlay(false), 700) }).catch(() => {})
    }
  }

  const formatCount = (n) => {
    if (!n && n !== 0) return '0'
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return String(n)
  }

  return (
    <div className="snap-start shrink-0 w-full max-w-[400px] h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200 group">

      {/* Video */}
      <video
        ref={videoRef}
        src={video.link}
        loop playsInline
        muted={isMuted}
        onClick={handlePlayToggle}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/25 pointer-events-none" />

      {/* Play/pause flash */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/50 text-white rounded-full p-4 backdrop-blur-sm">
            {isPlaying ? <BsPlay size={26} /> : <BsPause size={26} />}
          </div>
        </div>
      )}

      {/* Mute toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-3 right-3 z-10 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full p-2 transition border border-white/20"
        title={isMuted ? 'Mở tiếng' : 'Tắt tiếng'}
      >
        {isMuted ? <AiOutlineSound size={15} /> : <AiFillSound size={15} />}
      </button>

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10">
        {/* Like */}
        <button onClick={onLike} className="flex flex-col items-center gap-1" aria-label="Thích">
          <div className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isLiked ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
          }`}>
            {isLiked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
          </div>
          <span className="text-white text-[11px] font-bold drop-shadow">{formatCount(likesCount)}</span>
        </button>

        {/* Comment */}
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1" aria-label="Bình luận">
          <div className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 transition">
            <AiOutlineMessage size={20} />
          </div>
          <span className="text-white text-[11px] font-bold drop-shadow">{formatCount(commentsCount)}</span>
        </button>

        {/* Share */}
        <button onClick={onShare} className="flex flex-col items-center gap-1" aria-label="Chia sẻ">
          <div className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 transition">
            <AiOutlineShareAlt size={20} />
          </div>
          <span className="text-white text-[11px] font-bold drop-shadow">Chia sẻ</span>
        </button>
      </div>

      {/* Bottom metadata */}
      <div className="absolute left-3 bottom-4 right-16 z-10 space-y-2">
        {/* User row */}
        <div className="flex items-center gap-2.5">
          <Avatar src={video.user.avatar} name={video.user.name} size="md" className="ring-2 ring-white/70" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-white text-sm truncate leading-none">{video.user.name}</p>
            <p className="text-white/70 text-[11px] mt-0.5">@{video.user.username}</p>
          </div>
          <button
            onClick={() => setIsFollowed(!isFollowed)}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 border ${
              isFollowed
                ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm'
                : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-500 shadow-sm shadow-primary-600/30'
            }`}
          >
            {isFollowed ? <><AiOutlineCheck size={10} /> Đang theo dõi</> : <><AiOutlinePlus size={10} /> Theo dõi</>}
          </button>
        </div>

        {/* Caption */}
        <p className="text-white/90 text-[12px] leading-relaxed line-clamp-2 font-normal drop-shadow">
          {video.title}
        </p>

        {/* Music ticker */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg px-2.5 py-1 w-max max-w-[75%]">
          <span className="text-white/80 text-[11px] animate-pulse">♫</span>
          <div className="overflow-hidden w-32 h-3.5 relative">
            <div className="absolute whitespace-nowrap text-[11px] text-white/80 font-medium animate-marquee">
              Âm thanh gốc · {video.user.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchPage
