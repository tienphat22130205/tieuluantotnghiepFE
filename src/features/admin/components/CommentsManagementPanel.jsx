const CommentsManagementPanel = ({ comments, posts, onDeleteComment }) => {
  const postTitleById = posts.reduce((acc, post) => {
    acc[post.id] = post.documentTitle
    return acc
  }, {})

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-slate-800">Danh sách bình luận</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Người bình luận</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Nội dung</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Bài viết/Tài liệu</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Thời gian</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{comment.author}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{comment.content}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{postTitleById[comment.postId] || 'Không xác định'}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{comment.createdAt}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    Xóa bình luận
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CommentsManagementPanel
