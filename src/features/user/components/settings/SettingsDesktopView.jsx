import { useState } from 'react'
import { AiOutlineRight } from 'react-icons/ai'

/**
 * SettingsDesktopView – Giao diện Cài đặt dành cho Web / Desktop (>= md).
 * Bố cục 2 cột: Sidebar menu danh mục bên trái và Panel nội dung chi tiết bên phải.
 */
const SettingsDesktopView = ({
  tabs,
  renderTabContent,
  defaultTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="hidden md:grid md:grid-cols-12 gap-6">
      {/* Cột trái: Menu Tabs (Desktop) */}
      <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 self-start transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
                active
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold border-l-4 border-primary-600 rounded-l-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}
                />
                <span>{tab.label}</span>
              </div>
              <AiOutlineRight
                size={14}
                className={active ? 'text-primary-500 opacity-100' : 'text-slate-300 dark:text-slate-600 opacity-60'}
              />
            </button>
          )
        })}
      </div>

      {/* Cột phải: Panel nội dung chi tiết (Desktop) */}
      <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        {renderTabContent(activeTab)}
      </div>
    </div>
  )
}

export default SettingsDesktopView
