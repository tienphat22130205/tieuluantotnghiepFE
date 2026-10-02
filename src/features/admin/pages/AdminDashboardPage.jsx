import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AdminOverviewPanel,
  AdminSidebar,
  AdminSummaryCards,
  AdminTopbar,
  BanUserModal,
  CommentsManagementPanel,
  DocumentStatsPanel,
  PostsModerationPanel,
  RoleConfirmModal,
  UnbanRequestsManagementPanel,
  UsersManagementPanel,
} from '../components'
import { adminMenuItems } from '../constants/adminNavItems'
import { logout } from '@/features/auth/store/authSlice'
import { isAdminUser, isModeratorUser } from '@/utils/auth'
import { usePreferences } from '@/context/PreferencesContext'
import {
  useAdminUsersManagement,
  useAdminModeration,
  useAdminStats,
} from '../hooks'

/**
 * AdminDashboardPage – Trang quản trị hệ thống
 * Đã được tách logic vào các custom hook chuyên biệt (Users, Moderation, Stats).
 */
const AdminDashboardPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = usePreferences()
  const { user, role } = useSelector((state) => state.auth)

  const isAdmin = isAdminUser(user, role)
  const isModerator = isModeratorUser(user, role)
  const moderatorLockedSectionIds = ['users', 'unbanRequests', 'stats']
  const defaultSection = 'dashboard'
  const isSectionLockedForModerator = (section) =>
    isModerator && moderatorLockedSectionIds.includes(section)

  const [activeSection, setActiveSection] = useState(defaultSection)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

  // 1. Quản lý Người dùng & Yêu cầu mở khóa
  const usersMgmt = useAdminUsersManagement({ activeSection, isModerator })

  // 2. Kiểm duyệt Bài viết & Bình luận
  const moderation = useAdminModeration({ activeSection, isAdmin })

  // 3. Thống kê & Tổng quan hệ thống
  const stats = useAdminStats({ isAdmin, isModerator })

  useEffect(() => {
    setActiveSection(defaultSection)
  }, [defaultSection])

  const handleSelectSection = (section) => {
    if (isSectionLockedForModerator(section)) return
    setActiveSection(section)
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleToggleMenu = () => {
    const isDesktopViewport = window.matchMedia('(min-width: 1024px)').matches

    if (isDesktopViewport) {
      setIsDesktopCollapsed((prev) => !prev)
      return
    }

    setIsSidebarOpen((prev) => !prev)
  }

  // Render panel theo từng section được chọn
  let activePanel
  if (activeSection === 'posts') {
    activePanel = (
      <PostsModerationPanel
        isAdminView={isAdmin}
        posts={moderation.posts}
        pagination={moderation.postsPagination}
        filters={moderation.postsFilters}
        isLoading={moderation.isPostsLoading}
        error={moderation.postsError}
        busyPostId={moderation.busyPostId}
        onDeletePost={moderation.handleDeletePost}
        onRefresh={moderation.handleRefreshPosts}
        onPageChange={moderation.handlePostsPageChange}
        onFiltersChange={moderation.handlePostsFiltersChange}
      />
    )
  } else if (activeSection === 'comments') {
    activePanel = (
      <CommentsManagementPanel
        comments={moderation.comments}
        pagination={moderation.commentsPagination}
        filters={moderation.commentsFilters}
        isLoading={moderation.isCommentsLoading}
        error={moderation.commentsError}
        busyCommentId={moderation.busyCommentId}
        onDeleteComment={moderation.handleDeleteComment}
        onRefresh={moderation.handleRefreshComments}
        onPageChange={moderation.handleCommentsPageChange}
        onFiltersChange={moderation.handleCommentsFiltersChange}
      />
    )
  } else if (activeSection === 'unbanRequests') {
    activePanel = (
      <UnbanRequestsManagementPanel
        requests={usersMgmt.unbanRequests}
        isLoading={usersMgmt.isUnbanRequestsLoading}
        error={usersMgmt.unbanRequestsError}
        pagination={usersMgmt.unbanRequestsPagination}
        statusFilter={usersMgmt.unbanStatusFilter}
        busyRequestId={usersMgmt.busyUnbanRequestId}
        onStatusFilterChange={usersMgmt.handleUnbanStatusFilterChange}
        onPageChange={usersMgmt.handleUnbanRequestsPageChange}
        onReview={usersMgmt.handleReviewUnbanRequest}
      />
    )
  } else if (activeSection === 'users') {
    activePanel = (
      <UsersManagementPanel
        users={usersMgmt.users}
        isLoading={usersMgmt.isUsersLoading}
        error={usersMgmt.usersError}
        pagination={usersMgmt.usersPagination}
        busyUserId={usersMgmt.busyUserId}
        onRoleChange={usersMgmt.handleRoleChange}
        onToggleStatus={usersMgmt.handleToggleUserStatus}
        onPageChange={usersMgmt.handleUsersPageChange}
      />
    )
  } else if (activeSection === 'stats') {
    activePanel = (
      <DocumentStatsPanel
        stats={stats.stats}
        trending={stats.trendingPosts}
        statsFilters={stats.statsFilters}
        trendingFilters={stats.trendingFilters}
        isLoading={stats.isStatsLoading}
        error={stats.statsError}
        onRefresh={stats.handleRefreshStatsOnly}
        onStatsFiltersChange={(changes) => {
          stats.setStatsFilters((prev) => ({ ...prev, ...changes }))
        }}
        onTrendingFiltersChange={(changes) => {
          stats.setTrendingFilters((prev) => ({ ...prev, ...changes }))
        }}
      />
    )
  } else {
    // Default: 'dashboard'
    activePanel = (
      <AdminOverviewPanel
        overview={stats.overview}
        userStats={stats.userStats}
        isLoading={stats.isStatsLoading}
        error={stats.statsError}
        onRefresh={stats.loadDashboardData}
      />
    )
  }

  const showLockedOverlay = isSectionLockedForModerator(activeSection)
  const lockedMessageBySection = {
    users: t('admin.moderatorLockedUsers') || 'Vai trò kiểm duyệt viên không có quyền quản lý người dùng.',
    unbanRequests: t('admin.moderatorLockedUnban') || 'Vai trò kiểm duyệt viên không có quyền duyệt yêu cầu mở khóa.',
    stats: t('admin.moderatorLockedStats') || 'Vai trò kiểm duyệt viên không có quyền xem thống kê tài liệu.',
  }

  return (
    <div className="min-h-screen font-sans flex flex-col lg:flex-row bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <AdminSidebar
        activeSection={activeSection}
        menuItems={adminMenuItems}
        onSelect={handleSelectSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
        lockedSectionIds={isModerator ? moderatorLockedSectionIds : []}
      />

      <main className="flex-1 min-w-0 flex flex-col gap-4 p-3 sm:p-4 lg:p-5 overflow-x-hidden">
        <AdminTopbar
          activeSection={activeSection}
          user={user}
          onLogout={handleLogout}
          onToggleMenu={handleToggleMenu}
          isDesktopCollapsed={isDesktopCollapsed}
        />

        <AdminSummaryCards
          users={usersMgmt.users}
          posts={moderation.posts}
          comments={moderation.comments}
          documents={[]}
          userStats={stats.userStats}
          overview={stats.overview}
        />

        <div className="relative">
          {activePanel}
          {showLockedOverlay && !isAdmin && activeSection !== 'dashboard' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/55 px-5 text-center">
              <div className="rounded-xl border border-white/30 bg-slate-900/80 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-sm">
                <p className="font-semibold">🔒 {t('admin.moderatorLockedArea') || 'Khu vực bị khóa'}</p>
                <p className="mt-1 text-slate-100">{lockedMessageBySection[activeSection]}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <RoleConfirmModal
        isOpen={usersMgmt.confirmRoleModal.open}
        userName={usersMgmt.confirmRoleModal.userName}
        roleLabel={usersMgmt.roleLabelMap[usersMgmt.confirmRoleModal.role] || usersMgmt.confirmRoleModal.role}
        isLoading={Boolean(usersMgmt.busyUserId)}
        onCancel={() => usersMgmt.setConfirmRoleModal({ open: false, userId: null, role: '', userName: '' })}
        onConfirm={usersMgmt.handleConfirmRoleChange}
      />

      <BanUserModal
        key={usersMgmt.banModalState.version}
        isOpen={usersMgmt.banModalState.isOpen}
        user={usersMgmt.banModalState.user}
        isSubmitting={Boolean(usersMgmt.busyUserId)}
        onCancel={usersMgmt.handleCloseBanModal}
        onSubmit={usersMgmt.handleBanModalSubmit}
      />
    </div>
  )
}

export default AdminDashboardPage
