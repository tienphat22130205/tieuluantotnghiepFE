import { useParams } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import AIGenerateButton from '../components/AIGenerateButton'
import PostForm from '../components/PostForm'
import useCreatePostPage from '../hooks/useCreatePostPage'

/**
 * CreatePost Page – Trang tạo bài viết mới (Tính năng AI cốt lõi).
 */
const CreatePostPage = () => {
  const { postId } = useParams()
  const isEditMode = Boolean(postId)

  const {
    images,
    previews,
    content,
    hashtags,
    visibility,
    isAILoading,
    isPosting,
    aiUsed,
    isLoadingPost,
    setContent,
    setHashtags,
    setVisibility,
    handleImageChange,
    handleRemoveImage,
    handleAIGenerate,
    handleSubmit,
  } = useCreatePostPage({ postId, isEditMode })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
      </h1>

      {isLoadingPost && (
        <p className="text-sm text-gray-500 mb-4">Đang tải bài viết...</p>
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
            isLoading={isAILoading}
            onClick={handleAIGenerate}
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
  )
}

export default CreatePostPage
