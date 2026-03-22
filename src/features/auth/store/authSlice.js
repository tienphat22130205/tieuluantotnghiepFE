import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const parseStoredUser = () => {
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

const getErrorMessage = (err, fallbackMessage) => {
  if (!err) return fallbackMessage
  if (typeof err === 'string') return err

  const detailError = err.details?.error

  if (typeof detailError === 'string' && detailError.trim()) {
    return detailError
  }

  if (Array.isArray(detailError) && detailError.length > 0) {
    const firstError = detailError[0]
    if (typeof firstError === 'string') return firstError
    if (typeof firstError?.message === 'string') return firstError.message
  }

  if (typeof detailError?.message === 'string') {
    return detailError.message
  }

  return err.message || err.details?.message || fallbackMessage
}

// ──── Async Thunks ────

// Đăng ký
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      return data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Đăng ký thất bại'))
    }
  }
)

// Đăng nhập
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)

      if (!data?.token || !data?.user) {
        return rejectWithValue('Đăng nhập thất bại: dữ liệu trả về không hợp lệ')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Đăng nhập thất bại'))
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
      return rejectWithValue(getErrorMessage(err, 'Không lấy được thông tin người dùng'))
    }
  }
)

const initialState = {
  user: parseStoredUser(),
  token: storedToken,
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
        if (action.payload?.token && action.payload?.user) {
          state.user = action.payload.user
          state.token = action.payload.token
        }
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
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
