import { useState } from 'react'
import { AiOutlinePicture, AiOutlineEye } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * PhotosTab – Nội dung tab "Ảnh" (full page version) với lưới ảnh hiện đại và xem chi tiết.
 */
const PhotosTab = ({ posts = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <AiOutlinePicture size={22} className="text-emerald-500" />
            Tất cả hình ảnh
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng cộng {uniquePhotoUrls.length} ảnh đã chia sẻ
          </p>
        </div>
      </div>

      {uniquePhotoUrls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {uniquePhotoUrls.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhoto(url)}
              className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 group cursor-pointer relative shadow-xs hover:shadow-md transition-all duration-200"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                <span className="p-2 rounded-full bg-black/40 backdrop-blur-xs">
                  <AiOutlineEye size={20} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 mb-3 shadow-xs">
            <AiOutlinePicture size={32} />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">
            Chưa có hình ảnh nào
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hình ảnh được đính kèm trong các bài viết sẽ tự động xuất hiện tại đây.
          </p>
        </div>
      )}

      {/* Lightbox / Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={selectedPhoto}
              alt="Enlarged preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold p-2 hover:opacity-80 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotosTab
