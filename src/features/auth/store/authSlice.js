import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'
import {
  getAuthToken,
  getStoredAuthUser,
  migrateLegacyAuthStorage,
  removeAuthToken,
  removeStoredAuthUser,
  setAuthToken,
  setStoredAuthUser,
  setRememberedEmail,
  removeRememberedEmail,
  setRememberMeFlag,
} from '@/utils/authStorage'
import { setCookie, removeCookie } from '@/utils/cookieUtils'
import { getRoleValue } from '@/utils/auth'

migrateLegacyAuthStorage()

const storedToken = getAuthToken()
const storedUser = getStoredAuthUser()

const parseStoredUser = () => {
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

const parsedStoredUser = parseStoredUser()

const formatBanUntil = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getErrorMessage = (err, fallbackMessage) => {
  if (!err) return fallbackMessage
  if (typeof err === 'string') return err

  const errorCode = String(err?.code || err?.details?.code || '').toUpperCase()
  const reason = err?.reason || err?.details?.reason || ''
  const banUntil = err?.banUntil || err?.details?.banUntil || null

  if (errorCode === 'ACCOUNT_BANNED') {
    const lines = [
      `Tài khoản của bạn đã bị khóa${reason ? ` vì: ${reason}` : '.'}`,
    ]

    const formattedBanUntil = formatBanUntil(banUntil)
    if (formattedBanUntil) {
      lines.push(`Thời gian mở khóa dự kiến: ${formattedBanUntil}`)
    }

    return lines.join(' ')
  }

  if (errorCode === 'ACCOUNT_DISABLED') {
    return 'Tài khoản của bạn đang bị vô hiệu hóa.'
  }

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
        setAuthToken(nextToken)
      }

      if (nextUser) {
        setStoredAuthUser(nextUser)
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
      const { rememberMe = true, ...loginPayload } = credentials
      const data = await authService.login(loginPayload)

      if (!data?.token || !data?.user) {
        return rejectWithValue('Đăng nhập thất bại: dữ liệu trả về không hợp lệ')
      }

      setAuthToken(data.token, rememberMe)
      setStoredAuthUser(data.user, rememberMe)

      const cookieDays = rememberMe ? 7 : null
      const userId = data.user._id || data.user.id || ''
      setCookie('token', data.token, cookieDays)
      if (userId) {
        setCookie('userId', userId, cookieDays)
      }

      if (rememberMe) {
        setRememberedEmail(loginPayload.email)
        setRememberMeFlag(true)
      } else {
        removeRememberedEmail()
        setRememberMeFlag(false)
      }

      return data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Đăng nhập thất bại'))
    }
  }
)

// Đăng nhập bằng Google (Firebase Auth)
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (payload, { rejectWithValue }) => {
    try {
      const idToken = typeof payload === 'string' ? payload : payload?.idToken
      const rememberMe =
        typeof payload === 'object' && payload?.rememberMe !== undefined
          ? payload.rememberMe
          : true

      const data = await authService.googleLogin(idToken)

      if (!data?.token || !data?.user) {
        return rejectWithValue('Đăng nhập Google thất bại: dữ liệu trả về không hợp lệ')
      }

      setAuthToken(data.token, rememberMe)
      setStoredAuthUser(data.user, rememberMe)

      const cookieDays = rememberMe ? 7 : null
      const userId = data.user._id || data.user.id || ''
      setCookie('token', data.token, cookieDays)
      if (userId) {
        setCookie('userId', userId, cookieDays)
      }

      return data
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Đăng nhập Google thất bại'))
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

// Kiểm tra role của user hiện tại
export const checkRole = createAsyncThunk(
  'auth/checkRole',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.checkRole()
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Không thể kiểm tra quyền'))
    }
  }
)

const initialState = {
  user: parsedStoredUser,
  token: storedToken,
  role: getRoleValue(parsedStoredUser),
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
      state.role = null
      state.error = null
      removeAuthToken()
      removeStoredAuthUser()
      removeCookie('token')
      removeCookie('userId')
      removeCookie('firebase_token')
      removeCookie('uid')
      removeCookie('x-user-uid')
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
        state.role = getRoleValue(action.payload.user)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── Login with Google ──
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.role = getRoleValue(action.payload.user)
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // ── GetMe ──
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.role = getRoleValue(action.payload)
        setStoredAuthUser(action.payload)
      })

      // ── Check Role ──
      .addCase(checkRole.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkRole.fulfilled, (state, action) => {
        state.isLoading = false
        const nextRole = getRoleValue(state.user, action.payload?.role)
        state.role = nextRole || null
        if (state.user) {
          state.user = {
            ...state.user,
            role: nextRole || state.user.role,
          }
          setStoredAuthUser(state.user)
        }
      })
      .addCase(checkRole.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
