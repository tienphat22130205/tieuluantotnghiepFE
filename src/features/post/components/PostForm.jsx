import { Button } from '@/components/ui'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const postFormSchema = z.object({
  content: z.string().max(2200, 'Nội dung tối đa 2200 ký tự'),
  hashtags: z
    .string()
    .max(500, 'Hashtags quá dài')
    .refine((value) => value.trim().length === 0 || /#[\p{L}\p{N}_]+/u.test(value), {
      message: 'Hashtag cần có định dạng #ten_tag',
    }),
  visibility: z.enum(['public', 'friends', 'private', 'me']),
})

/**
 * PostForm – Form nhập content, hashtags, visibility và nút đăng bài.
 */
const PostForm = ({
  content,
  hashtags,
  visibility,
  aiUsed,
  hasImages,
  submitLabel,
  isPosting,
  onContentChange,
  onHashtagsChange,
  onVisibilityChange,
  onSubmit,
}) => {
  const {
    register,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    mode: 'onChange',
    defaultValues: {
      content,
      hashtags,
      visibility,
    },
  })

  useEffect(() => {
    setValue('content', content, { shouldValidate: true })
  }, [content, setValue])

  useEffect(() => {
    setValue('hashtags', hashtags, { shouldValidate: true })
  }, [hashtags, setValue])

  useEffect(() => {
    setValue('visibility', visibility, { shouldValidate: true })
  }, [visibility, setValue])

  const contentField = register('content', {
    onChange: (e) => onContentChange(e.target.value),
  })

  const hashtagsField = register('hashtags', {
    onChange: (e) => onHashtagsChange(e.target.value),
  })

  const visibilityField = register('visibility', {
    onChange: (e) => onVisibilityChange(e.target.value),
  })

  const handleSubmitClick = async (e) => {
    const isValid = await trigger()
    if (!isValid) {
      e.preventDefault()
      return
    }
    onSubmit?.(e)
  }

  return (
    <>
      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nội dung bài viết
          {aiUsed && (
            <span className="ml-2 text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
              ✨ AI Generated
            </span>
          )}
        </label>
        <textarea
          {...contentField}
          placeholder={hasImages ? 'Viết gì đó về những bức ảnh này...' : 'Hôm nay bạn thấy thế nào?'}
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none transition"
        />
        {errors.content?.message && (
          <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Hashtags
        </label>
        <input
          {...hashtagsField}
          placeholder="#travel #sunset #beautiful"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
        />
        <p className="text-xs text-gray-400 mt-1">
          Cách nhau bằng dấu cách. Ví dụ: #travel #sunset
        </p>
        {errors.hashtags?.message && (
          <p className="text-xs text-red-500 mt-1">{errors.hashtags.message}</p>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Đối tượng xem
        </label>
        <select
          {...visibilityField}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition bg-white"
        >
          <option value="public">Công khai</option>
          <option value="friends">Bạn bè</option>
          <option value="private">Chỉ mình tôi</option>
        </select>
      </div>

      {/* Nút đăng bài */}
      <Button type="submit" fullWidth isLoading={isPosting} size="lg" onClick={handleSubmitClick}>
        {submitLabel || (hasImages ? 'Đăng ảnh' : 'Đăng trạng thái')}
      </Button>
    </>
  )
}

export default PostForm
