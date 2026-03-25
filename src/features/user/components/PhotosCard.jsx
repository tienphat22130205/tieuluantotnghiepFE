import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * PhotosCard – Sidebar card hiển thị preview ảnh.
 * Props: posts (array of post objects)
 */
const PhotosCard = ({ posts }) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Ảnh</h3>
        <button className="text-sm text-primary-600 hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {uniquePhotoUrls.slice(0, 9).map((url, idx) => (
          <div
            key={idx}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
            />
          </div>
        ))}
      </div>
      {uniquePhotoUrls.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-6">
          Chưa có ảnh
        </p>
      )}
    </div>
  )
}

export default PhotosCard
