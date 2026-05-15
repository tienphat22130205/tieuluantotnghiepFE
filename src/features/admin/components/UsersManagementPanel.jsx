import { FiLock, FiUnlock, FiLoader } from 'react-icons/fi'

const roleOptions = [
  { value: 'user', label: 'Thành viên' },
  { value: 'moderator', label: 'Kiểm duyệt viên' },
  { value: 'admin', label: 'Quản trị viên' },
]

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
  const currentPage = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-800">Danh sách người dùng</h2>
        <span className="text-xs text-slate-500">
          Tổng: {Number(pagination?.totalItems || users.length || 0)} người dùng
        </span>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Họ tên</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Email</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Vai trò</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Trạng thái</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Lý do khóa</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Lần hoạt động cuối</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-sm text-slate-500">
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            )}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-sm text-slate-500">
                  Không có dữ liệu người dùng.
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{user.fullName}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{user.email}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <select
                    value={user.role}
                    onChange={(event) => onRoleChange(user.id, event.target.value)}
                    disabled={busyUserId === user.id}
                    className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm text-slate-700">
                  {user.status === 'locked' ? (user.lockReason || '--') : '--'}
                </td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{user.lastActive}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <button
                    type="button"
                    className="flex items-center justify-center cursor-pointer rounded-lg p-2 text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: user.status === 'active' ? '#fee2e2' : '#e0f2fe', color: user.status === 'active' ? '#dc2626' : '#0284c7' }}
                    title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
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
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trang trước
        </button>
        <span className="text-xs font-medium text-slate-600">Trang {currentPage}/{totalPages}</span>
        <button
          type="button"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </section>
  )
}

export default UsersManagementPanel
