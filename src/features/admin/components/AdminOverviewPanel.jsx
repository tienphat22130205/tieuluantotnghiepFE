import { useMemo } from 'react'
import { FiMessageCircle, FiRefreshCw, FiUsers } from 'react-icons/fi'
import { HashtagChartCard, TrendChartCard } from './OverviewCharts'
import { usePreferences } from '@/context/PreferencesContext'

const StatCard = ({ label, value, hint, tone = 'slate' }) => {
  const toneClasses = {
    slate: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200',
    blue: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300',
    rose: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300',
  }

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        {hint && <span className="text-xs font-medium opacity-75">{hint}</span>}
      </div>
    </article>
  )
}

const AdminOverviewPanel = ({
  overview,
  userStats,
  isLoading,
  error,
  onRefresh,
}) => {
  const { t } = usePreferences()

  const topPostsColumns = useMemo(() => [
    { key: 'author', title: t('admin.author') || 'Tác giả', render: (post) => post.author || '--' },
    { key: 'content', title: t('admin.content') || 'Nội dung', render: (post) => <span className="line-clamp-2 text-slate-900 dark:text-slate-100">{post.content || '--'}</span> },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
    { key: 'interactions', title: t('admin.interactions') || 'Tương tác', render: (post) => post.interactions ?? 0 },
  ], [t])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin.title') || 'Admin Dashboard'}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('admin.quickOverviewTitle') || 'Tổng quan nhanh các chỉ số quan trọng của hệ thống'}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? (t('admin.loading') || 'Đang tải...') : (t('admin.refresh') || 'Làm mới')}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('admin.totalUsers') || 'Tổng người dùng'} value={userStats.totalUsers} hint={`${t('admin.active') || 'Hoạt động'}: ${userStats.activeUsers}`} tone="blue" />
        <StatCard label={t('admin.totalPosts') || 'Tổng bài viết'} value={overview?.summary?.totalPosts ?? 0} hint={`Likes: ${overview?.summary?.totalLikes ?? 0}`} tone="green" />
        <StatCard label={t('admin.totalComments') || 'Tổng bình luận'} value={overview?.summary?.totalComments ?? 0} hint={`${t('admin.trending') || 'Bài trending'}: ${overview?.meta?.topLimit ?? 0}`} tone="amber" />
        <StatCard label={t('admin.unbanPending') || 'Yêu cầu mở khóa chờ duyệt'} value={userStats.pendingUnbanRequests} hint={`${t('admin.approved') || 'Đã duyệt'}: ${userStats.approvedUnbanRequests}`} tone="rose" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TrendChartCard overview={overview} />
        <HashtagChartCard overview={overview} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <FiUsers /> {t('admin.usersAndStatus') || 'Người dùng & trạng thái'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t('admin.active') || 'Hoạt động'} value={userStats.activeUsers} tone="blue" />
            <StatCard label={t('admin.locked') || 'Đã khóa'} value={userStats.lockedUsers} tone="rose" />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <FiMessageCircle /> {t('admin.quickNotes') || 'Ghi chú nhanh'}
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>• {t('admin.note1') || 'Dashboard này dùng dữ liệu tổng quan từ API thống kê bài viết và dữ liệu quản trị người dùng.'}</p>
            <p>• {t('admin.note2') || 'Các chỉ số hiện tại được tối ưu để load nhanh và hiển thị gọn trong trang admin.'}</p>
            <p>• {t('admin.note3') || 'Hệ thống tối ưu hiển thị trên cả máy tính và thiết bị di động.'}</p>
          </div>
        </article>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
        <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{t('admin.topPosts') || 'Top bài viết'}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr>
                {topPostsColumns.map((column) => (
                  <th key={column.key} className="border-b border-slate-200 px-3 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(overview?.topPosts || []).slice(0, 5).map((row, index) => (
                <tr key={row.id || row._id || index} className="hover:bg-white/70 dark:hover:bg-slate-700/40">
                  {topPostsColumns.map((column) => (
                    <td key={column.key} className="border-b border-slate-100 px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:text-slate-100">
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default AdminOverviewPanel
