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
const PostCardHeader = ({ user, createdAt, visibility, location, canManage = false, onEdit, onDelete, group }) => {
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
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3">
        {group ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <Avatar
              src={group.avatar}
              name={group.name || 'Nhóm'}
              size="md"
              to={`/groups/${group._id || group.id || group}`}
              className="!rounded-xl border border-slate-200"
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
          <Avatar
            src={user?.avatar}
            name={displayName}
            size="md"
            to={profilePath}
          />
        )}
        <div>
          {group ? (
            <>
              <Link
                to={`/groups/${group._id || group.id || group}`}
                className="font-bold text-gray-900 hover:text-primary-600 hover:underline text-sm block leading-tight"
              >
                {group.name || 'Nhóm'}
              </Link>
              <div className="text-xs text-slate-500 mt-0.5 leading-tight">
                <Link
                  to={profilePath}
                  className="font-semibold text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {displayName}
                </Link>
                <span className="text-slate-400">
                  {' '}· {timeAgo(createdAt)} | {visibilityLabel}
                </span>
                {normalizedLocation?.label && (
                  <span className="ml-1 inline-flex items-center gap-1 text-slate-400">
                    | <FiMapPin size={11} />
                    <span className="max-w-[220px] truncate align-middle">{normalizedLocation.label}</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to={profilePath}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm"
              >
                {displayName}
              </Link>
              <div className="text-xs text-slate-400">
                <span>{timeAgo(createdAt)} | {visibilityLabel}</span>
                {normalizedLocation?.label && (
                  <span className="ml-1 inline-flex items-center gap-1 text-slate-500">
                    | <FiMapPin size={11} />
                    <span className="max-w-[220px] truncate align-middle">{normalizedLocation.label}</span>
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
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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
