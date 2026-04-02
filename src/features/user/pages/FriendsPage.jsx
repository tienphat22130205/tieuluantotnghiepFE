import { Link } from 'react-router-dom'
import { Avatar, Button, LoadingSpinner } from '@/components/ui'
import useFriendsPage from '../hooks/useFriendsPage'
import { COMMON_TEXT, FRIENDS_PAGE_TEXT } from '@/constants/messages'

const UserRow = ({ user, actions }) => {
  const userId = user?._id || user?.id
  const displayName = user?.full_name || user?.fullName || user?.username || COMMON_TEXT.unknownUser

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <Link to={userId ? `/profile/${userId}` : '#'} className="flex min-w-0 items-center gap-3">
        <Avatar src={user?.avatar} name={displayName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
          {user?.username && <p className="truncate text-xs text-gray-500">@{user.username}</p>}
        </div>
      </Link>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}

const FriendsPage = () => {
  const {
    incomingRequests,
    sentRequests,
    friends,
    isLoading,
    actingRequestId,
    actingFriendId,
    handleRespondRequest,
    handleCancelSentRequest,
    handleUnfriend,
  } = useFriendsPage()

  if (isLoading) {
    return <LoadingSpinner text={FRIENDS_PAGE_TEXT.loading} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{FRIENDS_PAGE_TEXT.incomingTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">{FRIENDS_PAGE_TEXT.incomingCount(incomingRequests.length)}</p>

        <div className="mt-4 space-y-3">
          {incomingRequests.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">{FRIENDS_PAGE_TEXT.noIncoming}</p>
          )}

          {incomingRequests.map((request) => (
            <UserRow
              key={request._id}
              user={request.user}
              actions={(
                <>
                  <Button
                    size="sm"
                    onClick={() => handleRespondRequest(request._id, 'accepted')}
                    isLoading={actingRequestId === request._id}
                  >
                    {FRIENDS_PAGE_TEXT.accept}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRespondRequest(request._id, 'declined')}
                    disabled={actingRequestId === request._id}
                  >
                    {FRIENDS_PAGE_TEXT.decline}
                  </Button>
                </>
              )}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">{FRIENDS_PAGE_TEXT.sentTitle}</h2>
        <p className="mt-1 text-sm text-gray-500">{FRIENDS_PAGE_TEXT.sentCount(sentRequests.length)}</p>

        <div className="mt-4 space-y-3">
          {sentRequests.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">{FRIENDS_PAGE_TEXT.noSent}</p>
          )}

          {sentRequests.map((request) => (
            <UserRow
              key={request._id}
              user={request.user}
              actions={(
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelSentRequest(request._id)}
                  isLoading={actingRequestId === request._id}
                >
                  {FRIENDS_PAGE_TEXT.cancelRequest}
                </Button>
              )}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">{FRIENDS_PAGE_TEXT.friendsTitle}</h2>
        <p className="mt-1 text-sm text-gray-500">{FRIENDS_PAGE_TEXT.friendsCount(friends.length)}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {friends.length === 0 && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">{FRIENDS_PAGE_TEXT.noFriends}</p>
          )}

          {friends.map((friend) => (
            <UserRow
              key={friend._id || friend.id}
              user={friend}
              actions={(
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfriend(friend._id || friend.id)}
                  isLoading={actingFriendId === String(friend._id || friend.id)}
                >
                  {FRIENDS_PAGE_TEXT.unfriend}
                </Button>
              )}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default FriendsPage
