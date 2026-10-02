import { AiOutlineSearch } from 'react-icons/ai'
import { Button, LoadingSpinner } from '@/components/ui'
import { FRIENDS_PAGE_TEXT } from '@/constants/messages'
import FriendsSection from './FriendsSection'
import FriendRow from './FriendRow'
import FriendRequestCard from './FriendRequestCard'
import SuggestionCard from './SuggestionCard'

const FriendsTabContent = ({
  t,
  hasSearched,
  searchQuery,
  isSearching,
  searchResults,
  onCloseSearch,
  getRelationship,
  actingFriendId,
  actingRequestId,
  actingSuggestionId,
  handleUnfriend,
  handleRespondRequest,
  handleCancelSentRequest,
  handleSendRequest,
  handleSendRequestFromSuggestion,
  activeMenu,
  setActiveMenu,
  incomingRequests,
  sentRequests,
  friends,
  filteredFriends,
  suggestions,
  homeRequests,
  homeSuggestions,
  friendSearchQuery,
  setFriendSearchQuery,
}) => {
  if (hasSearched) {
    return (
      <FriendsSection
        title="Kết quả tìm kiếm"
        subtitle={isSearching ? 'Đang tìm kiếm tài khoản...' : `Tìm thấy ${searchResults.length} kết quả`}
        rightElement={
          <button
            type="button"
            onClick={onCloseSearch}
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

          {!isSearching &&
            searchResults.map((user) => {
              const userId = user._id || user.id
              const rel = getRelationship(userId)

              let actionButton = null
              if (rel.type === 'friend') {
                actionButton = (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-250">
                      {t('friends.allFriends')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1 text-xs"
                      onClick={() => handleUnfriend(userId)}
                      isLoading={actingFriendId === String(userId)}
                    >
                      {t('friends.unfriend')}
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
                      {t('friends.accept')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1 text-xs"
                      onClick={() => handleRespondRequest(rel.requestId, 'declined')}
                      disabled={actingRequestId === rel.requestId}
                    >
                      {t('friends.decline')}
                    </Button>
                  </div>
                )
              } else if (rel.type === 'sent') {
                actionButton = (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-250">
                      Đã gửi yêu cầu
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1 text-xs"
                      onClick={() => handleCancelSentRequest(rel.requestId)}
                      isLoading={actingRequestId === rel.requestId}
                    >
                      {t('friends.cancelRequest')}
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
                    {t('friends.addFriend')}
                  </Button>
                )
              }

              return <FriendRow key={userId} user={user} rightAction={actionButton} />
            })}
        </div>
      </FriendsSection>
    )
  }

  return (
    <>
      {activeMenu === 'home' && (
        <>
          <FriendsSection
            title={t('friends.requests')}
            subtitle={`${incomingRequests.length} ${t('friends.pendingRequestsCount')}`}
            actionText={incomingRequests.length > 0 ? t('friends.seeAll') : ''}
            onActionClick={() => setActiveMenu('requests')}
          >
            {homeRequests.length === 0 ? (
              <p className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-6 text-center text-sm text-slate-500">
                {t('friends.noRequests')}
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
            title={t('friends.peopleYouMayKnow')}
            subtitle={`${suggestions.length} ${t('friends.suggestionsCount')}`}
            actionText={suggestions.length > 0 ? t('friends.seeAll') : ''}
            onActionClick={() => setActiveMenu('suggestions')}
          >
            {homeSuggestions.length === 0 ? (
              <p className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-6 text-center text-sm text-slate-500">
                {t('friends.noSuggestions')}
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
                  rightAction={
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
                  }
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
                  rightAction={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-4"
                      onClick={() => handleCancelSentRequest(request._id)}
                      isLoading={actingRequestId === request._id}
                    >
                      {FRIENDS_PAGE_TEXT.cancelRequest}
                    </Button>
                  }
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
          rightElement={
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
          }
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
                  rightAction={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-4"
                      onClick={() => handleUnfriend(friendId)}
                      isLoading={actingFriendId === String(friendId)}
                    >
                      {FRIENDS_PAGE_TEXT.unfriend}
                    </Button>
                  }
                />
              )
            })}
          </div>
        </FriendsSection>
      )}

      {activeMenu === 'close_friends' && (
        <FriendsSection title="Bạn bè thân thiết" subtitle="Danh mục ưu tiên tương tác">
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
  )
}

export default FriendsTabContent
