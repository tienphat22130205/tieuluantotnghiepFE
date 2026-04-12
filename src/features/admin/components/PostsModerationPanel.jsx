import { useState } from 'react'

const emptyPostForm = {
  author: '',
  content: '',
  documentTitle: '',
}

const postStatusOptions = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

const PostsModerationPanel = ({ posts, onAddPost, onDeletePost, onUpdatePost }) => {
  const [form, setForm] = useState(emptyPostForm)

  const handleSubmit = (event) => {
    event.preventDefault()
    const isFormValid = form.author.trim() && form.content.trim() && form.documentTitle.trim()
    if (!isFormValid) return

    onAddPost(form)
    setForm(emptyPostForm)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-slate-800">Kiểm duyệt bài viết và tài liệu</h2>
      </div>

      <form className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
        <input
          value={form.author}
          onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Tác giả"
        />
        <input
          value={form.documentTitle}
          onChange={(event) => setForm((prev) => ({ ...prev, documentTitle: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Tiêu đề tài liệu"
        />
        <input
          value={form.content}
          onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Nội dung bài viết"
        />
        <button type="submit" className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
          Thêm bài viết
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Tác giả</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Nội dung</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Tài liệu</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Trạng thái bài viết</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Tài liệu hợp lệ</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{post.author}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{post.content}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{post.documentTitle}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <select
                    className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    value={post.status}
                    onChange={(event) => onUpdatePost(post.id, { status: event.target.value })}
                  >
                    {postStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <button
                    type="button"
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${post.documentValid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                    onClick={() => onUpdatePost(post.id, { documentValid: !post.documentValid })}
                  >
                    {post.documentValid ? 'Hợp lệ' : 'Không hợp lệ'}
                  </button>
                </td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5"
                    onClick={() => onDeletePost(post.id)}
                  >
                    Xóa bài viết
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

export default PostsModerationPanel
