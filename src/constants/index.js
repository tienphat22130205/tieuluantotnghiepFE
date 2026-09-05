/**
 * 📋 Constants
 * ─────────────
 * Hằng số dùng chung toàn project: Routes, Query Keys, v.v.
 */

import { getProfilePath } from '@/utils/profileData'

// ── Routes ──
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CREATE_POST: '/create',
  PROFILE: (userOrId) => getProfilePath(userOrId),
  POST_DETAIL: (postId) => `/post/${postId}`,
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
}

export { getProfilePath }

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
