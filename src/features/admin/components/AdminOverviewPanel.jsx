import { useMemo } from 'react'
import { FiMessageCircle, FiRefreshCw, FiUsers } from 'react-icons/fi'
import { HashtagChartCard, TrendChartCard } from './OverviewCharts'

const StatCard = ({ label, value, hint, tone = 'slate' }) => {
  const toneClasses = {
    slate: 'border-slate-200 bg-slate-50 text-slate-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    rose: 'border-rose-200 bg-rose-50 text-rose-800',
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

  const topPostsColumns = useMemo(() => [
    { key: 'author', title: 'Tác giả', render: (post) => post.author || '--' },
    { key: 'content', title: 'Nội dung', render: (post) => <span className="line-clamp-2 text-slate-900">{post.content || '--'}</span> },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
    { key: 'interactions', title: 'Tương tác', render: (post) => post.interactions ?? 0 },
  ], [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Tổng quan nhanh các chỉ số quan trọng của hệ thống</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng người dùng" value={userStats.totalUsers} hint={`Hoạt động: ${userStats.activeUsers}`} tone="blue" />
        <StatCard label="Tổng bài viết" value={overview?.summary?.totalPosts ?? 0} hint={`Likes: ${overview?.summary?.totalLikes ?? 0}`} tone="green" />
        <StatCard label="Tổng bình luận" value={overview?.summary?.totalComments ?? 0} hint={`Bài trending: ${overview?.meta?.topLimit ?? 0}`} tone="amber" />
        <StatCard label="Yêu cầu mở khóa chờ duyệt" value={userStats.pendingUnbanRequests} hint={`Đã duyệt: ${userStats.approvedUnbanRequests}`} tone="rose" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <TrendChartCard overview={overview} />
        <HashtagChartCard overview={overview} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
            <FiUsers /> Người dùng & trạng thái
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Hoạt động" value={userStats.activeUsers} tone="blue" />
            <StatCard label="Đã khóa" value={userStats.lockedUsers} tone="rose" />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
            <FiMessageCircle /> Ghi chú nhanh
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p>• Dashboard này dùng dữ liệu tổng quan từ API thống kê bài viết và dữ liệu quản trị người dùng.</p>
            <p>• Có thể mở rộng thêm biểu đồ theo thời gian cho users, comments, unban requests nếu backend bổ sung API.</p>
            <p>• Các chỉ số hiện tại được tối ưu để load nhanh và hiển thị gọn trong trang admin.</p>
          </div>
        </article>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Top bài viết</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr>
                {topPostsColumns.map((column) => (
                  <th key={column.key} className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(overview?.topPosts || []).slice(0, 5).map((row, index) => (
                <tr key={row.id || row._id || index} className="hover:bg-white/70">
                  {topPostsColumns.map((column) => (
                    <td key={column.key} className="border-b border-slate-100 px-2 py-2 text-sm text-slate-900">
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
