import { Button } from '@/components/ui'

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
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={hasImages ? 'Viết gì đó về những bức ảnh này...' : 'Hôm nay bạn thấy thế nào?'}
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none transition"
        />
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Hashtags
        </label>
        <input
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="#travel #sunset #beautiful"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
        />
        <p className="text-xs text-gray-400 mt-1">
          Cách nhau bằng dấu cách. Ví dụ: #travel #sunset
        </p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Đối tượng xem
        </label>
        <select
          value={visibility}
          onChange={(e) => onVisibilityChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition bg-white"
        >
          <option value="public">Công khai</option>
          <option value="friends">Bạn bè</option>
          <option value="me">Chỉ mình tôi</option>
        </select>
      </div>

      {/* Nút đăng bài */}
      <Button type="submit" fullWidth isLoading={isPosting} size="lg" onClick={onSubmit}>
        {submitLabel || (hasImages ? 'Đăng ảnh' : 'Đăng trạng thái')}
      </Button>
    </>
  )
}

export default PostForm
