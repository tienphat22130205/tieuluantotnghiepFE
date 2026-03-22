import { useMemo, useState } from 'react'
import { AiOutlineStop, AiOutlineCheck, AiOutlineSearch, AiOutlineClose } from 'react-icons/ai'

const UserManagement = ({ users }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [dialogType, setDialogType] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [bannedUserIds, setBannedUserIds] = useState(new Set())

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter((user) => {
      return (
        user.full_name?.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q)
      )
    })
  }, [users, searchQuery])

  const pagedUsers = useMemo(() => {
    const start = page * rowsPerPage
    return filteredUsers.slice(start, start + rowsPerPage)
  }, [filteredUsers, page, rowsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))

  const openBanDialog = (user) => {
    setSelectedUser(user)
    setDialogType('ban')
  }

  const openUnbanDialog = (user) => {
    setSelectedUser(user)
    setDialogType('unban')
  }

  const closeDialog = () => {
    setSelectedUser(null)
    setDialogType(null)
    setBanReason('')
  }

  const handleBanUser = () => {
    if (!selectedUser || !banReason.trim()) return
    setBannedUserIds((prev) => new Set(prev).add(selectedUser._id))
    closeDialog()
  }

  const handleUnbanUser = () => {
    if (!selectedUser) return
    setBannedUserIds((prev) => {
      const next = new Set(prev)
      next.delete(selectedUser._id)
      return next
    })
    closeDialog()
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
          <AiOutlineSearch className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search by name or username"
            className="w-64 max-w-full bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Username</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pagedUsers.map((user) => {
              const isBanned = bannedUserIds.has(user._id)
              return (
                <tr key={user._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.full_name} className="h-9 w-9 rounded-full object-cover" />
                      <span className="text-sm font-medium text-gray-800">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">@{user.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isBanned
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isBanned ? (
                      <button
                        onClick={() => openUnbanDialog(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        <AiOutlineCheck />
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => openBanDialog(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <AiOutlineStop />
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {pagedUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <p className="text-sm text-gray-500">
          Page {page + 1} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setPage(0)
            }}
            className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {dialogType && selectedUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {dialogType === 'ban' ? 'Ban User' : 'Unban User'}
              </h3>
              <button onClick={closeDialog} className="text-gray-400 hover:text-gray-600">
                <AiOutlineClose size={18} />
              </button>
            </div>

            {dialogType === 'ban' ? (
              <>
                <p className="text-sm text-gray-600">
                  Are you sure you want to ban <span className="font-semibold">{selectedUser.full_name}</span>?
                </p>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban"
                  className="mt-3 min-h-24 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-primary-500"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={closeDialog} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">Cancel</button>
                  <button
                    onClick={handleBanUser}
                    disabled={!banReason.trim()}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Ban User
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Are you sure you want to unban <span className="font-semibold">{selectedUser.full_name}</span>?
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={closeDialog} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">Cancel</button>
                  <button
                    onClick={handleUnbanUser}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Unban User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default UserManagement
