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
  const [aiOptions, setAiOptions] = useState({
    language: 'vi',
    tone: 'fun',
    length: 'medium',
    includeHashtags: true,
    numCaptions: 3,
  })
  const [aiCaptions, setAiCaptions] = useState([])
  const [aiHashtags, setAiHashtags] = useState([])
  const [aiCaptionHashtags, setAiCaptionHashtags] = useState([])
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(null)
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
    setAiCaptions([])
    setAiHashtags([])
    setAiCaptionHashtags([])
    setSelectedCaptionIndex(null)
  }

  const handleAiOptionChange = (key, value) => {
    setAiOptions((prev) => ({ ...prev, [key]: value }))
  }

  const normalizeAIResult = (payload) => {
    const parseMaybeJsonString = (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value

      try {
        return JSON.parse(trimmed)
      } catch {
        return value
      }
    }

    const normalizeHashtagString = (value) => {
      if (typeof value !== 'string') return []

      return value
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    }

    const extractHashtagsFromText = (value) => {
      if (typeof value !== 'string') return []
      const matches = value.match(/#[\p{L}\p{N}_]+/gu)
      return matches ? [...new Set(matches.map((tag) => tag.trim()))] : []
    }

    const isSystemText = (value) => {
      if (typeof value !== 'string') return false
      const text = value.trim().toLowerCase()
      if (!text) return true

      const exactMessages = [
        'sinh nội dung ai thành công',
        'sinh noi dung ai thanh cong',
        'thành công',
        'thanh cong',
        'success',
        'ok',
      ]

      if (exactMessages.includes(text)) return true
      if (text.includes('thành công') && text.length < 90) return true
      if (text.includes('success') && text.length < 90) return true
      return false
    }

    const collectHashtagsFromUnknown = (node, depth = 0) => {
      if (depth > 6 || node === null || node === undefined) return []

      const parsedNode = parseMaybeJsonString(node)

      if (typeof parsedNode === 'string') {
        const directHashTags = extractHashtagsFromText(parsedNode)
        if (directHashTags.length > 0) return directHashTags

        // Handle "tag1, tag2" or "tag1 tag2" style values when field is hashtag-like.
        return normalizeHashtagString(parsedNode)
      }

      if (Array.isArray(parsedNode)) {
        return parsedNode.flatMap((item) => collectHashtagsFromUnknown(item, depth + 1))
      }

      if (typeof parsedNode === 'object') {
        const hashtagKeys = ['hashtags', 'hash_tags', 'suggestedHashtags', 'tags', 'keywords']

        const fromHashtagKeys = hashtagKeys.flatMap((key) => collectHashtagsFromUnknown(parsedNode[key], depth + 1))
        if (fromHashtagKeys.length > 0) return fromHashtagKeys

        return Object.values(parsedNode).flatMap((value) => collectHashtagsFromUnknown(value, depth + 1))
      }

      return []
    }

    const collectTextsFromUnknown = (node, depth = 0) => {
      if (depth > 6 || node === null || node === undefined) return []

      const parsedNode = parseMaybeJsonString(node)

      if (typeof parsedNode === 'string') {
        const text = parsedNode.trim()
        return text ? [text] : []
      }

      if (Array.isArray(parsedNode)) {
        return parsedNode.flatMap((item) => collectTextsFromUnknown(item, depth + 1))
      }

      if (typeof parsedNode === 'object') {
        const preferredKeys = ['captions', 'caption', 'generatedCaptions', 'suggestions', 'results', 'content', 'text']

        const fromPreferred = preferredKeys.flatMap((key) => collectTextsFromUnknown(parsedNode[key], depth + 1))
        if (fromPreferred.length > 0) {
          return fromPreferred
        }

        return Object.values(parsedNode).flatMap((value) => collectTextsFromUnknown(value, depth + 1))
      }

      return []
    }

    const toCaptionItems = (candidate) => {
      const normalizedCandidate = parseMaybeJsonString(candidate)
      const source = Array.isArray(normalizedCandidate) ? normalizedCandidate : [normalizedCandidate]

      return source
        .map((item) => {
          if (!item) return null

          if (typeof item === 'string') {
            const text = item.trim()
            if (!text || isSystemText(text)) return null
            return { text, hashtags: extractHashtagsFromText(text) }
          }

          if (typeof item === 'object') {
            // Some backends return stringified JSON items inside arrays.
            const parsedItem = parseMaybeJsonString(item)
            if (typeof parsedItem === 'string') {
              const text = parsedItem.trim()
              if (!text || isSystemText(text)) return null
              return { text, hashtags: extractHashtagsFromText(text) }
            }

            const text = (parsedItem.caption || parsedItem.content || parsedItem.text || parsedItem.generated_text || '').trim()
            const tagsFromFields = [
              ...(Array.isArray(parsedItem.hashtags) ? parsedItem.hashtags : []),
              ...(Array.isArray(parsedItem.hash_tags) ? parsedItem.hash_tags : []),
              ...(Array.isArray(parsedItem.suggestedHashtags) ? parsedItem.suggestedHashtags : []),
              ...(typeof parsedItem.hashtags === 'string' ? normalizeHashtagString(parsedItem.hashtags) : []),
            ]

            const localTags = tagsFromFields
              .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
              .filter(Boolean)
              .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

            if (!text || isSystemText(text)) return null
            const textTags = extractHashtagsFromText(text)
            const mergedTags = [...new Set([...localTags, ...textTags])]
            return { text, hashtags: mergedTags }
          }

          return null
        })
        .filter(Boolean)
    }

    const captionCandidates = [
      payload?.captions,
      payload?.generatedCaptions,
      payload?.suggestions,
      payload?.results,
      payload?.data?.captions,
      payload?.data?.generatedCaptions,
      payload?.data?.suggestions,
      payload?.data?.results,
      payload?.data?.result?.captions,
      payload?.caption,
      payload?.data?.caption,
      payload?.result?.caption,
      payload?.result,
      payload?.data?.result,
    ]

    const captionItems = captionCandidates
      .filter((candidate) => candidate !== undefined && candidate !== null)
      .map((candidate) => toCaptionItems(candidate))
      .sort((a, b) => b.length - a.length)[0] || []

    const fallbackCaptionItems = collectTextsFromUnknown(payload)
      .map((text) => text.trim())
      .filter((text) => text.length > 0 && !isSystemText(text))
      .map((text) => ({ text, hashtags: extractHashtagsFromText(text) }))

    const finalCaptionItems = captionItems.length > 0 ? captionItems : fallbackCaptionItems

    const rawHashtags =
      payload?.hashtags ||
      payload?.hash_tags ||
      payload?.suggestedHashtags ||
      payload?.data?.hashtags ||
      payload?.data?.hash_tags ||
      payload?.data?.suggestedHashtags ||
      payload?.data?.result?.hashtags ||
      []

    const globalHashtags = (Array.isArray(rawHashtags) ? rawHashtags : [rawHashtags])
      .flatMap((tag) => (typeof tag === 'string' ? normalizeHashtagString(tag) : []))
      .filter(Boolean)

    const discoveredHashtags = collectHashtagsFromUnknown(payload)
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

    const captions = finalCaptionItems.map((item) => item.text)
    const captionHashtags = finalCaptionItems.map((item) => item.hashtags)
    const tagsFromCaptions = finalCaptionItems.flatMap((item) => item.hashtags)

    return {
      captions,
      captionHashtags,
      hashtags: [...new Set([...globalHashtags, ...tagsFromCaptions, ...discoveredHashtags])],
    }
  }

  const handleUseAICaption = (caption, index) => {
    setContent(caption)
    setSelectedCaptionIndex(index)
    setAiUsed(true)

    const tagsOfSelectedCaption = aiCaptionHashtags[index] || []
    if (tagsOfSelectedCaption.length > 0) {
      setHashtags(tagsOfSelectedCaption.join(' '))
    }
  }

  const handleAIGenerate = async () => {
    if (images.length === 0) {
      toast.warn('Vui long chon anh truoc khi dung AI!')
      return false
    }

    setIsAILoading(true)
    try {
      const formData = new FormData()
      images.forEach((file) => formData.append('images', file))
      formData.append('language', aiOptions.language)
      formData.append('tone', aiOptions.tone)
      formData.append('length', aiOptions.length)
      formData.append('includeHashtags', String(aiOptions.includeHashtags))
      formData.append('numCaptions', String(aiOptions.numCaptions))

      const result = await postService.generateContentUpload(formData)
      const { captions, hashtags, captionHashtags } = normalizeAIResult(result)

      console.debug('AI generate payload parsed', {
        rawResult: result,
        captionsCount: captions.length,
        hashtagsCount: hashtags.length,
      })

      if (captions.length === 0) {
        console.error('AI payload could not be parsed into captions', result)
        throw new Error('AI did not return captions')
      }

      setAiCaptions(captions)
      setAiHashtags(hashtags)
      setAiCaptionHashtags(captionHashtags)
      setSelectedCaptionIndex(null)
      setAiUsed(false)

      toast.success('Đã sinh nội dung AI, hãy chọn caption và hashtags phù hợp.')

      if (hashtags.length > 0) {
        setHashtags(hashtags.join(' '))
      }

      return true
    } catch (error) {
      const isTimeout = /timeout|timed out|exceeded/i.test(error?.message || '')
      const message = isTimeout
        ? 'AI xử lý hơi lâu, bạn thử lại sau vài giây hoặc giảm số ảnh.'
        : (error?.message || 'Khong the sinh caption. Vui long thu lai.')
      toast.error(message)
      return false
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
  }
}

export default useCreatePostPage
