import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { getDisplayName } from './friendDisplayName'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const SuggestionCard = ({ user, actingSuggestionId, onAddFriend }) => {
  const userIdentifier = user?.username ? String(user.username).replace(/^@/, '') : (user?._id || user?.id)
  const displayName = getDisplayName(user)
  const avatarUrl = resolveMediaUrl(user?.avatar)

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full">
      <Link to={userIdentifier ? `/profile/${userIdentifier}` : '#'} className="block aspect-square w-full bg-slate-50 overflow-hidden relative group">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-semibold text-3xl">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link to={userIdentifier ? `/profile/${userIdentifier}` : '#'} className="hover:underline block min-w-0">
            <p className="truncate text-base font-bold text-slate-900">{displayName}</p>
          </Link>
          {user?.username && <p className="truncate text-xs text-slate-500">@{user.username}</p>}
        </div>

        <Button
          size="sm"
          className="w-full rounded-xl py-2 mt-auto font-semibold text-[13px] sm:text-sm px-1 sm:px-3"
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
