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

  const fileInputRef = useRef(null)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[650px] transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <FiX size={18} />
        </button>

        {/* Left Panel: Options Form */}
        <div className="w-full md:w-[400px] border-r border-slate-100 flex flex-col h-1/2 md:h-full overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Tạo tin mới</h2>

          {/* Story Type Selector */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => {
                setStoryType('image')
                setMediaPreview(null)
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                storyType !== 'text'
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FiImage size={16} />
              Ảnh / Video
            </button>
            <button
              type="button"
              onClick={() => {
                setStoryType('text')
                setMediaPreview(null)
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                storyType === 'text'
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <FiType size={16} />
              Tin chữ
            </button>
          </div>

          {/* Form Content conditional */}
          <div className="flex-1 space-y-5">
            {storyType !== 'text' ? (
              // Media Upload section
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chọn hình ảnh hoặc video
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-2xl p-6 text-center transition-colors duration-150 cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <FiUploadCloud className="mx-auto text-slate-400 group-hover:text-primary-500 mb-2 transition-colors" size={36} />
                  <span className="text-sm font-medium text-slate-600 block group-hover:text-slate-800">
                    Kéo thả hoặc bấm để tải lên
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Hỗ trợ ảnh JPG, PNG hoặc video MP4
                  </span>
                </div>
              </div>
            ) : (
              // Text customizations
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Nội dung tin chữ
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Bắt đầu nhập..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                {/* Preset background colors */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Màu nền tin
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBgColor(preset)}
                        className={`w-7 h-7 rounded-full border border-slate-100 flex items-center justify-center transition hover:scale-110 cursor-pointer ${
                          bgColor === preset ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                        }`}
                        style={{ background: preset }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Story Duration selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Thời lượng phát tin
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
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

            {/* Music sticker selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Nhạc nền kèm theo
              </label>

              {selectedMusic ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse shrink-0">
                        <FiMusic size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-emerald-800 block truncate max-w-[200px]">
                          {selectedMusic.title || 'Dán link Spotify'}
                        </span>
                        <span className="text-xs text-emerald-600 block truncate max-w-[200px]">
                          {selectedMusic.artist || 'Nhập thông tin bên dưới'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMusic(null)}
                      className="text-emerald-500 hover:text-emerald-700 text-xs font-semibold hover:underline cursor-pointer shrink-0"
                    >
                      Gỡ nhạc
                    </button>
                  </div>

                  {selectedMusic.isCustom && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/50">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                          Tên bài hát
                        </label>
                        <input
                          type="text"
                          placeholder="Tên bài hát..."
                          value={selectedMusic.title}
                          onChange={(e) => setSelectedMusic({ ...selectedMusic, title: e.target.value })}
                          className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                          Ca sĩ
                        </label>
                        <input
                          type="text"
                          placeholder="Ca sĩ..."
                          value={selectedMusic.artist}
                          onChange={(e) => setSelectedMusic({ ...selectedMusic, artist: e.target.value })}
                          className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMusicList(!showMusicList)}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 rounded-2xl py-3 text-sm text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                  >
                    <FiMusic size={16} className="text-slate-500" />
                    Thêm nhạc vào tin
                  </button>

                  {/* Dropdown list of popular music */}
                  {showMusicList && (
                    <div className="absolute left-0 right-0 mt-2 z-30 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 max-h-[290px] overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Tìm bài hát hoặc dán link Spotify..."
                        value={musicSearch}
                        onChange={(e) => {
                          const val = e.target.value
                          setMusicSearch(val)
                          if (val.includes('spotify.com/')) {
                            setSelectedMusic({
                              title: '',
                              artist: '',
                              spotifyUrl: val,
                              isCustom: true
                            })
                            setShowMusicList(false)
                            setMusicSearch('')
                          }
                        }}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs mb-2.5 focus:outline-none focus:border-primary-500"
                      />
                      <div className="space-y-1">
                        {filteredSongs.map((song) => (
                          <div
                            key={song.id}
                            onClick={() => handleSelectSong(song)}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-700 block group-hover:text-primary-600">
                                {song.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {song.artist}
                              </span>
                            </div>
                            <span className="text-[10px] text-primary-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              Chọn
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-center text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || (storyType !== 'text' && !mediaPreview) || (storyType === 'text' && !textContent.trim())}
              className="flex-1 py-3 text-center text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-2xl shadow transition-all cursor-pointer"
            >
              {isLoading ? 'Đang tải...' : 'Đăng tin'}
            </button>
          </div>
        </div>

        {/* Right Panel: Story Live Preview */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-6 md:p-10">
          <div className="relative w-[240px] h-[400px] md:w-[280px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-black border-[6px] border-slate-800 flex items-center justify-center select-none">
            {/* Live Preview Screen */}
            <div className="absolute inset-0 z-0">
              {storyType === 'text' ? (
                <div
                  className="w-full h-full flex items-center justify-center p-4 text-center"
                  style={{ background: bgColor }}
                >
                  <span
                    className="text-base md:text-lg font-bold break-words whitespace-pre-wrap max-w-full drop-shadow"
                    style={{ color: textColor }}
                  >
                    {textContent || 'Vui lòng nhập nội dung...'}
                  </span>
                </div>
              ) : mediaPreview ? (
                storyType === 'video' ? (
                  <video src={mediaPreview} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center gap-2">
                  <FiImage size={28} />
                  <span>Hãy chọn một ảnh hoặc video để hiển thị bản xem trước tin tại đây.</span>
                </div>
              )}
            </div>

            {/* Music sticker overlay inside preview */}
            {selectedMusic && (mediaPreview || storyType === 'text') && (
              <div className="absolute top-[80px] left-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-white/10 animate-bounce">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <FiMusic size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-white block truncate">
                    {selectedMusic.title}
                  </span>
                  <span className="text-[8px] text-slate-300 block truncate">
                    {selectedMusic.artist}
                  </span>
                </div>
              </div>
            )}

            {/* Top Indicator bar */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-white" />
              </div>
            </div>

            {/* Bottom Preview badge */}
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
