import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import userService from '../services/userService'
import postService from '@/features/post/services/postService'
import { getMe } from '@/features/auth/store/authSlice'

const useProfilePage = (userId) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const feedPosts = useSelector((state) => state.posts.posts)

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
      caption: post.caption || post.content || '',
      image_url: post.image_url || post.imageUrl || post.image || null,
      images: Array.isArray(post.images) ? post.images : [post.image_url || post.imageUrl || post.image].filter(Boolean),
      hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
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

  const getPostAuthorId = (post) => (
    post?.user?._id
    || post?.user?.id
    || post?.author?._id
    || post?.author?.id
    || post?.author_id
    || post?.user_id
    || (typeof post?.author === 'string' ? post.author : null)
  )

  const withProfileIdentity = (post, targetProfile) => {
    if (!post || !targetProfile?._id) return post

    const authorId = getPostAuthorId(post)
    if (!authorId || String(authorId) !== String(targetProfile._id)) {
      return post
    }

    return {
      ...post,
      user: {
        ...post.user,
        _id: targetProfile._id,
        id: targetProfile._id,
        username: targetProfile.username || post?.user?.username,
        full_name: targetProfile.full_name || post?.user?.full_name,
        avatar: targetProfile.avatar || post?.user?.avatar || null,
      },
    }
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
        setPosts((prev) => prev.map((post) => withProfileIdentity(post, updatedProfile)))
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

    const previousAvatar = profile?.avatar || null
    const optimisticAvatar = URL.createObjectURL(file)

    setProfile((prev) => (prev ? { ...prev, avatar: optimisticAvatar } : prev))
    setPosts((prev) => prev.map((post) => withProfileIdentity(post, {
      ...(profile || {}),
      _id: currentUserId,
      avatar: optimisticAvatar,
    })))

    setIsUploadingAvatar(true)
    try {
      const response = await userService.uploadMyAvatar(file)
      const updatedProfile = normalizeProfile(extractProfilePayload(response))

      if (updatedProfile) {
        setProfile(updatedProfile)
        setPosts((prev) => prev.map((post) => withProfileIdentity(post, updatedProfile)))
      } else if (profile?._id) {
        const refreshedProfileResponse = await userService.getMyProfile()
        const refreshedProfile = normalizeProfile(extractProfilePayload(refreshedProfileResponse))
        if (refreshedProfile) {
          setProfile(refreshedProfile)
          setPosts((prev) => prev.map((post) => withProfileIdentity(post, refreshedProfile)))
        }
      }

      await dispatch(getMe())
      toast.success('Cập nhật avatar thành công', { autoClose: 2500 })
    } catch (err) {
      setProfile((prev) => (prev ? { ...prev, avatar: previousAvatar } : prev))
      setPosts((prev) => prev.map((post) => withProfileIdentity(post, {
        ...(profile || {}),
        _id: currentUserId,
        avatar: previousAvatar,
      })))
      toast.error(err?.message || 'Upload avatar thất bại', { autoClose: 3000 })
    } finally {
      setIsUploadingAvatar(false)
      URL.revokeObjectURL(optimisticAvatar)
    }
  }

  const friendCount = useMemo(() => {
    if (!profile) return 0
    if (Array.isArray(profile.friends) && profile.friends.length > 0) return profile.friends.length
    if (Array.isArray(profile.followers)) return profile.followers.length
    return 0
  }, [profile])

  const normalizedProfilePosts = normalizePosts(posts, profile).map((post) => withProfileIdentity(post, profile))

  const ownFeedPosts = isMyProfile && currentUserId
    ? normalizePosts(feedPosts, profile)
      .filter((post) => {
        const authorId = getPostAuthorId(post)
        return authorId && String(authorId) === String(currentUserId)
      })
      .map((post) => withProfileIdentity(post, profile))
    : []

  const seen = new Set()
  const displayedPosts = [...ownFeedPosts, ...normalizedProfilePosts].filter((post) => {
    const postId = post?._id || post?.id
    if (!postId || seen.has(postId)) return false
    seen.add(postId)
    return true
  })

  return {
    profile,
    posts,
    displayedPosts,
    friendCount,
    isFollowing,
    activeTab,
    isLoading,
    error,
    isMyProfile,
    isEditingProfile,
    isSavingProfile,
    isUploadingAvatar,
    profileForm,
    setActiveTab,
    handleFollowToggle,
    handleEditProfileOpen,
    handleEditProfileCancel,
    handleProfileFormChange,
    handleSaveProfile,
    handleAvatarUpload,
  }
}

export default useProfilePage
