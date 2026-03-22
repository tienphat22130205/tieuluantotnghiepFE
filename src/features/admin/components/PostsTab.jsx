const PostsTab = ({ posts }) => {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Danh sách bài viết gần đây</h2>
      <div className="mt-4 space-y-3">
        {posts.slice(0, 8).map((post) => (
          <div key={post._id} className="rounded-xl border border-gray-100 p-3">
            <p className="line-clamp-1 text-sm font-medium text-gray-800">{post.caption}</p>
            <p className="mt-1 text-xs text-gray-500">
              @{post.user?.username} • {post.likes?.length || 0} lượt thích • {post.comments_count || 0} bình luận
            </p>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">Chưa có bài viết để hiển thị.</p>
        )}
      </div>
    </article>
  )
}

export default PostsTab
