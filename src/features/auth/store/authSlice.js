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

// Đăng ký (Bước 1)
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      // LƯU Ý: Không lưu token vào localStorage ở bước 1
      // Vì user chưa xác thực email và chưa chọn username
      return data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Đăng ký thất bại'))
    }
  }
)

// Gợi ý username (Bước 3)
export const suggestUsername = createAsyncThunk(
  'auth/suggestUsername',
  async (data, { rejectWithValue }) => {
    try {
      return await authService.suggestUsername(data)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Gợi ý username thất bại'))
    }
  }
)

// Set username (Bước 3)
export const setUsername = createAsyncThunk(
  'auth/setUsername',
  async (data, { rejectWithValue, getState }) => {
    try {
      const response = await authService.setUsername(data)

      const currentState = getState()
      const currentUser = currentState?.auth?.user
      const currentToken = currentState?.auth?.token

      // Backend có thể chỉ trả message khi set username thành công.
      // Fallback: merge vào user hiện tại để tránh reload bị hiện modal lặp lại.
      const nextUser = response?.user || (currentUser
        ? {
            ...currentUser,
            username: data?.username,
            usernameSelected: true,
          }
        : null)

      const nextToken = response?.token || currentToken

      if (nextToken) {
        localStorage.setItem('token', nextToken)
      }

      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser))
      }

      return {
        ...response,
        user: nextUser,
        token: nextToken,
      }
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Đặt username thất bại'))
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
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
        // Không set user/token ở đây vì còn phải xác thực email và chọn username
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── Suggest Username ──
      .addCase(suggestUsername.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(suggestUsername.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(suggestUsername.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── Set Username ──
      .addCase(setUsername.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(setUsername.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload?.user) {
          state.user = action.payload.user
        }

        if (action.payload?.token) {
          state.token = action.payload.token
        }
      })
      .addCase(setUsername.rejected, (state, action) => {
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
