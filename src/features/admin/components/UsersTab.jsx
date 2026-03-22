const UsersTab = ({ users }) => {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Người dùng nổi bật</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {users.slice(0, 8).map((friend) => (
          <div key={friend._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
            <img
              src={friend.avatar}
              alt={friend.full_name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">{friend.full_name}</p>
              <p className="text-xs text-gray-500">@{friend.username} • {friend.mutualFriends} bạn chung</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default UsersTab
