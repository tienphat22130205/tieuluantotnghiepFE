import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'

// ──── Async Thunks ────

// Đăng ký
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Đăng ký thất bại')
    }
  }
)

// Đăng nhập
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (err) {
      return rejectWithValue(err.message || 'Đăng nhập thất bại')
    }
  }
)

// Lấy thông tin user hiện tại
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ──── Khởi tạo state từ localStorage ────
const userFromStorage = localStorage.getItem('user')

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
}

// ──── Slice ────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Đăng xuất
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    // Xóa lỗi
    clearError: (state) => {
      state.error = null
    },
    // Demo Mode - Đăng nhập giả lập (chỉ để test UI)
    loginDemo: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.error = null
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Register ──
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── Login ──
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── GetMe ──
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearError, loginDemo } = authSlice.actions
export default authSlice.reducer
