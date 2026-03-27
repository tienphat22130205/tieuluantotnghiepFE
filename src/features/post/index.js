/**
 * 📝 Post Feature – Barrel Export
 * ─────────────────────────────────
 * Export tất cả thành phần của feature post từ 1 entry point.
 *
 *   import { HomePage, PostCard, postReducer } from '@/features/post'
 */
// Pages
export { default as HomePage } from './pages/HomePage'
export { default as CreatePostPage } from './pages/CreatePostPage'
export { default as PostDetailPage } from './pages/PostDetailPage'

// Components
export { default as PostCard } from './components/PostCard'
export { default as PostCardHeader } from './components/PostCardHeader'
export { default as PostCardActions } from './components/PostCardActions'
export { default as PostCardBody } from './components/PostCardBody'
export { default as ProfileSidebar } from './components/ProfileSidebar'
export { default as DemoBanner } from './components/DemoBanner'
export { default as PostList } from './components/PostList'
export { default as ImageUploader } from './components/ImageUploader'
export { default as AIGenerateButton } from './components/AIGenerateButton'
export { default as PostForm } from './components/PostForm'
export { default as PostContent } from './components/PostContent'
export { default as CommentSection } from './components/CommentSection'

// Services
export { default as postService } from './services/postService'

// Store
export { default as postReducer } from './store/postSlice'
export {
  fetchFeed,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  removeComment,
  clearPosts,
  setCurrentPost,
  loadMockPosts,
} from './store/postSlice'
