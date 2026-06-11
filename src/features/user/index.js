/**
 * 👤 User Feature – Barrel Export
 * ─────────────────────────────────
 * Export tất cả thành phần của feature user từ 1 entry point.
 *
 *   import { ProfilePage, userService } from '@/features/user'
 */
// Pages
export { default as ProfilePage } from './pages/ProfilePage'
export { default as FriendsPage } from './pages/FriendsPage'
export { default as GroupsPage } from './pages/GroupsPage'

// Components
export { default as CoverPhoto } from './components/CoverPhoto'
export { default as ProfileInfo } from './components/ProfileInfo'
export { default as ProfileTabs } from './components/ProfileTabs'
export { default as IntroCard } from './components/IntroCard'
export { default as PhotosCard } from './components/PhotosCard'
export { default as FriendsCard } from './components/FriendsCard'
export { default as PostsTab } from './components/PostsTab'
export { default as AboutTab } from './components/AboutTab'
export { default as PhotosTab } from './components/PhotosTab'
export { default as FriendsTab } from './components/FriendsTab'

// Services
export { default as userService } from './services/userService'
export { default as friendService } from './services/friendService'
