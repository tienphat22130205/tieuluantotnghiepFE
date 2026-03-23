import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import userService from '../services/userService'
import postService from '@/features/post/services/postService'
import { getMe } from '@/features/auth/store/authSlice'
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
 * Dùng dữ liệu thật từ API.
 */
const ProfilePage = () => {
  const dispatch = useDispatch()
  const { userId } = useParams()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [profileForm, setProfileForm] = useState({
    bio: '',
    address: '',
    city: '',
    country: '',
    lat: '',
    lng: '',
  })

  const currentUserId = currentUser?.id || currentUser?._id
  const isMyProfile = currentUserId === userId
  const hasValidRouteUserId = Boolean(userId && userId !== 'undefined' && userId !== 'null')

  const normalizeProfile = (rawProfile) => {
    if (!rawProfile) return null

    const rawLocation = rawProfile.location
    const locationInfo = typeof rawLocation === 'object' && rawLocation !== null
      ? {
          address: rawLocation.address || '',
          city: rawLocation.city || '',
          country: rawLocation.country || '',
          lat: rawLocation.lat,
          lng: rawLocation.lng,
        }
      : {
          address: '',
          city: '',
          country: '',
          lat: null,
          lng: null,
        }

    const locationText =
      typeof rawLocation === 'string'
        ? rawLocation
        : [locationInfo.address, locationInfo.city, locationInfo.country]
            .filter(Boolean)
            .join(', ')

    return {
      ...rawProfile,
      _id: rawProfile._id || rawProfile.id,
      full_name: rawProfile.full_name || rawProfile.fullName || `${rawProfile.firstName || ''} ${rawProfile.lastName || ''}`.trim(),
      created_at: rawProfile.created_at || rawProfile.createdAt || rawProfile.updatedAt || null,
      location: locationText,
      locationData: locationInfo,
      website: rawProfile.website || '',
      coverPhoto: rawProfile.coverPhoto || '',
      followers: rawProfile.followers || [],
      following: rawProfile.following || [],
      friends: rawProfile.friends || [],
    }
  }

  const normalizePosts = (rawPosts, ownerProfile) => {
    if (!Array.isArray(rawPosts)) return []

    return rawPosts.map((post) => ({
      ...post,
      _id: post._id || post.id,
      image_url: post.image_url || post.imageUrl || post.image || null,
      created_at: post.created_at || post.createdAt,
      comments_count: post.comments_count || post.commentsCount || 0,
      likes: Array.isArray(post.likes) ? post.likes : [],
      user: post.user || {
        _id: ownerProfile?._id,
        username: ownerProfile?.username,
        full_name: ownerProfile?.full_name,
        avatar: ownerProfile?.avatar,
      },
    }))
  }

  const extractProfilePayload = (response) => {
    if (!response) return null

    if (response?.data?.profile) return response.data.profile
    if (response?.data?.user) return response.data.user
    if (response?.profile) return response.profile
    if (response?.user) return response.user

    return response?.data || response
  }

  const extractPostsPayload = (response) => {
    if (!response) return []
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.posts)) return response.posts
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.data?.posts)) return response.data.posts
    return []
  }

  useEffect(() => {
    let isMounted = true

    const loadProfilePageData = async () => {
      if (!hasValidRouteUserId && !isMyProfile) {
        setError('Đường dẫn trang cá nhân không hợp lệ')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const profileResponse = isMyProfile
          ? await userService.getMyProfile()
          : await userService.getProfile(userId)

        const rawProfile = extractProfilePayload(profileResponse)
        const normalizedProfile = normalizeProfile(rawProfile)

        if (!normalizedProfile?._id) {
          throw new Error('Dữ liệu profile không hợp lệ')
        }

        if (!isMounted) return

        setProfile(normalizedProfile)

        try {
          const postsResponse = await postService.getByUser(normalizedProfile._id)
          const rawPosts = extractPostsPayload(postsResponse)

          if (!isMounted) return
          setPosts(normalizePosts(rawPosts, normalizedProfile))
        } catch {
          if (!isMounted) return
          // Không chặn hiển thị profile nếu endpoint posts chưa sẵn sàng
          setPosts([])
        }

        if (Array.isArray(normalizedProfile.followers)) {
          setIsFollowing(normalizedProfile.followers.includes(currentUserId))
        } else {
          setIsFollowing(false)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err?.message || 'Không tải được trang cá nhân')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    if (userId || isMyProfile) {
      loadProfilePageData()
    }

    return () => {
      isMounted = false
    }
  }, [hasValidRouteUserId, isMyProfile, userId, currentUserId])

  useEffect(() => {
    if (!profile || !isMyProfile) return

    setProfileForm({
      bio: profile.bio || '',
      address: profile.locationData?.address || '',
      city: profile.locationData?.city || '',
      country: profile.locationData?.country || '',
      lat: profile.locationData?.lat ?? '',
      lng: profile.locationData?.lng ?? '',
    })
  }, [profile, isMyProfile])

  // Follow / Unfollow
  const handleFollowToggle = async () => {
    if (!currentUserId || !profile) return

    const previousIsFollowing = isFollowing
    setIsFollowing(!previousIsFollowing)
    setProfile((prev) => ({
      ...prev,
      followers: previousIsFollowing
        ? prev.followers.filter((id) => id !== currentUserId)
        : [...prev.followers, currentUserId],
    }))

    try {
      await userService.toggleFollow(profile._id)
    } catch {
      // Rollback nếu API thất bại
      setIsFollowing(previousIsFollowing)
      setProfile((prev) => ({
        ...prev,
        followers: previousIsFollowing
          ? [...prev.followers, currentUserId]
          : prev.followers.filter((id) => id !== currentUserId),
      }))
    }
  }

  const handleEditProfileOpen = () => {
    if (!isMyProfile || !profile) return
    setIsEditingProfile(true)
  }

  const handleEditProfileCancel = () => {
    setIsEditingProfile(false)
    if (!profile) return

    setProfileForm({
      bio: profile.bio || '',
      address: profile.locationData?.address || '',
      city: profile.locationData?.city || '',
      country: profile.locationData?.country || '',
      lat: profile.locationData?.lat ?? '',
      lng: profile.locationData?.lng ?? '',
    })
  }

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    if (!isMyProfile) return

    setIsSavingProfile(true)
    try {
      const payload = {
        bio: profileForm.bio,
        location: {
          address: profileForm.address,
          city: profileForm.city,
          country: profileForm.country,
          lat: profileForm.lat === '' ? null : Number(profileForm.lat),
          lng: profileForm.lng === '' ? null : Number(profileForm.lng),
        },
      }

      const response = await userService.updateMyProfile(payload)
      const updatedProfile = normalizeProfile(extractProfilePayload(response))

      if (updatedProfile) {
        setProfile(updatedProfile)
      }

      await dispatch(getMe())
      setIsEditingProfile(false)
      toast.success('Cập nhật profile thành công', { autoClose: 2500 })
    } catch (err) {
      toast.error(err?.message || 'Cập nhật profile thất bại', { autoClose: 3000 })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    if (!isMyProfile || !file) return

    setIsUploadingAvatar(true)
    try {
      const response = await userService.uploadMyAvatar(file)
      const updatedProfile = normalizeProfile(extractProfilePayload(response))

      if (updatedProfile) {
        setProfile(updatedProfile)
      }

      await dispatch(getMe())
      toast.success('Cập nhật avatar thành công', { autoClose: 2500 })
    } catch (err) {
      toast.error(err?.message || 'Upload avatar thất bại', { autoClose: 3000 })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Render tab content
  const renderTabContent = () => {
    if (!profile) return null

    switch (activeTab) {
      case 'posts':
        return <PostsTab posts={posts} />
      case 'about':
        return <AboutTab profile={profile} />
      case 'photos':
        return <PhotosTab posts={posts} />
      case 'friends':
        return <FriendsTab friendCount={friendCount} friends={profile.friends || []} />
      default:
        return null
    }
  }

  const friendCount = useMemo(() => {
    if (!profile) return 0
    if (Array.isArray(profile.friends) && profile.friends.length > 0) return profile.friends.length
    if (Array.isArray(profile.followers)) return profile.followers.length
    return 0
  }, [profile])

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">Đang tải trang cá nhân...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy dữ liệu trang cá nhân.'}</p>
      </div>
    )
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
            onEditProfile={handleEditProfileOpen}
            onAvatarUpload={handleAvatarUpload}
            isUploadingAvatar={isUploadingAvatar}
          />

          <div className="px-4 sm:px-6">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {isMyProfile && isEditingProfile && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Chỉnh sửa trang cá nhân</h3>

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
                  placeholder="Viết vài dòng giới thiệu về bạn..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
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
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">Thành phố</label>
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
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">Quốc gia</label>
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
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <IntroCard profile={profile} isMyProfile={isMyProfile} onEditProfile={handleEditProfileOpen} />
            <PhotosCard posts={posts} />
            <FriendsCard friends={profile.friends || []} friendCount={friendCount} />
          </div>

          {/* Right - Tab Content */}
          <div className="md:col-span-2">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
