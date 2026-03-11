import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import postService from '../services/postService'

// ──── Async Thunks ────

// Lấy Newsfeed
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await postService.getFeed(page, limit)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// Tạo bài viết
export const createPost = createAsyncThunk(
  'posts/create',
  async (formData, { rejectWithValue }) => {
    try {
      return await postService.create(formData)
    } catch (err) {
      return rejectWithValue(err.message || 'Tạo bài viết thất bại')
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
        const newPosts = action.payload.posts || action.payload
        // Nếu page > 1 thì nối thêm (infinite scroll)
        if (state.page > 1) {
          state.posts = [...state.posts, ...newPosts]
        } else {
          state.posts = newPosts
        }
        state.hasMore = newPosts.length > 0
        state.page += 1
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── Create Post ──
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload) // Thêm bài mới lên đầu
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
