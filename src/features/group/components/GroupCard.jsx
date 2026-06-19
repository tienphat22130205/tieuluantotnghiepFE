import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AiOutlineGlobal, AiOutlineLock } from 'react-icons/ai'
import { joinGroup, leaveGroup } from '../store/groupSlice'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { toast } from 'react-toastify'

const GroupCard = ({ group }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  // Local state for join/leave toggle to reflect instantly in search cards
  const [localStatus, setLocalStatus] = useState(group.memberStatus || (group.isJoined ? 'approved' : null))
  const [loading, setLoading] = useState(false)

  const coverUrl = resolveMediaUrl(group.coverImage) || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60'
  const avatarUrl = resolveMediaUrl(group.avatar) || ''

  const isJoined = localStatus === 'approved' || localStatus === 'admin' || localStatus === 'moderator'
  const isPending = localStatus === 'pending'
  const isAdmin = localStatus === 'admin' || String(group.creator?._id || group.creator) === String(currentUserId)

  const handleAction = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    setLoading(true)
    try {
      if (isJoined || isPending) {
        // Leave
        await dispatch(leaveGroup(group._id)).unwrap()
        setLocalStatus(null)
        toast.info(`Đã rời nhóm "${group.name}"`)
      } else {
        // Join
        const result = await dispatch(joinGroup(group._id)).unwrap()
        const status = result?.member?.status || result?.membership?.status || 'approved'
        setLocalStatus(status)
        if (status === 'pending') {
          toast.success('Đã gửi yêu cầu tham gia nhóm riêng tư. Chờ admin duyệt!')
        } else {
          toast.success(`Đã tham gia nhóm "${group.name}"!`)
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      to={`/groups/${group._id}`}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col h-full group"
    >
      {/* Cover Image */}
      <div className="h-28 overflow-hidden relative bg-slate-100 shrink-0">
        <img
          src={coverUrl}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/55 text-white backdrop-blur-xs text-[10px] font-bold rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
          {group.privacy === 'public' ? (
            <>
              <AiOutlineGlobal size={11} /> Công khai
            </>
          ) : (
            <>
              <AiOutlineLock size={11} /> Riêng tư
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 relative">
        {/* Avatar positioned floating over cover */}
        <div className="absolute -top-7 left-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={group.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
              {group.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-1.5 pt-4">
          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
            {group.name}
          </h4>
          <p className="text-[10px] font-semibold text-primary-600 bg-primary-50 rounded-full px-2 py-0.5 w-max">
            {group.memberCount || 1} thành viên
          </p>
          <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-2">
            {group.description || 'Nhóm này chưa có phần mô tả ngắn.'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end shrink-0">
          {!isAdmin && (
            <button
              type="button"
              onClick={handleAction}
              disabled={loading}
              className={`text-xs font-extrabold px-4 py-2 rounded-full transition-all duration-200 border ${
                isJoined
                  ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : isPending
                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-700'
              }`}
            >
              {loading ? 'Đang xử lý...' : isJoined ? 'Rời nhóm' : isPending ? 'Chờ duyệt' : 'Tham gia'}
            </button>
          )}

          {isAdmin && (
            <span className="text-xs font-extrabold px-4 py-2 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
              Quản trị viên
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default GroupCard
