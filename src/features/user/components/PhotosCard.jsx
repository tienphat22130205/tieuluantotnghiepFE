import { AiOutlinePicture } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * PhotosCard – Sidebar card hiển thị xem trước ảnh.
 */
const PhotosCard = ({ posts = [], onSeeAll }) => {
  const photoUrls = (posts || [])
    .flatMap((post) => {
      const images = Array.isArray(post?.images) ? post.images : []
      const fallback = post?.image_url ? [post.image_url] : []
      return [...images, ...fallback]
    })
    .map((image) => resolveMediaUrl(image))
    .filter(Boolean)
  const uniquePhotoUrls = [...new Set(photoUrls)]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-5 transition-colors">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <AiOutlinePicture size={18} className="text-emerald-500" />
          Ảnh
          <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">
            ({uniquePhotoUrls.length})
          </span>
        </h3>
        {onSeeAll && uniquePhotoUrls.length > 0 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Xem tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {uniquePhotoUrls.slice(0, 9).map((url, idx) => (
          <div
            key={idx}
            onClick={onSeeAll}
            className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 group cursor-pointer relative"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {uniquePhotoUrls.length === 0 && (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
          Chưa có hình ảnh nào
        </div>
      )}
    </div>
  )
}

export default PhotosCard
