import { useEffect, useMemo, useState } from 'react'
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
import { toast } from 'react-toastify'
import { adminMenuItems } from '../data/adminMockData'
import { logout } from '@/features/auth/store/authSlice'
import { COLORS } from '@/theme/colors'
import adminUsersService from '../services/adminUsersService'
import adminModerationService from '../services/adminModerationService'
import { isAdminUser, isModeratorUser } from '@/utils/auth'
import { usePreferences } from '@/context/PreferencesContext'

const AdminDashboardPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = usePreferences()
  const { user, role } = useSelector((state) => state.auth)
  const isAdmin = isAdminUser(user, role)
  const isModerator = isModeratorUser(user, role)
  const moderatorLockedSectionIds = ['users', 'unbanRequests', 'stats']
  const defaultSection = 'dashboard'
  const isSectionLockedForModerator = (section) => isModerator && moderatorLockedSectionIds.includes(section)

  const [activeSection, setActiveSection] = useState(defaultSection)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [users, setUsers] = useState([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [busyUserId, setBusyUserId] = useState(null)
  const [confirmRoleModal, setConfirmRoleModal] = useState({
    open: false,
    userId: null,
    role: '',
    userName: '',
  })
  const [busyUnbanRequestId, setBusyUnbanRequestId] = useState(null)
  const [banModalState, setBanModalState] = useState({
    isOpen: false,
    user: null,
    version: 0,
  })
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
  })
  const [posts, setPosts] = useState([])
  const [isPostsLoading, setIsPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState('')
  const [busyPostId, setBusyPostId] = useState(null)
  const [postsFilters, setPostsFilters] = useState({
    sortBy: 'createdAt',
    search: '',
    filterDeleted: false,
  })
  const [postsPagination, setPostsPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  })
  const [comments, setComments] = useState([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [busyCommentId, setBusyCommentId] = useState(null)
  const [commentsFilters, setCommentsFilters] = useState({
    search: '',
  })
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
  })
  const [overview, setOverview] = useState(null)
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    pendingUnbanRequests: 0,
    approvedUnbanRequests: 0,
    rejectedUnbanRequests: 0,
  })

  const [stats, setStats] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [statsFilters, setStatsFilters] = useState({
    timeRange: '90d',
    topLimit: 5,
  })
  const [trendingFilters, setTrendingFilters] = useState({
    hoursBack: 24,
    limit: 20,
  })
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  const [unbanRequests, setUnbanRequests] = useState([])
  const [isUnbanRequestsLoading, setIsUnbanRequestsLoading] = useState(false)
  const [unbanRequestsError, setUnbanRequestsError] = useState('')
  const [unbanStatusFilter, setUnbanStatusFilter] = useState('pending')
  const [unbanRequestsPagination, setUnbanRequestsPagination] = useState({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
  })

  useEffect(() => {
    setActiveSection(defaultSection)
  }, [defaultSection])

  useEffect(() => {
    if (activeSection !== 'users' || isModerator) return

    let isMounted = true

    const loadUsers = async () => {
      setIsUsersLoading(true)
      setUsersError('')

      try {
        const response = await adminUsersService.listAdminUsers({
          page: usersPagination.page,
          limit: usersPagination.limit,
          status: 'all',
          q: '',
        })

        if (!isMounted) return

        setUsers(response.users)
        setUsersPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } catch (error) {
        if (!isMounted) return

        setUsers([])
        setUsersError(error?.message || 'Không thể tải danh sách người dùng.')
      } finally {
        if (isMounted) {
          setIsUsersLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [activeSection, usersPagination.limit, usersPagination.page, isModerator])

  useEffect(() => {
    if (activeSection !== 'unbanRequests' || isModerator) return

    let isMounted = true

    const loadRequests = async () => {
      setIsUnbanRequestsLoading(true)
      setUnbanRequestsError('')

      try {
        const response = await adminUsersService.listAdminUnbanRequests({
          status: unbanStatusFilter,
          page: unbanRequestsPagination.page,
          limit: unbanRequestsPagination.limit,
        })

        if (!isMounted) return

        setUnbanRequests(response.requests)
        setUnbanRequestsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } catch (error) {
        if (!isMounted) return

        setUnbanRequests([])
        setUnbanRequestsError(error?.message || 'Không thể tải danh sách yêu cầu mở khóa.')
      } finally {
        if (isMounted) {
          setIsUnbanRequestsLoading(false)
        }
      }
    }

    loadRequests()

    return () => {
      isMounted = false
    }
  }, [activeSection, unbanRequestsPagination.limit, unbanRequestsPagination.page, unbanStatusFilter, isModerator])

  useEffect(() => {
    if (activeSection !== 'posts') return

    let isMounted = true

    const loadPosts = async () => {
      setIsPostsLoading(true)
      setPostsError('')

      try {
        const response = await adminModerationService.listManagedPosts({
          page: postsPagination.page,
          limit: postsPagination.limit,
          sortBy: postsFilters.sortBy,
          search: postsFilters.search,
          filterDeleted: postsFilters.filterDeleted,
        })

        if (!isMounted) return
        setPosts(response.posts)
        setPostsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } catch (error) {
        if (!isMounted) return
        setPosts([])
        setPostsError(error?.message || 'Không thể tải danh sách bài viết để quản lý.')
      } finally {
        if (isMounted) {
          setIsPostsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [
    activeSection,
    postsPagination.page,
    postsPagination.limit,
    postsFilters.sortBy,
    postsFilters.search,
    postsFilters.filterDeleted,
  ])

  useEffect(() => {
    if (activeSection !== 'comments') return

    let isMounted = true

    const loadComments = async () => {
      setIsCommentsLoading(true)
      setCommentsError('')

      try {
        const response = await adminModerationService.listManagedComments({
          page: commentsPagination.page,
          limit: commentsPagination.limit,
          search: commentsFilters.search,
        })

        if (!isMounted) return
        setComments(response.comments)
        setCommentsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } catch (error) {
        if (!isMounted) return
        setComments([])
        setCommentsError(error?.message || 'Không thể tải danh sách bình luận.')
      } finally {
        if (isMounted) {
          setIsCommentsLoading(false)
        }
      }
    }

    loadComments()

    return () => {
      isMounted = false
    }
  }, [activeSection, commentsPagination.limit, commentsPagination.page, commentsFilters.search])

  useEffect(() => {
    if (!isAdmin && !isModerator) return

    let isMounted = true

    const loadDashboardData = async () => {
      setIsStatsLoading(true)
      setStatsError('')

      try {
        const statsQuery = {
          timeRange: statsFilters.timeRange,
          topLimit: statsFilters.topLimit,
        }
        const trendingQuery = {
          hoursBack: trendingFilters.hoursBack,
          limit: trendingFilters.limit,
        }

        const [overviewData, usersResponse, pendingRequests, approvedRequests, rejectedRequests, trendingData] = await Promise.all([
          adminModerationService.getPostStatistics(statsQuery),
          adminUsersService.listAdminUsers({ page: 1, limit: 1, status: 'all', q: '' }),
          adminUsersService.listAdminUnbanRequests({ status: 'pending', page: 1, limit: 1 }),
          adminUsersService.listAdminUnbanRequests({ status: 'approved', page: 1, limit: 1 }),
          adminUsersService.listAdminUnbanRequests({ status: 'rejected', page: 1, limit: 1 }),
          adminModerationService.getTrendingPosts(trendingQuery),
        ])

        if (!isMounted) return
        setOverview(overviewData)
        setStats(overviewData)
        const userStatsData = usersResponse.stats || {}
        setUserStats({
          totalUsers: userStatsData.totalUsers ?? usersResponse.pagination?.totalItems ?? 0,
          activeUsers: userStatsData.activeUsers ?? 0,
          lockedUsers: userStatsData.bannedUsers ?? 0,
          pendingUnbanRequests: pendingRequests.pagination?.totalItems ?? 0,
          approvedUnbanRequests: approvedRequests.pagination?.totalItems ?? 0,
          rejectedUnbanRequests: rejectedRequests.pagination?.totalItems ?? 0,
        })
        setTrendingPosts(trendingData)
      } catch (error) {
        if (!isMounted) return
        setOverview(null)
        setUserStats({
          totalUsers: 0,
          activeUsers: 0,
          lockedUsers: 0,
          pendingUnbanRequests: 0,
          approvedUnbanRequests: 0,
          rejectedUnbanRequests: 0,
        })
        setStats([])
        setTrendingPosts([])
        setStatsError(error?.message || 'Không thể tải thống kê bài viết.')
      } finally {
        if (isMounted) {
          setIsStatsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [isAdmin, isModerator, statsFilters.timeRange, statsFilters.topLimit, trendingFilters.hoursBack, trendingFilters.limit])

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

  const roleLabelMap = useMemo(() => ({
    user: 'Thành viên',
    moderator: 'Kiểm duyệt viên',
    admin: 'Quản trị viên',
  }), [])

  const handleRoleChange = async (userId, role) => {
    const targetUser = users.find((item) => item.id === userId)
    if (!targetUser) return

    setConfirmRoleModal({
      open: true,
      userId,
      role,
      userName: targetUser.fullName || targetUser.email || 'người dùng',
    })
  }

  const handleConfirmRoleChange = async () => {
    const { userId, role, userName } = confirmRoleModal
    const previousUsers = users
    const nextRoleLabel = roleLabelMap[role] || role

    setConfirmRoleModal({ open: false, userId: null, role: '', userName: '' })
    setBusyUserId(userId)

    try {
      await adminUsersService.updateUserRole(userId, role)
      toast.success(`Đã chuyển vai trò sang ${nextRoleLabel}. Tổng số người dùng hiện tại: ${previousUsers.length}`, { autoClose: 2500 })
      const response = await adminUsersService.listAdminUsers({ page: usersPagination.page, limit: usersPagination.limit, status: 'all', q: '' })
      setUsers(response.users)
      setUsersPagination((prev) => ({ ...prev, ...response.pagination }))
    } catch (error) {
      setUsers(previousUsers)
      setUsersError(error?.message || 'Không thể cập nhật vai trò người dùng.')
      toast.error(error?.message || 'Không thể cập nhật vai trò người dùng.', { autoClose: 2800 })
    } finally {
      setBusyUserId(null)
    }
  }

  const handleToggleUserStatus = async (userId) => {
    const targetUser = users.find((item) => item.id === userId)
    if (!targetUser) return

    setUsersError('')

    try {
      if (targetUser.status === 'active') {
        setBanModalState({
          isOpen: true,
          user: targetUser,
          version: Date.now(),
        })
        return
      } else {
        setBusyUserId(userId)
        await adminUsersService.unbanUser(userId)
        toast.success('Mở khóa tài khoản thành công!', { autoClose: 2200 })
      }

      const response = await adminUsersService.listAdminUsers({
        page: usersPagination.page,
        limit: usersPagination.limit,
        status: 'all',
        q: '',
      })

      setUsers(response.users)
      setUsersPagination((prev) => ({
        ...prev,
        ...response.pagination,
      }))
    } catch (error) {
      setUsersError(error?.message || 'Không thể cập nhật trạng thái người dùng.')
      toast.error(error?.message || 'Không thể cập nhật trạng thái người dùng.', { autoClose: 2800 })
    } finally {
      setBusyUserId(null)
    }
  }

  const handleCloseBanModal = () => {
    if (busyUserId) return
    setBanModalState({ isOpen: false, user: null, version: 0 })
  }

  const handleBanModalSubmit = async (payload) => {
    const targetUser = banModalState.user
    if (!targetUser?.id || !payload?.reason) {
      return
    }

    setUsersError('')
    setBusyUserId(targetUser.id)

    try {
      await adminUsersService.banUser(targetUser.id, payload)

      const response = await adminUsersService.listAdminUsers({
        page: usersPagination.page,
        limit: usersPagination.limit,
        status: 'all',
        q: '',
      })

      setUsers(response.users)
      setUsersPagination((prev) => ({
        ...prev,
        ...response.pagination,
      }))

      setBanModalState({ isOpen: false, user: null, version: 0 })
      toast.success('Khóa tài khoản thành công!', { autoClose: 2200 })
    } catch (error) {
      setUsersError(error?.message || 'Không thể khóa tài khoản người dùng.')
      toast.error(error?.message || 'Không thể khóa tài khoản người dùng.', { autoClose: 2800 })
    } finally {
      setBusyUserId(null)
    }
  }

  const handleUsersPageChange = (nextPage) => {
    setUsersPagination((prev) => {
      const totalPages = Number(prev.totalPages || 1)
      const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
      if (safePage === prev.page) return prev
      return { ...prev, page: safePage }
    })
  }

  const handleUnbanStatusFilterChange = (status) => {
    setUnbanStatusFilter(status)
    setUnbanRequestsPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }

  const handleUnbanRequestsPageChange = (nextPage) => {
    setUnbanRequestsPagination((prev) => {
      const totalPages = Number(prev.totalPages || 1)
      const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
      if (safePage === prev.page) return prev
      return { ...prev, page: safePage }
    })
  }

  const handleReviewUnbanRequest = async (requestId, decision, adminNote) => {
    setBusyUnbanRequestId(requestId)
    setUnbanRequestsError('')

    try {
      await adminUsersService.reviewAdminUnbanRequest(requestId, {
        decision,
        adminNote,
      })

      const response = await adminUsersService.listAdminUnbanRequests({
        status: unbanStatusFilter,
        page: unbanRequestsPagination.page,
        limit: unbanRequestsPagination.limit,
      })

      setUnbanRequests(response.requests)
      setUnbanRequestsPagination((prev) => ({
        ...prev,
        ...response.pagination,
      }))

      toast.success(
        decision === 'approve'
          ? 'Đã duyệt yêu cầu mở khóa.'
          : 'Đã từ chối yêu cầu mở khóa.',
        { autoClose: 2200 }
      )
    } catch (error) {
      setUnbanRequestsError(error?.message || 'Không thể xử lý yêu cầu mở khóa.')
      toast.error(error?.message || 'Không thể xử lý yêu cầu mở khóa.', { autoClose: 2800 })
    } finally {
      setBusyUnbanRequestId(null)
    }
  }

  const handleRefreshPosts = async () => {
    setIsPostsLoading(true)
    setPostsError('')

    try {
      if (isAdmin) {
        const response = await adminModerationService.listManagedPosts({
          page: postsPagination.page,
          limit: postsPagination.limit,
          sortBy: postsFilters.sortBy,
          search: postsFilters.search,
          filterDeleted: postsFilters.filterDeleted,
        })

        setPosts(response.posts)
        setPostsPagination((prev) => ({
          ...prev,
          ...response.pagination,
        }))
      } else {
        const recentPosts = await adminModerationService.listRecentPosts()
        setPosts(recentPosts)
        setPostsPagination((prev) => ({
          ...prev,
          page: 1,
          totalItems: recentPosts.length,
          totalPages: 1,
        }))
      }
    } catch (error) {
      setPostsError(error?.message || 'Không thể tải danh sách bài viết để quản lý.')
    } finally {
      setIsPostsLoading(false)
    }
  }

  const handleDeletePost = async (postId, reason) => {
    if (!postId || !reason?.trim()) return

    setBusyPostId(postId)
    setPostsError('')

    try {
      await adminModerationService.deletePostByModerator(postId, reason)
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
      setComments((prevComments) => prevComments.filter((comment) => comment.postId !== postId))
      toast.success('Đã xóa bài vi phạm và gửi thông báo cho người dùng.', { autoClose: 2200 })
    } catch (error) {
      setPostsError(error?.message || 'Không thể xóa bài viết vi phạm.')
      toast.error(error?.message || 'Không thể xóa bài viết vi phạm.', { autoClose: 2800 })
    } finally {
      setBusyPostId(null)
    }
  }

  const handleDeleteComment = async (comment, reason) => {
    if (!comment?.postId || !comment?.id || !reason?.trim()) return

    setBusyCommentId(comment.id)
    setCommentsError('')

    try {
      await adminModerationService.deleteCommentByModerator({
        postId: comment.postId,
        commentId: comment.id,
        reason,
      })

      setComments((prevComments) => prevComments.filter((item) => item.id !== comment.id))
      setCommentsPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, Number(prev.totalItems || 0) - 1),
      }))
      toast.success('Đã xóa bình luận vi phạm và gửi thông báo cho người dùng.', { autoClose: 2200 })
    } catch (error) {
      setCommentsError(error?.message || 'Không thể xóa bình luận vi phạm.')
      toast.error(error?.message || 'Không thể xóa bình luận vi phạm.', { autoClose: 2800 })
    } finally {
      setBusyCommentId(null)
    }
  }

  let activePanel
  if (activeSection === 'posts') {
    activePanel = (
      <PostsModerationPanel
        isAdminView={isAdmin}
        posts={posts}
        pagination={postsPagination}
        filters={postsFilters}
        isLoading={isPostsLoading}
        error={postsError}
        busyPostId={busyPostId}
        onDeletePost={handleDeletePost}
        onRefresh={handleRefreshPosts}
        onPageChange={(nextPage) => {
          setPostsPagination((prev) => {
            const totalPages = Number(prev.totalPages || 1)
            const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
            if (safePage === prev.page) return prev
            return { ...prev, page: safePage }
          })
        }}
        onFiltersChange={(changes) => {
          const { page, ...filterChanges } = changes
          setPostsFilters((prev) => ({
            ...prev,
            ...filterChanges,
          }))
          if (typeof page === 'number') {
            setPostsPagination((prev) => ({ ...prev, page }))
          }
        }}
      />
    )
  } else if (activeSection === 'comments') {
    activePanel = (
      <CommentsManagementPanel
        comments={comments}
        pagination={commentsPagination}
        filters={commentsFilters}
        isLoading={isCommentsLoading}
        error={commentsError}
        busyCommentId={busyCommentId}
        onDeleteComment={handleDeleteComment}
        onRefresh={async () => {
          setIsCommentsLoading(true)
          setCommentsError('')
          try {
            const response = await adminModerationService.listManagedComments({
              page: commentsPagination.page,
              limit: commentsPagination.limit,
              search: commentsFilters.search,
            })
            setComments(response.comments)
            setCommentsPagination((prev) => ({ ...prev, ...response.pagination }))
          } catch (error) {
            setCommentsError(error?.message || 'Không thể tải danh sách bình luận.')
          } finally {
            setIsCommentsLoading(false)
          }
        }}
        onPageChange={(nextPage) => {
          setCommentsPagination((prev) => {
            const totalPages = Number(prev.totalPages || 1)
            const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
            if (safePage === prev.page) return prev
            return { ...prev, page: safePage }
          })
        }}
        onFiltersChange={(changes) => {
          const { page, ...filterChanges } = changes
          setCommentsFilters((prev) => ({ ...prev, ...filterChanges }))
          if (typeof page === 'number') {
            setCommentsPagination((prev) => ({ ...prev, page }))
          }
        }}
      />
    )
  } else if (activeSection === 'unbanRequests') {
    activePanel = (
      <UnbanRequestsManagementPanel
        requests={unbanRequests}
        isLoading={isUnbanRequestsLoading}
        error={unbanRequestsError}
        pagination={unbanRequestsPagination}
        statusFilter={unbanStatusFilter}
        busyRequestId={busyUnbanRequestId}
        onStatusFilterChange={handleUnbanStatusFilterChange}
        onPageChange={handleUnbanRequestsPageChange}
        onReview={handleReviewUnbanRequest}
      />
    )
  } else {
    activePanel = (
      <DocumentStatsPanel
        stats={stats}
        trending={trendingPosts}
        statsFilters={statsFilters}
        trendingFilters={trendingFilters}
        isLoading={isStatsLoading}
        error={statsError}
        onRefresh={async () => {
          if (!isAdmin) return
          setIsStatsLoading(true)
          setStatsError('')

          try {
            const [statsData, trendingData] = await Promise.all([
              adminModerationService.getPostStatistics(statsFilters),
              adminModerationService.getTrendingPosts(trendingFilters),
            ])
            setStats(statsData)
            setTrendingPosts(trendingData)
          } catch (error) {
            setStatsError(error?.message || 'Không thể tải thống kê bài viết.')
          } finally {
            setIsStatsLoading(false)
          }
        }}
        onStatsFiltersChange={(changes) => {
          setStatsFilters((prev) => ({ ...prev, ...changes }))
        }}
        onTrendingFiltersChange={(changes) => {
          setTrendingFilters((prev) => ({ ...prev, ...changes }))
        }}
      />
    )
  }

  const usersPanel = (
    <UsersManagementPanel
      users={users}
      isLoading={isUsersLoading}
      error={usersError}
      pagination={usersPagination}
      busyUserId={busyUserId}
      onRoleChange={handleRoleChange}
      onToggleStatus={handleToggleUserStatus}
      onPageChange={handleUsersPageChange}
    />
  )

  const panelBySection = activeSection === 'dashboard' ? (
    <AdminOverviewPanel
      overview={overview}
      userStats={userStats}
      isLoading={isStatsLoading}
      error={statsError}
      onRefresh={async () => {
        if (!isAdmin && !isModerator) return
        setIsStatsLoading(true)
        setStatsError('')
        try {
          const statsQuery = {
            timeRange: statsFilters.timeRange,
            topLimit: statsFilters.topLimit,
          }
          const trendingQuery = {
            hoursBack: trendingFilters.hoursBack,
            limit: trendingFilters.limit,
          }
          const [overviewData, usersResponse, pendingRequests, approvedRequests, rejectedRequests, trendingData] = await Promise.all([
            adminModerationService.getPostStatistics(statsQuery),
            adminUsersService.listAdminUsers({ page: 1, limit: 1, status: 'all', q: '' }),
            adminUsersService.listAdminUnbanRequests({ status: 'pending', page: 1, limit: 1 }),
            adminUsersService.listAdminUnbanRequests({ status: 'approved', page: 1, limit: 1 }),
            adminUsersService.listAdminUnbanRequests({ status: 'rejected', page: 1, limit: 1 }),
            adminModerationService.getTrendingPosts(trendingQuery),
          ])
          setOverview(overviewData)
          setStats(overviewData)
          const userStatsData = usersResponse.stats || {}
          setUserStats({
            totalUsers: userStatsData.totalUsers ?? usersResponse.pagination?.totalItems ?? 0,
            activeUsers: userStatsData.activeUsers ?? 0,
            lockedUsers: userStatsData.bannedUsers ?? 0,
            pendingUnbanRequests: pendingRequests.pagination?.totalItems ?? 0,
            approvedUnbanRequests: approvedRequests.pagination?.totalItems ?? 0,
            rejectedUnbanRequests: rejectedRequests.pagination?.totalItems ?? 0,
          })
          setTrendingPosts(trendingData)
        } catch (error) {
          setStatsError(error?.message || 'Không thể tải thống kê bài viết.')
        } finally {
          setIsStatsLoading(false)
        }
      }}
    />
  ) : activeSection === 'users' ? usersPanel : activePanel
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
          users={users}
          posts={posts}
          comments={comments}
          documents={[]}
          userStats={userStats}
          overview={overview}
        />
        <div className="relative">
          {panelBySection}
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
        isOpen={confirmRoleModal.open}
        userName={confirmRoleModal.userName}
        roleLabel={roleLabelMap[confirmRoleModal.role] || confirmRoleModal.role}
        isLoading={Boolean(busyUserId)}
        onCancel={() => setConfirmRoleModal({ open: false, userId: null, role: '', userName: '' })}
        onConfirm={handleConfirmRoleChange}
      />

      <BanUserModal
        key={banModalState.version}
        isOpen={banModalState.isOpen}
        user={banModalState.user}
        isSubmitting={Boolean(busyUserId)}
        onCancel={handleCloseBanModal}
        onSubmit={handleBanModalSubmit}
      />
    </div>
  )
}

export default AdminDashboardPage
