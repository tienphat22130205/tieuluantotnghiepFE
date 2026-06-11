import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineMessage,
  AiOutlineShareAlt,
  AiOutlineSound,
  AiFillSound,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlinePlus,
} from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'

// Curated high-quality fallback vertical videos from Pexels (9:16)
const FALLBACK_VIDEOS = [
  {
    id: 'pexels-6963395',
    link: 'https://videos.pexels.com/video-files/6963395/6963395-sd_540_960_25fps.mp4',
    title: 'Một ngày dạo quanh phố phường Hà Nội yên bình ngày cuối thu 🍁✨ #hanoi #vibes #travelvietnam',
    user: {
      name: 'Thanh Tùng',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=tung',
      username: 'thanhtung.travel',
    },
    likes: 1250,
    commentsCount: 89,
    shares: 45,
  },
  {
    id: 'pexels-3209828',
    link: 'https://videos.pexels.com/video-files/3209828/3209828-sd_540_960_25fps.mp4',
    title: 'Cốc cà phê ấm nóng ngày mưa rả rích ☕️🌧️ Bình yên nhỏ nhoi góc quán quen. #coffee #chill #rainyday',
    user: {
      name: 'Minh Thư',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=thu',
      username: 'thu.coffee',
    },
    likes: 840,
    commentsCount: 42,
    shares: 18,
  },
  {
    id: 'pexels-5858087',
    link: 'https://videos.pexels.com/video-files/5858087/5858087-sd_540_960_25fps.mp4',
    title: 'Góc nhỏ Đà Lạt mộng mơ, trốn thành phố xô bồ tìm bình yên 🌲🍃 #dalat #dalatlife #healing',
    user: {
      name: 'Khánh Linh',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh',
      username: 'linh.dalat',
    },
    likes: 2305,
    commentsCount: 148,
    shares: 92,
  },
  {
    id: 'pexels-3195325',
    link: 'https://videos.pexels.com/video-files/3195325/3195325-sd_540_960_25fps.mp4',
    title: 'Ngắm hoàng hôn rực rỡ buông xuống bãi biển Nha Trang thơ mộng 🌅🌊 #sunset #beachlife #travel',
    user: {
      name: 'Hoàng Nam',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=nam',
      username: 'nam.ocean',
    },
    likes: 1520,
    commentsCount: 75,
    shares: 38,
  },
  {
    id: 'pexels-8088622',
    link: 'https://videos.pexels.com/video-files/8088622/8088622-sd_540_960_25fps.mp4',
    title: 'Chú cún con Golden đáng yêu chạy nhảy giữa vườn hoa đầy nắng 🐶🌸 #doglover #pet #goldenretriever',
    user: {
      name: 'Bảo Ngọc',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ngoc',
      username: 'ngoc.golden',
    },
    likes: 3110,
    commentsCount: 230,
    shares: 115,
  },
  {
    id: 'pexels-6981242',
    link: 'https://videos.pexels.com/video-files/6981242/6981242-sd_540_960_25fps.mp4',
    title: 'Nấu ăn cực chill cuối tuần: Mỳ Ý sốt kem nấm béo ngậy siêu dễ làm 🍝🧀 #cooking #foodie #chill',
    user: {
      name: 'Chef Duy Anh',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=duyanh',
      username: 'duyanh.cook',
    },
    likes: 912,
    commentsCount: 56,
    shares: 24,
  },
]

// Mock comments database for interaction
const INITIAL_COMMENTS = {
  'pexels-6963395': [
    { id: 1, name: 'Hương Giang', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=giang', text: 'Nhìn Hà Nội bình yên quá bạn ơi! Muốn xách balo đi ngay luôn.' },
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

const WatchPage = () => {
  const { user: currentUser } = useAuth()
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true) // Shared mute state for seamless scroll transition
  const [likedVideos, setLikedVideos] = useState({})
  const [likesCount, setLikesCount] = useState({})
  const [comments, setComments] = useState(INITIAL_COMMENTS)
  const [activeCommentVideoId, setActiveCommentVideoId] = useState(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('for-you') // 'for-you' | 'trending'

  useEffect(() => {
    const fetchPexelsVideos = async () => {
      setIsLoading(true)
      const apiKey = import.meta.env.VITE_PEXELS_API_KEY

      if (!apiKey) {
        // Fallback to local curated videos immediately if key not configured
        setVideos(FALLBACK_VIDEOS)
        const initialLikes = {}
        FALLBACK_VIDEOS.forEach((v) => {
          initialLikes[v.id] = v.likes
        })
        setLikesCount(initialLikes)
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get('https://api.pexels.com/videos/popular?per_page=12', {
          headers: {
            Authorization: apiKey,
          },
        })

        const fetched = response.data.videos.map((vid) => {
          // Extract the first SD video file or any standard file
          const file = vid.video_files.find((f) => f.quality === 'sd' || f.width <= 720) || vid.video_files[0]
          return {
            id: `pexels-${vid.id}`,
            link: file?.link || '',
            title: `Khám phá video tuyệt đẹp từ Pexels Creator. #${vid.user.name.replace(/\s+/g, '')} #pexels #shorts`,
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

        setVideos(fetched.length > 0 ? fetched : FALLBACK_VIDEOS)
        const initialLikes = {}
        ;(fetched.length > 0 ? fetched : FALLBACK_VIDEOS).forEach((v) => {
          initialLikes[v.id] = v.likes
        })
        setLikesCount(initialLikes)
      } catch (error) {
        console.error('Lỗi khi tải video từ Pexels API:', error)
        setVideos(FALLBACK_VIDEOS)
        const initialLikes = {}
        FALLBACK_VIDEOS.forEach((v) => {
          initialLikes[v.id] = v.likes
        })
        setLikesCount(initialLikes)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPexelsVideos()
  }, [])

  const handleLike = (videoId) => {
    const isLiked = likedVideos[videoId]
    setLikedVideos((prev) => ({ ...prev, [videoId]: !isLiked }))
    setLikesCount((prev) => ({
      ...prev,
      [videoId]: isLiked ? prev[videoId] - 1 : prev[videoId] + 1,
    }))
  }

  const handleShare = (video) => {
    navigator.clipboard.writeText(video.link)
    toast.success('Đã sao chép liên kết video vào bộ nhớ tạm!', { autoClose: 2000 })
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newCommentText.trim()) return

    const videoId = activeCommentVideoId
    const newComment = {
      id: Date.now(),
      name: currentUser?.full_name || currentUser?.fullName || 'Người dùng',
      avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username || 'user'}`,
      text: newCommentText.trim(),
    }

    setComments((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }))
    setNewCommentText('')
  }

  return (
    <div className="relative flex flex-col md:flex-row min-h-[calc(100vh-6rem)] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl text-slate-100">
      {/* Sidebar - Desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-white mb-6">Watch</h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'for-you'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Dành cho bạn
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === 'trending'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Xu hướng
          </button>
        </nav>
      </aside>

      {/* Main Feed Container */}
      <main className="flex-1 flex flex-col items-center bg-slate-950 relative">
        {/* Mobile Tab Header */}
        <header className="flex md:hidden w-full border-b border-slate-850 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10 px-4 py-3 items-center justify-between">
          <span className="text-lg font-black text-white">Watch</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'for-you' ? 'bg-primary-600 text-white' : 'text-slate-400'
              }`}
            >
              Dành cho bạn
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'trending' ? 'bg-primary-600 text-white' : 'text-slate-400'
              }`}
            >
              Xu hướng
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-primary-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Đang tải video mới nhất...</p>
          </div>
        ) : (
          <div className="w-full max-w-[480px] h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6.5rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-none py-2 px-1 flex flex-col space-y-4">
            {videos.map((vid) => (
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

      {/* Side drawer overlay for Comments */}
      {activeCommentVideoId && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <button className="flex-1 cursor-default" onClick={() => setActiveCommentVideoId(null)} aria-label="Đóng bình luận" />
          <div className="w-full max-w-[400px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0">
              <h3 className="font-bold text-white text-base">Bình luận</h3>
              <button
                type="button"
                onClick={() => setActiveCommentVideoId(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>

            {/* List of comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
              {((comments[activeCommentVideoId] || INITIAL_COMMENTS[activeCommentVideoId] || [])).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <AiOutlineMessage size={36} className="mb-2 opacity-50" />
                  <p className="text-xs">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                (comments[activeCommentVideoId] || INITIAL_COMMENTS[activeCommentVideoId] || []).map((comm) => (
                  <div key={comm.id} className="flex gap-3 text-sm items-start">
                    <Avatar src={comm.avatar} name={comm.name} size="sm" className="ring-1 ring-slate-800" />
                    <div className="bg-slate-800 rounded-2xl px-3 py-2 max-w-[80%]">
                      <p className="font-semibold text-slate-200 text-xs">{comm.name}</p>
                      <p className="text-slate-300 mt-1 leading-relaxed text-xs">{comm.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment input */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-slate-800 text-slate-100 rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 border border-slate-700 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2.5 transition shrink-0"
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

// Dedicated scroll-snap video item
const VideoItem = ({
  video,
  isMuted,
  setIsMuted,
  isLiked,
  likesCount,
  commentsCount,
  onLike,
  onShare,
  onOpenComments,
}) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)

  // Autoplay/pause when entering/leaving viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current
              ?.play()
              .then(() => setIsPlaying(true))
              .catch((err) => {
                // Autoplay blocked
                setIsPlaying(false)
              })
          } else {
            videoRef.current?.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.65 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  const handlePlayToggle = () => {
    if (isPlaying) {
      videoRef.current?.pause()
      setIsPlaying(false)
      setShowPlayOverlay(true)
      setTimeout(() => setShowPlayOverlay(false), 600)
    } else {
      videoRef.current
        ?.play()
        .then(() => {
          setIsPlaying(true)
          setShowPlayOverlay(true)
          setTimeout(() => setShowPlayOverlay(false), 600)
        })
        .catch(() => {})
    }
  }

  return (
    <div className="snap-start shrink-0 w-full h-[calc(100vh-9.5rem)] md:h-[calc(100vh-7.5rem)] bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center group/item shadow-inner border border-slate-800">
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={video.link}
        loop
        playsInline
        muted={isMuted}
        onClick={handlePlayToggle}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Fade overlay gradient for readable metadata */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Floating sound toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-10 bg-slate-900/60 hover:bg-slate-900/80 p-2.5 rounded-full backdrop-blur-md text-white transition ring-1 ring-white/10"
        title={isMuted ? 'Mở tiếng' : 'Tắt tiếng'}
      >
        {isMuted ? <AiFillSound size={16} /> : <AiOutlineSound size={16} />}
      </button>

      {/* Micro play/pause status alert overlay */}
      {showPlayOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white rounded-full p-4 animate-ping-once text-sm font-bold">
            {isPlaying ? '▶' : '❚❚'}
          </div>
        </div>
      )}

      {/* Right Interaction Sidebar */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-4 z-10">
        {/* Like Button */}
        <button
          onClick={onLike}
          className="flex flex-col items-center text-white"
          aria-label="Thích video"
        >
          <div className={`p-3 rounded-full transition-transform ${isLiked ? 'bg-red-500/20 text-red-500 scale-110' : 'bg-slate-900/50 text-white hover:bg-slate-950/70'}`}>
            {isLiked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
          </div>
          <span className="text-xs font-bold mt-1 text-slate-200">{likesCount}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={onOpenComments}
          className="flex flex-col items-center text-white"
          aria-label="Mở bình luận"
        >
          <div className="p-3 rounded-full bg-slate-900/50 hover:bg-slate-950/70 text-white transition">
            <AiOutlineMessage size={22} />
          </div>
          <span className="text-xs font-bold mt-1 text-slate-200">{commentsCount}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="flex flex-col items-center text-white"
          aria-label="Chia sẻ liên kết"
        >
          <div className="p-3 rounded-full bg-slate-900/50 hover:bg-slate-950/70 text-white transition">
            <AiOutlineShareAlt size={22} />
          </div>
          <span className="text-xs font-bold mt-1 text-slate-200">Chia sẻ</span>
        </button>
      </div>

      {/* Bottom Metadata Panel */}
      <div className="absolute left-4 bottom-4 right-16 text-white z-10 space-y-2.5">
        <div className="flex items-center gap-3">
          <Avatar src={video.user.avatar} name={video.user.name} size="md" className="ring-2 ring-primary-500" />
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-100 truncate flex items-center gap-2">
              {video.user.name}
              <span className="text-[10px] text-primary-400 bg-primary-950/40 border border-primary-500/30 px-1.5 py-0.5 rounded-full font-semibold">Creator</span>
            </p>
            <p className="text-[11px] text-slate-300 font-normal">@{video.user.username}</p>
          </div>
          <button
            onClick={() => setIsFollowed(!isFollowed)}
            className={`ml-2 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all duration-200 border ${
              isFollowed
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-700 flex items-center gap-0.5'
            }`}
          >
            {isFollowed ? 'Đang theo dõi' : (
              <>
                <AiOutlinePlus size={10} /> Theo dõi
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-200 font-normal leading-relaxed line-clamp-2 max-w-[90%]">
          {video.title}
        </p>

        {/* Real-time moving music ticker */}
        <div className="flex items-center gap-1.5 text-[11px] text-primary-400 font-medium bg-primary-950/40 border border-primary-500/20 rounded-lg py-1 px-2.5 w-max max-w-[70%]">
          <span className="animate-pulse">♫</span>
          <div className="overflow-hidden relative w-36 h-3.5">
            <div className="absolute whitespace-nowrap animate-marquee">
              Âm thanh gốc - {video.user.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchPage
