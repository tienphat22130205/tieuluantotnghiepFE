import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import { FiBarChart2, FiTrendingUp, FiPieChart, FiZap } from 'react-icons/fi'
import AdminDataTable from './AdminDataTable'
import { usePreferences } from '@/context/PreferencesContext'

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
  const { isDarkMode, t } = usePreferences()

  const rangeOptions = useMemo(() => [
    { value: '90d', label: t('admin.range90d') || '90 ngày' },
    { value: '30d', label: t('admin.range30d') || '30 ngày' },
    { value: '7d', label: t('admin.range7d') || '7 ngày' },
  ], [t])

  const axisTextColor = isDarkMode ? '#94a3b8' : '#64748b'
  const gridBorderColor = isDarkMode ? '#334155' : '#f1f5f9'
  const tooltipTheme = isDarkMode ? 'dark' : 'light'

  const postsOverTimeChart = useMemo(() => {
    const labels = stats?.engagementTrend?.labels || []
    const data = stats?.engagementTrend?.posts || []

    return {
      series: [{ name: t('admin.post') || 'Bài viết', data: data.map(safeNumber) }],
      options: {
        chart: { type: 'line', toolbar: { show: true }, animations: { enabled: true }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#ef4444'],
        xaxis: { categories: labels, labels: { style: { colors: axisTextColor } } },
        yaxis: { title: { text: t('admin.postsCount') || 'Số bài viết', style: { color: axisTextColor } }, labels: { style: { colors: axisTextColor } } },
        grid: { borderColor: gridBorderColor },
        tooltip: { theme: tooltipTheme },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0 } },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
      },
    }
  }, [stats, axisTextColor, gridBorderColor, tooltipTheme, isDarkMode, t])

  const postTypesChart = useMemo(() => {
    const labels = stats?.postTypes?.labels || []
    const values = stats?.postTypes?.values || []

    return {
      series: values.map(safeNumber),
      options: {
        chart: { type: 'pie', animations: { enabled: true }, background: 'transparent' },
        labels,
        colors: ['#60a5fa', '#34d399', '#f59e0b', '#ef4444', '#8b5cf6'],
        tooltip: { theme: tooltipTheme },
        legend: { position: 'right', labels: { colors: axisTextColor } },
        stroke: { colors: [isDarkMode ? '#1e293b' : '#fff'] },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
      },
    }
  }, [stats, tooltipTheme, axisTextColor, isDarkMode])

  const topHashtagsChart = useMemo(() => {
    const labels = stats?.topHashtags?.labels || []
    const values = stats?.topHashtags?.values || []

    return {
      series: [{ name: t('admin.timesUsed') || 'Lần sử dụng', data: values.map(safeNumber) }],
      options: {
        chart: { type: 'bar', toolbar: { show: true }, animations: { enabled: true }, background: 'transparent' },
        colors: ['#3b82f6'],
        xaxis: { categories: labels, labels: { style: { colors: axisTextColor } } },
        yaxis: { title: { text: t('admin.usageCount') || 'Số lần sử dụng', style: { color: axisTextColor } }, labels: { style: { colors: axisTextColor } } },
        grid: { borderColor: gridBorderColor },
        tooltip: { theme: tooltipTheme },
        plotOptions: { bar: { horizontal: false, columnWidth: '70%' } },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
      },
    }
  }, [stats, axisTextColor, gridBorderColor, tooltipTheme, isDarkMode, t])

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
        chart: { type: 'line', toolbar: { show: true }, animations: { enabled: true }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#ef4444', '#059669'],
        xaxis: { categories: labels, labels: { style: { colors: axisTextColor } } },
        yaxis: { title: { text: t('admin.interactions') || 'Tương tác', style: { color: axisTextColor } }, labels: { style: { colors: axisTextColor } } },
        grid: { borderColor: gridBorderColor },
        tooltip: { theme: tooltipTheme },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0 } },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
      },
    }
  }, [stats, axisTextColor, gridBorderColor, tooltipTheme, isDarkMode, t])

  const topPostsColumns = useMemo(() => [
    { key: 'author', title: t('admin.author') || 'Tác giả', render: (post) => post.author || '--' },
    { key: 'content', title: t('admin.content') || 'Nội dung', render: (post) => <span className="line-clamp-2">{post.content || '--'}</span> },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
    { key: 'interactions', title: t('admin.interactions') || 'Interactions', render: (post) => post.interactions ?? 0 },
  ], [t])

  const trendingColumns = useMemo(() => [
    { key: 'author', title: t('admin.author') || 'Tác giả', render: (post) => post.author || '--' },
    { key: 'content', title: t('admin.content') || 'Nội dung', render: (post) => <span className="line-clamp-2">{post.content || '--'}</span> },
    { key: 'engagementScore', title: t('admin.engagementScore') || 'Engagement Score', render: (post) => post.engagementScore ?? 0 },
    { key: 'likes', title: 'Likes', render: (post) => post.likes ?? 0 },
    { key: 'comments', title: 'Comments', render: (post) => post.comments ?? 0 },
  ], [t])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          <FiBarChart2 size={24} /> {t('admin.statsAndAnalytics') || 'Thống kê bài viết & Analytics'}
        </h2>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (t('admin.loading') || 'Đang tải...') : (t('admin.refresh') || 'Tải mới')}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <select
          value={statsFilters.timeRange}
          onChange={(event) => onStatsFiltersChange({ timeRange: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
        >
          {rangeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          value={statsFilters.topLimit || 5}
          onChange={(event) => onStatsFiltersChange({ topLimit: Number(event.target.value || 5) })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
        >
          {[5, 10, 20].map((option) => (
            <option key={option} value={option}>{`Top ${option}`}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <FiTrendingUp size={18} /> {t('admin.postsOverTime') || 'Posts Over Time'}
          </h3>
          {postsOverTimeChart ? (
            <Chart type="line" series={postsOverTimeChart.series} options={postsOverTimeChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">{t('admin.loading') || 'Đang tải...'}</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <FiPieChart size={18} /> {t('admin.postTypesDistribution') || 'Post Types Distribution'}
          </h3>
          {postTypesChart ? (
            <Chart type="pie" series={postTypesChart.series} options={postTypesChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">{t('admin.loading') || 'Đang tải...'}</div>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <FiZap size={18} className="text-orange-500" /> {t('admin.topHashtags') || 'Top Hashtags'}
          </h3>
          {topHashtagsChart ? (
            <Chart type="bar" series={topHashtagsChart.series} options={topHashtagsChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">{t('admin.loading') || 'Đang tải...'}</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <FiTrendingUp size={18} className="text-red-500" /> {t('admin.engagementTrend') || 'Engagement Trend'}
          </h3>
          {engagementTrendChart ? (
            <Chart type="line" series={engagementTrendChart.series} options={engagementTrendChart.options} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">{t('admin.loading') || 'Đang tải...'}</div>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.totalPosts') || 'Tổng bài viết'}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">{stats?.summary?.totalPosts ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.totalLikes') || 'Tổng lượt thích'}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">{stats?.summary?.totalLikes ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.totalComments') || 'Tổng bình luận'}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">{stats?.summary?.totalComments ?? 0}</p>
        </div>
      </div>

      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        <FiBarChart2 size={16} /> {t('admin.topPostsStats') || 'Top Posts theo thống kê'}
      </h3>
      <AdminDataTable
        columns={topPostsColumns}
        rows={stats?.topPosts || []}
        isLoading={isLoading}
        emptyText={t('admin.noStatsData') || 'Không có dữ liệu thống kê.'}
        pagination={{ page: 1, totalPages: 1 }}
      />

      <div className="mt-6 mb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          <FiZap size={16} className="text-orange-500" /> {t('admin.trendingPosts') || 'Trending Posts'}
        </h3>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="number"
          min={1}
          max={168}
          value={trendingFilters.hoursBack}
          onChange={(event) => onTrendingFiltersChange({ hoursBack: Number(event.target.value || 24) })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
          placeholder={t('admin.hoursBackPlaceholder') || 'Số giờ gần đây'}
        />
        <input
          type="number"
          min={1}
          max={500}
          value={trendingFilters.limit}
          onChange={(event) => onTrendingFiltersChange({ limit: Number(event.target.value || 10) })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
          placeholder={t('admin.limitPlaceholder') || 'Giới hạn'}
        />
      </div>

      <AdminDataTable
        columns={trendingColumns}
        rows={trending?.items || []}
        isLoading={isLoading}
        emptyText={t('admin.noTrendingData') || 'Không có bài viết trending.'}
        pagination={{ page: 1, totalPages: 1 }}
      />
    </section>
  )
}

export default DocumentStatsPanel
