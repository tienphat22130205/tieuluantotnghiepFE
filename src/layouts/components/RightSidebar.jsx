import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  AiOutlineSearch,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineUserAdd,
  AiOutlineMessage,
} from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import friendService from '@/features/user/services/friendService'
import userService from '@/features/user/services/userService'
import { extractItems } from '@/utils/friendship'

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null
  return {
    ...user,
    _id: user._id || user.id,
    full_name: user.full_name || user.fullName || user.name || '',
    avatar: user.avatar || null,
    username: user.username || '',
  }
}

const RightSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchKeyword, setSearchKeyword] = useState(
    () => new URLSearchParams(location.search).get('q') || ''
  )
  const [friendRequests, setFriendRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingFriends, setIsLoadingFriends] = useState(false)
  const [actingRequestId, setActingRequestId] = useState(null)

  // Sync search keyword with URL
  useEffect(() => {
    setSearchKeyword(new URLSearchParams(location.search).get('q') || '')
  }, [location.search])

  const handleSearchSubmit = () => {
    const trimmed = searchKeyword.trim()
    if (trimmed.length < 2) return

    const params = new URLSearchParams()
    params.set('q', trimmed)
    params.set('page', '1')
    navigate(`/search?${params.toString()}`)
  }

  // Load incoming friend requests
  const loadIncomingRequests = async () => {
    setIsLoadingRequests(true)
    try {
      const response = await friendService.getIncomingRequests()
      const items = extractItems(response)
      const formatted = items.map((item) => {
        const sender = normalizeUser(item.sender || item.from || item.user)
        return {
          _id: item._id || item.id,
          user: sender,
        }
      }).filter((item) => item.user)
      setFriendRequests(formatted.slice(0, 3)) // display top 3 requests
    } catch {
      setFriendRequests([])
    } finally {
      setIsLoadingRequests(false)
    }
  }

  // Load friends list & their presence
  const loadFriendsAndPresence = async () => {
    setIsLoadingFriends(true)
    try {
      const friendsResponse = await friendService.getMyFriends()
      const normalizedFriends = extractItems(friendsResponse)
        .map((item) => normalizeUser(item.user || item.friend || item))
        .filter(Boolean)

      const friendIds = normalizedFriends.map((item) => item._id).filter(Boolean)
      if (friendIds.length > 0) {
        const presenceResponse = await userService.getPresenceByUserIds(friendIds)
        const presenceItems = presenceResponse?.data?.items || presenceResponse?.items || []
        const presenceMap = new Map(
          presenceItems.map((item) => [String(item.userId), Boolean(item.isOnline)])
        )

        const finalFriends = normalizedFriends.map((f) => ({
          ...f,
          isOnline: presenceMap.get(String(f._id)) || false,
        }))

        // Sort: online first, then alphabetical
        finalFriends.sort((a, b) => {
          if (a.isOnline && !b.isOnline) return -1
          if (!a.isOnline && b.isOnline) return 1
          return String(a.full_name).localeCompare(String(b.full_name))
        })

        setFriends(finalFriends)
      } else {
        setFriends([])
      }
    } catch {
      setFriends([])
    } finally {
      setIsLoadingFriends(false)
    }
  }

  useEffect(() => {
    loadIncomingRequests()
    loadFriendsAndPresence()

    // Periodically sync presence every 30s
    const intervalId = setInterval(() => {
      loadFriendsAndPresence()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const handleRespondRequest = async (requestId, action) => {
    setActingRequestId(requestId)
    try {
      await friendService.respondToRequest(requestId, action)
      setFriendRequests((prev) => prev.filter((item) => item._id !== requestId))
      
      if (action === 'accepted') {
        toast.success('Chấp nhận lời mời kết bạn!')
        loadFriendsAndPresence()
      } else {
        toast.success('Đã từ chối lời mời kết bạn.')
      }
      
      // Dispatch events to notify Badge update
      window.dispatchEvent(new Event('friends:incoming-updated'))
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi xử lý yêu cầu.')
    } finally {
      setActingRequestId(null)
    }
  }

  const handleOpenChat = (friend) => {
    window.dispatchEvent(new CustomEvent('chat:open'))
    window.dispatchEvent(
      new CustomEvent('chat:select-friend', { detail: { friendId: friend._id } })
    )
  }

  const trendingTopics = [
    '#HocTap',
    '#FrontEnd',
    '#ReactJS',
    '#TinCongNghe',
    '#Zivo',
  ]

  const handleTopicClick = (topic) => {
    const keyword = topic.replace('#', '')
    const params = new URLSearchParams()
    params.set('q', keyword)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="sticky top-5 space-y-4">
      {/* Search block */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800">
        <label htmlFor="global-search" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
          Tìm kiếm
        </label>
        <div className="flex items-center gap-2">
          <input
            id="global-search"
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearchSubmit()
              }
            }}
            placeholder="Tìm người dùng, bài viết..."
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:focus:border-primary-500"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="rounded-full bg-primary-600 p-2 text-white transition hover:bg-primary-700 cursor-pointer shrink-0"
            aria-label="Tìm kiếm"
          >
            <AiOutlineSearch size={16} />
          </button>
        </div>
      </div>

      {/* Friend Requests (conditional) */}
      {friendRequests.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Lời mời kết bạn</span>
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600 font-extrabold dark:bg-slate-800">
              {friendRequests.length}
            </span>
          </p>
          <div className="mt-3 space-y-3">
            {friendRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar src={req.user.avatar} name={req.user.full_name} size="sm" to={`/profile/${req.user._id}`} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {req.user.full_name}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      @{req.user.username || 'user'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRespondRequest(req._id, 'accepted')}
                    disabled={actingRequestId === req._id}
                    className="rounded-full bg-primary-600 p-1.5 text-white hover:bg-primary-700 disabled:opacity-50 transition cursor-pointer"
                    title="Chấp nhận"
                  >
                    <AiOutlineCheck size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondRequest(req._id, 'declined')}
                    disabled={actingRequestId === req._id}
                    className="rounded-full bg-slate-200 p-1.5 text-slate-700 hover:bg-slate-300 disabled:opacity-50 transition cursor-pointer dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    title="Từ chối"
                  >
                    <AiOutlineClose size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discover Topics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Khám phá xu hướng</p>
        <p className="mt-0.5 text-xs text-slate-400">Theo dõi chủ đề bạn quan tâm.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trendingTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => handleTopicClick(topic)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-primary-500"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Online Contacts list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Liên hệ trực tuyến</p>
        <p className="mt-0.5 text-xs text-slate-400">Click vào bạn bè để nhắn tin nhanh.</p>
        
        {isLoadingFriends && friends.length === 0 ? (
          <div className="mt-3 py-4 text-center text-xs text-slate-400">
            Đang tải danh sách...
          </div>
        ) : friends.length === 0 ? (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-900/50">
            <p className="font-medium">Chưa có bạn bè</p>
            <p className="mt-1 text-[10px] text-slate-400">Hãy kết nối thêm bạn bè để trò chuyện!</p>
          </div>
        ) : (
          <div className="mt-3 max-h-[300px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {friends.map((friend) => (
              <button
                key={friend._id}
                type="button"
                onClick={() => handleOpenChat(friend)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src={friend.avatar}
                    name={friend.full_name}
                    size="sm"
                    online={friend.isOnline}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-primary-600 transition dark:text-slate-300">
                      {friend.full_name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {friend.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </p>
                  </div>
                </div>
                <span className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-primary-500 transition shrink-0 pr-1">
                  <AiOutlineMessage size={14} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RightSidebar
