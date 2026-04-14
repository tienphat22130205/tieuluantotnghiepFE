import { Link } from 'react-router-dom'
import { Avatar, Button } from '@/components/ui'
import { getDisplayName } from './friendDisplayName'

const SuggestionCard = ({ user, actingSuggestionId, onAddFriend }) => {
  const userId = user?._id || user?.id
  const displayName = getDisplayName(user)

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link to={userId ? `/profile/${userId}` : '#'} className="block h-36 bg-slate-100">
        <div className="flex h-full items-center justify-center">
          <Avatar src={user?.avatar} name={displayName} size="2xl" />
        </div>
      </Link>

      <div className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
          {user?.username && <p className="truncate text-xs text-slate-500">@{user.username}</p>}
        </div>

        <Button
          size="sm"
          className="w-full rounded-lg"
          onClick={() => onAddFriend(userId)}
          isLoading={actingSuggestionId === String(userId)}
        >
          Thêm bạn bè
        </Button>
      </div>
    </article>
  )
}

export default SuggestionCard
