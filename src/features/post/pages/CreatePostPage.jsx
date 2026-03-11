import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import postService from '../services/postService'
import { createPost } from '../store/postSlice'
import ImageUploader from '../components/ImageUploader'
import AIGenerateButton from '../components/AIGenerateButton'
import PostForm from '../components/PostForm'

/**
 * CreatePost Page – Trang tạo bài viết mới (Tính năng AI cốt lõi).
 */
const CreatePostPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [aiUsed, setAiUsed] = useState(false)

  // Chọn ảnh
  const handleImageChange = (file) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  // Xóa ảnh
  const handleRemoveImage = () => {
    setImage(null)
    setPreview(null)
    setCaption('')
    setHashtags('')
    setAiUsed(false)
  }

  // Gọi AI sinh nội dung
  const handleAIGenerate = async () => {
    if (!image) {
      alert('Vui lòng chọn ảnh trước khi dùng AI!')
      return
    }

    setIsAILoading(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      const result = await postService.generateCaption(formData)
      setCaption(result.caption || '')
      setHashtags(
        Array.isArray(result.hashtags)
          ? result.hashtags.join(' ')
          : result.hashtags || ''
      )
      setAiUsed(true)
    } catch (err) {
      alert('AI đang bận, vui lòng thử lại sau!')
      console.error('AI Error:', err)
    } finally {
      setIsAILoading(false)
    }
  }

  // Đăng bài
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) {
      alert('Vui lòng chọn ít nhất 1 ảnh!')
      return
    }

    setIsPosting(true)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('caption', caption)
      formData.append('hashtags', hashtags)
      formData.append('is_ai_generated', aiUsed)
      await dispatch(createPost(formData)).unwrap()
      navigate('/')
    } catch (_err) {
      alert('Đăng bài thất bại! Vui lòng thử lại.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo bài viết mới</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploader
          preview={preview}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
        />

        {preview && (
          <AIGenerateButton
            isLoading={isAILoading}
            onClick={handleAIGenerate}
          />
        )}

        <PostForm
          caption={caption}
          hashtags={hashtags}
          aiUsed={aiUsed}
          isPosting={isPosting}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
        />
      </form>
    </div>
  )
}

export default CreatePostPage
