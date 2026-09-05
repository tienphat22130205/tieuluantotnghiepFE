import {
  AiOutlineEdit,
  AiOutlineCamera,
  AiOutlineMessage,
  AiOutlineMore,
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineEnvironment,
  AiOutlineCalendar,
  AiOutlineLink,
} from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { Avatar, Button } from '@/components/ui'
import { useState, useRef } from 'react'
import { PROFILE_ACTION_LABELS } from '@/constants/messages'
import { formatDate } from '@/utils/formatDate'
import ChangeAvatarModal from './ChangeAvatarModal'

/**
 * ProfileInfo – Avatar, tên, username, stats, chi tiết tóm tắt, nút hành động.
 */
const ProfileInfo = ({
  profile,
  posts = [],
  isMyProfile,
  relationshipStatus,
  friendActionLabel,
  isFriendActionLoading,
  onFriendAction,
  onEditProfile,
  onAvatarUpload,
  onAvatarRemove,
  isUploadingAvatar,
}) => {
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false)
  const fileInputRef = useRef(null)

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file || !onAvatarUpload) return
    onAvatarUpload(file)
    event.target.value = ''
  }

  const joinDate = profile.created_at ? formatDate(profile.created_at) : null

  return (
    <div className="relative px-4 sm:px-6 bg-white dark:bg-slate-900 pb-4 sm:pb-5 transition-colors">
      {/* Upper row: Avatar & Profile Bio/Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Avatar: Nằm đúng 1 nửa bên trên ảnh bìa, 1 nửa bên dưới ảnh bìa */}
          <div className="relative flex-shrink-0 -mt-16 sm:-mt-20 z-20">
            <div
              className={`relative rounded-full select-none ${isMyProfile ? 'cursor-pointer group/avatar' : ''}`}
              onClick={isMyProfile ? () => setIsChangeAvatarOpen(true) : undefined}
            >
              <Avatar
                src={profile.avatar}
                name={profile.full_name || profile.fullName || profile.username}
                size="2xl"
                className="w-32 h-32 sm:w-40 sm:h-40 ring-4 ring-white dark:ring-slate-900 shadow-xl object-cover rounded-full bg-white dark:bg-slate-900 transition-all duration-200 group-hover/avatar:brightness-90"
              />

              {isMyProfile && (
                <>
                  {/* Subtle hover overlay to indicate clickable avatar */}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center pointer-events-none text-white gap-1">
                    <AiOutlineCamera size={26} className="drop-shadow-md" />
                    <span className="text-[11px] font-semibold drop-shadow-md tracking-tight">Đổi ảnh</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                </>
              )}
            </div>
          </div>

          {/* User Names & Quick Details */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {profile.full_name || profile.fullName || profile.username}
              </h1>
              {profile.verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  ✓ Xác minh
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              @{profile.username}
            </p>

            {/* Bio snippet in header */}
            {profile.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-2 max-w-xl font-normal leading-relaxed line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <AiOutlineEnvironment size={14} className="text-blue-500" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                  <AiOutlineLink size={14} className="text-emerald-500" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              )}
              {joinDate && (
                <span className="inline-flex items-center gap-1">
                  <AiOutlineCalendar size={14} className="text-slate-400" />
                  Tham gia {joinDate}
                </span>
              )}
            </div>

            {/* Stats Badge Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 font-medium text-slate-700 dark:text-slate-300">
                <strong className="font-bold text-slate-900 dark:text-white">{posts.length}</strong> bài viết
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 font-medium text-slate-700 dark:text-slate-300">
                <strong className="font-bold text-slate-900 dark:text-white">{profile.friends?.length || 0}</strong> bạn bè
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 font-medium text-slate-700 dark:text-slate-300">
                <strong className="font-bold text-slate-900 dark:text-white">{profile.following?.length || 0}</strong> đang theo dõi
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Column / Row */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-4 shrink-0">
          {isMyProfile ? (
            <>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 sm:flex-initial cursor-pointer rounded-xl font-semibold text-xs sm:text-sm py-2 px-4 shadow-sm hover:shadow transition-all"
                onClick={onEditProfile}
                disabled={isUploadingAvatar}
              >
                <AiOutlineEdit size={16} />
                Chỉnh sửa trang cá nhân
              </Button>
              <Link
                to="/settings"
                title="Cài đặt & quyền riêng tư"
                className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
              >
                <AiOutlineSetting size={18} />
              </Link>
            </>
          ) : (
            <>
              <Button
                variant={relationshipStatus?.areFriends ? 'outline' : 'primary'}
                size="sm"
                onClick={onFriendAction}
                isLoading={isFriendActionLoading}
                className="flex-1 sm:flex-initial cursor-pointer rounded-xl font-semibold text-xs sm:text-sm py-2 px-4 shadow-sm"
              >
                <AiOutlineUser size={16} />
                {friendActionLabel || PROFILE_ACTION_LABELS.sendRequest}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial cursor-pointer rounded-xl font-semibold text-xs sm:text-sm py-2 px-4"
              >
                <AiOutlineMessage size={16} />
                Nhắn tin
              </Button>
              <Button variant="outline" size="sm" className="!px-3 cursor-pointer rounded-xl py-2">
                <AiOutlineMore size={18} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Instagram-style Avatar Options Modal */}
      {isMyProfile && (
        <ChangeAvatarModal
          isOpen={isChangeAvatarOpen}
          onClose={() => setIsChangeAvatarOpen(false)}
          onUploadClick={() => fileInputRef.current?.click()}
          onRemoveAvatar={async () => {
            setIsChangeAvatarOpen(false)
            if (onAvatarRemove) {
              await onAvatarRemove()
            }
          }}
          hasAvatar={Boolean(profile?.avatar)}
          isLoading={isUploadingAvatar}
        />
      )}
    </div>
  )
}

export default ProfileInfo
