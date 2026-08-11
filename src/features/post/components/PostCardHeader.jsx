import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineDotsHorizontal, HiChevronRight } from 'react-icons/hi'
import { FiMapPin } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import { timeAgo } from '@/utils/formatDate'
import { normalizePostLocation } from '@/utils/postLocation'

/**
 * PostCardHeader – Header bài viết (Avatar, tên, thời gian, menu).
 * Props: user (object), createdAt (string), visibility (string), canManage, onEdit, onDelete
 */
const PostCardHeader = ({ user, createdAt, visibility, location, canManage = false, onEdit, onDelete, group, isOverlay = false }) => {
  const userId = user?.id || user?._id
  const profilePath = userId ? `/profile/${userId}` : '#'
  const displayName = user?.full_name || user?.fullName || user?.username || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'
  const visibilityLabel = {
    public: 'Công khai',
    friends: 'Bạn bè',
    private: 'Chỉ mình tôi',
    me: 'Chỉ mình tôi',
  }[visibility] || 'Công khai'
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const normalizedLocation = normalizePostLocation(location)

  useEffect(() => {
    if (!showMenu) return undefined

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  return (
    <div className={`flex items-center justify-between ${isOverlay ? 'px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white' : 'px-5 py-3.5'}`}>
      <div className="flex items-center gap-3">
        {group ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <Avatar
              src={group.avatar}
              name={group.name || 'Nhóm'}
              size="md"
              to={`/groups/${group._id || group.id || group}`}
              className="!rounded-xl border border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 z-10">
              <Avatar
                src={user?.avatar}
                name={displayName}
                size="xs"
                to={profilePath}
                className="w-5 h-5 !w-5 !h-5 border border-white shadow"
              />
            </div>
          </div>
        ) : (
          <div className={isOverlay ? 'ring-2 ring-white/40 rounded-full' : ''}>
            <Avatar
              src={user?.avatar}
              name={displayName}
              size="md"
              to={profilePath}
            />
          </div>
        )}
        <div>
          {group ? (
            <>
              <Link
                to={`/groups/${group._id || group.id || group}`}
                className={`font-bold hover:underline text-sm block leading-tight ${isOverlay ? 'text-white drop-shadow-sm' : 'text-gray-900 hover:text-primary-600'}`}
              >
                {group.name || 'Nhóm'}
              </Link>
              <div className={`text-xs mt-0.5 leading-tight ${isOverlay ? 'text-white/80' : 'text-slate-500'}`}>
                <Link
                  to={profilePath}
                  className={`font-semibold transition-colors ${isOverlay ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  {displayName}
                </Link>
                <span className={isOverlay ? 'text-white/70' : 'text-slate-400'}>
                  {' '}· {timeAgo(createdAt)}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                to={profilePath}
                className={`font-bold transition-colors text-sm ${isOverlay ? 'text-white drop-shadow-sm hover:text-white/90' : 'text-gray-900 hover:text-primary-600'}`}
              >
                {displayName}
              </Link>
              <div className={`text-xs ${isOverlay ? 'text-white/80 drop-shadow-xs' : 'text-slate-400'}`}>
                <span>{timeAgo(createdAt)}</span>
                {normalizedLocation?.label && (
                  <span className="ml-1 inline-flex items-center gap-1">
                    | <FiMapPin size={11} />
                    <span className="max-w-[200px] truncate align-middle">{normalizedLocation.label}</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menu 3 chấm */}
      {canManage && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className={`rounded-full p-1.5 transition ${isOverlay ? 'bg-white/30 backdrop-blur-md text-white hover:bg-white/50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
          >
            <HiOutlineDotsHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  onEdit?.()
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  onDelete?.()
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Xóa bài viết
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PostCardHeader
