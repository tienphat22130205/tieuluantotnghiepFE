import {
  AiOutlineEdit,
  AiOutlineCamera,
  AiOutlineMessage,
  AiOutlineMore,
  AiOutlineUser,
} from 'react-icons/ai'
import { Avatar, Button } from '@/components/ui'
import { useId } from 'react'

/**
 * ProfileInfo – Avatar, tên, username, stats, nút hành động.
 * Props: profile, posts, isMyProfile, isFollowing, onFollowToggle, onEditProfile, onAvatarUpload, isUploadingAvatar
 */
const ProfileInfo = ({
  profile,
  posts,
  isMyProfile,
  isFollowing,
  onFollowToggle,
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
    <div className="relative px-4 sm:px-6 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 pb-4">
        {/* Avatar - nhô lên trên ảnh bìa */}
        <div className="relative group flex-shrink-0 -mt-[68px]">
          <div className="relative">
            <Avatar
              src={profile.avatar}
              name={profile.full_name}
              size="2xl"
              className="ring-4 ring-white"
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
                  className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  title={isUploadingAvatar ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
                >
                  <AiOutlineCamera size={18} className="text-gray-700" />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Name & Stats - ngang hàng với avatar */}
        <div className="flex-1 sm:mb-2 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile.full_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            @{profile.username}
          </p>
          <div className="flex gap-4 sm:gap-6 mt-2 text-sm">
            <div>
              <span className="font-bold text-gray-900">{posts.length}</span>
              <span className="text-gray-500 ml-1">Bài viết</span>
            </div>
            <button className="hover:underline cursor-pointer">
              <span className="font-bold text-gray-900">
                {profile.followers?.length || 0}
              </span>
              <span className="text-gray-500 ml-1">Người theo dõi</span>
            </button>
            <button className="hover:underline cursor-pointer">
              <span className="font-bold text-gray-900">
                {profile.following?.length || 0}
              </span>
              <span className="text-gray-500 ml-1">Đang theo dõi</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:self-end sm:mb-2">
          {isMyProfile ? (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-initial cursor-pointer"
              onClick={onEditProfile}
              disabled={isUploadingAvatar}
            >
              <AiOutlineEdit size={16} />
              Chỉnh sửa trang cá nhân
            </Button>
          ) : (
            <>
              <Button
                variant={isFollowing ? 'outline' : 'primary'}
                size="sm"
                onClick={onFollowToggle}
                className="flex-1 sm:flex-initial cursor-pointer"
              >
                <AiOutlineUser size={16} />
                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <AiOutlineMessage size={16} />
                Nhắn tin
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="!px-3 cursor-pointer">
            <AiOutlineMore size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
