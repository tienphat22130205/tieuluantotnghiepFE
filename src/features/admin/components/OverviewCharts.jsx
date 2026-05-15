import { memo, useMemo } from 'react'
import Chart from 'react-apexcharts'
import { FiActivity, FiBarChart2 } from 'react-icons/fi'

export const TrendChartCard = memo(({ overview }) => {
  const series = useMemo(() => ([
    { name: 'Bài viết', data: overview?.engagementTrend?.posts || [] },
    { name: 'Likes', data: overview?.engagementTrend?.likes || [] },
    { name: 'Comments', data: overview?.engagementTrend?.comments || [] },
  ]), [overview])

  const options = useMemo(() => ({
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#2563eb', '#ef4444', '#10b981'],
    xaxis: { categories: overview?.engagementTrend?.labels || [] },
    yaxis: { title: { text: 'Số lượng' } },
    tooltip: { theme: 'light' },
    legend: { position: 'top' },
    grid: { borderColor: '#e5e7eb' },
  }), [overview])

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm lg:col-span-2">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
        <FiBarChart2 /> Thống kê tương tác theo thời gian
      </div>
      <Chart type="line" series={series} options={options} height={320} />
    </article>
  )
})

export const HashtagChartCard = memo(({ overview }) => {
  const categories = useMemo(() => overview?.topHashtags?.labels || [], [overview])
  const values = useMemo(() => overview?.topHashtags?.values || [], [overview])

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
        <FiActivity /> Top hashtags
      </div>
      <Chart
        type="bar"
        series={[{ name: 'Lượt dùng', data: values }]}
        options={{
          chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false } },
          plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
          colors: ['#6366f1'],
          xaxis: { categories },
          tooltip: { theme: 'light' },
          grid: { borderColor: '#e5e7eb' },
        }}
        height={320}
      />
    </article>
  )
})
