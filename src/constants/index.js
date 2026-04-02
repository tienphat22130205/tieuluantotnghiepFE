/**
 * 📋 Constants
 * ─────────────
 * Hằng số dùng chung toàn project: Routes, Query Keys, v.v.
 */

// ── Routes ──
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CREATE_POST: '/create',
  PROFILE: (userId) => `/profile/${userId}`,
  POST_DETAIL: (postId) => `/post/${postId}`,
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
}

// ── Query Keys (dùng cho React Query / cache) ──
export const QUERY_KEYS = {
  FEED: 'feed',
  POST: 'post',
  COMMENTS: 'comments',
  PROFILE: 'profile',
  USER_POSTS: 'userPosts',
  SUGGESTIONS: 'suggestions',
}

export * from './messages'
