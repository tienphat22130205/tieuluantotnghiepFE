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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
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

          <div className="px-4 sm:px-6">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {isMyProfile && isEditingProfile && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Chinh sua trang ca nhan</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={profileForm.bio}
                  onChange={handleProfileFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                  placeholder="Viet vai dong gioi thieu ve ban..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Dia chi</label>
                  <input
                    id="address"
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                    placeholder="123 Nguyen Hue"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">Thanh pho</label>
                  <input
                    id="city"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                    placeholder="Ho Chi Minh"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">Quoc gia</label>
                  <input
                    id="country"
                    name="country"
                    value={profileForm.country}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                    placeholder="Viet Nam"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1.5">Lat</label>
                    <input
                      id="lat"
                      name="lat"
                      type="number"
                      step="any"
                      value={profileForm.lat}
                      onChange={handleProfileFormChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                      placeholder="10.7769"
                    />
                  </div>
                  <div>
                    <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1.5">Lng</label>
                    <input
                      id="lng"
                      name="lng"
                      type="number"
                      step="any"
                      value={profileForm.lng}
                      onChange={handleProfileFormChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:outline-none"
                      placeholder="106.7009"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleEditProfileCancel}
                  disabled={isSavingProfile}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Huy
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {isSavingProfile ? 'Dang luu...' : 'Luu thay doi'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <IntroCard profile={profile} isMyProfile={isMyProfile} onEditProfile={handleEditProfileOpen} />
            <PhotosCard posts={displayedPosts} />
            <FriendsCard friends={profile.friends || []} friendCount={friendCount} />
          </div>

          <div className="md:col-span-2">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
