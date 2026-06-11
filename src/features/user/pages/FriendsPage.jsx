import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import userService from '@/features/user/services/userService'
import { getUserId, extractItems } from '@/utils/friendship'
import { AiOutlineRight, AiOutlineSearch, AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import { Button, LoadingSpinner } from '@/components/ui'
import useFriendsPage from '../hooks/useFriendsPage'
import { FRIENDS_PAGE_TEXT } from '@/constants/messages'
import FRIEND_MENU_ITEMS from '../components/friends/friendMenuItems'
import FriendsSection from '../components/friends/FriendsSection'
import FriendRow from '../components/friends/FriendRow'
import FriendRequestCard from '../components/friends/FriendRequestCard'
import SuggestionCard from '../components/friends/SuggestionCard'

const normalizeUsersFromResponse = (response) => {
  const items = extractItems(response)
  return items
    .map((item) => ({
      ...item,
      _id: item?._id || item?.id,
      full_name: item?.full_name || item?.fullName || `${item?.firstName || ''} ${item?.lastName || ''}`.trim(),
      username: item?.username || '',
      avatar: item?.avatar || null,
    }))
    .filter((item) => item?._id)
}

const FriendsPage = () => {
  const [activeMenu, setActiveMenu] = useState('home')
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { user: currentUser } = useSelector((state) => state.auth)
  const currentUserId = getUserId(currentUser)

  const {
    incomingRequests,
    sentRequests,
    friends,
    suggestions,
    isLoading,
    actingRequestId,
    actingFriendId,
    actingSuggestionId,
    handleRespondRequest,
    handleCancelSentRequest,
    handleUnfriend,
    handleSendRequest,
    handleSendRequestFromSuggestion,
  } = useFriendsPage()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const performUserSearch = async () => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) return

    setIsSearching(true)
    setSearchError('')
    setHasSearched(true)

    try {
      const response = await userService.searchUsers({ q: trimmed, page: 1, limit: 20 })
      const normalizedUsers = normalizeUsersFromResponse(response).filter(
        (item) => String(getUserId(item)) !== String(currentUserId)
      )
      setSearchResults(normalizedUsers)
    } catch (err) {
      setSearchResults([])
      setSearchError(err?.message || 'Không thể tìm kiếm tài khoản')
    } finally {
      setIsSearching(false)
    }
  }

  const getRelationship = (userId) => {
    const targetId = String(userId)
    const isFriend = friends.some((f) => String(getUserId(f)) === targetId)
    if (isFriend) return { type: 'friend' }

    const incoming = incomingRequests.find((r) => String(getUserId(r.user)) === targetId)
    if (incoming) return { type: 'incoming', requestId: incoming._id }

    const sent = sentRequests.find((r) => String(getUserId(r.user)) === targetId)
    if (sent) return { type: 'sent', requestId: sent._id }

    return { type: 'none' }
  }

  const homeRequests = useMemo(() => incomingRequests.slice(0, 6), [incomingRequests])
  const homeSuggestions = useMemo(() => suggestions.slice(0, 8), [suggestions])

  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return friends
    const query = friendSearchQuery.toLowerCase()
    return friends.filter((friend) => {
      const name = (friend.full_name || friend.fullName || friend.username || '').toLowerCase()
      return name.includes(query)
    })
  }, [friends, friendSearchQuery])

  const renderMenuContent = () => (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-xl font-bold text-slate-900">Bạn bè</h1>
        <button
          type="button"
          className="lg:hidden p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          <AiOutlineClose size={18} />
        </button>
      </div>
      <nav className="space-y-1">
        {FRIEND_MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeMenu === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveMenu(item.key)
                setIsMenuOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                <span className="text-sm font-semibold">{item.label}</span>
              </span>
              <AiOutlineRight size={14} className={active ? 'text-primary-500' : 'text-slate-400'} />
            </button>
          )
        })}
      </nav>
    </>
  )

  if (isLoading) {
    return <LoadingSpinner text={FRIENDS_PAGE_TEXT.loading} />
  }

  return (
    <div className="min-h-[70vh] relative">
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer (Slides out from the right) */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden border-l border-slate-100 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {renderMenuContent()}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:h-fit">
          {renderMenuContent()}
        </aside>

        <main className="space-y-6">
          {/* Mobile Header with Menu Button */}
          <div className="flex items-center justify-between lg:hidden mb-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Bạn bè</h1>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-3 py-1.5 flex items-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              onClick={() => setIsMenuOpen(true)}
            >
              <AiOutlineMenu size={16} />
              <span>Danh mục</span>
            </Button>
          </div>

          {/* Global Friends Search input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="relative flex-1">
              <AiOutlineSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (!e.target.value.trim()) {
                    setSearchResults([])
                    setHasSearched(false)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    performUserSearch()
                  }
                }}
                placeholder="Tìm kiếm"
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button
              onClick={performUserSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="rounded-full px-5 py-2 font-semibold shrink-0"
            >
              Tìm kiếm
            </Button>
          </div>

          {hasSearched ? (
            <FriendsSection
              title="Kết quả tìm kiếm"
              subtitle={isSearching ? "Đang tìm kiếm tài khoản..." : `Tìm thấy ${searchResults.length} kết quả`}
              rightElement={
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setHasSearched(false)
                  }}
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-700 cursor-pointer"
                >
                  Đóng tìm kiếm
                </button>
              }
            >
              <div className="space-y-3">
                {isSearching && (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner text="Đang tìm kiếm tài khoản..." />
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && (
                  <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp với "{searchQuery}".
                  </p>
                )}

                {!isSearching && searchResults.map((user) => {
                  const userId = user._id || user.id
                  const rel = getRelationship(userId)
                  
                  let actionButton = null
                  if (rel.type === 'friend') {
                    actionButton = (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-250">Bạn bè</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1 text-xs"
                          onClick={() => handleUnfriend(userId)}
                          isLoading={actingFriendId === String(userId)}
                        >
                          Hủy kết bạn
                        </Button>
                      </div>
                    )
                  } else if (rel.type === 'incoming') {
                    actionButton = (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          className="rounded-xl font-medium px-3 py-1 text-xs"
                          onClick={() => handleRespondRequest(rel.requestId, 'accepted')}
                          isLoading={actingRequestId === rel.requestId}
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1 text-xs"
                          onClick={() => handleRespondRequest(rel.requestId, 'declined')}
                          disabled={actingRequestId === rel.requestId}
                        >
                          Từ chối
                        </Button>
                      </div>
                    )
                  } else if (rel.type === 'sent') {
                    actionButton = (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-250">Đã gửi yêu cầu</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1 text-xs"
                          onClick={() => handleCancelSentRequest(rel.requestId)}
                          isLoading={actingRequestId === rel.requestId}
                        >
                          Hủy yêu cầu
                        </Button>
                      </div>
                    )
                  } else {
                    actionButton = (
                      <Button
                        size="sm"
                        className="rounded-xl font-semibold px-4 py-1.5 text-xs"
                        onClick={() => handleSendRequest(userId, user)}
                        isLoading={actingSuggestionId === String(userId)}
                      >
                        Thêm bạn bè
                      </Button>
                    )
                  }

                  return (
                    <FriendRow
                      key={userId}
                      user={user}
                      rightAction={actionButton}
                    />
                  )
                })}
              </div>
            </FriendsSection>
          ) : (
            <>
              {activeMenu === 'home' && (
                <>
                  <FriendsSection
                    title="Lời mời kết bạn"
                    subtitle={FRIENDS_PAGE_TEXT.incomingCount(incomingRequests.length)}
                    actionText={incomingRequests.length > 0 ? 'Xem tất cả' : ''}
                    onActionClick={() => setActiveMenu('requests')}
                  >
                    {homeRequests.length === 0 ? (
                      <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                        {FRIENDS_PAGE_TEXT.noIncoming}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {homeRequests.map((request) => (
                          <FriendRequestCard
                            key={request._id}
                            request={request}
                            actingRequestId={actingRequestId}
                            onAccept={(requestId) => handleRespondRequest(requestId, 'accepted')}
                            onDecline={(requestId) => handleRespondRequest(requestId, 'declined')}
                          />
                        ))}
                      </div>
                    )}
                  </FriendsSection>

                  <FriendsSection
                    title="Những người bạn có thể biết"
                    subtitle={`Có ${suggestions.length} gợi ý cho bạn`}
                    actionText={suggestions.length > 0 ? 'Xem tất cả' : ''}
                    onActionClick={() => setActiveMenu('suggestions')}
                  >
                    {homeSuggestions.length === 0 ? (
                      <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                        Hiện chưa có gợi ý phù hợp.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {homeSuggestions.map((user) => (
                          <SuggestionCard
                            key={user._id || user.id}
                            user={user}
                            actingSuggestionId={actingSuggestionId}
                            onAddFriend={handleSendRequestFromSuggestion}
                          />
                        ))}
                      </div>
                    )}
                  </FriendsSection>
                </>
              )}

              {activeMenu === 'requests' && (
                <>
                  <FriendsSection
                    title="Lời mời kết bạn"
                    subtitle={FRIENDS_PAGE_TEXT.incomingCount(incomingRequests.length)}
                  >
                    <div className="space-y-3">
                      {incomingRequests.length === 0 && (
                        <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                          {FRIENDS_PAGE_TEXT.noIncoming}
                        </p>
                      )}
                      {incomingRequests.map((request) => (
                        <FriendRow
                          key={request._id}
                          user={request.user}
                          rightAction={(
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="rounded-xl font-medium px-4"
                                onClick={() => handleRespondRequest(request._id, 'accepted')}
                                isLoading={actingRequestId === request._id}
                              >
                                {FRIENDS_PAGE_TEXT.accept}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-4"
                                onClick={() => handleRespondRequest(request._id, 'declined')}
                                disabled={actingRequestId === request._id}
                              >
                                {FRIENDS_PAGE_TEXT.decline}
                              </Button>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </FriendsSection>

                  <FriendsSection
                    title="Lời mời đã gửi"
                    subtitle={FRIENDS_PAGE_TEXT.sentCount(sentRequests.length)}
                  >
                    <div className="space-y-3">
                      {sentRequests.length === 0 && (
                        <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                          {FRIENDS_PAGE_TEXT.noSent}
                        </p>
                      )}
                      {sentRequests.map((request) => (
                        <FriendRow
                          key={request._id}
                          user={request.user}
                          rightAction={(
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-4"
                              onClick={() => handleCancelSentRequest(request._id)}
                              isLoading={actingRequestId === request._id}
                            >
                              {FRIENDS_PAGE_TEXT.cancelRequest}
                            </Button>
                          )}
                        />
                      ))}
                    </div>
                  </FriendsSection>
                </>
              )}

              {activeMenu === 'suggestions' && (
                <FriendsSection title="Gợi ý kết bạn" subtitle={`Có ${suggestions.length} gợi ý cho bạn`}>
                  {suggestions.length === 0 ? (
                    <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                      Hiện chưa có gợi ý phù hợp.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {suggestions.map((user) => (
                        <SuggestionCard
                          key={user._id || user.id}
                          user={user}
                          actingSuggestionId={actingSuggestionId}
                          onAddFriend={handleSendRequestFromSuggestion}
                        />
                      ))}
                    </div>
                  )}
                </FriendsSection>
              )}

              {activeMenu === 'all' && (
                <FriendsSection
                  title="Tất cả bạn bè"
                  subtitle={FRIENDS_PAGE_TEXT.friendsCount(friends.length)}
                  rightElement={(
                    <div className="relative">
                      <AiOutlineSearch
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={friendSearchQuery}
                        onChange={(e) => setFriendSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm"
                        className="pl-9 pr-4 py-2 text-sm rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:border focus:border-primary-300 outline-none transition w-full sm:w-56"
                      />
                    </div>
                  )}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredFriends.length === 0 && (
                      <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                        {friendSearchQuery.trim() ? 'Không tìm thấy bạn bè phù hợp.' : FRIENDS_PAGE_TEXT.noFriends}
                      </p>
                    )}
                    {filteredFriends.map((friend) => {
                      const friendId = friend._id || friend.id
                      return (
                        <FriendRow
                          key={friendId}
                          user={friend}
                          rightAction={(
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-4"
                              onClick={() => handleUnfriend(friendId)}
                              isLoading={actingFriendId === String(friendId)}
                            >
                              {FRIENDS_PAGE_TEXT.unfriend}
                            </Button>
                          )}
                        />
                      )
                    })}
                  </div>
                </FriendsSection>
              )}

              {activeMenu === 'close_friends' && (
                <FriendsSection
                  title="Bạn bè thân thiết"
                  subtitle="Danh mục ưu tiên tương tác"
                >
                  <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                    Tính năng đang được chuẩn bị. Bạn có thể thiết lập danh sách bạn bè thân thiết sau khi cập nhật Backend.
                  </p>
                </FriendsSection>
              )}

              {(activeMenu === 'birthdays' || activeMenu === 'custom') && (
                <FriendsSection
                  title={activeMenu === 'birthdays' ? 'Sinh nhật' : 'Danh sách tùy chỉnh'}
                  subtitle="Mục này đang được chuẩn bị"
                >
                  <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                    Bạn có thể ưu tiên dùng các mục Trang chủ, Lời mời kết bạn, Gợi ý và Tất cả bạn bè trước.
                  </p>
                </FriendsSection>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default FriendsPage
