import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import postService from '../services/postService'
import { normalizeVisibility } from '@/utils/friendship'

const normalizeHashtags = (hashtags) => {
  if (!hashtags) return []
  if (Array.isArray(hashtags)) return hashtags
  if (typeof hashtags === 'string') {
    return hashtags
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
  }
  return []
}

const normalizePostForUi = (post) => {
  if (!post) return null

  const rawImages = Array.isArray(post.images) ? post.images : []
  const normalizedImages = rawImages
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') return item
      if (typeof item === 'object') return item.image_url || item.url || item.path || null
      return null
    })
    .filter(Boolean)
  const images = normalizedImages.length > 0
    ? normalizedImages
    : [post.image_url || post.imageUrl].filter(Boolean)
  const author = post.user || post.author || {}
  const shared = post.sharedPost || post.shared_post || post.originalPost || post.original_post || null
  const sharedPost = (() => {
    if (!shared) return null
    if (typeof shared === 'string') {
      return {
        _id: shared,
        caption: '',
        image_url: null,
        user: null,
      }
    }

    const sharedRawImages = Array.isArray(shared.images) ? shared.images : []
    const sharedNormalizedImages = sharedRawImages
      .map((item) => {
        if (!item) return null
        if (typeof item === 'string') return item
        if (typeof item === 'object') return item.image_url || item.url || item.path || null
        return null
      })
      .filter(Boolean)
    const sharedImages = sharedNormalizedImages.length > 0
      ? sharedNormalizedImages
      : [shared.image_url || shared.imageUrl].filter(Boolean)
    const sharedAuthor = shared.user || shared.author || {}

    return {
      ...shared,
      _id: shared._id || shared.id,
      caption: shared.caption || shared.content || '',
      image_url: shared.image_url || shared.imageUrl || sharedImages[0] || null,
      images: sharedImages,
      user: {
        _id: sharedAuthor._id || sharedAuthor.id || null,
        username: sharedAuthor.username || shared.authorUsername || 'user',
        full_name: sharedAuthor.full_name || sharedAuthor.fullName || shared.authorName,
        avatar: sharedAuthor.avatar || shared.authorAvatar || null,
      },
    }
  })()

  return {
    ...post,
    _id: post._id || post.id,
    isDeleted: Boolean(post.isDeleted || post.deletedAt || post.deleted_at),
    caption: post.caption || post.content || '',
    image_url: post.image_url || post.imageUrl || images[0] || null,
    images,
    hashtags: normalizeHashtags(post.hashtags),
    created_at: post.created_at || post.createdAt,
    comments_count: post.comments_count || post.commentsCount || post.commentCount || (Array.isArray(post.comments) ? post.comments.length : 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    likes: Array.isArray(post.likes) ? post.likes : [],
    isLiked: post.isLiked ?? post.liked ?? (Array.isArray(post.likes) ? undefined : false),
    likeCount: post.likeCount ?? post.likesCount ?? post.likes_count,
    postType: post.postType || post.post_type || null,
    sharedPost,
    visibility: normalizeVisibility(post.visibility),
    user: {
      _id: author._id || author.id || (typeof post.author === 'string' ? post.author : null),
      username: author.username || post.authorUsername || 'user',
      full_name: author.full_name || author.fullName || post.authorName,
      avatar: author.avatar || post.authorAvatar || null,
    },
  }
}

const extractPostPayload = (payload) => {
  if (!payload) return null
  return payload.data || payload.post || payload
}

const extractPostsPayload = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.posts)) return payload.posts
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.posts)) return payload.data.posts
  return []
}

const mergeUniquePostsById = (posts) => {
  const seen = new Set()
  return posts.filter((post) => {
    const postId = post?._id || post?.id
    if (!postId || seen.has(postId)) return false
    seen.add(postId)
    return true
  })
}

const resolveEventPostId = (payload = {}) =>
  payload?.postId
  || payload?.post?._id
  || payload?.post?.id
  || payload?.data?.postId
  || payload?.data?.post?._id
  || payload?.data?.post?.id
  || payload?._id
  || payload?.id
  || null

// ──── Async Thunks ────

// Lấy Newsfeed
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page, limit = 5 } = {}, { getState, rejectWithValue }) => {
    try {
      const statePage = getState()?.posts?.page || 1
      const resolvedPage = Number.isInteger(page) ? page : statePage
      const data = await postService.getFeed(resolvedPage, limit)
      return { data, page: resolvedPage, limit }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// Tạo bài viết
export const createPost = createAsyncThunk(
  'posts/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await postService.create(payload)
    } catch (err) {
      return rejectWithValue(err.message || 'Tạo bài viết thất bại')
    }
  }
)

// Chỉnh sửa bài viết
export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ postId, payload }, { rejectWithValue }) => {
    try {
      return await postService.update(postId, payload)
    } catch (err) {
      return rejectWithValue(err.message || 'Chỉnh sửa bài viết thất bại')
    }
  }
)

// Xóa bài viết
export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, { rejectWithValue }) => {
    try {
      await postService.softDelete(postId)
      return { postId, isDeleted: true, deletedAt: new Date().toISOString() }
    } catch (err) {
      return rejectWithValue(err.message || 'Xóa bài viết thất bại')
    }
  }
)

// Like / Unlike
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (payload, { rejectWithValue }) => {
    try {
      const postId = typeof payload === 'string' ? payload : payload?.postId
      const isLiked = typeof payload === 'object' ? payload?.isLiked : false
      const currentUserId = typeof payload === 'object' ? payload?.currentUserId : null
      const result = await postService.toggleLike(postId, isLiked)
      return { ...result, postId, currentUserId }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// Thêm comment
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      return await postService.addComment(postId, content)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const removeComment = createAsyncThunk(
  'posts/removeComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      return await postService.deleteComment(postId, commentId)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ──── Slice ────
const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
}

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = []
      state.page = 1
      state.hasMore = true
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload
    },
    // Load mock posts (demo mode)
    loadMockPosts: (state, action) => {
      state.posts = action.payload
      state.isLoading = false
      state.hasMore = false
      state.page = 1
    },
    upsertRealtimePost: (state, action) => {
      const normalizedPost = normalizePostForUi(extractPostPayload(action.payload))
      if (!normalizedPost?._id || normalizedPost.isDeleted) return

      const existingIndex = state.posts.findIndex((post) => post._id === normalizedPost._id)
      if (existingIndex === -1) {
        state.posts = mergeUniquePostsById([normalizedPost, ...state.posts])
        return
      }

      state.posts[existingIndex] = {
        ...state.posts[existingIndex],
        ...normalizedPost,
      }
    },
    applyRealtimeLikeEvent: (state, action) => {
      const payload = action.payload || {}
      const postId = resolveEventPostId(payload)
      if (!postId) return

      const idx = state.posts.findIndex((post) => post._id === postId)
      if (idx === -1) return

      const previousLikes = Array.isArray(state.posts[idx].likes) ? state.posts[idx].likes : []
      const eventLikeCount = payload?.likeCount ?? payload?.likesCount ?? payload?.likes_count
      const normalizedLikeCount = Number.isFinite(Number(eventLikeCount))
        ? Number(eventLikeCount)
        : previousLikes.length

      const placeholders = Array.from({ length: Math.max(0, normalizedLikeCount) }, (_, i) => `like-${i}`)
      state.posts[idx].likes = placeholders
      state.posts[idx].likeCount = normalizedLikeCount

      const eventType = payload?.type || action.meta?.arg?.eventType
      if (eventType === 'post:liked') {
        state.posts[idx].isLiked = true
      }
      if (eventType === 'post:unliked') {
        state.posts[idx].isLiked = false
      }
    },
    applyRealtimeCommentEvent: (state, action) => {
      const payload = action.payload || {}
      const postId = resolveEventPostId(payload)
      if (!postId) return

      const idx = state.posts.findIndex((post) => post._id === postId)
      if (idx === -1) return

      const eventCommentCount = payload?.commentCount ?? payload?.commentsCount ?? payload?.comments_count
      if (Number.isFinite(Number(eventCommentCount))) {
        state.posts[idx].comments_count = Number(eventCommentCount)
      } else {
        state.posts[idx].comments_count = (state.posts[idx].comments_count || 0) + 1
      }
    },
    applyRealtimeCommentDeletedEvent: (state, action) => {
      const payload = action.payload || {}
      const postId = resolveEventPostId(payload)
      if (!postId) return

      const idx = state.posts.findIndex((post) => post._id === postId)
      if (idx === -1) return

      const eventCommentCount = payload?.commentCount ?? payload?.commentsCount ?? payload?.comments_count
      if (Number.isFinite(Number(eventCommentCount))) {
        state.posts[idx].comments_count = Number(eventCommentCount)
      } else {
        state.posts[idx].comments_count = Math.max(0, (state.posts[idx].comments_count || 0) - 1)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Feed ──
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false
        const requestedPage = action.payload?.page || 1
        const requestedLimit = Number(action.payload?.limit || 5)
        const newPosts = extractPostsPayload(action.payload?.data)
          .map(normalizePostForUi)
          .filter(Boolean)
        // Nếu page > 1 thì nối thêm (infinite scroll)
        if (requestedPage > 1) {
          state.posts = mergeUniquePostsById([...state.posts, ...newPosts])
        } else {
          state.posts = mergeUniquePostsById(newPosts)
        }
        state.hasMore = newPosts.length >= requestedLimit
        state.page = requestedPage + 1
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── Create Post ──
      .addCase(createPost.fulfilled, (state, action) => {
        const newPost = normalizePostForUi(extractPostPayload(action.payload))
        if (newPost) {
          state.posts = mergeUniquePostsById([newPost, ...state.posts])
        }
      })

      // ── Update Post ──
      .addCase(updatePost.fulfilled, (state, action) => {
        const updatedPost = normalizePostForUi(extractPostPayload(action.payload))
        if (!updatedPost?._id) return

        const idx = state.posts.findIndex((p) => p._id === updatedPost._id)
        if (idx !== -1) {
          state.posts[idx] = {
            ...state.posts[idx],
            ...updatedPost,
            images: updatedPost.images?.length ? updatedPost.images : state.posts[idx].images,
            image_url: updatedPost.image_url || state.posts[idx].image_url,
          }
        }
      })

      // ── Delete Post ──
      .addCase(deletePost.pending, (state, action) => {
        const deletingPostId = action.meta.arg
        const idx = state.posts.findIndex((post) => post._id === deletingPostId)
        if (idx !== -1) {
          state.posts[idx] = {
            ...state.posts[idx],
            isDeleted: true,
            _optimisticDelete: true,
          }
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload?.postId
        const idx = state.posts.findIndex((post) => post._id === deletedPostId)
        if (idx !== -1) {
          state.posts[idx] = {
            ...state.posts[idx],
            isDeleted: true,
            deletedAt: action.payload?.deletedAt || state.posts[idx].deletedAt || null,
            _optimisticDelete: false,
          }
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        const deletingPostId = action.meta.arg
        const idx = state.posts.findIndex((post) => post._id === deletingPostId)
        if (idx !== -1) {
          state.posts[idx] = {
            ...state.posts[idx],
            isDeleted: false,
            _optimisticDelete: false,
          }
        }
        state.error = action.payload || 'Xóa bài viết thất bại'
      })

      // ── Toggle Like ──
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, likeCount, currentUserId } = action.payload || {}
        const idx = state.posts.findIndex((p) => p._id === postId)
        if (idx === -1) return

        const likes = Array.isArray(state.posts[idx].likes) ? state.posts[idx].likes : []
        const userId = currentUserId || null
        let nextLikes = likes

        if (userId) {
          nextLikes = liked
            ? [...likes.filter((id) => id !== userId), userId]
            : likes.filter((id) => id !== userId)
        }

        if (typeof likeCount === 'number' && likeCount !== nextLikes.length) {
          const keep = userId && liked ? [userId] : []
          const placeholders = Array.from({ length: Math.max(0, likeCount - keep.length) }, (_, i) => `like-${i}`)
          nextLikes = [...keep, ...placeholders]
        }

        state.posts[idx].likes = nextLikes
        state.posts[idx].isLiked = liked
      })

      // ── Add Comment ──
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, commentCount } = action.payload || {}
        const idx = state.posts.findIndex((p) => p._id === postId)
        if (idx !== -1) {
          state.posts[idx].comments_count = typeof commentCount === 'number'
            ? commentCount
            : (state.posts[idx].comments_count || 0) + 1
        }
      })

      // ── Remove Comment ──
      .addCase(removeComment.fulfilled, (state, action) => {
        const { postId, commentCount } = action.payload || {}
        const idx = state.posts.findIndex((p) => p._id === postId)
        if (idx !== -1) {
          state.posts[idx].comments_count = typeof commentCount === 'number'
            ? commentCount
            : Math.max(0, (state.posts[idx].comments_count || 0) - 1)
        }
      })
  },
})

export const {
  clearPosts,
  setCurrentPost,
  loadMockPosts,
  upsertRealtimePost,
  applyRealtimeLikeEvent,
  applyRealtimeCommentEvent,
  applyRealtimeCommentDeletedEvent,
} = postSlice.actions
export default postSlice.reducer
