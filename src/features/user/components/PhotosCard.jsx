/**
 * PhotosCard – Sidebar card hiển thị preview ảnh.
 * Props: posts (array of post objects)
 */
const PhotosCard = ({ posts }) => {
  const photoPosts = posts.filter((p) => p.image_url)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Ảnh</h3>
        <button className="text-sm text-primary-600 hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photoPosts.slice(0, 9).map((post, idx) => (
          <div
            key={idx}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              src={post.image_url}
              alt=""
              className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer"
            />
          </div>
        ))}
      </div>
      {photoPosts.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-6">
          Chưa có ảnh
        </p>
      )}
    </div>
  )
}

export default PhotosCard
