import { memo, useMemo } from 'react'
import Chart from 'react-apexcharts'
import { FiActivity, FiBarChart2 } from 'react-icons/fi'
import { usePreferences } from '@/context/PreferencesContext'

export const TrendChartCard = memo(({ overview }) => {
  const { isDarkMode, t } = usePreferences()
  const series = useMemo(() => ([
    { name: t('admin.post') || 'Bài viết', data: overview?.engagementTrend?.posts || [] },
    { name: 'Likes', data: overview?.engagementTrend?.likes || [] },
    { name: 'Comments', data: overview?.engagementTrend?.comments || [] },
  ]), [overview, t])

  const options = useMemo(() => ({
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#2563eb', '#ef4444', '#10b981'],
    xaxis: {
      categories: overview?.engagementTrend?.labels || [],
      labels: { style: { colors: isDarkMode ? '#94a3b8' : '#64748b' } },
    },
    yaxis: {
      title: { text: t('admin.quantity') || 'Số lượng', style: { color: isDarkMode ? '#94a3b8' : '#64748b' } },
      labels: { style: { colors: isDarkMode ? '#94a3b8' : '#64748b' } },
    },
    tooltip: { theme: isDarkMode ? 'dark' : 'light' },
    legend: { position: 'top', labels: { colors: isDarkMode ? '#cbd5e1' : '#334155' } },
    grid: { borderColor: isDarkMode ? '#334155' : '#e5e7eb' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
  }), [overview, isDarkMode, t])

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <FiBarChart2 /> {t('admin.engagementTrendChart') || 'Thống kê tương tác theo thời gian'}
      </div>
      <Chart type="line" series={series} options={options} height={320} />
    </article>
  )
})

export const HashtagChartCard = memo(({ overview }) => {
  const { isDarkMode, t } = usePreferences()
  const categories = useMemo(() => overview?.topHashtags?.labels || [], [overview])
  const values = useMemo(() => overview?.topHashtags?.values || [], [overview])

  const options = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
    colors: ['#6366f1'],
    xaxis: {
      categories,
      labels: { style: { colors: isDarkMode ? '#94a3b8' : '#64748b' } },
    },
    yaxis: {
      labels: { style: { colors: isDarkMode ? '#94a3b8' : '#64748b' } },
    },
    tooltip: { theme: isDarkMode ? 'dark' : 'light' },
    grid: { borderColor: isDarkMode ? '#334155' : '#e5e7eb' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
  }), [categories, isDarkMode])

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <FiActivity /> {t('admin.topHashtags') || 'Top hashtags'}
      </div>
      <Chart
        type="bar"
        series={[{ name: t('admin.timesUsed') || 'Lượt dùng', data: values }]}
        options={options}
        height={320}
      />
    </article>
  )
})
