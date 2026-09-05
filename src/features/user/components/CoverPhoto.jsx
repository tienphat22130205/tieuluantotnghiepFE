import { AiOutlineCamera } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * CoverPhoto – Ảnh bìa trang cá nhân (nguyên bản).
 * Props: coverPhoto (url), isMyProfile (boolean)
 */
const CoverPhoto = ({ coverPhoto, isMyProfile }) => {
  const coverPhotoUrl = resolveMediaUrl(coverPhoto)

  return (
    <div className="relative h-40 sm:h-52 md:h-64 bg-primary-600 dark:bg-slate-800 overflow-hidden group">
      {coverPhotoUrl && (
        <img
          src={coverPhotoUrl}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      )}
      {isMyProfile && (
        <button
          type="button"
          className="absolute bottom-3 right-3 bg-white dark:bg-slate-900 px-2.5 py-2 sm:px-4 sm:py-2 rounded-xl shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer border border-slate-100 dark:border-slate-700 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <AiOutlineCamera size={18} className="text-slate-700 dark:text-slate-300" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">Chỉnh sửa ảnh bìa</span>
        </button>
      )}
    </div>
  )
}

export default CoverPhoto
