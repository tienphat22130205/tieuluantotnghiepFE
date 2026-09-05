import {
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineLink,
  AiOutlineInfoCircle,
} from 'react-icons/ai'
import { Button } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

/**
 * IntroCard – Sidebar card hiển thị thông tin giới thiệu.
 */
const IntroCard = ({ profile, isMyProfile, onEditProfile }) => {
  const joinedDate = profile.created_at ? formatDate(profile.created_at) : 'Chưa cập nhật'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-5 transition-colors">
      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3.5 flex items-center gap-2">
        <AiOutlineInfoCircle size={18} className="text-blue-600 dark:text-blue-400" />
        Giới thiệu
      </h3>

      <div className="space-y-3">
        {profile.bio && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-700 dark:text-slate-200 text-center leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {profile.location && (
          <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <AiOutlineEnvironment className="text-slate-400 dark:text-slate-500 shrink-0" size={18} />
            <span>
              Sống tại <strong className="font-semibold text-slate-900 dark:text-white">{profile.location}</strong>
            </span>
          </div>
        )}

        {profile.website && (
          <div className="flex items-center gap-2.5 text-sm">
            <AiOutlineLink className="text-slate-400 dark:text-slate-500 shrink-0" size={18} />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline truncate font-medium"
            >
              {profile.website}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
          <AiOutlineCalendar className="text-slate-400 dark:text-slate-500 shrink-0" size={18} />
          <span>Tham gia từ {joinedDate}</span>
        </div>
      </div>

      {isMyProfile && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 cursor-pointer rounded-xl font-medium border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-200"
          onClick={onEditProfile}
        >
          Chỉnh sửa chi tiết
        </Button>
      )}
    </div>
  )
}

export default IntroCard
