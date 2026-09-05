import {
  AiOutlineCalendar,
  AiOutlineIdcard,
  AiOutlineEnvironment,
  AiOutlineLink,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineUser,
} from 'react-icons/ai'
import { formatDate } from '@/utils/formatDate'

/**
 * AboutTab – Nội dung tab "Giới thiệu" chi tiết (full page version).
 */
const AboutTab = ({ profile }) => {
  const joinDate = profile.created_at ? formatDate(profile.created_at) : 'Chưa cập nhật'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-7 transition-colors space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <AiOutlineUser size={22} className="text-blue-600 dark:text-blue-400" />
          Giới thiệu chi tiết
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thông tin cơ bản và tiểu sử cá nhân của {profile.full_name || profile.username}.
        </p>
      </div>

      {/* Bio section */}
      {profile.bio && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tiểu sử
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {profile.bio}
          </div>
        </div>
      )}

      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {profile.location && (
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
              <AiOutlineEnvironment size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nơi sống</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {profile.location}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
            <AiOutlineCalendar size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Thời gian tham gia</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {joinDate}
            </p>
          </div>
        </div>

        {profile.website && (
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
              <AiOutlineLink size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Website</p>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block mt-0.5"
              >
                {profile.website}
              </a>
            </div>
          </div>
        )}

        {profile.email && (
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
              <AiOutlineMail size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Email liên hệ</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                {profile.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AboutTab
