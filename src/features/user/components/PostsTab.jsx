import { useState } from 'react'
import { AiOutlineFileText, AiOutlinePlus } from 'react-icons/ai'
import { PostCard, QuickPostBar, CreatePostModal } from '@/features/post'
import { Button } from '@/components/ui'

/**
 * PostsTab – Nội dung tab "Bài viết" tích hợp thanh đăng bài nhanh và Empty State đẹp mắt.
 * Props: posts (array), isMyProfile (boolean), onPostCreated (function)
 */
const PostsTab = ({ posts = [], isMyProfile = false, onPostCreated }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handlePostSuccess = () => {
    setIsCreateModalOpen(false)
    if (onPostCreated) {
      onPostCreated()
    }
  }

  return (
    <div className="space-y-5">
      {/* Quick Post Creator bar for profile owner */}
      {isMyProfile && (
        <>
          <QuickPostBar onOpen={() => setIsCreateModalOpen(true)} />
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onPostSuccess={handlePostSuccess}
          />
        </>
      )}

      {/* Post List */}
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post._id || post.id} post={post} />)
      ) : (
        /* Modern Aesthetic Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
            <AiOutlineFileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Chưa có bài viết nào
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {isMyProfile
              ? 'Hãy chia sẻ những suy nghĩ, hình ảnh và khoảnh khắc đáng nhớ của bạn lên trang cá nhân ngay bây giờ.'
              : 'Người dùng này hiện chưa chia sẻ bài viết công khai nào.'}
          </p>

          {isMyProfile && (
            <Button
              variant="primary"
              size="sm"
              className="mt-5 inline-flex items-center gap-2 rounded-xl font-semibold px-5 py-2.5 shadow-sm hover:shadow"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <AiOutlinePlus size={16} />
              Tạo bài viết đầu tiên
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default PostsTab
