import { useMemo, useState } from 'react'
import { AiOutlineRight } from 'react-icons/ai'
import { Button, LoadingSpinner } from '@/components/ui'
import useFriendsPage from '../hooks/useFriendsPage'
import { FRIENDS_PAGE_TEXT } from '@/constants/messages'
import FRIEND_MENU_ITEMS from '../components/friends/friendMenuItems'
import FriendsSection from '../components/friends/FriendsSection'
import FriendRow from '../components/friends/FriendRow'
import FriendRequestCard from '../components/friends/FriendRequestCard'
import SuggestionCard from '../components/friends/SuggestionCard'

const FriendsPage = () => {
  const [activeMenu, setActiveMenu] = useState('home')

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
    handleSendRequestFromSuggestion,
  } = useFriendsPage()

  const homeRequests = useMemo(() => incomingRequests.slice(0, 6), [incomingRequests])
  const homeSuggestions = useMemo(() => suggestions.slice(0, 8), [suggestions])

  if (isLoading) {
    return <LoadingSpinner text={FRIENDS_PAGE_TEXT.loading} />
  }

  return (
    <div className="min-h-[70vh] rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 lg:sticky lg:top-5 lg:h-fit">
          <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">Bạn bè</h1>
          <nav className="space-y-1">
            {FRIEND_MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const active = activeMenu === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveMenu(item.key)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
        </aside>

        <main className="space-y-4">
          {activeMenu === 'home' && (
            <>
              <FriendsSection
                title="Lời mời kết bạn"
                subtitle={FRIENDS_PAGE_TEXT.incomingCount(incomingRequests.length)}
                actionText={incomingRequests.length > 0 ? 'Xem tất cả' : ''}
              >
                {homeRequests.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    {FRIENDS_PAGE_TEXT.noIncoming}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
              >
                {homeSuggestions.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Hiện chưa có gợi ý phù hợp.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
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
                            className="rounded-lg"
                            onClick={() => handleRespondRequest(request._id, 'accepted')}
                            isLoading={actingRequestId === request._id}
                          >
                            {FRIENDS_PAGE_TEXT.accept}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
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
                          className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Hiện chưa có gợi ý phù hợp.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <FriendsSection title="Tất cả bạn bè" subtitle={FRIENDS_PAGE_TEXT.friendsCount(friends.length)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {friends.length === 0 && (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    {FRIENDS_PAGE_TEXT.noFriends}
                  </p>
                )}
                {friends.map((friend) => {
                  const friendId = friend._id || friend.id
                  return (
                    <FriendRow
                      key={friendId}
                      user={friend}
                      rightAction={(
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
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

          {(activeMenu === 'birthdays' || activeMenu === 'custom') && (
            <FriendsSection
              title={activeMenu === 'birthdays' ? 'Sinh nhật' : 'Danh sách tùy chỉnh'}
              subtitle="Mục này đang được chuẩn bị"
            >
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Bạn có thể ưu tiên dùng các mục Trang chủ, Lời mời kết bạn, Gợi ý và Tất cả bạn bè trước.
              </p>
            </FriendsSection>
          )}
        </main>
      </div>
    </div>
  )
}

export default FriendsPage
