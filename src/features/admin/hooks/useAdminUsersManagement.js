import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'react-toastify'
import adminUsersService from '../services/adminUsersService'

/**
 * Custom hook quản lý logic Người dùng và Yêu cầu mở khóa (Unban requests) cho Admin.
 */
export const useAdminUsersManagement = ({ activeSection, isModerator }) => {
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

  // Load Users List
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

  // Load Unban Requests List
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

  const roleLabelMap = useMemo(
    () => ({
      user: 'Thành viên',
      moderator: 'Kiểm duyệt viên',
      admin: 'Quản trị viên',
    }),
    []
  )

  const handleRoleChange = useCallback(
    (userId, role) => {
      const targetUser = users.find((item) => item.id === userId)
      if (!targetUser) return

      setConfirmRoleModal({
        open: true,
        userId,
        role,
        userName: targetUser.fullName || targetUser.email || 'người dùng',
      })
    },
    [users]
  )

  const handleConfirmRoleChange = useCallback(async () => {
    const { userId, role } = confirmRoleModal
    const previousUsers = users
    const nextRoleLabel = roleLabelMap[role] || role

    setConfirmRoleModal({ open: false, userId: null, role: '', userName: '' })
    setBusyUserId(userId)

    try {
      await adminUsersService.updateUserRole(userId, role)
      toast.success(
        `Đã chuyển vai trò sang ${nextRoleLabel}. Tổng số người dùng hiện tại: ${previousUsers.length}`,
        { autoClose: 2500 }
      )
      const response = await adminUsersService.listAdminUsers({
        page: usersPagination.page,
        limit: usersPagination.limit,
        status: 'all',
        q: '',
      })
      setUsers(response.users)
      setUsersPagination((prev) => ({ ...prev, ...response.pagination }))
    } catch (error) {
      setUsers(previousUsers)
      setUsersError(error?.message || 'Không thể cập nhật vai trò người dùng.')
      toast.error(error?.message || 'Không thể cập nhật vai trò người dùng.', { autoClose: 2800 })
    } finally {
      setBusyUserId(null)
    }
  }, [confirmRoleModal, users, roleLabelMap, usersPagination.page, usersPagination.limit])

  const handleToggleUserStatus = useCallback(
    async (userId) => {
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
    },
    [users, usersPagination.page, usersPagination.limit]
  )

  const handleCloseBanModal = useCallback(() => {
    if (busyUserId) return
    setBanModalState({ isOpen: false, user: null, version: 0 })
  }, [busyUserId])

  const handleBanModalSubmit = useCallback(
    async (payload) => {
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
    },
    [banModalState.user, usersPagination.page, usersPagination.limit]
  )

  const handleUsersPageChange = useCallback((nextPage) => {
    setUsersPagination((prev) => {
      const totalPages = Number(prev.totalPages || 1)
      const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
      if (safePage === prev.page) return prev
      return { ...prev, page: safePage }
    })
  }, [])

  const handleUnbanStatusFilterChange = useCallback((status) => {
    setUnbanStatusFilter(status)
    setUnbanRequestsPagination((prev) => ({
      ...prev,
      page: 1,
    }))
  }, [])

  const handleUnbanRequestsPageChange = useCallback((nextPage) => {
    setUnbanRequestsPagination((prev) => {
      const totalPages = Number(prev.totalPages || 1)
      const safePage = Math.min(Math.max(1, Number(nextPage || 1)), totalPages)
      if (safePage === prev.page) return prev
      return { ...prev, page: safePage }
    })
  }, [])

  const handleReviewUnbanRequest = useCallback(
    async (requestId, decision, adminNote) => {
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
    },
    [unbanStatusFilter, unbanRequestsPagination.page, unbanRequestsPagination.limit]
  )

  return {
    users,
    isUsersLoading,
    usersError,
    busyUserId,
    usersPagination,
    roleLabelMap,
    confirmRoleModal,
    setConfirmRoleModal,
    banModalState,
    handleRoleChange,
    handleConfirmRoleChange,
    handleToggleUserStatus,
    handleCloseBanModal,
    handleBanModalSubmit,
    handleUsersPageChange,
    unbanRequests,
    isUnbanRequestsLoading,
    unbanRequestsError,
    unbanStatusFilter,
    unbanRequestsPagination,
    busyUnbanRequestId,
    handleUnbanStatusFilterChange,
    handleUnbanRequestsPageChange,
    handleReviewUnbanRequest,
  }
}

export default useAdminUsersManagement
