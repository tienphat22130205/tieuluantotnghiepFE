import { useState, useRef } from 'react'
import { FiX, FiMusic, FiImage, FiType, FiUploadCloud } from 'react-icons/fi'
import { toast } from 'react-toastify'
import storyService from '../services/storyService'

const localPopularSongs = [
  { id: 's-8', title: 'Buông', artist: 'Hngle', spotifyUrl: 'https://open.spotify.com/embed/album/6ub8yuzsgJbYRdTd0ZgmLp?utm_source=generator&theme=0' },
  { id: 's-9', title: 'Không Buông', artist: 'Hngle', spotifyUrl: 'https://open.spotify.com/embed/album/6XkJNJGMV0VxaaxlfB3ss3?utm_source=generator&theme=0' },
  { id: 's-10', title: 'Tìm Em', artist: 'Hngle ft. Bảo Anh', spotifyUrl: 'https://open.spotify.com/embed/album/4qCaDixeJX4LXWMZs6rVyl?utm_source=generator&theme=0' },
  { id: 's-11', title: 'Ngày Em Đẹp Nhất', artist: 'Tama', spotifyUrl: 'https://open.spotify.com/embed/track/0DtarPcErIh4skfFtxzomo?utm_source=generator&theme=0' },
  { id: 's-12', title: 'Cuối Cùng Thì - LoFi', artist: 'Vu Trung Quan, Tama', spotifyUrl: 'https://open.spotify.com/embed/track/4NX93ZGvM0oVZ5nGo0ZuJZ?utm_source=generator&theme=0' },
  { id: 's-13', title: 'Lời Tạm Biệt Chưa Nói', artist: 'GREY D, Orange', spotifyUrl: 'https://open.spotify.com/embed/track/5k1fqShYVOdPHIq0RBKwrN?utm_source=generator&theme=0' },
  { id: 's-14', title: 'Thanh Xuân', artist: 'Da LAB', spotifyUrl: 'https://open.spotify.com/embed/track/3b34161QoxLwsqhWSPy9i5?utm_source=generator&theme=0' }
]

const CreateStoryModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null

  const [storyType, setStoryType] = useState('image') // 'image' | 'text'
  const [selectedMusic, setSelectedMusic] = useState(null)
  const [musicSearch, setMusicSearch] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
  const [mediaPreview, setMediaPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [duration, setDuration] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [showMusicList, setShowMusicList] = useState(false)
  const [imageFilter, setImageFilter] = useState('none')
  const [objectFit, setObjectFit] = useState('cover')
  const [showStylePanel, setShowStylePanel] = useState(false)

  const fileInputRef = useRef(null)

  const filterPresets = [
    { id: 'none',    label: 'Gốc',      style: 'none' },
    { id: 'warm',    label: 'Ấm',       style: 'sepia(0.35) saturate(1.4) brightness(1.05)' },
    { id: 'cool',    label: 'Lạnh',     style: 'hue-rotate(200deg) saturate(1.2) brightness(1.02)' },
    { id: 'faded',   label: 'Nhạt',     style: 'brightness(1.1) contrast(0.85) saturate(0.7)' },
    { id: 'bw',      label: 'Đen trắng',style: 'grayscale(1) contrast(1.1)' },
    { id: 'vivid',   label: 'Sặc sỡ',  style: 'saturate(1.9) contrast(1.1)' },
    { id: 'dreamy',  label: 'Mộng mơ', style: 'brightness(1.08) saturate(1.3) hue-rotate(15deg)' },
  ]

  const colorPresets = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #434343 0%, #000000 100%)'
  ]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const isVideo = file.type.startsWith('video/')
      if (isVideo) {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src)
          const durationSec = Math.round(video.duration)
          if (durationSec > 300) {
            toast.error('Video có thời lượng vượt quá 5 phút (tối đa 300 giây)!')
            setSelectedFile(null)
            setMediaPreview(null)
            e.target.value = ''
            return
          }
          setDuration(Math.min(durationSec, 300))
        }
        video.src = URL.createObjectURL(file)
      } else {
        setDuration(5) // default for images
      }

      setSelectedFile(file)
      setStoryType(isVideo ? 'video' : 'image')
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectSong = (song) => {
    setSelectedMusic(song)
    setShowMusicList(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('mediaType', storyType)
      if (storyType !== 'text' && selectedFile) {
        formData.append('file', selectedFile)
      }
      formData.append('textContent', textContent)
      formData.append('bgColor', storyType === 'text' ? bgColor : '')
      formData.append('textColor', storyType === 'text' ? textColor : '')
      formData.append('duration', duration)
      formData.append('imageFilter', storyType !== 'text' ? imageFilter : 'none')
      formData.append('objectFit', objectFit)

      if (selectedMusic) {
        formData.append('spotifyUrl', selectedMusic.spotifyUrl || '')
        formData.append('musicTitle', selectedMusic.title || 'Spotify Link')
        formData.append('musicArtist', selectedMusic.artist || 'Spotify Embed')
      }

      const res = await storyService.createStory(formData)
      const createdStory = res?.data || res
      onSuccess?.(createdStory)
      toast.success('Đăng tin thành công!')

      // Reset state
      setMediaPreview(null)
      setSelectedFile(null)
      setSelectedMusic(null)
      setTextContent('')
      setDuration(5)
      setImageFilter('none')
      setObjectFit('cover')
      onClose()
    } catch (err) {
      toast.error(err?.message || 'Đăng tin thất bại!')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSongs = localPopularSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
      song.artist.toLowerCase().includes(musicSearch.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm md:p-4">
      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="md:hidden relative w-full h-full bg-slate-900 flex flex-col overflow-hidden">

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* Media Preview - full screen */}
        <div className="relative flex-1 overflow-hidden">
          {storyType === 'text' ? (
            <div className="w-full h-full flex items-center justify-center p-8 text-center" style={{ background: bgColor }}>
              <textarea
                placeholder="Nhập nội dung tin..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="bg-transparent text-center text-xl font-bold w-full h-full flex items-center resize-none focus:outline-none"
                style={{ color: textColor }}
              />
            </div>
          ) : mediaPreview ? (
            storyType === 'video' ? (
              <video
                src={mediaPreview}
                className={`w-full h-full object-${objectFit}`}
                style={{ filter: imageFilter !== 'none' ? imageFilter : undefined }}
                muted autoPlay loop
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Preview"
                className={`w-full h-full object-${objectFit}`}
                style={{ filter: imageFilter !== 'none' ? imageFilter : undefined }}
              />
            )
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-4 cursor-pointer"
            >
              <FiUploadCloud size={56} className="text-slate-500" />
              <span className="text-sm text-slate-400 text-center px-10 leading-relaxed">
                Nhấn để chọn ảnh hoặc video
              </span>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65 pointer-events-none" />

          {/* Top bar: back + type toggle */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-10 pb-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer"
            >
              <FiX size={18} />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { setStoryType('image'); setMediaPreview(null) }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm cursor-pointer transition ${
                  storyType !== 'text' ? 'bg-white text-slate-800' : 'bg-black/40 text-white border border-white/20'
                }`}
              >
                Ảnh/Video
              </button>
              <button
                onClick={() => { setStoryType('text'); setMediaPreview(null) }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm cursor-pointer transition ${
                  storyType === 'text' ? 'bg-white text-slate-800' : 'bg-black/40 text-white border border-white/20'
                }`}
              >
                Tin chữ
              </button>
            </div>
          </div>

          {/* Right side tool icons */}
          <div className="absolute top-24 right-3 z-20 flex flex-col gap-5 items-center">
            {storyType !== 'text' && (
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-lg">
                  <FiImage size={20} />
                </div>
                <span className="text-white text-[10px] font-semibold drop-shadow">Ảnh</span>
              </button>
            )}

            {storyType !== 'text' && mediaPreview && (
              <button onClick={() => setShowStylePanel(!showStylePanel)} className="flex flex-col items-center gap-1 cursor-pointer">
                <div className={`w-11 h-11 rounded-full backdrop-blur-sm border flex items-center justify-center text-white shadow-lg transition ${
                  imageFilter !== 'none' ? 'bg-violet-500 border-violet-400' : 'bg-black/50 border-white/20'
                }`}>
                  <FiType size={20} />
                </div>
                <span className="text-white text-[10px] font-semibold drop-shadow">Style</span>
              </button>
            )}

            {storyType === 'text' && (
              <div className="flex flex-col gap-2">
                {colorPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBgColor(preset)}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer transition hover:scale-110 ${
                      bgColor === preset ? 'border-white scale-110' : 'border-white/40'
                    }`}
                    style={{ background: preset }}
                  />
                ))}
              </div>
            )}

            <button onClick={() => setShowMusicList(!showMusicList)} className="flex flex-col items-center gap-1 cursor-pointer">
              <div className={`w-11 h-11 rounded-full backdrop-blur-sm border flex items-center justify-center text-white shadow-lg transition ${
                selectedMusic ? 'bg-emerald-500 border-emerald-400' : 'bg-black/50 border-white/20'
              }`}>
                <FiMusic size={20} />
              </div>
              <span className="text-white text-[10px] font-semibold drop-shadow">Nhạc</span>
            </button>
          </div>

          {/* Music chip overlay above bottom bar */}
          {selectedMusic && (
            <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center gap-2.5 bg-black/70 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-white/10">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <FiMusic size={13} className="text-white animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">{selectedMusic.title || 'Spotify Link'}</span>
                <span className="text-[10px] text-slate-300 block truncate">{selectedMusic.artist || ''}</span>
              </div>
              <button onClick={() => setSelectedMusic(null)} className="text-white/60 hover:text-white text-lg leading-none cursor-pointer shrink-0 px-1">✕</button>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="bg-black px-4 py-4 flex items-center gap-3 safe-area-bottom">
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value={5} className="text-black bg-white">5 giây</option>
            <option value={10} className="text-black bg-white">10 giây</option>
            <option value={15} className="text-black bg-white">15 giây</option>
            <option value={30} className="text-black bg-white">30 giây</option>
            <option value={60} className="text-black bg-white">1 phút</option>
            <option value={180} className="text-black bg-white">3 phút</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (storyType !== 'text' && !mediaPreview) || (storyType === 'text' && !textContent.trim())}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:opacity-60 text-white font-bold px-7 py-2.5 rounded-xl text-sm cursor-pointer transition shadow-lg"
          >
            {isLoading ? 'Đang tải...' : 'Đăng tin'}
          </button>
        </div>

        {/* Music picker – bottom sheet */}
        {showMusicList && (
          <>
            <div className="absolute inset-0 z-30 bg-black/40" onClick={() => setShowMusicList(false)} />
            <div className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl shadow-2xl p-4 max-h-[65vh] overflow-y-auto">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-800 mb-3">🎵 Chọn nhạc nền</h3>
              <input
                type="text"
                placeholder="Tìm bài hát hoặc dán link Spotify..."
                value={musicSearch}
                onChange={(e) => {
                  const val = e.target.value
                  setMusicSearch(val)
                  if (val.includes('spotify.com/')) {
                    setSelectedMusic({ title: '', artist: '', spotifyUrl: val, isCustom: true })
                    setShowMusicList(false)
                    setMusicSearch('')
                  }
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:border-primary-500"
              />
              <div className="space-y-1">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className="flex items-center justify-between px-3 py-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">{song.title}</span>
                      <span className="text-xs text-slate-400 block">{song.artist}</span>
                    </div>
                    <span className="text-xs text-primary-500 font-bold">Chọn</span>
                  </div>
                ))}
              </div>
              {selectedMusic?.isCustom && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Tên bài</label>
                    <input type="text" placeholder="Tên bài hát..."
                      value={selectedMusic.title}
                      onChange={(e) => setSelectedMusic({ ...selectedMusic, title: e.target.value })}
                      className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Ca sĩ</label>
                    <input type="text" placeholder="Ca sĩ..."
                      value={selectedMusic.artist}
                      onChange={(e) => setSelectedMusic({ ...selectedMusic, artist: e.target.value })}
                      className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Style picker – bottom sheet (filter + objectFit) */}
        {showStylePanel && (
          <>
            <div className="absolute inset-0 z-30 bg-black/40" onClick={() => setShowStylePanel(false)} />
            <div className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl shadow-2xl p-4">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-800 mb-4">✨ Điều chỉnh ảnh</h3>

              {/* Object-fit toggle */}
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kích thước</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setObjectFit('cover')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      objectFit === 'cover' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Cắt vừa màn hình
                  </button>
                  <button
                    onClick={() => setObjectFit('contain')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      objectFit === 'contain' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Vừa khung (letterbox)
                  </button>
                </div>
              </div>

              {/* Filter presets */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bộ lọc màu</p>
                <div className="grid grid-cols-4 gap-3">
                  {filterPresets.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setImageFilter(f.style)}
                      className={`flex flex-col items-center gap-1.5 cursor-pointer group`}
                    >
                      <div
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                          imageFilter === f.style ? 'border-primary-500 scale-105' : 'border-transparent'
                        }`}
                      >
                        {mediaPreview ? (
                          <img
                            src={mediaPreview}
                            alt={f.label}
                            className="w-full h-full object-cover"
                            style={{ filter: f.style !== 'none' ? f.style : undefined }}
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              filter: f.style !== 'none' ? f.style : undefined
                            }}
                          />
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold ${
                        imageFilter === f.style ? 'text-primary-600' : 'text-slate-500'
                      }`}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowStylePanel(false)}
                className="w-full mt-5 py-3 bg-slate-800 text-white font-bold rounded-2xl cursor-pointer"
              >
                Xong
              </button>
            </div>
          </>
        )}
      </div>

      {/* ==================== DESKTOP LAYOUT (md+) ==================== */}
      <div className="hidden md:flex relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden h-[650px]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Left Panel: Options Form */}
        <div className="w-[400px] border-r border-slate-100 flex flex-col h-full overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Tạo tin mới</h2>

          {/* Story Type Selector */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => { setStoryType('image'); setMediaPreview(null) }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                storyType !== 'text' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FiImage size={16} />Ảnh / Video
            </button>
            <button
              type="button"
              onClick={() => { setStoryType('text'); setMediaPreview(null) }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                storyType === 'text' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FiType size={16} />Tin chữ
            </button>
          </div>

          <div className="flex-1 space-y-5">
            {storyType !== 'text' ? (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Chọn hình ảnh hoặc video</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-2xl p-6 text-center transition-colors cursor-pointer group"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                  <FiUploadCloud className="mx-auto text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" size={36} />
                  <span className="text-sm font-medium text-slate-600 block group-hover:text-slate-800">Kéo thả hoặc bấm để tải lên</span>
                  <span className="text-xs text-slate-400 block mt-1">Hỗ trợ ảnh JPG, PNG hoặc video MP4</span>
                </div>

                {/* Object-fit + Filter - only show after media selected */}
                {mediaPreview && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kích thước hiển thị</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setObjectFit('cover')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            objectFit === 'cover' ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Cắt vừa
                        </button>
                        <button type="button" onClick={() => setObjectFit('contain')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            objectFit === 'contain' ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Vừa khung
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bộ lọc màu</label>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {filterPresets.map((f) => (
                          <button key={f.id} type="button" onClick={() => setImageFilter(f.style)}
                            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                              imageFilter === f.style ? 'border-primary-500 scale-105' : 'border-transparent hover:border-slate-200'
                            }`}>
                              <img
                                src={mediaPreview}
                                alt={f.label}
                                className="w-full h-full object-cover"
                                style={{ filter: f.style !== 'none' ? f.style : undefined }}
                              />
                            </div>
                            <span className={`text-[10px] font-semibold ${
                              imageFilter === f.style ? 'text-primary-600' : 'text-slate-400'
                            }`}>{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nội dung tin chữ</label>
                  <textarea rows={3} placeholder="Bắt đầu nhập..." value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Màu nền tin</label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((preset, idx) => (
                      <button key={idx} type="button" onClick={() => setBgColor(preset)}
                        className={`w-7 h-7 rounded-full border border-slate-100 transition hover:scale-110 cursor-pointer ${bgColor === preset ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                        style={{ background: preset }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Thời lượng phát tin</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-500 bg-white cursor-pointer"
              >
                <option value={5}>5 giây (5s - Mặc định)</option>
                <option value={10}>10 giây (10s)</option>
                <option value={15}>15 giây (15s)</option>
                <option value={30}>30 giây (30s)</option>
                <option value={60}>1 phút (60s)</option>
                <option value={180}>3 phút (180s)</option>
                <option value={300}>5 phút (300s - Tối đa)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Nhạc nền kèm theo</label>
              {selectedMusic ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse shrink-0">
                        <FiMusic size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-emerald-800 block truncate max-w-[200px]">{selectedMusic.title || 'Dán link Spotify'}</span>
                        <span className="text-xs text-emerald-600 block truncate max-w-[200px]">{selectedMusic.artist || 'Nhập thông tin bên dưới'}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedMusic(null)}
                      className="text-emerald-500 hover:text-emerald-700 text-xs font-semibold hover:underline cursor-pointer shrink-0"
                    >Gỡ nhạc</button>
                  </div>
                  {selectedMusic.isCustom && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/50">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Tên bài hát</label>
                        <input type="text" placeholder="Tên bài hát..." value={selectedMusic.title}
                          onChange={(e) => setSelectedMusic({ ...selectedMusic, title: e.target.value })}
                          className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Ca sĩ</label>
                        <input type="text" placeholder="Ca sĩ..." value={selectedMusic.artist}
                          onChange={(e) => setSelectedMusic({ ...selectedMusic, artist: e.target.value })}
                          className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button type="button" onClick={() => setShowMusicList(!showMusicList)}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 rounded-2xl py-3 text-sm text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    <FiMusic size={16} className="text-slate-500" />Thêm nhạc vào tin
                  </button>
                  {showMusicList && (
                    <div className="absolute left-0 right-0 mt-2 z-30 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 max-h-[290px] overflow-y-auto">
                      <input type="text" placeholder="Tìm bài hát hoặc dán link Spotify..."
                        value={musicSearch}
                        onChange={(e) => {
                          const val = e.target.value
                          setMusicSearch(val)
                          if (val.includes('spotify.com/')) {
                            setSelectedMusic({ title: '', artist: '', spotifyUrl: val, isCustom: true })
                            setShowMusicList(false)
                            setMusicSearch('')
                          }
                        }}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs mb-2.5 focus:outline-none focus:border-primary-500"
                      />
                      <div className="space-y-1">
                        {filteredSongs.map((song) => (
                          <div key={song.id} onClick={() => handleSelectSong(song)}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-700 block group-hover:text-primary-600">{song.title}</span>
                              <span className="text-[10px] text-slate-400 block">{song.artist}</span>
                            </div>
                            <span className="text-[10px] text-primary-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Chọn</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-center text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            >Hủy</button>
            <button type="submit" onClick={handleSubmit}
              disabled={isLoading || (storyType !== 'text' && !mediaPreview) || (storyType === 'text' && !textContent.trim())}
              className="flex-1 py-3 text-center text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-2xl shadow transition-all cursor-pointer"
            >{isLoading ? 'Đang tải...' : 'Đăng tin'}</button>
          </div>
        </div>

        {/* Right Panel: Story Live Preview */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-10">
          <div className="relative w-[280px] h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-black border-[6px] border-slate-800 flex items-center justify-center select-none">
            <div className="absolute inset-0 z-0">
              {storyType === 'text' ? (
                <div className="w-full h-full flex items-center justify-center p-4 text-center" style={{ background: bgColor }}>
                  <span className="text-lg font-bold break-words whitespace-pre-wrap max-w-full drop-shadow" style={{ color: textColor }}>
                    {textContent || 'Vui lòng nhập nội dung...'}
                  </span>
                </div>
              ) : mediaPreview ? (
                storyType === 'video' ? (
                  <video
                    src={mediaPreview}
                    className={`w-full h-full object-${objectFit}`}
                    style={{ filter: imageFilter !== 'none' ? imageFilter : undefined }}
                    muted autoPlay loop
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className={`w-full h-full object-${objectFit}`}
                    style={{ filter: imageFilter !== 'none' ? imageFilter : undefined }}
                  />
                )
              ) : (
                <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center gap-2">
                  <FiImage size={28} />
                  <span>Hãy chọn một ảnh hoặc video để hiển thị bản xem trước tin tại đây.</span>
                </div>
              )}
            </div>

            {selectedMusic && (mediaPreview || storyType === 'text') && (
              <div className="absolute top-[80px] left-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-white/10 animate-bounce">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <FiMusic size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-white block truncate">{selectedMusic.title}</span>
                  <span className="text-[8px] text-slate-300 block truncate">{selectedMusic.artist}</span>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-white" />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-xs rounded-full px-3 py-1 text-[10px] text-white border border-white/10">
              Bản xem trước tin
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CreateStoryModal
