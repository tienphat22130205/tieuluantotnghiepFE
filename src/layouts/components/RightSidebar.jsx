import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineMessage,
} from 'react-icons/ai'
import { FiPhone, FiVideo } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'
import friendService from '@/features/user/services/friendService'
import userService from '@/features/user/services/userService'
import { extractItems } from '@/utils/friendship'
import { StoriesBar } from '@/features/story'
import { useCallStore } from '@/features/chat/store/useCallStore'
import { useAuth } from '@/features/auth'
import { getSocket } from '@/services/socketClient'

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null
  const computedName =
    user.full_name ||
    user.fullName ||
    user.name ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    user.username ||
    'Người dùng'

  return {
    ...user,
    _id: user._id || user.id,
    full_name: computedName,
    avatar: user.avatar || null,
    username: user.username || '',
  }
}

const RightSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const makeCall = useCallStore((state) => state.makeCall)
  const { t } = usePreferences()

  const [friendRequests, setFriendRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingFriends, setIsLoadingFriends] = useState(false)
  const [actingRequestId, setActingRequestId] = useState(null)

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
      setFriendRequests(formatted.slice(0, 3))
    } catch {
      setFriendRequests([])
    } finally {
      setIsLoadingRequests(false)
    }
  }

  // Load friends list & presence
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

  const { token } = useAuth()

  useEffect(() => {
    loadIncomingRequests()
    loadFriendsAndPresence()

    // Real-time socket listener for presence updates (0-second delay)
    if (token) {
      const socket = getSocket(token)
      if (socket) {
        const handlePresenceUpdate = (payload) => {
          const targetUserId = String(payload?.userId || payload?.data?.userId || '')
          if (!targetUserId) return
          const isOnline = Boolean(payload?.isOnline ?? payload?.data?.isOnline)

          setFriends((prevFriends) =>
            prevFriends.map((friend) => {
              if (String(friend._id || friend.id) === targetUserId) {
                return { ...friend, isOnline }
              }
              return friend
            })
          )
        }

        socket.on('presence:update', handlePresenceUpdate)

        return () => {
          socket.off('presence:update', handlePresenceUpdate)
        }
      }
    }

    // Fallback interval check every 30s
    const intervalId = setInterval(() => {
      loadFriendsAndPresence()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [token])

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
      new CustomEvent('chat:select-friend', { detail: { friendId: friend._id || friend.id, friend } })
    )
  }

  const onlineFriends = useMemo(() => friends.filter((f) => f.isOnline), [friends])
  const offlineFriends = useMemo(() => friends.filter((f) => !f.isOnline), [friends])

  return (
    <div className="sticky top-16 space-y-4">
      {/* 1. Stories Section moved to top of RightSidebar */}
      <StoriesBar />

      {/* 2. Friend Requests (conditional) */}
      {friendRequests.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>{t('sidebar.friendRequests')}</span>
            <span className="rounded-full bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 text-xs text-primary-600 dark:text-primary-400 font-extrabold">
              {friendRequests.length}
            </span>
          </p>
          <div className="mt-3 space-y-2.5">
            {friendRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar src={req.user.avatar} name={req.user.full_name} size="sm" to={`/profile/${req.user._id}`} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {req.user.full_name}
                    </p>
                    <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
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
                    title={t('sidebar.accept')}
                  >
                    <AiOutlineCheck size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondRequest(req._id, 'declined')}
                    disabled={actingRequestId === req._id}
                    className="rounded-full bg-slate-200 dark:bg-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition cursor-pointer"
                    title={t('sidebar.decline')}
                  >
                    <AiOutlineClose size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Grouped Chat Contacts List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {t('sidebar.contacts')}
          </h3>
          <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
            {onlineFriends.length} {t('sidebar.onlineCount')}
          </span>
        </div>

        {isLoadingFriends && friends.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Đang tải danh sách...
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center text-xs text-slate-500 dark:text-slate-400">
            <p className="font-medium">{t('sidebar.noFriends')}</p>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{t('sidebar.noFriendsSub')}</p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {/* ONLINE SECTION */}
            {onlineFriends.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('sidebar.activeNow')} ({onlineFriends.length})
                </p>
                <div className="space-y-1">
                  {onlineFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between gap-2 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 group"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenChat(friend)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <Avatar
                          src={friend.avatar}
                          name={friend.full_name}
                          size="sm"
                          online={true}
                        />
                        <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                          {friend.full_name}
                        </span>
                      </button>

                      {/* Quick Call Action Icons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => makeCall(friend._id, false)}
                          title="Gọi thoại"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-xs transition cursor-pointer"
                        >
                          <FiPhone size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => makeCall(friend._id, true)}
                          title="Gọi Video"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-xs transition cursor-pointer"
                        >
                          <FiVideo size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OFFLINE SECTION */}
            {offlineFriends.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  {t('sidebar.offline')} ({offlineFriends.length})
                </p>
                <div className="space-y-1">
                  {offlineFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between gap-2 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 group"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenChat(friend)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <Avatar
                          src={friend.avatar}
                          name={friend.full_name}
                          size="sm"
                          online={false}
                        />
                        <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                          {friend.full_name}
                        </span>
                      </button>

                      {/* Quick Call Action Icons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => makeCall(friend._id, false)}
                          title="Gọi thoại"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-xs transition cursor-pointer"
                        >
                          <FiPhone size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => makeCall(friend._id, true)}
                          title="Gọi Video"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-xs transition cursor-pointer"
                        >
                          <FiVideo size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RightSidebar
