import { useState, useEffect } from 'react'
import {
  AiOutlineSetting,
  AiOutlineGlobal,
  AiOutlineBulb,
  AiOutlineLock,
  AiOutlineBell,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineCheck,
  AiOutlineTeam,
} from 'react-icons/ai'
import { toast } from 'react-toastify'
import { useAuth } from '@/features/auth'
import { Avatar } from '@/components/ui'

const SettingsPage = () => {
  const { user, handleLogout } = useAuth()
  const profileUserId = user?.id || user?._id
  const preferenceStorageKey = profileUserId ? `ui-preferences:${profileUserId}` : 'ui-preferences:guest'

  // Load preferences from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(preferenceStorageKey)
      return saved ? JSON.parse(saved).isDarkMode : false
    } catch {
      return false
    }
  })

  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(preferenceStorageKey)
      return saved ? JSON.parse(saved).language : 'vi'
    } catch {
      return 'vi'
    }
  })

  const [postVisibility, setPostVisibility] = useState('public')
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState('appearance')

  const displayName = user?.full_name || user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'

  // Sync dark mode & language changes to HTML document & localStorage
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.classList.toggle('dark', isDarkMode)

    localStorage.setItem(
      preferenceStorageKey,
      JSON.stringify({ language, isDarkMode })
    )
  }, [language, isDarkMode, preferenceStorageKey])

  const handleSaveSettings = () => {
    toast.success('Đã lưu cấu hình cài đặt thành công!', { autoClose: 2000 })
  }

  const tabs = [
    { id: 'appearance', label: 'Giao diện & Ngôn ngữ', icon: AiOutlineBulb },
    { id: 'privacy', label: 'Quyền riêng tư', icon: AiOutlineLock },
    { id: 'notifications', label: 'Thông báo', icon: AiOutlineBell },
    { id: 'account', label: 'Tài khoản', icon: AiOutlineUser },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
          <AiOutlineSetting size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cài đặt & Quyền riêng tư</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý giao diện, quyền riêng tư, thông báo và tài khoản của bạn.</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Tab Menu */}
        <div className="md:col-span-4 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-1 self-start">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-bold border-l-4 border-primary-600 rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} className={active ? 'text-primary-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          {/* TAB 1: GIAO DIỆN & NGÔN NGỮ */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Giao diện & Chế độ xem</h3>
                <p className="text-xs text-slate-500">Tùy chỉnh tông màu và ngôn ngữ hiển thị trên hệ thống.</p>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <AiOutlineBulb size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Giao diện Tối (Dark Mode)</p>
                    <p className="text-xs text-slate-400">Giảm mỏi mắt khi sử dụng ứng dụng vào ban đêm.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    isDarkMode ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <AiOutlineGlobal size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Ngôn ngữ hiển thị</p>
                    <p className="text-xs text-slate-400">Chọn ngôn ngữ bạn muốn sử dụng.</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary-500"
                >
                  <option value="vi">Tiếng Việt (VN)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: QUYỀN RIÊNG TƯ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Quyền riêng tư & Trạng thái</h3>
                <p className="text-xs text-slate-500">Kiểm soát ai có thể xem nội dung và trạng thái của bạn.</p>
              </div>

              {/* Online Status Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Hiển thị Trạng thái Hoạt động</p>
                  <p className="text-xs text-slate-400">Cho phép bạn bè biết khi nào bạn đang Online.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnlineStatus((prev) => !prev)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    showOnlineStatus ? 'bg-emerald-500' : 'bg-slate-200'
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
              <div className="space-y-2 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Quyền xem bài viết mặc định</p>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    { id: 'public', label: 'Công khai', icon: AiOutlineGlobal },
                    { id: 'friends', label: 'Bạn bè', icon: AiOutlineTeam },
                    { id: 'private', label: 'Chỉ mình tôi', icon: AiOutlineLock },
                  ].map(({ id, label, icon: ItemIcon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPostVisibility(id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        postVisibility === id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ItemIcon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Thông báo & Âm thanh</h3>
                <p className="text-xs text-slate-500">Tùy chỉnh thông báo đẩy và âm thanh thông báo.</p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Âm thanh thông báo</p>
                  <p className="text-xs text-slate-400">Phát âm thanh khi có tin nhắn hoặc thông báo mới.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    soundEnabled ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TÀI KHOẢN */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Thông tin Tài khoản</h3>
                <p className="text-xs text-slate-500">Thông tin cá nhân và quản lý đăng xuất.</p>
              </div>

              <div className="flex items-center gap-4 py-3 border-b border-slate-100">
                <Avatar src={user?.avatar} name={displayName} size="md" />
                <div>
                  <p className="text-base font-bold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">@{user?.username || 'zivo_user'}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition cursor-pointer"
                >
                  <AiOutlineLogout size={16} />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <AiOutlineCheck size={16} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
