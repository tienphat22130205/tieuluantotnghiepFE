import { LogOut, Menu } from 'lucide-react'
import { COLORS } from '@/theme/colors'

const titles = {
  users: 'Quản lý người dùng',
  unbanRequests: 'Yêu cầu mở khóa tài khoản',
  posts: 'Kiểm duyệt bài viết và tài liệu',
  comments: 'Quản lý bình luận',
  stats: 'Thống kê tài liệu được xem nhiều',
}

const subtitles = {
  users: 'Phân quyền và khóa/mở khóa tài khoản người dùng.',
  unbanRequests: 'Duyệt hoặc từ chối các yêu cầu mở khóa từ người dùng bị khóa vĩnh viễn.',
  posts: 'Thêm, sửa, xóa bài viết và quản lý tính hợp lệ của tài liệu.',
  comments: 'Xem danh sách bình luận và xóa bình luận vi phạm.',
  stats: 'Theo dõi các tài liệu có lượt xem cao nhất trên hệ thống.',
}

const AdminTopbar = ({ activeSection, user, onLogout, onToggleMenu, isDesktopCollapsed }) => {
  const displayName = user?.fullName || user?.username || 'Admin'
  const avatarText = displayName.slice(0, 1).toUpperCase()

  return (
    <header
      className="rounded-2xl border p-4 shadow-sm"
      style={{ borderColor: COLORS.border, backgroundColor: COLORS.adminPanelBg }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleMenu}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2"
          style={{ borderColor: COLORS.border, color: COLORS.textSecondary, backgroundColor: COLORS.surface }}
          aria-label="Thu hoặc mở menu"
        >
          <Menu size={18} />
          <span className="hidden text-sm font-medium lg:inline">
            {isDesktopCollapsed ? 'Mở menu' : 'Thu menu'}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl border px-2 py-1.5"
            style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: COLORS.adminSidebarActive }}
              >
                {avatarText}
              </span>
            )}
            <span className="hidden text-sm font-medium sm:inline" style={{ color: COLORS.textSecondary }}>{displayName}</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{ backgroundColor: COLORS.errorLight, color: COLORS.error }}
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>

      <p className="text-xs" style={{ color: COLORS.textLight }}>Admin / Dashboard</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ color: COLORS.text }}>{titles[activeSection]}</h1>
      <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>{subtitles[activeSection]}</p>
    </header>
  )
}

export default AdminTopbar
