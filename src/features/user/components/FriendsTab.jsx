import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineTeam, AiOutlineSearch, AiOutlineMessage } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'

/**
 * FriendsTab – Nội dung tab "Bạn bè" chi tiết với ô tìm kiếm nhanh và card bạn bè phong cách hiện đại.
 */
const FriendsTab = ({ friendCount = 0, friends = [] }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedFriends = useMemo(() => {
    return (friends || []).filter((friend) => friend && typeof friend === 'object')
  }, [friends])

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return normalizedFriends
    const lower = searchTerm.toLowerCase().trim()
    return normalizedFriends.filter((f) => {
      const name = (f.full_name || f.fullName || '').toLowerCase()
      const username = (f.username || '').toLowerCase()
      return name.includes(lower) || username.includes(lower)
    })
  }, [normalizedFriends, searchTerm])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <AiOutlineTeam size={22} className="text-blue-500" />
            Danh sách bạn bè
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {friendCount} người bạn
          </p>
        </div>

        {/* Search input inside Friends tab */}
        <div className="relative w-full sm:w-64">
          <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bạn bè..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Friends Grid */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredFriends.map((friend) => {
            const avatarUrl = resolveMediaUrl(friend.avatar)
            const displayName = friend.full_name || friend.fullName || friend.username || 'Người dùng'
            const friendId = friend._id || friend.id
            const friendIdentifier = friend.username ? String(friend.username).replace(/^@/, '') : friendId

            return (
              <div
                key={friendId}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-blue-100 dark:hover:border-slate-700 transition-all duration-200"
              >
                <Link to={`/profile/${friendIdentifier}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-xs">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-indigo-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-base">
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {displayName}
                    </p>
                    {friend.username && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{friend.username}
                      </p>
                    )}
                    {friend.mutualFriends > 0 && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {friend.mutualFriends} bạn chung
                      </p>
                    )}
                  </div>
                </Link>

                <Link
                  to={`/chat?userId=${friendId}`}
                  title="Nhắn tin"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition shrink-0 cursor-pointer shadow-xs"
                >
                  <AiOutlineMessage size={18} />
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-14 px-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 mb-3 shadow-xs">
            <AiOutlineTeam size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            {searchTerm ? 'Không tìm thấy bạn bè phù hợp' : 'Chưa có người bạn nào'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {searchTerm
              ? `Không có kết quả nào khớp với "${searchTerm}". Hãy thử tìm kiếm bằng từ khóa khác.`
              : 'Hãy kết nối với bạn bè xung quanh để cùng chia sẻ những khoảnh khắc thú vị!'}
          </p>
        </div>
      )}
    </div>
  )
}

export default FriendsTab
