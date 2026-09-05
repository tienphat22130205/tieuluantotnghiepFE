import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CoverPhoto from '../components/CoverPhoto'
import ProfileInfo from '../components/ProfileInfo'
import ProfileTabs from '../components/ProfileTabs'
import IntroCard from '../components/IntroCard'
import PhotosCard from '../components/PhotosCard'
import FriendsCard from '../components/FriendsCard'
import PostsTab from '../components/PostsTab'
import AboutTab from '../components/AboutTab'
import PhotosTab from '../components/PhotosTab'
import FriendsTab from '../components/FriendsTab'
import EditProfileModal from '../components/EditProfileModal'
import ProfileSkeleton from '../components/ProfileSkeleton'
import useProfilePage from '../hooks/useProfilePage'
import { PROFILE_PAGE_TEXT } from '@/constants/messages'

/**
 * ProfilePage – Giao diện trang cá nhân cao cấp, chuẩn mực phong cách mạng xã hội hiện đại.
 */
const ProfilePage = () => {
  const { userId } = useParams()

  const {
    profile,
    displayedPosts,
    friendCount,
    relationshipStatus,
    friendActionLabel,
    activeTab,
    isLoading,
    error,
    isMyProfile,
    isEditingProfile,
    isSavingProfile,
    isUploadingAvatar,
    isFriendActionLoading,
    profileForm,
    setActiveTab,
    handleFriendAction,
    handleEditProfileOpen,
    handleEditProfileCancel,
    handleProfileFormChange,
    handleSaveProfile,
    handleAvatarUpload,
    handleAvatarRemove,
  } = useProfilePage(userId)

  // Calculate unique photos count for tabs badge
  const photosCount = useMemo(() => {
    const urls = (displayedPosts || [])
      .flatMap((post) => {
        const images = Array.isArray(post?.images) ? post.images : []
        const fallback = post?.image_url ? [post.image_url] : []
        return [...images, ...fallback]
      })
      .filter(Boolean)
    return new Set(urls).size
  }, [displayedPosts])

  const renderTabContent = () => {
    if (!profile) return null

    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={displayedPosts} isMyProfile={isMyProfile} />
      case 'about':
        return <AboutTab profile={profile} />
      case 'photos':
        return <PhotosTab posts={displayedPosts} />
      case 'friends':
        return <FriendsTab friendCount={friendCount} friends={profile.friends || []} />
      default:
        return null
    }
  }

  // Modern Shimmer Skeleton Loading
  if (isLoading) {
    return <ProfileSkeleton />
  }

  // Error State
  if (error || !profile) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-3 text-2xl">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {error || PROFILE_PAGE_TEXT.notFound}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Không thể tìm thấy thông tin của người dùng này hoặc trang cá nhân đang không khả dụng.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Profile Card (Cover Photo + Info + Tabs) */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors animate-fade-in">
        <div className="mx-auto max-w-5xl">
          <CoverPhoto coverPhoto={profile.coverPhoto} isMyProfile={isMyProfile} />

          <ProfileInfo
            profile={profile}
            posts={displayedPosts}
            isMyProfile={isMyProfile}
            relationshipStatus={relationshipStatus}
            friendActionLabel={friendActionLabel}
            isFriendActionLoading={isFriendActionLoading}
            onFriendAction={handleFriendAction}
            onEditProfile={handleEditProfileOpen}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
            isUploadingAvatar={isUploadingAvatar}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            postsCount={displayedPosts.length}
            photosCount={photosCount}
            friendCount={friendCount}
          />
        </div>
      </div>

      {/* Main Content Body */}
      <div className="mx-auto max-w-5xl px-1 sm:px-2">
        {isMyProfile && (
          <EditProfileModal
            isOpen={isEditingProfile}
            isSaving={isSavingProfile}
            profileForm={profileForm}
            onClose={handleEditProfileCancel}
            onChange={handleProfileFormChange}
            onSave={handleSaveProfile}
          />
        )}

        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Left Sidebar (Intro, Photos, Friends) */}
            <div className="md:col-span-1 space-y-4">
              <IntroCard profile={profile} isMyProfile={isMyProfile} onEditProfile={handleEditProfileOpen} />
              <PhotosCard posts={displayedPosts} onSeeAll={() => setActiveTab('photos')} />
              <FriendsCard friends={profile.friends || []} friendCount={friendCount} onSeeAll={() => setActiveTab('friends')} />
            </div>

            {/* Right Feed (Posts) */}
            <div className="md:col-span-2">{renderTabContent()}</div>
          </div>
        ) : (
          <div className="w-full">{renderTabContent()}</div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
