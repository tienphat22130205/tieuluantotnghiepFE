import { useState, useEffect, useCallback } from 'react'
import adminModerationService from '../services/adminModerationService'
import adminUsersService from '../services/adminUsersService'

/**
 * Custom hook quản lý dữ liệu thống kê tổng quan (Dashboard Overview & Document Stats) cho Admin.
 */
export const useAdminStats = ({ isAdmin, isModerator }) => {
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
