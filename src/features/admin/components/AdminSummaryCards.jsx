const AdminSummaryCards = ({ users, posts, comments, documents }) => {
  const activeUsers = users.filter((user) => user.status === 'active').length
  const lockedUsers = users.length - activeUsers
  const pendingPosts = posts.filter((post) => post.status === 'pending').length
  const invalidDocuments = documents.filter((doc) => !doc.isValid).length

  const cards = [
    { title: 'Người dùng đang hoạt động', value: activeUsers },
    { title: 'Tài khoản đã khóa', value: lockedUsers },
    { title: 'Bài viết chờ kiểm duyệt', value: pendingPosts },
    { title: 'Bình luận cần xử lý', value: comments.length },
    { title: 'Tài liệu không hợp lệ', value: invalidDocuments },
  ]

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-xs text-slate-500">{card.title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-800">{card.value}</h3>
        </article>
      ))}
    </section>
  )
}

export default AdminSummaryCards
