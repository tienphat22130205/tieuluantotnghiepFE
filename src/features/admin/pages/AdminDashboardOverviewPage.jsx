import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AdminOverviewPanel } from '../components'
import adminUsersService from '../services/adminUsersService'
import adminModerationService from '../services/adminModerationService'
import { isAdminUser } from '@/utils/auth'

const AdminDashboardOverviewPage = () => {
  const navigate = useNavigate()
  const { user, role } = useSelector((state) => state.auth)
  const isAdmin = isAdminUser(user, role)

  const [overview, setOverview] = useState(null)
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    pendingUnbanRequests: 0,
    approvedUnbanRequests: 0,
    rejectedUnbanRequests: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [overviewData, usersResponse, pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
        adminModerationService.getPostStatistics({ timeRange: '90d', topLimit: 5 }),
        adminUsersService.listAdminUsers({ page: 1, limit: 200, status: 'all', q: '' }),
        adminUsersService.listAdminUnbanRequests({ status: 'pending', page: 1, limit: 20 }),
        adminUsersService.listAdminUnbanRequests({ status: 'approved', page: 1, limit: 20 }),
        adminUsersService.listAdminUnbanRequests({ status: 'rejected', page: 1, limit: 20 }),
      ])

      setOverview(overviewData)
      setUserStats({
        totalUsers: usersResponse.users.length,
        activeUsers: usersResponse.users.filter((item) => item.status === 'active').length,
        lockedUsers: usersResponse.users.filter((item) => item.status === 'locked').length,
        pendingUnbanRequests: pendingRequests.pagination?.totalItems ?? pendingRequests.requests.length,
        approvedUnbanRequests: approvedRequests.pagination?.totalItems ?? approvedRequests.requests.length,
        rejectedUnbanRequests: rejectedRequests.pagination?.totalItems ?? rejectedRequests.requests.length,
      })
    } catch (loadError) {
      setError(loadError?.message || 'Không thể tải dữ liệu dashboard.')
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    loadOverview()
  }, [isAdmin, loadOverview])

  if (!isAdmin) return null

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Trang tổng quan riêng cho admin, không ảnh hưởng các mục quản lý khác.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Tới menu quản lý
        </button>
      </div>

      <AdminOverviewPanel
        overview={overview}
        userStats={userStats}
        isLoading={isLoading}
        error={error}
        onRefresh={loadOverview}
      />
    </div>
  )
}

export default AdminDashboardOverviewPage
