import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import { FiBarChart2, FiTrendingUp, FiPieChart, FiZap } from 'react-icons/fi'
import AdminDataTable from './AdminDataTable'

const rangeOptions = [
  { value: '90d', label: '90 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '7d', label: '7 ngày' },
]

const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

const DocumentStatsPanel = ({
  stats,
  trending,
  statsFilters,
  trendingFilters,
  isLoading,
  error,
  onRefresh,
  onStatsFiltersChange,
  onTrendingFiltersChange,
}) => {
  const postsOverTimeChart = useMemo(() => {
    const labels = stats?.engagementTrend?.labels || []
    const data = stats?.engagementTrend?.posts || []

    return {
      series: [{ name: 'Bài viết', data: data.map(safeNumber) }],
      options: {
        chart: { type: 'line', toolbar: { show: true }, animations: { enabled: true } },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#ef4444'],
        xaxis: { categories: labels },
        yaxis: { title: { text: 'Số bài viết' } },
        tooltip: { theme: 'light' },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0 } },
      },
    }
  }, [stats])

  const postTypesChart = useMemo(() => {
    const labels = stats?.postTypes?.labels || []
    const values = stats?.postTypes?.values || []

    return {
      series: values.map(safeNumber),
      options: {
        chart: { type: 'pie', animations: { enabled: true } },
        labels,
        colors: ['#60a5fa', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6'],
        tooltip: { theme: 'light' },
        legend: { position: 'right' },
      },
    }
  }, [stats])

  const topHashtagsChart = useMemo(() => {
    const labels = stats?.topHashtags?.labels || []
    const values = stats?.topHashtags?.values || []

    return {
      series: [{ name: 'Lần sử dụng', data: values.map(safeNumber) }],
      options: {
        chart: { type: 'bar', toolbar: { show: true }, animations: { enabled: true } },
        colors: ['#3b82f6'],
        xaxis: { categories: labels },
        yaxis: { title: { text: 'Số lần sử dụng' } },
        tooltip: { theme: 'light' },
        plotOptions: { bar: { horizontal: false, columnWidth: '70%' } },
      },
    }
  }, [stats])

  const engagementTrendChart = useMemo(() => {
    const labels = stats?.engagementTrend?.labels || []
    const likes = stats?.engagementTrend?.likes || []
    const comments = stats?.engagementTrend?.comments || []

    return {
      series: [
        { name: 'Likes', data: likes.map(safeNumber) },
        { name: 'Comments', data: comments.map(safeNumber) },
      ],
      options: {
        chart: { type: 'line', toolbar: { show: true }, animations: { enabled: true } },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#ef4444', '#059669'],
        xaxis: { categories: labels },
        yaxis: { title: { text: 'Tương tác' } },
        tooltip: { theme: 'light' },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0 } },
      },
    }
  }, [stats])

  const topPostsColumns = [
    { key: 'author', title: 'Tác giả', render: (post) => post.author || '--' },
    { key: 'content', title: 'Nội dung', render: (post) => <span className="line-clamp-2">{post.content || '--'}</span> },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
    { key: 'interactions', title: 'Interactions', render: (post) => post.interactions ?? 0 },
  ]

  const trendingColumns = [
    { key: 'author', title: 'Tác giả', render: (post) => post.author || '--' },
    { key: 'content', title: 'Nội dung', render: (post) => <span className="line-clamp-2">{post.content || '--'}</span> },
    { key: 'engagementScore', title: 'Engagement Score', render: (post) => post.engagementScore ?? 0 },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
  ]


  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800"><FiBarChart2 size={24} /> Thống kê bài viết & Analytics</h2>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Đang tải...' : 'Tải mới'}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <select
          value={statsFilters.timeRange}
          onChange={(event) => onStatsFiltersChange({ timeRange: event.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {rangeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          value={statsFilters.topLimit || 5}
          onChange={(event) => onStatsFiltersChange({ topLimit: Number(event.target.value || 5) })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {[5, 10, 20].map((option) => (
            <option key={option} value={option}>{`Top ${option}`}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><FiTrendingUp size={18} /> Posts Over Time</h3>
          {postsOverTimeChart ? (
            <Chart type="line" series={postsOverTimeChart.series} options={postsOverTimeChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">Đang tải...</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><FiPieChart size={18} /> Post Types Distribution</h3>
          {postTypesChart ? (
            <Chart type="pie" series={postTypesChart.series} options={postTypesChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">Đang tải...</div>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><FiZap size={18} className="text-orange-500" /> Top Hashtags</h3>
          {topHashtagsChart ? (
            <Chart type="bar" series={topHashtagsChart.series} options={topHashtagsChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">Đang tải...</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><FiTrendingUp size={18} className="text-red-500" /> Engagement Trend</h3>
          {engagementTrendChart ? (
            <Chart type="line" series={engagementTrendChart.series} options={engagementTrendChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">Đang tải...</div>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Tổng bài viết</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{stats?.summary?.totalPosts ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Tổng lượt thích</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{stats?.summary?.totalLikes ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Tổng bình luận</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{stats?.summary?.totalComments ?? 0}</p>
        </div>
      </div>

      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600"><FiBarChart2 size={16} /> Top Posts theo thống kê</h3>
      <AdminDataTable
        columns={topPostsColumns}
        rows={stats?.topPosts || []}
        isLoading={isLoading}
        emptyText="Không có dữ liệu thống kê."
        pagination={{ page: 1, totalPages: 1 }}
      />

      <div className="mt-6 mb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600"><FiZap size={16} className="text-orange-500" /> Trending Posts</h3>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="number"
          min={1}
          max={168}
          value={trendingFilters.hoursBack}
          onChange={(event) => onTrendingFiltersChange({ hoursBack: Number(event.target.value || 24) })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Số giờ gần đây"
        />
        <input
          type="number"
          min={1}
          max={500}
          value={trendingFilters.limit}
          onChange={(event) => onTrendingFiltersChange({ limit: Number(event.target.value || 10) })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Giới hạn"
        />
      </div>

      <AdminDataTable
        columns={trendingColumns}
        rows={trending?.items || []}
        isLoading={isLoading}
        emptyText="Không có bài viết trending."
        pagination={{ page: 1, totalPages: 1 }}
      />
    </section>
  )
}

export default DocumentStatsPanel
