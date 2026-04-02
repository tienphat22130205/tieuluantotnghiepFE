import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import userService from '../services/userService'
import friendService from '../services/friendService'
import postService from '@/features/post/services/postService'
import { getMe } from '@/features/auth/store/authSlice'
import { canViewPost, getUserId, normalizeRelationshipStatus } from '@/utils/friendship'
import {
  COMMON_TEXT,
  FRIEND_MESSAGES,
  PROFILE_ACTION_LABELS,
  PROFILE_MESSAGES,
} from '@/constants/messages'
import {
  appendUniqueUserById,
  initialRelationshipState,
  normalizeUserCollection,
  removeUserById,
} from '../utils/relationshipState'
import {
  createProfileFormState,
  extractPostsPayload,
  extractProfilePayload,
  getPostAuthorId,
  normalizePosts,
  normalizeProfile,
  withProfileIdentity,
} from '../utils/profileData'

const useProfilePage = (userId) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const feedPosts = useSelector((state) => state.posts.posts)

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [relationshipStatus, setRelationshipStatus] = useState(initialRelationshipState)
  const [activeTab, setActiveTab] = useState('posts')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    bio: '',
    address: '',
    city: '',
    country: '',
    lat: '',
    lng: '',
  })

  const currentUserId = getUserId(currentUser)
  const isMyProfile = Boolean(
    currentUserId
    && userId
    && String(currentUserId) === String(userId)
  )
  const hasValidRouteUserId = Boolean(userId && userId !== 'undefined' && userId !== 'null')

  const refreshRelationshipStatus = useCallback(async (targetUserId) => {
    if (!targetUserId || isMyProfile) {
      setRelationshipStatus(initialRelationshipState)
      return initialRelationshipState
    }

    try {
      const statusResponse = await friendService.getRelationshipStatus(targetUserId)
      const normalizedStatus = normalizeRelationshipStatus(statusResponse, currentUserId, targetUserId)
      setRelationshipStatus(normalizedStatus)
      return normalizedStatus
    } catch {
      const fallbackStatus = {
        currentUserId: currentUserId ? String(currentUserId) : null,
        targetUserId: String(targetUserId),
        areFriends: false,
        hasIncomingRequest: false,
        hasSentRequest: false,
        requestId: null,
      }
      setRelationshipStatus(fallbackStatus)
      return fallbackStatus
    }
  }, [currentUserId, isMyProfile])

  const refreshProfileSocialCollections = useCallback(async (targetUserId) => {
    if (!targetUserId) {
      return { friends: [], followers: [], following: [] }
    }

    const [friendsResult, followersResult, followingResult] = await Promise.allSettled([
      isMyProfile
        ? friendService.getMyFriends()
        : friendService.getFriendsByUserId(targetUserId),
      isMyProfile
        ? friendService.getMyFollowers()
        : friendService.getFollowersByUserId(targetUserId),
      isMyProfile
        ? friendService.getMyFollowing()
        : friendService.getFollowingByUserId(targetUserId),
    ])

    return {
      friends: friendsResult.status === 'fulfilled' ? normalizeUserCollection(friendsResult.value) : [],
      followers: followersResult.status === 'fulfilled' ? normalizeUserCollection(followersResult.value) : [],
      following: followingResult.status === 'fulfilled' ? normalizeUserCollection(followingResult.value) : [],
    }
  }, [isMyProfile])

  useEffect(() => {
    let isMounted = true

    const loadProfilePageData = async () => {
      if (!hasValidRouteUserId && !isMyProfile) {
        setError(PROFILE_MESSAGES.invalidProfileRoute)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        let normalizedProfile = null

        try {
          const profileResponse = isMyProfile
            ? await userService.getMyProfile()
            : await userService.getProfile(userId)

          const rawProfile = extractProfilePayload(profileResponse)
          normalizedProfile = normalizeProfile(rawProfile)
        } catch (profileError) {
          // Fallback profile keeps profile route usable when backend has no user-detail endpoint.
          if (isMyProfile || !hasValidRouteUserId) {
            throw profileError
          }

          normalizedProfile = normalizeProfile({
            _id: String(userId),
            id: String(userId),
            username: '',
            full_name: COMMON_TEXT.unknownUser,
            friends: [],
          })
        }

        if (!normalizedProfile?._id) {
          throw new Error(PROFILE_MESSAGES.invalidProfileData)
        }

        if (!isMounted) return

        const socialCollections = await refreshProfileSocialCollections(normalizedProfile._id)
        const normalizedFriends = socialCollections.friends.length > 0
          ? socialCollections.friends
          : (Array.isArray(normalizedProfile.friends) ? normalizedProfile.friends : [])
        const normalizedFollowers = socialCollections.followers.length > 0
          ? socialCollections.followers
          : (Array.isArray(normalizedProfile.followers) ? normalizedProfile.followers : [])
        const normalizedFollowing = socialCollections.following.length > 0
          ? socialCollections.following
          : (Array.isArray(normalizedProfile.following) ? normalizedProfile.following : [])

        const profileWithFriends = {
          ...normalizedProfile,
          friends: normalizedFriends,
          followers: normalizedFollowers,
          following: normalizedFollowing,
        }

        setProfile(profileWithFriends)

        try {
          const postsResponse = await postService.getByUser(profileWithFriends._id)
          const rawPosts = extractPostsPayload(postsResponse)

          if (!isMounted) return
          setPosts(normalizePosts(rawPosts, profileWithFriends))
        } catch {
          if (!isMounted) return
          setPosts([])
        }

        if (isMyProfile) {
          setRelationshipStatus(initialRelationshipState)
        } else {
          try {
            const statusResponse = await friendService.getRelationshipStatus(profileWithFriends._id)
            if (!isMounted) return

            setRelationshipStatus(
              normalizeRelationshipStatus(statusResponse, currentUserId, profileWithFriends._id)
            )
          } catch {
            if (!isMounted) return
            const hasFriendInProfile = profileWithFriends.friends
              .some((friend) => String(getUserId(friend)) === String(currentUserId))

            setRelationshipStatus((prev) => ({
              ...prev,
              currentUserId: currentUserId ? String(currentUserId) : null,
              targetUserId: profileWithFriends._id ? String(profileWithFriends._id) : null,
              areFriends: hasFriendInProfile,
              hasIncomingRequest: false,
              hasSentRequest: false,
              requestId: null,
            }))
          }
        }
      } catch (err) {
        if (!isMounted) return
        setError(err?.message || PROFILE_MESSAGES.loadProfileFailed)
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
  }, [hasValidRouteUserId, isMyProfile, userId, currentUserId, refreshProfileSocialCollections])

  useEffect(() => {
    if (!profile || !isMyProfile) return

    setProfileForm(createProfileFormState(profile))
  }, [profile, isMyProfile])

  const handleFriendAction = async () => {
    if (!currentUserId || !profile || isMyProfile) return

    const targetUserId = getUserId(profile)
    if (!targetUserId) {
      toast.error(FRIEND_MESSAGES.cannotResolveTargetUserId)
      return
    }

    if (String(targetUserId) === String(currentUserId)) {
      toast.error(FRIEND_MESSAGES.cannotSendRequestToSelf)
      return
    }

    setIsFriendActionLoading(true)
    try {
      const latestRelationshipStatus = await refreshRelationshipStatus(targetUserId)

      if (latestRelationshipStatus.areFriends) {
        await friendService.unfriend(targetUserId)

        setRelationshipStatus((prev) => ({
          ...prev,
          areFriends: false,
          hasIncomingRequest: false,
          hasSentRequest: false,
          requestId: null,
        }))

        const socialCollections = await refreshProfileSocialCollections(targetUserId)
        setProfile((prev) => (prev
          ? {
              ...prev,
              friends: socialCollections.friends.length > 0
                ? socialCollections.friends
                : removeUserById(prev.friends || [], currentUserId),
              followers: socialCollections.followers.length > 0
                ? socialCollections.followers
                : removeUserById(prev.followers || [], currentUserId),
              following: socialCollections.following.length > 0
                ? socialCollections.following
                : removeUserById(prev.following || [], currentUserId),
            }
          : prev
        ))

        await dispatch(getMe())
        await refreshRelationshipStatus(targetUserId)
        toast.success(FRIEND_MESSAGES.unfriendSuccess)
        return
      }

      if (latestRelationshipStatus.hasIncomingRequest && latestRelationshipStatus.requestId) {
        await friendService.respondToRequest(latestRelationshipStatus.requestId, 'accepted')

        const currentUserInfo = {
          _id: String(currentUserId),
          id: String(currentUserId),
          username: currentUser?.username || '',
          full_name: currentUser?.full_name || currentUser?.fullName || currentUser?.name || '',
          avatar: currentUser?.avatar || null,
        }

        setRelationshipStatus((prev) => ({
          ...prev,
          areFriends: true,
          hasIncomingRequest: false,
          hasSentRequest: false,
          requestId: null,
        }))
        setProfile((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            friends: appendUniqueUserById(prev.friends || [], currentUserInfo),
            followers: appendUniqueUserById(prev.followers || [], currentUserInfo),
            following: appendUniqueUserById(prev.following || [], currentUserInfo),
          }
        })

        const socialCollections = await refreshProfileSocialCollections(targetUserId)
        setProfile((prev) => (prev
          ? {
              ...prev,
              friends: socialCollections.friends.length > 0 ? socialCollections.friends : prev.friends,
              followers: socialCollections.followers.length > 0 ? socialCollections.followers : prev.followers,
              following: socialCollections.following.length > 0 ? socialCollections.following : prev.following,
            }
          : prev
        ))

        // Backend updates both followers/following on accept; refresh auth user snapshot.
        await dispatch(getMe())
        await refreshRelationshipStatus(targetUserId)
        toast.success(FRIEND_MESSAGES.acceptRequestOnProfileSuccess)
        return
      }

      if (latestRelationshipStatus.hasSentRequest && latestRelationshipStatus.requestId) {
        await friendService.cancelSentRequest(latestRelationshipStatus.requestId)
        setRelationshipStatus((prev) => ({
          ...prev,
          hasSentRequest: false,
          hasIncomingRequest: false,
          requestId: null,
        }))
        await refreshRelationshipStatus(targetUserId)
        toast.success(FRIEND_MESSAGES.cancelRequestOnProfileSuccess)
        return
      }

      if (!latestRelationshipStatus.areFriends) {
        const sendResponse = await friendService.sendRequest(targetUserId)
        const requestId =
          sendResponse?.request?.id
          || sendResponse?.request?.requestId
          || sendResponse?.request?._id
          || sendResponse?.data?.requestId
          || sendResponse?.requestId
          || sendResponse?.data?._id
          || sendResponse?._id
          || null

        setRelationshipStatus((prev) => ({
          ...prev,
          hasSentRequest: true,
          hasIncomingRequest: false,
          requestId: requestId ? String(requestId) : prev.requestId,
        }))
        await refreshRelationshipStatus(targetUserId)
        toast.success(FRIEND_MESSAGES.sendRequestSuccess)
      }
    } catch (err) {
      toast.error(err?.message || FRIEND_MESSAGES.processFriendActionFailed)
    } finally {
      setIsFriendActionLoading(false)
    }
  }

  const handleEditProfileOpen = () => {
    if (!isMyProfile || !profile) return
    setIsEditingProfile(true)
  }

  const handleEditProfileCancel = () => {
    setIsEditingProfile(false)
    if (!profile) return

    setProfileForm(createProfileFormState(profile))
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

  const friendActionLabel = useMemo(() => {
    if (relationshipStatus.areFriends) return PROFILE_ACTION_LABELS.unfriend
    if (relationshipStatus.hasIncomingRequest) return PROFILE_ACTION_LABELS.acceptRequest
    if (relationshipStatus.hasSentRequest) return PROFILE_ACTION_LABELS.cancelRequest
    return PROFILE_ACTION_LABELS.sendRequest
  }, [relationshipStatus])

  const normalizedProfilePosts = normalizePosts(posts, profile).map((post) => withProfileIdentity(post, profile))

  const canViewerSeeProfilePost = (post) => canViewPost(post, {
    currentUserId,
    isFriend: relationshipStatus.areFriends,
  })

  const ownFeedPosts = isMyProfile && currentUserId
    ? normalizePosts(feedPosts, profile)
      .filter((post) => {
        const authorId = getPostAuthorId(post)
        return authorId && String(authorId) === String(currentUserId)
      })
      .map((post) => withProfileIdentity(post, profile))
    : []

  const seen = new Set()
  const displayedPosts = [...ownFeedPosts, ...normalizedProfilePosts]
    .filter((post) => (isMyProfile ? true : canViewerSeeProfilePost(post)))
    .filter((post) => {
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
  }
}

export default useProfilePage
