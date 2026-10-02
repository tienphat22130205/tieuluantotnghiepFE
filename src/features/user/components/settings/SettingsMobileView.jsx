import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineRight, AiOutlineArrowLeft } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'

/**
 * SettingsMobileView – Giao diện Cài đặt dành riêng cho Mobile (< md).
 * Sử dụng cấu trúc Master-Detail Drilldown (Menu danh sách -> Trang chi tiết kèm nút Quay lại).
 */
const SettingsMobileView = ({
  tabs,
  renderTabContent,
  user,
  displayName,
  profilePath,
}) => {
  const { t } = usePreferences()
  // null = hiển thị menu danh sách tổng quan; string = hiển thị tab chi tiết
  const [mobileActiveTab, setMobileActiveTab] = useState(null)

  return (
    <div className="block md:hidden">
      {mobileActiveTab === null ? (
        /* Màn hình 1: Danh sách Menu Cài đặt */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          {/* Hàng thông tin tóm tắt cá nhân: chuyển nhanh về Trang cá nhân */}
          <Link
            to={profilePath}
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-[0.99] transition cursor-pointer"
          >
            <Avatar src={user?.avatar} name={displayName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user?.username || 'zivo_user'} • {t('settings.viewProfile', 'Xem trang cá nhân')}
              </p>
            </div>
            <AiOutlineRight size={16} className="text-slate-400 shrink-0" />
          </Link>

          {/* Danh sách các mục cài đặt */}
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobileActiveTab(tab.id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tab.color}`}>
                      <Icon size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tab.label}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  <AiOutlineRight size={16} className="text-slate-400 shrink-0 ml-2" />
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Màn hình 2: Trang chi tiết của mục được chọn kèm thanh điều hướng Quay lại */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          {/* Thanh Header Quay lại */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMobileActiveTab(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              <AiOutlineArrowLeft size={15} />
              <span>{t('settings.settingsNav', 'Cài đặt')}</span>
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
              {tabs.find((t) => t.id === mobileActiveTab)?.label}
            </span>
          </div>

          {/* Nội dung tab chi tiết */}
          <div>{renderTabContent(mobileActiveTab)}</div>
        </div>
      )}
    </div>
  )
}

export default SettingsMobileView
