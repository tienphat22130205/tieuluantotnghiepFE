import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import postService from '../services/postService'

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

  return {
    ...post,
    _id: post._id || post.id,
    caption: post.caption || post.content || '',
    image_url: post.image_url || post.imageUrl || images[0] || null,
    images,
    hashtags: normalizeHashtags(post.hashtags),
    created_at: post.created_at || post.createdAt,
    comments_count: post.comments_count || post.commentsCount || 0,
    likes: Array.isArray(post.likes) ? post.likes : [],
    user: {
      _id: author._id || author.id || (typeof post.author === 'string' ? post.author : null),
      username: author.username || post.authorUsername || 'user',
      full_name: author.full_name || author.fullName || post.authorName || 'Người dùng',
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

// ──── Async Thunks ────

// Lấy Newsfeed
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const statePage = getState()?.posts?.page || 1
      const resolvedPage = Number.isInteger(page) ? page : statePage
      const data = await postService.getFeed(resolvedPage, limit)
      return { data, page: resolvedPage }
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
      await postService.delete(postId)
      return { postId }
    } catch (err) {
      return rejectWithValue(err.message || 'Xóa bài viết thất bại')
    }
  }
)

// Like / Unlike
export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, { rejectWithValue }) => {
    try {
      return await postService.toggleLike(postId)
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
        const newPosts = extractPostsPayload(action.payload?.data)
          .map(normalizePostForUi)
          .filter(Boolean)
        // Nếu page > 1 thì nối thêm (infinite scroll)
        if (requestedPage > 1) {
          state.posts = mergeUniquePostsById([...state.posts, ...newPosts])
        } else {
          state.posts = mergeUniquePostsById(newPosts)
        }
        state.hasMore = newPosts.length > 0
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
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostId = action.payload?.postId
        state.posts = state.posts.filter((post) => post._id !== deletedPostId)
      })

      // ── Toggle Like ──
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.posts.findIndex((p) => p._id === updated._id)
        if (idx !== -1) state.posts[idx] = updated
      })

      // ── Add Comment ──
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId } = action.payload
        const idx = state.posts.findIndex((p) => p._id === postId)
        if (idx !== -1) {
          state.posts[idx].comments_count += 1
        }
      })
  },
})

export const { clearPosts, setCurrentPost, loadMockPosts } = postSlice.actions
export default postSlice.reducer
