import { AiOutlinePicture, AiOutlineVideoCamera, AiOutlineSmile } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { usePreferences } from '@/context/PreferencesContext'

/**
 * QuickPostBar – Thanh tạo bài viết nhanh ở trang chủ.
 * Gọi onOpen() để mở CreatePostModal thay vì navigate.
 */
const QuickPostBar = ({ onOpen }) => {
  const { user } = useAuth()
  const { t, language } = usePreferences()
  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Bạn'

  const promptText = language === 'en'
    ? `${displayName}${t('home.whatOnYourMind')}`
    : `${displayName} ${t('home.whatOnYourMind')}`

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm transition-colors">
      {/* Top row: Avatar + Input trigger */}
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatar}
          name={displayName}
          size="md"
          to={user?.username ? `/profile/${String(user.username).replace(/^@/, '')}` : (user?.id || user?._id ? `/profile/${user?.id || user?._id}` : '/')}
        />
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 text-left rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 font-normal transition-colors duration-150 cursor-pointer"
        >
          {promptText}
        </button>
      </div>

      {/* Divider */}
      <div className="mt-3 border-t border-slate-100/80 dark:border-slate-800" />

      {/* Action Buttons */}
      <div className="mt-2 flex items-center justify-around">
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
        >
          <AiOutlineVideoCamera size={20} className="text-red-500" />
          <span className="hidden sm:inline">{t('home.liveVideo')}</span>
          <span className="sm:hidden">Live</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
        >
          <AiOutlinePicture size={20} className="text-emerald-500" />
          <span className="hidden sm:inline">{t('home.photoVideo')}</span>
          <span className="sm:hidden">Photo</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
        >
          <AiOutlineSmile size={20} className="text-yellow-500" />
          <span className="hidden sm:inline">{t('home.feelingActivity')}</span>
          <span className="sm:hidden">Feeling</span>
        </button>
      </div>
    </div>
  )
}

export default QuickPostBar
