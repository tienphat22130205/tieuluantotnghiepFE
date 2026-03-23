import { AiOutlineCamera } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * CoverPhoto – Ảnh bìa trang cá nhân.
 * Props: coverPhoto (url), isMyProfile (boolean)
 */
const CoverPhoto = ({ coverPhoto, isMyProfile }) => {
  const coverPhotoUrl = resolveMediaUrl(coverPhoto)

  return (
    <div className="relative h-40 sm:h-52 md:h-64 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 overflow-hidden group">
      {coverPhotoUrl && (
        <img
          src={coverPhotoUrl}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      )}
      {isMyProfile && (
        <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 flex items-center gap-2 cursor-pointer">
          <AiOutlineCamera size={18} />
          <span className="text-sm font-medium">Chỉnh sửa ảnh bìa</span>
        </button>
      )}
    </div>
  )
}

export default CoverPhoto
