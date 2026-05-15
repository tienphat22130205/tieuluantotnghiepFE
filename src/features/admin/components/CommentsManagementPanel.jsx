import { useState } from 'react'
import { FiTrash2, FiLoader } from 'react-icons/fi'
import AdminDataTable from './AdminDataTable'

const formatDisplayDate = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '--'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const CommentsManagementPanel = ({
  comments,
  pagination,
  filters,
  isLoading,
  error,
  busyCommentId,
  onDeleteComment,
  onRefresh,
  onPageChange,
  onFiltersChange,
}) => {
  const [deleteReasons, setDeleteReasons] = useState({})

  const columns = [
    { key: 'author', title: 'Người bình luận' },
    { key: 'content', title: 'Nội dung', render: (comment) => <span className="line-clamp-2">{comment.content}</span> },
    { key: 'postContent', title: 'Bài viết', render: (comment) => <span className="line-clamp-1">{comment.postContent}</span> },
    { key: 'createdAt', title: 'Thời gian', render: (comment) => formatDisplayDate(comment.createdAt) },
    {
      key: 'reason',
      title: 'Lý do xóa',
      render: (comment) => (
        <input
          type="text"
          value={deleteReasons[comment.id] || ''}
          onChange={(event) => setDeleteReasons((prev) => ({ ...prev, [comment.id]: event.target.value }))}
          placeholder="Nhập lý do xóa"
          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      render: (comment) => {
        const reason = String(deleteReasons[comment.id] || '').trim()

        return (
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onDeleteComment(comment, reason)}
            disabled={!reason || busyCommentId === comment.id}
          >
            {busyCommentId === comment.id ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiTrash2 className="h-4 w-4" />
            )}
          </button>
        )
      },
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-800">Quản lý bình luận</h2>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Đang tải...' : 'Tải mới'}
        </button>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value, page: 1 })}
          placeholder="Tìm theo nội dung bình luận"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 md:col-span-2"
        />
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Tổng: {Number(pagination?.totalItems || comments.length || 0)} bình luận
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminDataTable
        columns={columns}
        rows={comments}
        isLoading={isLoading}
        emptyText="Không có bình luận để xử lý."
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </section>
  )
}

export default CommentsManagementPanel
