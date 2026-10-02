import { useState } from 'react'
import {
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineLock,
  AiOutlineCheck,
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { usePreferences } from '@/context/PreferencesContext'

/**
 * Tab Cài đặt: Quyền riêng tư (Trạng thái hoạt động, chế độ hiển thị bài viết)
 */
const PrivacySettingsTab = () => {
  const { t } = usePreferences()
  const [postVisibility, setPostVisibility] = useState('public')
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)

  const handleSaveGeneralSettings = () => {
    toast.success(t('settings.savedSuccess', 'Đã lưu cấu hình cài đặt thành công!'), { autoClose: 2000 })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('settings.privacySection') || 'Quyền riêng tư'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.privacySectionDesc') ||
            'Kiểm soát ai có thể nhìn thấy hoạt động và bài viết của bạn.'}
        </p>
      </div>

      {/* Online Status Toggle */}
      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('settings.onlineStatus') || 'Trạng thái hoạt động'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('settings.onlineStatusDesc') ||
              'Hiển thị khi bạn đang trực tuyến trên mạng xã hội'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowOnlineStatus((prev) => !prev)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            showOnlineStatus ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              showOnlineStatus ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Post Audience Visibility */}
      <div className="space-y-2 py-3 border-b border-slate-100 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {t('settings.postVisibility') || 'Chế độ người xem mặc định'}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('settings.postVisibilityDesc') ||
            'Đặt quyền hiển thị mặc định cho các bài đăng mới'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
          {[
            { id: 'public', label: t('settings.public') || 'Công khai', icon: AiOutlineGlobal },
            { id: 'friends', label: t('settings.friendsOnly') || 'Bạn bè', icon: AiOutlineTeam },
            { id: 'private', label: t('settings.private') || 'Chỉ mình tôi', icon: AiOutlineLock },
          ].map(({ id, label, icon: ItemIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPostVisibility(id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold border transition cursor-pointer text-center ${
                postVisibility === id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ItemIcon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSaveGeneralSettings}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
        >
          <AiOutlineCheck size={16} />
          <span>{t('settings.save') || 'Lưu cài đặt'}</span>
        </button>
      </div>
    </div>
  )
}

export default PrivacySettingsTab
