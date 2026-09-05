import { useMemo, useState } from 'react'
import { FiTrash2, FiLoader } from 'react-icons/fi'
import AdminDataTable from './AdminDataTable'
import { usePreferences } from '@/context/PreferencesContext'

const formatDisplayDate = (value, locale = 'vi') => {
  if (!value) return '--'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '--'
  return date.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
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
  const { t, language } = usePreferences()
  const [deleteReasons, setDeleteReasons] = useState({})

  const columns = useMemo(() => [
    {
      key: 'author',
      title: t('admin.commenter') || 'Người bình luận',
      render: (comment) => {
        const hasDistinctUsername =
          comment.username &&
          comment.username !== '--' &&
          !comment.author.startsWith('@') &&
          comment.author !== comment.username

        return (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{comment.author}</span>
            {hasDistinctUsername && (
              <span className="text-xs text-slate-400 dark:text-slate-500">@{comment.username}</span>
            )}
          </div>
        )
      },
    },
    { key: 'content', title: t('admin.content') || 'Nội dung', render: (comment) => <span className="line-clamp-2 text-slate-700 dark:text-slate-200">{comment.content}</span> },
    { key: 'postContent', title: t('admin.post') || 'Bài viết', render: (comment) => <span className="line-clamp-1 text-slate-600 dark:text-slate-300">{comment.postContent}</span> },
    { key: 'createdAt', title: t('admin.time') || 'Thời gian', render: (comment) => formatDisplayDate(comment.createdAt, language) },
    {
      key: 'reason',
      title: t('admin.deleteReason') || 'Lý do xóa',
      render: (comment) => (
        <input
          type="text"
          value={deleteReasons[comment.id] || ''}
          onChange={(event) => setDeleteReasons((prev) => ({ ...prev, [comment.id]: event.target.value }))}
          placeholder={t('admin.enterDeleteReason') || 'Nhập lý do xóa...'}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      ),
    },
    {
      key: 'actions',
      title: t('admin.actions') || 'Hành động',
      render: (comment) => {
        const reason = String(deleteReasons[comment.id] || '').trim()

        return (
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
            onClick={() => onDeleteComment(comment, reason)}
            disabled={!reason || busyCommentId === comment.id}
            title={t('admin.deleteComment') || 'Xóa bình luận'}
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
  ], [deleteReasons, busyCommentId, onDeleteComment, t, language])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{t('admin.commentsManagement') || 'Quản lý bình luận'}</h2>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (t('admin.loading') || 'Đang tải...') : (t('admin.refresh') || 'Tải mới')}
        </button>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value, page: 1 })}
          placeholder={t('admin.searchCommentPlaceholder') || 'Tìm theo nội dung bình luận...'}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 md:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          {t('admin.total') || 'Tổng'}: {Number(pagination?.totalItems || comments.length || 0)} {language === 'en' ? 'comments' : 'bình luận'}
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
        emptyText={t('admin.noComments') || 'Không có bình luận để xử lý.'}
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </section>
  )
}

export default CommentsManagementPanel

