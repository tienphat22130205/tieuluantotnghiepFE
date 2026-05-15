import { Button } from '@/components/ui'
import { FiMapPin } from 'react-icons/fi'
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
  location,
  isLocating,
  locationError,
  onContentChange,
  onHashtagsChange,
  onVisibilityChange,
  onDetectLocation,
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
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <FiMapPin size={14} className={location ? 'text-emerald-600' : 'text-slate-400'} />
            Vị trí đăng bài
          </label>
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isLocating || isPosting}
            title={isLocating ? 'Đang lấy GPS...' : 'Lấy vị trí từ GPS'}
            aria-label={isLocating ? 'Đang lấy GPS...' : 'Lấy vị trí từ GPS'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiMapPin size={16} className={isLocating ? 'animate-pulse' : ''} />
          </button>
        </div>

        {location ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <p className="font-medium">
              {location.placeName || [location.city, location.region, location.country].filter(Boolean).join(', ') || 'Đã lấy vị trí GPS'}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Tọa độ: {Number(location.lat).toFixed(6)}, {Number(location.lng).toFixed(6)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Chưa có vị trí. Bấm icon location nếu bạn muốn đính kèm GPS.
          </p>
        )}

        {locationError && <p className="mt-1 text-xs text-red-500">{locationError}</p>}
      </div>

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
