import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import adminModerationService from '../services/adminModerationService'
import adminUsersService from '../services/adminUsersService'
import { getSocket } from '@/services/socketClient'

/**
 * Custom hook quản lý dữ liệu thống kê tổng quan (Dashboard Overview & Document Stats) cho Admin.
 * Đã tối ưu Realtime qua Socket.io: tự động đồng bộ số liệu khi có người dùng, bài viết, bình luận mới.
 */
export const useAdminStats = ({ isAdmin, isModerator }) => {
  const { token } = useSelector((state) => state.auth)
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

  const loadDashboardData = useCallback(async () => {
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

      const [overviewData, usersResponse, pendingRequests, approvedRequests, rejectedRequests, trendingData] =
        await Promise.all([
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
      setIsStatsLoading(false)
    }
  }, [
    isAdmin,
    isModerator,
    statsFilters.timeRange,
    statsFilters.topLimit,
    trendingFilters.hoursBack,
    trendingFilters.limit,
  ])

  // Load stats on mount / filters change
  useEffect(() => {
    let isMounted = true

    const fetchInitial = async () => {
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

        const [overviewData, usersResponse, pendingRequests, approvedRequests, rejectedRequests, trendingData] =
          await Promise.all([
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

    fetchInitial()

    return () => {
      isMounted = false
    }
  }, [
    isAdmin,
    isModerator,
    statsFilters.timeRange,
    statsFilters.topLimit,
    trendingFilters.hoursBack,
    trendingFilters.limit,
  ])

  // Real-time synchronization via Socket.io
  useEffect(() => {
    if ((!isAdmin && !isModerator) || !token) return

    const socket = getSocket(token)
    if (!socket) return

    socket.emit('stats:join')

    const handleStatsUpdate = (payload) => {
      const type = payload?.eventType
      if (!type) return

      if (type === 'user:registered') {
        setUserStats((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          activeUsers: prev.activeUsers + 1,
        }))
      } else if (type === 'user:banned') {
        setUserStats((prev) => ({
          ...prev,
          lockedUsers: prev.lockedUsers + 1,
          activeUsers: Math.max(0, prev.activeUsers - 1),
        }))
      } else if (type === 'user:unbanned') {
        setUserStats((prev) => ({
          ...prev,
          lockedUsers: Math.max(0, prev.lockedUsers - 1),
          activeUsers: prev.activeUsers + 1,
        }))
      } else if (type === 'unban_request:created') {
        setUserStats((prev) => ({
          ...prev,
          pendingUnbanRequests: prev.pendingUnbanRequests + 1,
        }))
      } else if (type === 'unban_request:reviewed') {
        setUserStats((prev) => ({
          ...prev,
          pendingUnbanRequests: Math.max(0, prev.pendingUnbanRequests - 1),
        }))
      } else if (type === 'post:created') {
        setOverview((prev) => (prev ? { ...prev, totalPosts: (prev.totalPosts || 0) + 1 } : prev))
      } else if (type === 'post:deleted') {
        setOverview((prev) => (prev ? { ...prev, totalPosts: Math.max(0, (prev.totalPosts || 0) - 1) } : prev))
      } else if (type === 'comment:added') {
        setOverview((prev) => (prev ? { ...prev, totalComments: (prev.totalComments || 0) + 1 } : prev))
      } else if (type === 'comment:deleted') {
        setOverview((prev) => (prev ? { ...prev, totalComments: Math.max(0, (prev.totalComments || 0) - 1) } : prev))
      }
    }

    socket.on('stats:update', handleStatsUpdate)
    socket.on('admin:stats_update', handleStatsUpdate)

    return () => {
      socket.off('stats:update', handleStatsUpdate)
      socket.off('admin:stats_update', handleStatsUpdate)
      socket.emit('stats:leave')
    }
  }, [isAdmin, isModerator, token])

  const handleRefreshStatsOnly = useCallback(async () => {
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
  }, [isAdmin, statsFilters, trendingFilters])

  return {
    overview,
    userStats,
    stats,
    trendingPosts,
    statsFilters,
    setStatsFilters,
    trendingFilters,
    setTrendingFilters,
    isStatsLoading,
    statsError,
    loadDashboardData,
    handleRefreshStatsOnly,
  }
}

export default useAdminStats
