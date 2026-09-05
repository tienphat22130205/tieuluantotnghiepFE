import { usePreferences } from '@/context/PreferencesContext'

const AdminDataTable = ({
  columns,
  rows,
  isLoading,
  emptyText,
  rowKey,
  pagination,
  onPageChange,
  loadingLabel,
}) => {
  const { t } = usePreferences()
  const currentPage = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)
  const hasRows = Array.isArray(rows) && rows.length > 0
  const showOverlay = Boolean(isLoading && hasRows)

  const resolvedLoadingLabel = loadingLabel || t('admin.loadingData') || 'Đang tải dữ liệu...'
  const resolvedEmptyText = emptyText || t('admin.noData') || 'Không có dữ liệu.'

  return (
    <>
      <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {showOverlay && (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center border-b border-slate-100 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{resolvedLoadingLabel}</span>
          </div>
        )}
        <table className={`min-w-[980px] w-full border-collapse transition-opacity duration-200 ${showOverlay ? 'opacity-70' : 'opacity-100'}`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-400"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && !hasRows && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {resolvedLoadingLabel}
                </td>
              </tr>
            )}

            {!isLoading && !hasRows && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {resolvedEmptyText}
                </td>
              </tr>
            )}

            {hasRows && rows.map((row, index) => (
              <tr key={rowKey ? rowKey(row, index) : row.id || index} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/60">
                {columns.map((column) => (
                  <td key={column.key} className="border-b border-slate-100 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-800/80 dark:text-slate-100">
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
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('admin.prevPage') || 'Trang trước'}
        </button>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {t('admin.page') || 'Trang'} {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('admin.nextPage') || 'Trang sau'}
        </button>
      </div>
    </>
  )
}

export default AdminDataTable
