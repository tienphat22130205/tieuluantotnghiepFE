import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AdminSidebar,
  AdminSummaryCards,
  AdminTopbar,
  CommentsManagementPanel,
  DocumentStatsPanel,
  PostsModerationPanel,
  UsersManagementPanel,
} from '../components'
import {
  adminMenuItems,
  initialComments,
  initialDocuments,
  initialPosts,
  initialUsers,
} from '../data/adminMockData'
import { logout } from '@/features/auth/store/authSlice'
import { COLORS } from '@/theme/colors'

const AdminDashboardPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [activeSection, setActiveSection] = useState('users')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [users, setUsers] = useState(initialUsers)
  const [posts, setPosts] = useState(initialPosts)
  const [comments, setComments] = useState(initialComments)
  const [documents] = useState(initialDocuments)

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

  const handleRoleChange = (userId, role) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role } : user)))
  }

  const handleToggleUserStatus = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id !== userId) return user
        const nextStatus = user.status === 'active' ? 'locked' : 'active'
        return { ...user, status: nextStatus }
      })
    )
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
    if (activeSection === 'users') {
      return (
        <UsersManagementPanel users={users} onRoleChange={handleRoleChange} onToggleStatus={handleToggleUserStatus} />
      )
    }

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
  }, [activeSection, comments, documents, posts, users])

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
        {activePanel}
      </main>
    </div>
  )
}

export default AdminDashboardPage
