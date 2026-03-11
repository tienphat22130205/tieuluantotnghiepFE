import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { mockProfile, mockPosts } from '@/utils/mockData'
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

/**
 * Profile Page – Trang cá nhân (Facebook-style).
 * Sử dụng mock data tĩnh, không fetch API.
 */
const ProfilePage = () => {
  const { userId } = useParams()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [profile, setProfile] = useState(mockProfile)
  const [posts] = useState(
    mockPosts.filter((post) => post.user._id === mockProfile._id)
  )
  const [isFollowing, setIsFollowing] = useState(
    mockProfile.followers?.includes(currentUser?._id)
  )
  const [activeTab, setActiveTab] = useState('posts')

  const isMyProfile = currentUser?._id === userId

  // Follow / Unfollow (mock)
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)
    setProfile((prev) => ({
      ...prev,
      followers: isFollowing
        ? prev.followers.filter((id) => id !== currentUser._id)
        : [...prev.followers, currentUser._id],
    }))
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={posts} />
      case 'about':
        return <AboutTab profile={profile} />
      case 'photos':
        return <PhotosTab posts={posts} />
      case 'friends':
        return <FriendsTab friendCount={profile.followers?.length || 0} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo + Profile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <CoverPhoto coverPhoto={profile.coverPhoto} isMyProfile={isMyProfile} />

          <ProfileInfo
            profile={profile}
            posts={posts}
            isMyProfile={isMyProfile}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
          />

          <div className="px-4 sm:px-6">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <IntroCard profile={profile} isMyProfile={isMyProfile} />
            <PhotosCard posts={posts} />
            <FriendsCard friendCount={profile.followers?.length || 0} />
          </div>

          {/* Right - Tab Content */}
          <div className="md:col-span-2">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
