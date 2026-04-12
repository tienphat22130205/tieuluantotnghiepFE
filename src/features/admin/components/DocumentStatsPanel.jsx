import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DocumentStatsPanel = ({ documents }) => {
  const sortedDocuments = [...documents].sort((a, b) => b.views - a.views)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-slate-800">Thống kê tài liệu được xem nhiều nhất</h2>
      </div>

      <div className="mb-2 h-[340px] w-full">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={sortedDocuments} margin={{ top: 10, right: 15, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ee" />
            <XAxis dataKey="title" tick={{ fill: '#667085', fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={68} />
            <YAxis tick={{ fill: '#667085', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="views" radius={[10, 10, 0, 0]} animationDuration={1200} animationEasing="ease-out">
              {sortedDocuments.map((doc) => (
                <Cell key={doc.id} fill={doc.isValid ? '#2f80ed' : '#f2994a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Tài liệu</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Loại</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Lượt xem</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Tính hợp lệ</th>
            </tr>
          </thead>
          <tbody>
            {sortedDocuments.map((doc) => (
              <tr key={doc.id}>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{doc.title}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{doc.category}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{doc.views.toLocaleString('vi-VN')}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${doc.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {doc.isValid ? 'Hợp lệ' : 'Cần kiểm duyệt'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DocumentStatsPanel
