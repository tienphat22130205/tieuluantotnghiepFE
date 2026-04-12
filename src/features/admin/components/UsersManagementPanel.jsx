const roleOptions = [
  { value: 'member', label: 'Thành viên' },
  { value: 'moderator', label: 'Kiểm duyệt viên' },
  { value: 'admin', label: 'Quản trị viên' },
]

const UsersManagementPanel = ({ users, onRoleChange, onToggleStatus }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-slate-800">Danh sách người dùng</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Họ tên</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Email</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Vai trò</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Trạng thái</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Lần hoạt động cuối</th>
              <th className="border-b border-slate-200 px-2 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{user.fullName}</td>
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{user.email}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <select
                    value={user.role}
                    onChange={(event) => onRoleChange(user.id, event.target.value)}
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
                <td className="border-b border-slate-100 px-2 py-2 text-sm">{user.lastActive}</td>
                <td className="border-b border-slate-100 px-2 py-2">
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5"
                    onClick={() => onToggleStatus(user.id)}
                  >
                    {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default UsersManagementPanel
