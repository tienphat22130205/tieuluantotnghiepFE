import { Link } from 'react-router-dom'
import { Avatar, Button } from '@/components/ui'
import { FRIENDS_PAGE_TEXT } from '@/constants/messages'
import { getDisplayName } from './friendDisplayName'

const FriendRequestCard = ({ request, actingRequestId, onAccept, onDecline }) => {
  const userId = request?.user?._id || request?.user?.id
  const displayName = getDisplayName(request?.user)

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link to={userId ? `/profile/${userId}` : '#'} className="block h-36 bg-slate-100">
        <div className="flex h-full items-center justify-center">
          <Avatar src={request?.user?.avatar} name={displayName} size="2xl" />
        </div>
      </Link>

      <div className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
          {request?.user?.username && <p className="truncate text-xs text-slate-500">@{request.user.username}</p>}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            size="sm"
            className="rounded-lg"
            onClick={() => onAccept(request._id)}
            isLoading={actingRequestId === request._id}
          >
            {FRIENDS_PAGE_TEXT.accept}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={() => onDecline(request._id)}
            disabled={actingRequestId === request._id}
          >
            {FRIENDS_PAGE_TEXT.decline}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default FriendRequestCard
