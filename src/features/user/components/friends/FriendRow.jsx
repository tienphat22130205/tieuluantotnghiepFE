import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui'
import { getDisplayName } from './friendDisplayName'

const FriendRow = ({ user, rightAction }) => {
  const userIdentifier = user?.username ? String(user.username).replace(/^@/, '') : (user?._id || user?.id)
  const displayName = getDisplayName(user)

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Link to={userIdentifier ? `/profile/${userIdentifier}` : '#'} className="flex min-w-0 items-center gap-3">
        <Avatar src={user?.avatar} name={displayName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          {user?.username && <p className="truncate text-xs text-slate-500">@{user.username}</p>}
        </div>
      </Link>
      {rightAction}
    </div>
  )
}

export default FriendRow
