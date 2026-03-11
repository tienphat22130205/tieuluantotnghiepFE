import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/store/authSlice'
import postReducer from '@/features/post/store/postSlice'

/**
 * Redux Store tổng hợp.
 * Dùng Redux Toolkit để quản lý global state.
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
  },
})

export default store
