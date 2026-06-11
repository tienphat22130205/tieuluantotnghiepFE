import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AiOutlineClose,
  AiOutlinePicture,
  AiOutlineSmile,
  AiOutlineStar,
  AiOutlineVideoCamera,
  AiOutlineEnvironment,
  AiOutlineUser,
  AiOutlineSound,
} from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import AIGenerateButton from '../components/AIGenerateButton'
import AIOptionsModal from '../components/AIOptionsModal'
import AICaptionPickerModal from '../components/AICaptionPickerModal'
import useCreatePostPage from '../hooks/useCreatePostPage'

// Pill tags shown below user name row
const PILL_TAGS = [
  { key: 'music', label: 'Nhạc', icon: AiOutlineSound },
  { key: 'people', label: 'Gắn thẻ', icon: AiOutlineUser },
  { key: 'location', label: 'Vị trí', icon: AiOutlineEnvironment },
  { key: 'feeling', label: 'Cảm xúc', icon: AiOutlineSmile },
]

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Công khai' },
  { value: 'friends', label: 'Bạn bè' },
  { value: 'private', label: 'Chỉ mình tôi' },
]

const CreatePostPage = () => {
  const { postId } = useParams()
  const isEditMode = Boolean(postId)
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  // UI-only state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false)
  const [pickedAiHashtags, setPickedAiHashtags] = useState([])
  const [activePill, setActivePill] = useState(null)
  const [showVisibility, setShowVisibility] = useState(false)

  // Use the original hook — contains the full normalizeAIResult logic
  const {
    images,
    previews,
    content,
    hashtags,
    visibility,
    isAILoading,
    isPosting,
    aiUsed,
    aiOptions,
    aiCaptions,
    aiHashtags,
    aiCaptionHashtags,
    selectedCaptionIndex,
    isLoadingPost,
    location,
    isLocating,
    locationError,
    setContent,
    setHashtags,
    setVisibility,
    setLocation,
    handleImageChange,
    handleRemoveImage,
    handleAiOptionChange,
    handleAIGenerate,
    handleUseAICaption,
    handleDetectLocation,
    handleSubmit,
  } = useCreatePostPage({ postId, isEditMode })

  const displayName = user?.full_name || user?.fullName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Bạn'

  const canSubmit = content.trim().length > 0 || images.length > 0

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024
    )
    if (!files.length) return
    handleImageChange(files)
  }

  const handleClearImages = () => {
    handleRemoveImage()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const normalizeHashtagInput = (value) =>
    value.split(/[\s,]+/).map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`)

  const handleGenerateFromModal = async () => {
    setIsAIModalOpen(false)
    setPickedAiHashtags(normalizeHashtagInput(hashtags))
    setIsCaptionModalOpen(true)
    const ok = await handleAIGenerate()
    if (!ok) setIsCaptionModalOpen(false)
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] md:min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-[620px] mx-auto">

      {/* ── Header ── */}
      <div className="relative flex items-center justify-center h-14 border-b border-slate-100 px-4 shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
          aria-label="Đóng"
        >
          <AiOutlineClose size={20} />
        </button>
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
          {isEditMode ? 'Chỉnh sửa bài viết' : 'New post'}
        </h1>
      </div>

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto">

        {/* User row + visibility */}
        <div className="px-4 pt-4 flex items-center gap-3">
          <Avatar src={user?.avatar} name={displayName} size="md" to={`/profile/${user?.id || user?._id}`} />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-900 text-sm leading-none">{displayName}</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVisibility(v => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md px-2 py-1 transition"
              >
                {VISIBILITY_OPTIONS.find(o => o.value === visibility)?.label}
                <svg className="w-3 h-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {showVisibility && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-slate-200 py-1 min-w-[130px]">
                  {VISIBILITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setVisibility(opt.value); setShowVisibility(false) }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 ${visibility === opt.value ? 'text-primary-600' : 'text-slate-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pill tags */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {PILL_TAGS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === 'location') {
                  // Bấm vào Vị trí → gọi GPS ngay
                  if (location) {
                    // Đã có vị trí → bấm lại để xóa
                    setLocation(null)
                    setActivePill(null)
                  } else {
                    setActivePill('location')
                    handleDetectLocation({ silent: false })
                  }
                } else {
                  setActivePill(prev => prev === key ? null : key)
                }
              }}
              disabled={key === 'location' && isLocating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 disabled:opacity-60 ${
                (activePill === key || (key === 'location' && location))
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {key === 'location' && isLocating
                ? <span className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                : <Icon size={13} />}
              {label}
            </button>
          ))}
        </div>

        {/* Location indicator */}
        {(activePill === 'location' || location || locationError) && (
          <div className={`mx-4 mt-2 rounded-xl border px-3 py-2 text-xs font-medium flex items-center gap-2 ${
            locationError
              ? 'bg-red-50 border-red-100 text-red-600'
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}>
            <AiOutlineEnvironment size={14} className={`shrink-0 ${locationError ? 'text-red-400' : 'text-emerald-500'}`} />
            {isLocating
              ? 'Đang lấy vị trí GPS...'
              : locationError
                ? locationError
                : location
                  ? (location.placeName || [location.city, location.region, location.country].filter(Boolean).join(', ') || `${Number(location.lat).toFixed(4)}, ${Number(location.lng).toFixed(4)}`)
                  : 'Bấm để đính kèm vị trí GPS vào bài viết'
            }
            {location && !isLocating && (
              <button
                type="button"
                onClick={() => { setLocation(null); setActivePill(null) }}
                className="ml-auto text-emerald-500 hover:text-emerald-700 transition"
              >
                <AiOutlineClose size={12} />
              </button>
            )}
          </div>
        )}

        {/* Main textarea */}
        <div className="px-4 pt-3">
          {isLoadingPost ? (
            <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Đang tải bài viết...</div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì vậy?"
              rows={7}
              autoFocus
              className="w-full resize-none outline-none text-slate-900 text-[16px] placeholder:text-slate-400 bg-transparent leading-relaxed"
            />
          )}
        </div>

        {/* Hashtags field */}
        {(content.length > 0 || hashtags.length > 0) && (
          <div className="px-4 pb-2">
            <input
              type="text"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="#hashtag (tách bằng dấu cách)"
              className="w-full text-xs text-primary-600 placeholder:text-slate-400 outline-none bg-transparent font-medium"
            />
          </div>
        )}

        {/* Image previews */}
        {previews.length > 0 && (
          <div className="px-4 pb-3">
            <div className={`grid gap-1.5 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  {/* Individual remove only works in create mode for local files */}
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={handleClearImages}
                      className="absolute top-1.5 right-1.5 bg-black/55 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <AiOutlineClose size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!isEditMode && (
              <button type="button" onClick={handleClearImages} className="mt-2 text-[11px] text-red-500 hover:underline font-medium">
                Xóa tất cả ảnh
              </button>
            )}
          </div>
        )}

        {/* AI Generate Button — only when images present and not edit mode */}
        {!isEditMode && images.length > 0 && (
          <div className="px-4 pb-3">
            <AIGenerateButton disabled={isAILoading} onClick={() => setIsAIModalOpen(true)} />
          </div>
        )}
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Thêm ảnh"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <AiOutlinePicture size={22} />
          </button>
          <button type="button" title="GIF"
            className="p-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition font-bold text-[11px] border border-slate-300 leading-none flex items-center justify-center w-9 h-9"
          >
            GIF
          </button>
          <button type="button" title="Nổi bật"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <AiOutlineStar size={22} />
          </button>
          <button type="button" title="Video"
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <AiOutlineVideoCamera size={22} />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); handleSubmit(e) }}
          disabled={!canSubmit || isPosting}
          className={`rounded-full px-6 py-2 text-sm font-extrabold transition-all duration-200 ${
            canSubmit && !isPosting
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isPosting ? 'Đang đăng...' : isEditMode ? 'Lưu' : 'Đăng'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* AI Modals — reuse the same modal components with the hook's logic */}
      {!isEditMode && (
        <>
          <AIOptionsModal
            isOpen={isAIModalOpen}
            options={aiOptions}
            isLoading={isAILoading}
            onClose={() => { if (!isAILoading) setIsAIModalOpen(false) }}
            onChangeOption={handleAiOptionChange}
            onGenerate={handleGenerateFromModal}
          />
          <AICaptionPickerModal
            isOpen={isCaptionModalOpen}
            captions={aiCaptions}
            hashtags={aiHashtags}
            captionHashtags={aiCaptionHashtags}
            selectedTags={pickedAiHashtags}
            selectedIndex={selectedCaptionIndex}
            isLoading={isAILoading}
            onClose={() => { if (!isAILoading) setIsCaptionModalOpen(false) }}
            onToggleTag={tag => setPickedAiHashtags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
            onApplyHashtags={tags => setHashtags(tags.join(' '))}
            onUseCaption={handleUseAICaption}
          />
        </>
      )}
    </div>
  )
}

export default CreatePostPage
