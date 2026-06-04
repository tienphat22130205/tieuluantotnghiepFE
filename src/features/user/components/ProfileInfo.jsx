import {
  AiOutlineEdit,
  AiOutlineCamera,
  AiOutlineMessage,
  AiOutlineMore,
  AiOutlineUser,
} from 'react-icons/ai'
import { Avatar, Button } from '@/components/ui'
import { useId } from 'react'
import { PROFILE_ACTION_LABELS } from '@/constants/messages'

/**
 * ProfileInfo – Avatar, tên, username, stats, nút hành động.
 * Props: profile, posts, isMyProfile, relationshipStatus, friendActionLabel, isFriendActionLoading, onFriendAction, onEditProfile, onAvatarUpload, isUploadingAvatar
 */
const ProfileInfo = ({
  profile,
  posts,
  isMyProfile,
  relationshipStatus,
  friendActionLabel,
  isFriendActionLoading,
  onFriendAction,
  onEditProfile,
  onAvatarUpload,
  isUploadingAvatar,
}) => {
  const avatarInputId = useId()

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file || !onAvatarUpload) return
    onAvatarUpload(file)
    event.target.value = ''
  }

  return (
    <div className="relative px-4 sm:px-6 bg-white pb-3 sm:pb-4">
      {/* Upper section: Avatar on left, Name & Stats on right */}
      <div className="flex items-start gap-4 pb-3 sm:pb-4">
        {/* Avatar - nhô lên trên ảnh bìa */}
        <div className="relative group flex-shrink-0 -mt-10 sm:-mt-[68px] z-10 w-fit">
          <div className="relative w-fit">
            <Avatar
              src={profile.avatar}
              name={profile.full_name}
              size="2xl"
              className="w-24 h-24 sm:w-36 sm:h-36 ring-4 ring-white"
            />
            {isMyProfile && (
              <>
                <input
                  id={avatarInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <label
                  htmlFor={avatarInputId}
                  className="absolute bottom-0 right-0 bg-white p-1.5 sm:p-2 rounded-full hover:bg-slate-50 transition shadow-md border border-slate-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer z-20"
                  title={isUploadingAvatar ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
                >
                  <AiOutlineCamera size={16} className="text-gray-700 sm:w-[18px] sm:h-[18px]" />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Name & Stats - ngang hàng với avatar */}
        <div className="flex-1 min-w-0 pt-2 sm:pt-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {profile.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
            @{profile.username}
          </p>
          
          {/* Stats - inline list */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs sm:text-sm text-gray-500 font-medium">
            <span>
              <strong className="font-bold text-gray-900">{profile.friends?.length || 0}</strong> bạn bè
            </span>
            <span>·</span>
            <span>
              <strong className="font-bold text-gray-900">{profile.following?.length || 0}</strong> đang theo dõi
            </span>
            <span>·</span>
            <span>
              <strong className="font-bold text-gray-900">{posts.length}</strong> bài viết
            </span>
          </div>
        </div>
      </div>

      {/* Lower section: Action Buttons */}
      <div className="flex gap-2 sm:absolute sm:bottom-4 sm:right-6 sm:pb-0 z-10 w-full sm:w-auto">
        {isMyProfile ? (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-initial cursor-pointer rounded-xl font-semibold text-xs sm:text-sm py-2"
            onClick={onEditProfile}
            disabled={isUploadingAvatar}
          >
            <AiOutlineEdit size={16} />
            Chỉnh sửa trang cá nhân
          </Button>
        ) : (
          <>
            <Button
              variant={relationshipStatus?.areFriends ? 'outline' : 'primary'}
              size="sm"
              onClick={onFriendAction}
              isLoading={isFriendActionLoading}
              className="flex-1 sm:flex-initial cursor-pointer rounded-xl font-semibold text-xs sm:text-sm py-2"
            >
              <AiOutlineUser size={16} />
              {friendActionLabel || PROFILE_ACTION_LABELS.sendRequest}
            </Button>
            <Button variant="outline" size="sm" className="cursor-pointer rounded-xl font-semibold text-xs sm:text-sm py-2 flex-1 sm:flex-initial">
              <AiOutlineMessage size={16} />
              Nhắn tin
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" className="!px-3 cursor-pointer rounded-xl py-2">
          <AiOutlineMore size={18} />
        </Button>
      </div>
    </div>
  )
}

export default ProfileInfo
