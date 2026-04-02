const buildLocationInfo = (rawLocation) => {
  if (typeof rawLocation === 'object' && rawLocation !== null) {
    return {
      address: rawLocation.address || '',
      city: rawLocation.city || '',
      country: rawLocation.country || '',
      lat: rawLocation.lat,
      lng: rawLocation.lng,
    }
  }

  return {
    address: '',
    city: '',
    country: '',
    lat: null,
    lng: null,
  }
}

const buildLocationText = (rawLocation, locationInfo) => {
  if (typeof rawLocation === 'string') return rawLocation

  return [locationInfo.address, locationInfo.city, locationInfo.country]
    .filter(Boolean)
    .join(', ')
}

export const createProfileFormState = (profile) => ({
  bio: profile?.bio || '',
  address: profile?.locationData?.address || '',
  city: profile?.locationData?.city || '',
  country: profile?.locationData?.country || '',
  lat: profile?.locationData?.lat ?? '',
  lng: profile?.locationData?.lng ?? '',
})

export const normalizeProfile = (rawProfile) => {
  if (!rawProfile) return null

  const rawLocation = rawProfile.location
  const locationInfo = buildLocationInfo(rawLocation)
  const locationText = buildLocationText(rawLocation, locationInfo)

  return {
    ...rawProfile,
    _id: rawProfile._id || rawProfile.id,
    full_name: rawProfile.full_name
      || rawProfile.fullName
      || `${rawProfile.firstName || ''} ${rawProfile.lastName || ''}`.trim(),
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

export const normalizePosts = (rawPosts, ownerProfile) => {
  if (!Array.isArray(rawPosts)) return []

  return rawPosts.map((post) => ({
    ...post,
    _id: post._id || post.id,
    caption: post.caption || post.content || '',
    image_url: post.image_url || post.imageUrl || post.image || null,
    images: Array.isArray(post.images)
      ? post.images
      : [post.image_url || post.imageUrl || post.image].filter(Boolean),
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

export const getPostAuthorId = (post) => (
  post?.user?._id
  || post?.user?.id
  || post?.author?._id
  || post?.author?.id
  || post?.author_id
  || post?.user_id
  || (typeof post?.author === 'string' ? post.author : null)
)

export const withProfileIdentity = (post, targetProfile) => {
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

export const extractProfilePayload = (response) => {
  if (!response) return null

  if (response?.data?.profile) return response.data.profile
  if (response?.data?.user) return response.data.user
  if (response?.profile) return response.profile
  if (response?.user) return response.user

  return response?.data || response
}

export const extractPostsPayload = (response) => {
  if (!response) return []
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.posts)) return response.posts
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.posts)) return response.data.posts
  return []
}