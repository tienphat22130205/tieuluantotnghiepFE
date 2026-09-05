import api from '@/services/api'
import resolveMediaUrl from '@/utils/mediaUrl'

const extractItems = (payload, key = 'posts') => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.[key])) return payload[key]
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.[key])) return payload.data[key]
  if (Array.isArray(payload?.result?.[key])) return payload.result[key]
  return []
}

const normalizePagination = (payload, fallbackPage = 1, fallbackLimit = 20) => {
  const meta = payload?.data?.meta || payload?.pagination || payload?.meta || payload?.data?.pagination || payload?.data?.meta || {}
  const page = Number(meta?.page || payload?.page || fallbackPage || 1)
  const limit = Number(meta?.limit || payload?.limit || fallbackLimit || 20)
  const totalItems = Number(
    meta?.total
    || meta?.totalItems
    || meta?.total_items
    || payload?.total
    || payload?.totalItems
    || payload?.total_items
    || 0
  )
  const totalPages = Number(
    meta?.totalPages
    || meta?.total_pages
    || payload?.totalPages
    || payload?.total_pages
    || (Number.isFinite(totalItems) && limit > 0 ? Math.ceil(totalItems / limit) : 1)
  )

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : fallbackLimit,
    totalItems: Number.isFinite(totalItems) && totalItems >= 0 ? totalItems : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  }
}

const resolveAuthorName = (author, fallbackItem = {}) => {
  if (!author) return fallbackItem?.authorName || 'Người dùng'
  if (typeof author === 'string') {
    return fallbackItem?.authorName || 'Người dùng'
  }
  const firstLast = `${author?.firstName || author?.first_name || ''} ${author?.lastName || author?.last_name || ''}`.trim()
  return (
    firstLast
    || author?.fullName
    || author?.full_name
    || (author?.username ? `@${author.username}` : '')
    || fallbackItem?.authorName
    || 'Người dùng'
  )
}

const normalizePost = (item) => {
  const id = item?._id || item?.id || item?.postId || item?.post_id
  if (!id) return null

  const author = item?.user || item?.author || {}
  const document = item?.document || item?.file || {}
  const likes = Number(item?.likeCount || item?.likesCount || item?.likes || 0)
  const comments = Number(item?.commentCount || item?.commentsCount || item?.comments?.length || 0)
  const authorDisplayName = resolveAuthorName(author, item)

  return {
    id: String(id),
    author: authorDisplayName,
    username: author?.username || item?.username || '--',
    content: item?.caption || item?.content || item?.text || '',
    documentTitle: document?.title || item?.documentTitle || item?.fileName || '--',
    images: (Array.isArray(item?.images) ? item.images : (item?.image ? [item.image] : [])).map((u) => resolveMediaUrl(u)),
    createdAt: item?.created_at || item?.createdAt || null,
    likes,
    comments,
    interactions: likes + comments,
    isDeleted: Boolean(item?.isDeleted || item?.deletedAt || item?.deleted_at),
    raw: item,
  }
}

const normalizeComment = (postId, postContent, item) => {
  const id = item?._id || item?.id || item?.commentId || item?.comment_id
  if (!id) return null

  const author = item?.user || item?.author || {}
  const authorDisplayName = resolveAuthorName(author, item)

  return {
    id: String(id),
    postId: String(postId),
    postContent: postContent || '--',
    author: authorDisplayName,
    username: author?.username || item?.username || '',
    avatar: author?.avatar || item?.avatar || null,
    content: item?.content || item?.text || '--',
    createdAt: item?.created_at || item?.createdAt || null,
  }
}

const normalizeStatsPost = (item) => {
  const normalized = normalizePost(item)
  if (!normalized) return null

  return {
    ...normalized,
    interactions: Number(item?.interactions || item?.interactionCount || normalized.interactions),
    engagementScore: Number(item?.engagementScore || item?.score || 0),
  }
}

const listRecentPosts = async () => {
  const response = await api.get('/posts/moderation/recent')
  return extractItems(response)
    .map((item) => normalizePost(item))
    .filter(Boolean)
}

const listManagedPosts = async ({ page = 1, limit = 20, sortBy = 'createdAt', search = '', filterDeleted = false } = {}) => {
  const response = await api.get('/posts/management/all', {
    params: {
      page,
      limit,
      sortBy,
      search: search?.trim(),
      filterDeleted: filterDeleted ? 'true' : 'false',
    },
  })

  return {
    posts: extractItems(response)
      .map((item) => normalizePost(item))
      .filter(Boolean),
    pagination: normalizePagination(response, page, limit),
    raw: response,
  }
}

const listManagedComments = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const response = await api.get('/posts/management/all', {
    params: {
      page,
      limit,
      sortBy: 'createdAt',
      search: search?.trim(),
      filterDeleted: 'false',
    },
  })

  const posts = extractItems(response)
  const comments = posts.flatMap((post) => {
    const postId = post?._id || post?.id || post?.postId || post?.post_id
    if (!postId) return []

    const postContent = post?.caption || post?.content || post?.text || '--'
    const nestedComments = Array.isArray(post?.comments) ? post.comments : []

    return nestedComments
      .map((comment) => normalizeComment(postId, postContent, comment))
      .filter(Boolean)
  })

  return {
    comments,
    pagination: normalizePagination(response, page, limit),
  }
}

const listRecentComments = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const response = await api.get('/posts/moderation/recent', {
    params: { page, limit, search: search?.trim() },
  })

  const posts = extractItems(response)
  const comments = posts.flatMap((post) => {
    const postId = post?._id || post?.id || post?.postId || post?.post_id
    if (!postId) return []

    const postContent = post?.caption || post?.content || post?.text || '--'
    const nestedComments = Array.isArray(post?.comments) ? post.comments : []

    return nestedComments
      .map((comment) => normalizeComment(postId, postContent, comment))
      .filter(Boolean)
  })

  return {
    comments,
    pagination: normalizePagination(response, page, limit),
  }
}

const deletePostByModerator = async (postId, reason) => {
  return api.delete(`/posts/${postId}/moderator`, {
    data: {
      reason: reason?.trim(),
    },
  })
}

const deleteCommentByModerator = async ({ postId, commentId, reason }) => {
  return api.delete(`/posts/${postId}/comments/${commentId}/moderator`, {
    data: {
      reason: reason?.trim(),
    },
  })
}

const normalizeOverviewStats = (response) => {
  const data = response?.data || response || {}
  const summary = data?.summary || {}
  const topPosts = Array.isArray(data?.topPosts) ? data.topPosts : []
  const postTypes = data?.postTypes || {}
  const topHashtags = data?.topHashtags || {}
  const engagementTrend = data?.engagementTrend || {}

  return {
    summary: {
      totalPosts: Number(summary?.totalPosts || 0),
      totalLikes: Number(summary?.totalLikes || 0),
      totalComments: Number(summary?.totalComments || 0),
    },
    topPosts: topPosts.map((item) => normalizeStatsPost(item)).filter(Boolean),
    postTypes: {
      labels: Array.isArray(postTypes?.labels) ? postTypes.labels.map((label) => String(label)) : [],
      values: Array.isArray(postTypes?.values) ? postTypes.values.map((value) => Number(value) || 0) : [],
    },
    topHashtags: {
      labels: Array.isArray(topHashtags?.labels) ? topHashtags.labels.map((label) => String(label)) : [],
      values: Array.isArray(topHashtags?.values) ? topHashtags.values.map((value) => Number(value) || 0) : [],
    },
    engagementTrend: {
      labels: Array.isArray(engagementTrend?.labels) ? engagementTrend.labels.map((label) => String(label)) : [],
      posts: Array.isArray(engagementTrend?.posts) ? engagementTrend.posts.map((value) => Number(value) || 0) : [],
      likes: Array.isArray(engagementTrend?.likes) ? engagementTrend.likes.map((value) => Number(value) || 0) : [],
      comments: Array.isArray(engagementTrend?.comments) ? engagementTrend.comments.map((value) => Number(value) || 0) : [],
    },
    meta: data?.meta || {},
  }
}

const getPostStatistics = async ({ timeRange = '90d', topLimit = 5 } = {}) => {
  const response = await api.get('/posts/stats/overview', {
    params: { timeRange, topLimit: Math.min(Number(topLimit || 5), 500) },
  })

  return normalizeOverviewStats(response)
}

const getTrendingPosts = async ({ hoursBack = 24, limit = 10 } = {}) => {
  const response = await api.get('/posts/stats/trending', {
    params: { hoursBack, limit: Math.min(Number(limit || 10), 500) },
  })

  const data = response?.data || response || {}
  return {
    items: extractItems(data)
      .map((item) => normalizeStatsPost(item))
      .filter(Boolean),
    meta: data?.meta || {},
  }
}

const getPostsOverTime = async ({ timeRange = '30d', groupBy = 'day' } = {}) => {
  const response = await api.get('/posts/stats/posts-over-time', {
    params: { timeRange, groupBy },
  })

  const data = response?.data || response || {}
  return {
    labels: Array.isArray(data?.labels) ? data.labels.map((label) => String(label)) : [],
    values: Array.isArray(data?.values) ? data.values.map((value) => Number(value) || 0) : [],
    meta: data?.meta || {},
  }
}

const getPostTypesDistribution = async ({ timeRange = '30d' } = {}) => {
  const response = await api.get('/posts/stats/post-types-distribution', { params: { timeRange } })
  const data = response?.data || response || {}
  return {
    labels: Array.isArray(data?.labels) ? data.labels.map((label) => String(label)) : [],
    values: Array.isArray(data?.values) ? data.values.map((value) => Number(value) || 0) : [],
    meta: data?.meta || {},
  }
}

const getTopHashtags = async ({ timeRange = '30d', limit = 20 } = {}) => {
  const response = await api.get('/posts/stats/top-hashtags', { params: { timeRange, limit } })
  const data = response?.data || response || {}
  return {
    labels: Array.isArray(data?.labels) ? data.labels.map((label) => String(label)) : [],
    values: Array.isArray(data?.values) ? data.values.map((value) => Number(value) || 0) : [],
    meta: data?.meta || {},
  }
}

const getEngagementTrend = async ({ timeRange = '30d', groupBy = 'day' } = {}) => {
  const response = await api.get('/posts/stats/engagement-trend', { params: { timeRange, groupBy } })
  const data = response?.data || response || {}
  return {
    labels: Array.isArray(data?.labels) ? data.labels.map((label) => String(label)) : [],
    posts: Array.isArray(data?.posts) ? data.posts.map((value) => Number(value) || 0) : [],
    likes: Array.isArray(data?.likes) ? data.likes.map((value) => Number(value) || 0) : [],
    comments: Array.isArray(data?.comments) ? data.comments.map((value) => Number(value) || 0) : [],
    meta: data?.meta || {},
  }
}

const adminModerationService = {
  listRecentPosts,
  listManagedPosts,
  listManagedComments,
  listRecentComments,
  deletePostByModerator,
  deleteCommentByModerator,
  getPostStatistics,
  getTrendingPosts,
  getPostsOverTime,
  getPostTypesDistribution,
  getTopHashtags,
  getEngagementTrend,
}

export default adminModerationService
