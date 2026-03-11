import { PostCard } from '@/features/post'

/**
 * PostsTab – Nội dung tab "Bài viết".
 * Props: posts (array)
 */
const PostsTab = ({ posts }) => {
  return (
    <div className="space-y-5">
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">Chưa có bài viết nào.</p>
        </div>
      )}
    </div>
  )
}

export default PostsTab
