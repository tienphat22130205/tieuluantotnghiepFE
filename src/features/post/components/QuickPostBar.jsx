import { useNavigate } from 'react-router-dom'
import { AiOutlinePicture, AiOutlineVideoCamera, AiOutlineSmile } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'

/**
 * QuickPostBar – Thanh tạo bài viết nhanh ở trang chủ.
 * Style giống Facebook: Avatar + input placeholder + các nút tắt tắt.
 */
const QuickPostBar = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Bạn'

  const goToCreate = (tab) => {
    if (tab) {
      navigate(`/create?tab=${tab}`)
    } else {
      navigate('/create')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      {/* Top row: Avatar + Input trigger */}
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatar}
          name={displayName}
          size="md"
          to={user?.id || user?._id ? `/profile/${user?.id || user?._id}` : '/'}
        />
        <button
          type="button"
          onClick={() => goToCreate()}
          className="flex-1 text-left rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm text-slate-500 font-normal transition-colors duration-150 cursor-text"
        >
          {displayName} ơi, bạn đang nghĩ gì vậy?
        </button>
      </div>

      {/* Divider */}
      <div className="mt-3 border-t border-slate-100" />

      {/* Action Buttons */}
      <div className="mt-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => goToCreate('video')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors duration-150"
        >
          <AiOutlineVideoCamera size={20} className="text-red-500" />
          <span className="hidden sm:inline">Video trực tiếp</span>
          <span className="sm:hidden">Video</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <button
          type="button"
          onClick={() => goToCreate('photo')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors duration-150"
        >
          <AiOutlinePicture size={20} className="text-emerald-500" />
          <span className="hidden sm:inline">Ảnh/Video</span>
          <span className="sm:hidden">Ảnh</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <button
          type="button"
          onClick={() => goToCreate('feeling')}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors duration-150"
        >
          <AiOutlineSmile size={20} className="text-yellow-500" />
          <span className="hidden sm:inline">Cảm xúc/Hoạt động</span>
          <span className="sm:hidden">Cảm xúc</span>
        </button>
      </div>
    </div>
  )
}

export default QuickPostBar
