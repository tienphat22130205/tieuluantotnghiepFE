import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import AIGenerateButton from '../components/AIGenerateButton'
import AIOptionsModal from '../components/AIOptionsModal'
import AICaptionPickerModal from '../components/AICaptionPickerModal'
import PostForm from '../components/PostForm'
import useCreatePostPage from '../hooks/useCreatePostPage'

/**
 * CreatePost Page – Trang tạo bài viết mới (Tính năng AI cốt lõi).
 */
const CreatePostPage = () => {
  const { postId } = useParams()
  const isEditMode = Boolean(postId)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false)
  const [pickedAiHashtags, setPickedAiHashtags] = useState([])

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
    setContent,
    setHashtags,
    setVisibility,
    handleImageChange,
    handleRemoveImage,
    handleAiOptionChange,
    handleAIGenerate,
    handleUseAICaption,
    handleSubmit,
  } = useCreatePostPage({ postId, isEditMode })

  const openAIModal = () => {
    setIsAIModalOpen(true)
  }

  const normalizeHashtagInput = (value) =>
    value
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

  const closeAIModal = () => {
    if (isAILoading) return
    setIsAIModalOpen(false)
  }

  const handleGenerateFromModal = async () => {
    setIsAIModalOpen(false)
    setPickedAiHashtags(normalizeHashtagInput(hashtags))
    setIsCaptionModalOpen(true)

    const isSuccess = await handleAIGenerate()
    if (isSuccess) {
      return
    }

    setIsCaptionModalOpen(false)
  }

  const closeCaptionModal = () => {
    if (isAILoading) return
    setIsCaptionModalOpen(false)
  }

  const handleUseCaptionFromModal = (caption, index) => {
    handleUseAICaption(caption, index)
  }

  const handleApplyHashtagsFromModal = (pickedTags) => {
    setHashtags(pickedTags.join(' '))
  }

  const handleToggleAiHashtag = (tag) => {
    setPickedAiHashtags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag)
      }
      return [...prev, tag]
    })
  }

  return (
    <div className="min-h-[70vh] rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="mb-1 text-2xl font-black tracking-tight text-slate-900">
          {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </h1>
        <p className="mb-6 text-sm text-slate-500">Chia sẻ ảnh và cảm xúc theo phong cách của bạn.</p>

        {isLoadingPost && (
          <p className="mb-4 text-sm text-slate-500">Đang tải bài viết...</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
        {!isEditMode && (
          <ImageUploader
            previews={previews}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
          />
        )}

        {isEditMode && previews.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Hình ảnh hiện tại</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={`${preview}-${index}`} className="rounded-xl overflow-hidden border border-gray-200 aspect-square">
                  <img src={preview} alt={`Current ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isEditMode && previews.length > 0 && (
          <AIGenerateButton
            disabled={isAILoading}
            onClick={openAIModal}
          />
        )}

        {!isEditMode && (
          <AIOptionsModal
            isOpen={isAIModalOpen}
            options={aiOptions}
            isLoading={isAILoading}
            onClose={closeAIModal}
            onChangeOption={handleAiOptionChange}
            onGenerate={handleGenerateFromModal}
          />
        )}

        {!isEditMode && (
          <AICaptionPickerModal
            isOpen={isCaptionModalOpen}
            captions={aiCaptions}
            hashtags={aiHashtags}
            captionHashtags={aiCaptionHashtags}
            selectedTags={pickedAiHashtags}
            selectedIndex={selectedCaptionIndex}
            isLoading={isAILoading}
            onClose={closeCaptionModal}
            onToggleTag={handleToggleAiHashtag}
            onApplyHashtags={handleApplyHashtagsFromModal}
            onUseCaption={handleUseCaptionFromModal}
          />
        )}

        <PostForm
          content={content}
          hashtags={hashtags}
          visibility={visibility}
          aiUsed={aiUsed}
          hasImages={images.length > 0 || previews.length > 0}
          submitLabel={isEditMode ? 'Lưu chỉnh sửa' : undefined}
          isPosting={isPosting}
          onContentChange={setContent}
          onHashtagsChange={setHashtags}
          onVisibilityChange={setVisibility}
        />
        </form>
      </div>
    </div>
  )
}

export default CreatePostPage
