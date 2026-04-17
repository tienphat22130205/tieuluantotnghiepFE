import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AdminSidebar,
  AdminSummaryCards,
  AdminTopbar,
  BanUserModal,
  CommentsManagementPanel,
  DocumentStatsPanel,
  PostsModerationPanel,
  UsersManagementPanel,
} from '../components'
import { toast } from 'react-toastify'
import {
  adminMenuItems,
  initialComments,
  initialDocuments,
  initialPosts,
} from '../data/adminMockData'
import { logout } from '@/features/auth/store/authSlice'
import { COLORS } from '@/theme/colors'
import adminUsersService from '../services/adminUsersService'

const AdminDashboardPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [activeSection, setActiveSection] = useState('users')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [users, setUsers] = useState([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [busyUserId, setBusyUserId] = useState(null)
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
  const [posts, setPosts] = useState(initialPosts)
  const [comments, setComments] = useState(initialComments)
  const [documents] = useState(initialDocuments)

  useEffect(() => {
    if (activeSection !== 'users') return

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
  }, [activeSection, usersPagination.limit, usersPagination.page])

  const handleSelectSection = (section) => {
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

  const handleRoleChange = async (userId, role) => {
    const previousUsers = users
    setBusyUserId(userId)

    setUsers((prevUsers) => prevUsers.map((item) => (item.id === userId ? { ...item, role } : item)))
    try {
      await adminUsersService.updateUserRole(userId, role)
    } catch (error) {
      setUsers(previousUsers)
      setUsersError(error?.message || 'Không thể cập nhật vai trò người dùng.')
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

  const handleAddPost = (postForm) => {
    const newPost = {
      id: `p${Date.now()}`,
      author: postForm.author.trim(),
      content: postForm.content.trim(),
      documentTitle: postForm.documentTitle.trim(),
      status: 'pending',
      documentValid: true,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    }

    setPosts((prevPosts) => [newPost, ...prevPosts])
  }

  const handleUpdatePost = (postId, changes) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, ...changes } : post)))
  }

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    setComments((prevComments) => prevComments.filter((comment) => comment.postId !== postId))
  }

  const handleDeleteComment = (commentId) => {
    setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
  }

  const activePanel = useMemo(() => {
    if (activeSection === 'posts') {
      return (
        <PostsModerationPanel
          posts={posts}
          onAddPost={handleAddPost}
          onDeletePost={handleDeletePost}
          onUpdatePost={handleUpdatePost}
        />
      )
    }

    if (activeSection === 'comments') {
      return <CommentsManagementPanel comments={comments} posts={posts} onDeleteComment={handleDeleteComment} />
    }

    return <DocumentStatsPanel documents={documents} />
  }, [activeSection, comments, documents, posts])

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

  const panelBySection = activeSection === 'users' ? usersPanel : activePanel

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#f5f6fa_55%)] font-sans lg:grid"
      style={{
        gridTemplateColumns: isDesktopCollapsed ? '88px 1fr' : '300px 1fr',
        transition: 'grid-template-columns 320ms ease',
        color: COLORS.text,
        backgroundColor: COLORS.background,
      }}
    >
      <AdminSidebar
        activeSection={activeSection}
        menuItems={adminMenuItems}
        onSelect={handleSelectSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
      />

      <main className="flex flex-col gap-4 p-3 sm:p-4 lg:p-5">
        <AdminTopbar
          activeSection={activeSection}
          user={user}
          onLogout={handleLogout}
          onToggleMenu={handleToggleMenu}
          isDesktopCollapsed={isDesktopCollapsed}
        />
        <AdminSummaryCards users={users} posts={posts} comments={comments} documents={documents} />
        {panelBySection}
      </main>

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
