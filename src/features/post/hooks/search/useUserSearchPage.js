import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import userService from '@/features/user/services/userService'
import { extractItems, getUserId } from '@/utils/friendship'

const RECENT_SEARCHES_KEY = 'recent-user-searches'
const MAX_RECENT_SEARCHES = 8
const SEARCH_LIMIT = 10

const normalizeUsersFromResponse = (response) => {
  const items = extractItems(response)

  return items
    .map((item) => ({
      ...item,
      _id: item?._id || item?.id,
      full_name: item?.full_name || item?.fullName || `${item?.firstName || ''} ${item?.lastName || ''}`.trim(),
      username: item?.username || '',
      avatar: item?.avatar || null,
    }))
    .filter((item) => item?._id)
}

const normalizePagination = (response, fallbackPage, fallbackLimit, fallbackLength) => {
  const data = response?.data || response || {}

  const currentPage = Number(data?.page || data?.currentPage || fallbackPage || 1)
  const pageSize = Number(data?.limit || data?.pageSize || fallbackLimit || SEARCH_LIMIT)
  const totalItems = Number(data?.total || data?.totalItems || data?.count || fallbackLength || 0)
  const totalPages = Math.max(1, Number(data?.totalPages || Math.ceil(totalItems / Math.max(pageSize, 1)) || 1))

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  }
}

const readRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => typeof item === 'string' && item.trim()).slice(0, MAX_RECENT_SEARCHES)
  } catch {
    return []
  }
}

const persistRecentSearches = (nextList) => {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextList))
}

const pushRecentKeyword = (prevList, keyword) => {
  const normalized = keyword.trim()
  if (!normalized) return prevList

  return [
    normalized,
    ...prevList.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES)
}

const useUserSearchPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth)
  const [searchParams, setSearchParams] = useSearchParams()

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [recentSearches, setRecentSearches] = useState([])

  const query = (searchParams.get('q') || '').trim()
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1)

  useEffect(() => {
    setRecentSearches(readRecentSearches())
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setUsers([])
      setError('')
      setTotalPages(1)
      setTotalItems(0)
      setIsLoading(false)
      return
    }

    let isMounted = true

    const runSearch = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await userService.searchUsers({ q: query, page, limit: SEARCH_LIMIT })
        if (!isMounted) return

        const currentUserId = getUserId(currentUser)
        const normalizedUsers = normalizeUsersFromResponse(response).filter(
          (item) => String(getUserId(item)) !== String(currentUserId)
        )
        const pagination = normalizePagination(response, page, SEARCH_LIMIT, normalizedUsers.length)

        setUsers(normalizedUsers)
        setTotalPages(pagination.totalPages)
        setTotalItems(pagination.totalItems)
        setRecentSearches((prev) => {
          const nextList = pushRecentKeyword(prev, query)
          persistRecentSearches(nextList)
          return nextList
        })
      } catch (searchError) {
        if (!isMounted) return
        setUsers([])
        setTotalPages(1)
        setTotalItems(0)
        setError(searchError?.message || 'Không thể tìm kiếm tài khoản')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    runSearch()

    return () => {
      isMounted = false
    }
  }, [query, page, currentUser])

  const summaryText = useMemo(() => {
    if (query.length < 2) return 'Tìm kiếm được thực hiện từ ô tìm kiếm ở layout chính.'
    if (isLoading) return 'Đang tìm kiếm tài khoản...'
    if (error) return error
    if (users.length === 0) return 'Không tìm thấy tài khoản phù hợp.'

    return `Tìm thấy ${totalItems || users.length} tài khoản` + (totalPages > 1 ? ` • Trang ${page}/${totalPages}` : '')
  }, [query.length, isLoading, error, users.length, totalItems, totalPages, page])

  const goToSearchQuery = (keyword, nextPage = 1) => {
    const normalized = keyword.trim()
    const params = new URLSearchParams()
    if (normalized) params.set('q', normalized)
    if (nextPage > 1) params.set('page', String(nextPage))
    setSearchParams(params, { replace: true })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    persistRecentSearches([])
  }

  return {
    query,
    page,
    users,
    isLoading,
    error,
    totalPages,
    totalItems,
    recentSearches,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    summaryText,
    goToSearchQuery,
    clearRecentSearches,
  }
}

export default useUserSearchPage
