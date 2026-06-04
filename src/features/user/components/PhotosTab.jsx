import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * PhotosTab – Nội dung tab "Ảnh" (full page version).
 * Props: posts (array)
 */
const PhotosTab = ({ posts }) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">Ảnh</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {uniquePhotoUrls.map((url, idx) => (
          <div
            key={idx}
            className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-slate-100 group cursor-pointer relative"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      {uniquePhotoUrls.length === 0 && (
        <p className="text-center text-gray-500 py-12">Chưa có ảnh nào</p>
      )}
    </div>
  )
}

export default PhotosTab
