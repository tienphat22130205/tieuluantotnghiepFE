import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import postService from '../services/postService'
import { createPost, updatePost } from '../store/postSlice'
import ImageUploader from '../components/ImageUploader'
import AIGenerateButton from '../components/AIGenerateButton'
import PostForm from '../components/PostForm'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * CreatePost Page – Trang tạo bài viết mới (Tính năng AI cốt lõi).
 */
const CreatePostPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { postId } = useParams()
  const isEditMode = Boolean(postId)

  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [isAILoading, setIsAILoading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [aiUsed, setAiUsed] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const isMountedRef = useRef(true)

  const parseHashtags = (value) =>
    value
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

  const extractPostPayload = (payload) => payload?.data || payload?.post || payload

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isEditMode || !postId) return

    // Guard against invalid postId
    if (typeof postId !== 'string' || postId.trim().length === 0) {
      toast.error('ID bài viết không hợp lệ!')
      navigate('/')
      return
    }

    let isCancelled = false

    const loadPostForEditing = async () => {
      if (!isMountedRef.current) return
      setIsLoadingPost(true)
      try {
        const response = await postService.getById(postId)
        if (!isMountedRef.current || isCancelled) return

        const currentPost = extractPostPayload(response)

        if (!currentPost || !currentPost._id) {
          if (isMountedRef.current) {
            toast.error('Bài viết không tồn tại hoặc đã bị xóa!')
            navigate('/')
          }
          return
        }

        if (!isMountedRef.current || isCancelled) return

        setContent(currentPost?.content || currentPost?.caption || '')
        setVisibility(currentPost?.visibility || 'public')
        setHashtags(Array.isArray(currentPost?.hashtags) ? currentPost.hashtags.join(' ') : '')

        const existingImages = [
          ...(Array.isArray(currentPost?.images) ? currentPost.images : []),
          ...(currentPost?.image_url ? [currentPost.image_url] : []),
        ]
          .map((item) => {
            if (!item) return null
            if (typeof item === 'string') return resolveMediaUrl(item)
            if (typeof item === 'object') return resolveMediaUrl(item.image_url || item.url || item.path)
            return null
          })
          .filter(Boolean)

        if (isMountedRef.current) {
          setPreviews([...new Set(existingImages)])
        }
      } catch (err) {
        if (!isMountedRef.current || isCancelled) return
        console.error('Load post for edit error:', err)
        const isNotFound = err?.status === 404 || err?.message?.includes('404')
        if (isNotFound) {
          toast.error('Bài viết không tồn tại hoặc đã bị xóa!')
        } else {
          toast.error('Lỗi khi tải bài viết để chỉnh sửa. Vui lòng thử lại!')
        }
        navigate('/')
      } finally {
        if (isMountedRef.current) {
          setIsLoadingPost(false)
        }
      }
    }

    loadPostForEditing()

    return () => {
      isCancelled = true
    }
  }, [isEditMode, navigate, postId])

  // Chọn ảnh
  const handleImageChange = (files) => {
    setImages((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))])
  }

  // Xóa ảnh
  const handleRemoveImage = () => {
    setImages([])
    setPreviews([])
    setHashtags('')
    setAiUsed(false)
  }

  // Gọi AI sinh nội dung
  const handleAIGenerate = async () => {
    if (images.length === 0) {
      toast.warn('Vui lòng chọn ảnh trước khi dùng AI!')
      return
    }

    setIsAILoading(true)
    try {
      const formData = new FormData()
      formData.append('image', images[0])
      const result = await postService.generateCaption(formData)
      setContent(result.caption || '')
      setHashtags(
        Array.isArray(result.hashtags)
          ? result.hashtags.join(' ')
          : result.hashtags || ''
      )
      setAiUsed(true)
    } catch (err) {
      toast.error('AI đang bận, vui lòng thử lại sau!')
      console.error('AI Error:', err)
    } finally {
      setIsAILoading(false)
    }
  }

  // Đăng bài
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0 && previews.length === 0) {
      toast.warn('Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh!')
      return
    }

    setIsPosting(true)
    try {
      const normalizedHashtags = parseHashtags(hashtags)

      if (isEditMode) {
        await dispatch(updatePost({
          postId,
          payload: {
            content,
            visibility,
            hashtags: normalizedHashtags,
          },
        })).unwrap()

        toast.success('Cập nhật bài viết thành công!')
        navigate(`/post/${postId}`)
        return
      }

      if (images.length > 0) {
        const formData = new FormData()
        images.forEach((file) => formData.append('images', file))
        formData.append('content', content)
        formData.append('hashtags', normalizedHashtags.join(','))
        formData.append('visibility', visibility)
        formData.append('is_ai_generated', String(aiUsed))
        await dispatch(createPost(formData)).unwrap()
      } else {
        await dispatch(createPost({
          content,
          hashtags: normalizedHashtags,
          visibility,
        })).unwrap()
      }

      toast.success('Đăng bài thành công!')
      navigate('/')
    } catch (_err) {
      toast.error(isEditMode ? 'Cập nhật bài viết thất bại!' : 'Đăng bài thất bại! Vui lòng thử lại.')
    } finally {
      setIsPosting(false)
    }
  }

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
