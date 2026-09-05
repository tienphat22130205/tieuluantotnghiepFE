import { useEffect, useMemo, useRef, useState } from 'react'
import { FiTrash2, FiLoader, FiSearch, FiSliders } from 'react-icons/fi'
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

const truncateText = (text, maxLength = 100) => {
  if (!text) return '--'
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

const PostDetailModal = ({ isOpen, post, onClose }) => {
  const { t, language } = usePreferences()
  if (!isOpen || !post) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
            {t('admin.postDetails') || 'Chi tiết bài viết'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4">
          {Array.isArray(post.images) && post.images.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {t('admin.images') || 'Hình ảnh'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Post image ${idx + 1}`}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t('admin.author') || 'Tác giả'}
            </p>
            <p className="text-slate-800 dark:text-slate-100">{post.author || '--'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t('admin.content') || 'Nội dung'}
            </p>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{post.content || '--'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Likes</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{post.likes ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Comments</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{post.comments ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {t('admin.interactions') || 'Tương tác'}
              </p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{post.interactions ?? 0}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t('admin.time') || 'Thời gian'}
            </p>
            <p className="text-slate-800 dark:text-slate-100">{formatDisplayDate(post.createdAt, language)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const PostsModerationPanel = ({
  isAdminView,
  posts,
  pagination,
  filters,
  isLoading,
  error,
  busyPostId,
  onDeletePost,
  onRefresh,
  onPageChange,
  onFiltersChange,
}) => {
  const { t, language } = usePreferences()
  const [deleteReasons, setDeleteReasons] = useState({})
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchDraft, setSearchDraft] = useState(filters.search || '')
  const searchTimerRef = useRef(null)

  const sortOptions = useMemo(() => [
    { value: 'createdAt', label: t('admin.sortNewest') || 'Mới nhất' },
    { value: 'likes', label: t('admin.sortMostLiked') || 'Nhiều lượt thích' },
    { value: 'comments', label: t('admin.sortMostCommented') || 'Nhiều bình luận' },
  ], [t])

  useEffect(() => {
    setSearchDraft(filters.search || '')
  }, [filters.search])

  useEffect(() => () => {
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current)
  }, [])

  const handleSearchChange = (value) => {
    setSearchDraft(value)
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current)
    searchTimerRef.current = window.setTimeout(() => {
      onFiltersChange({ search: value, page: 1 })
    }, 300)
  }

  const handleChangeReason = (postId, value) => {
    setDeleteReasons((prev) => ({
      ...prev,
      [postId]: value,
    }))
  }

  const handleDelete = (postId) => {
    const reason = String(deleteReasons[postId] || '').trim()
    if (!reason) return
    onDeletePost(postId, reason)
  }

  const columns = useMemo(() => [
    {
      key: 'author',
      title: t('admin.author') || 'Tác giả',
      render: (post) => {
        const hasDistinctUsername =
          post.username &&
          post.username !== '--' &&
          !post.author.startsWith('@') &&
          post.author !== post.username

        return (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{post.author || '--'}</span>
            {hasDistinctUsername && (
              <span className="text-xs text-slate-400 dark:text-slate-500">@{post.username}</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'content',
      title: t('admin.content') || 'Nội dung',
      render: (post) => (
        <button
          type="button"
          onClick={() => setSelectedPost(post)}
          className="line-clamp-2 max-w-xs text-left text-slate-900 transition hover:underline hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
        >
          {truncateText(post.content, 80)}
        </button>
      ),
    },
    {
      key: 'createdAt',
      title: t('admin.time') || 'Thời gian',
      render: (post) => formatDisplayDate(post.createdAt, language),
    },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
    {
      key: 'reason',
      title: t('admin.violationReason') || 'Lý do vi phạm',
      render: (post) => (
        <input
          type="text"
          value={deleteReasons[post.id] || ''}
          onChange={(event) => handleChangeReason(post.id, event.target.value)}
          placeholder={t('admin.enterDeletePostReason') || 'Nhập lý do xóa...'}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      ),
    },
    {
      key: 'actions',
      title: t('admin.actions') || 'Hành động',
      render: (post) => (
        <button
          type="button"
          className="flex items-center justify-center cursor-pointer rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
          onClick={() => handleDelete(post.id)}
          disabled={busyPostId === post.id || !String(deleteReasons[post.id] || '').trim()}
          title={t('admin.deletePost') || 'Xóa bài'}
        >
          {busyPostId === post.id ? (
            <FiLoader className="h-4 w-4 animate-spin" />
          ) : (
            <FiTrash2 className="h-4 w-4" />
          )}
        </button>
      ),
    },
  ], [t, language, deleteReasons, busyPostId, handleDelete])

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {t('admin.postsManagement') || 'Quản lý bài viết'}
          </h2>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (t('admin.loading') || 'Đang tải...') : (t('admin.refresh') || 'Tải mới')}
          </button>
        </div>

        {isAdminView && (
          <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/60">
            <label className="relative md:col-span-2">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchDraft}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={t('admin.searchPostPlaceholder') || 'Tìm theo nội dung hoặc tác giả...'}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </label>
            <label className="relative">
              <FiSliders className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={filters.sortBy}
                onChange={(event) => onFiltersChange({ sortBy: event.target.value, page: 1 })}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-10 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={Boolean(filters.filterDeleted)}
                onChange={(event) => onFiltersChange({ filterDeleted: event.target.checked, page: 1 })}
              />
              {t('admin.onlyDeletedPosts') || 'Chỉ bài đã xóa'}
            </label>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <AdminDataTable
          columns={columns}
          rows={posts}
          isLoading={isLoading}
          emptyText={t('admin.noPosts') || 'Không tìm thấy bài viết nào phù hợp.'}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </section>

      <PostDetailModal isOpen={Boolean(selectedPost)} post={selectedPost} onClose={() => setSelectedPost(null)} />
    </>
  )
}

export default PostsModerationPanel
