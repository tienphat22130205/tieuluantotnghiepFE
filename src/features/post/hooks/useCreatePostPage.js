import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import postService from '../services/postService'
import { createPost, updatePost } from '../store/postSlice'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const useCreatePostPage = ({ postId, isEditMode }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

    if (typeof postId !== 'string' || postId.trim().length === 0) {
      toast.error('ID bai viet khong hop le!')
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
          toast.error('Bai viet khong ton tai hoac da bi xoa!')
          navigate('/')
          return
        }

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
        const isNotFound = err?.status === 404 || err?.message?.includes('404')
        toast.error(isNotFound ? 'Bai viet khong ton tai hoac da bi xoa!' : 'Loi khi tai bai viet de chinh sua. Vui long thu lai!')
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

  const handleImageChange = (files) => {
    setImages((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))])
  }

  const handleRemoveImage = () => {
    setImages([])
    setPreviews([])
    setHashtags('')
    setAiUsed(false)
  }

  const handleAIGenerate = async () => {
    if (images.length === 0) {
      toast.warn('Vui long chon anh truoc khi dung AI!')
      return
    }

    setIsAILoading(true)
    try {
      const formData = new FormData()
      formData.append('image', images[0])
      const result = await postService.generateCaption(formData)
      setContent(result.caption || '')
      setHashtags(Array.isArray(result.hashtags) ? result.hashtags.join(' ') : result.hashtags || '')
      setAiUsed(true)
    } catch {
      toast.error('AI dang ban, vui long thu lai sau!')
    } finally {
      setIsAILoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0 && previews.length === 0) {
      toast.warn('Vui long nhap noi dung hoac chon it nhat 1 anh!')
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

        toast.success('Cap nhat bai viet thanh cong!')
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

      toast.success('Dang bai thanh cong!')
      navigate('/')
    } catch {
      toast.error(isEditMode ? 'Cap nhat bai viet that bai!' : 'Dang bai that bai! Vui long thu lai.')
    } finally {
      setIsPosting(false)
    }
  }

  return {
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
  }
}

export default useCreatePostPage
