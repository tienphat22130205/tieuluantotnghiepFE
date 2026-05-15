const AdminDataTable = ({
  columns,
  rows,
  isLoading,
  emptyText,
  rowKey,
  pagination,
  onPageChange,
  loadingLabel = 'Đang tải dữ liệu...',
}) => {
  const currentPage = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)
  const hasRows = Array.isArray(rows) && rows.length > 0
  const showOverlay = Boolean(isLoading && hasRows)

  return (
    <>
      <div className="relative overflow-x-auto rounded-xl border border-slate-100 bg-white">
        {showOverlay && (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center border-b border-slate-100 bg-white/80 px-4 py-2 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-500">{loadingLabel}</span>
          </div>
        )}
        <table className={`min-w-[980px] w-full border-collapse transition-opacity duration-200 ${showOverlay ? 'opacity-70' : 'opacity-100'}`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && !hasRows && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-8 text-center text-sm text-slate-500">
                  {loadingLabel}
                </td>
              </tr>
            )}

            {!isLoading && !hasRows && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-8 text-center text-sm text-slate-500">
                  {emptyText}
                </td>
              </tr>
            )}

            {hasRows && rows.map((row, index) => (
              <tr key={rowKey ? rowKey(row, index) : row.id || index} className="transition-colors hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className="border-b border-slate-100 px-2 py-2 text-sm text-slate-900">
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trang trước
        </button>
        <span className="text-xs font-medium text-slate-600">Trang {currentPage}/{totalPages}</span>
        <button
          type="button"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </>
  )
}

export default AdminDataTable
