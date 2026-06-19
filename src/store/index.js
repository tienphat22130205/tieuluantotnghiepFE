import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/store/authSlice'
import postReducer from '@/features/post/store/postSlice'
import groupReducer from '@/features/group/store/groupSlice'

/**
 * Redux Store tổng hợp.
 * Dùng Redux Toolkit để quản lý global state.
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    group: groupReducer,
  },
})

export default store
