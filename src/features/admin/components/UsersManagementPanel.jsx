import { useMemo } from 'react'
import { FiLock, FiUnlock, FiLoader } from 'react-icons/fi'
import { usePreferences } from '@/context/PreferencesContext'

const UsersManagementPanel = ({
  users,
  isLoading,
  error,
  pagination,
  busyUserId,
  onRoleChange,
  onToggleStatus,
  onPageChange,
}) => {
  const { t } = usePreferences()
  const currentPage = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)

  const roleOptions = useMemo(() => [
    { value: 'user', label: t('admin.roleUser') || 'Thành viên' },
    { value: 'moderator', label: t('admin.roleModerator') || 'Kiểm duyệt viên' },
    { value: 'admin', label: t('admin.roleAdmin') || 'Quản trị viên' },
  ], [t])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          {t('admin.usersList') || 'Danh sách người dùng'}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {t('admin.total') || 'Tổng'}: {Number(pagination?.totalItems || users.length || 0)} {t('admin.users') || 'người dùng'}
        </span>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.fullName') || 'Họ tên'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.email') || 'Email'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.role') || 'Vai trò'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.status') || 'Trạng thái'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.lockReason') || 'Lý do khóa'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.lastActive') || 'Lần hoạt động cuối'}
              </th>
              <th className="border-b border-slate-200 px-3 py-2.5 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-400">
                {t('admin.actions') || 'Hành động'}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('admin.loadingUsers') || 'Đang tải danh sách người dùng...'}
                </td>
              </tr>
            )}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t('admin.noUsers') || 'Không có dữ liệu người dùng.'}
                </td>
              </tr>
            )}

            {!isLoading && users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-800 dark:border-slate-800 dark:text-slate-100">{user.fullName}</td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{user.email}</td>
                <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <select
                    value={user.role}
                    onChange={(event) => onRoleChange(user.id, event.target.value)}
                    disabled={busyUserId === user.id}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                    {user.status === 'active' ? (t('admin.statusActive') || 'Đang hoạt động') : (t('admin.statusLocked') || 'Đã khóa')}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {user.status === 'locked' ? (user.lockReason || '--') : '--'}
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">{user.lastActive}</td>
                <td className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <button
                    type="button"
                    className="flex items-center justify-center cursor-pointer rounded-lg p-2 text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: user.status === 'active' ? '#fee2e2' : '#e0f2fe', color: user.status === 'active' ? '#dc2626' : '#0284c7' }}
                    title={user.status === 'active' ? (t('admin.lockAccount') || 'Khóa tài khoản') : (t('admin.unlockAccount') || 'Mở khóa tài khoản')}
                    disabled={busyUserId === user.id}
                    onClick={() => onToggleStatus(user.id)}
                  >
                    {busyUserId === user.id ? (
                      <FiLoader className="h-4 w-4 animate-spin" />
                    ) : user.status === 'active' ? (
                      <FiLock className="h-4 w-4" />
                    ) : (
                      <FiUnlock className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
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
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('admin.nextPage') || 'Trang sau'}
        </button>
      </div>
    </section>
  )
}

export default UsersManagementPanel
