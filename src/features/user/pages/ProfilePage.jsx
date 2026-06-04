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
import useProfilePage from '../hooks/useProfilePage'
import { PROFILE_PAGE_TEXT } from '@/constants/messages'

/**
 * Profile Page - UI only. Business logic lives in useProfilePage hook.
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
  } = useProfilePage(userId)

  const renderTabContent = () => {
    if (!profile) return null

    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={displayedPosts} />
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

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">{PROFILE_PAGE_TEXT.loading}</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-red-600">{error || PROFILE_PAGE_TEXT.notFound}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-fade-in">
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
            isUploadingAvatar={isUploadingAvatar}
          />

          <div className="px-4 pb-2 sm:px-6">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-1 py-1 sm:px-2">
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
            <div className="md:col-span-1 space-y-4">
              <IntroCard profile={profile} isMyProfile={isMyProfile} onEditProfile={handleEditProfileOpen} />
              <PhotosCard posts={displayedPosts} onSeeAll={() => setActiveTab('photos')} />
              <FriendsCard friends={profile.friends || []} friendCount={friendCount} onSeeAll={() => setActiveTab('friends')} />
            </div>

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
