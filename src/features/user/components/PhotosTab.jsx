/**
 * PhotosTab – Nội dung tab "Ảnh" (full page version).
 * Props: posts (array)
 */
const PhotosTab = ({ posts }) => {
  const photoPosts = posts.filter((p) => p.image_url)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">Ảnh</h3>
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
        <p className="text-center text-gray-500 py-8">Chưa có ảnh nào</p>
      )}
    </div>
  )
}

export default PhotosTab
