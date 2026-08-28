import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AiOutlineGlobal, AiOutlineLock } from 'react-icons/ai'
import { joinGroup, leaveGroup } from '../store/groupSlice'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { toast } from 'react-toastify'
import { usePreferences } from '@/context/PreferencesContext'

const GroupCard = ({ group }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { t } = usePreferences()
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
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col h-full group"
    >
      {/* Cover Image */}
      <div className="h-28 overflow-hidden relative bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={coverUrl}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/55 text-white backdrop-blur-xs text-[10px] font-bold rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
          {group.privacy === 'public' ? (
            <>
              <AiOutlineGlobal size={11} /> {t('groups.public')}
            </>
          ) : (
            <>
              <AiOutlineLock size={11} /> {t('groups.private')}
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
              className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold border-2 border-white dark:border-slate-800 shadow-sm">
              {group.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-1.5 pt-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1">
            {group.name}
          </h4>
          <span className="inline-block text-[11px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md">
            {group.membersCount || group.memberCount || 1} {t('groups.members')}
          </span>
          {group.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAction}
          disabled={loading}
          className={`w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
            isJoined
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400'
              : isPending
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/10'
          }`}
        >
          {loading
            ? '...'
            : isJoined
            ? (isAdmin ? 'Quản trị' : t('groups.joined'))
            : isPending
            ? 'Đang chờ duyệt'
            : t('groups.join')}
        </button>
      </div>
    </Link>
  )
}

export default GroupCard
