import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import userService from '@/features/user/services/userService'
import postService from '@/features/post/services/postService'
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
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [recentSearches, setRecentSearches] = useState([])

  const query = (searchParams.get('q') || '').trim()
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1)
  const tab = searchParams.get('tab') || 'users'

  useEffect(() => {
    setRecentSearches(readRecentSearches())
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setUsers([])
      setPosts([])
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
        if (tab === 'users') {
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
        } else {
          const response = await postService.searchPosts(query, page, SEARCH_LIMIT)
          if (!isMounted) return

          const rawPosts = response?.data?.items || response?.items || []
          const normalizedPosts = rawPosts.map((post) => ({
            ...post,
            user: post.user || post.author,
          }))
          const pagination = normalizePagination(response, page, SEARCH_LIMIT, normalizedPosts.length)

          setPosts(normalizedPosts)
          setTotalPages(pagination.totalPages)
          setTotalItems(pagination.totalItems)
        }

        setRecentSearches((prev) => {
          const nextList = pushRecentKeyword(prev, query)
          persistRecentSearches(nextList)
          return nextList
        })
      } catch (searchError) {
        if (!isMounted) return
        setUsers([])
        setPosts([])
        setTotalPages(1)
        setTotalItems(0)
        setError(searchError?.message || (tab === 'users' ? 'Không thể tìm kiếm tài khoản' : 'Không thể tìm kiếm bài viết'))
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
  }, [query, page, tab, currentUser])

  const summaryText = useMemo(() => {
    if (query.length < 2) return 'Tìm kiếm được thực hiện từ ô tìm kiếm ở layout chính.'
    if (isLoading) return tab === 'users' ? 'Đang tìm kiếm tài khoản...' : 'Đang tìm kiếm bài viết...'
    if (error) return error

    const count = tab === 'users' ? users.length : posts.length
    if (count === 0) return tab === 'users' ? 'Không tìm thấy tài khoản phù hợp.' : 'Không tìm thấy bài viết phù hợp.'

    const label = tab === 'users' ? 'tài khoản' : 'bài viết'
    return `Tìm thấy ${totalItems || count} ${label}` + (totalPages > 1 ? ` • Trang ${page}/${totalPages}` : '')
  }, [query.length, isLoading, error, tab, users.length, posts.length, totalItems, totalPages, page])

  const goToSearchQuery = (keyword, nextPage = 1, nextTab = tab) => {
    const normalized = keyword.trim()
    const params = new URLSearchParams()
    if (normalized) params.set('q', normalized)
    if (nextTab && nextTab !== 'users') params.set('tab', nextTab)
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
    tab,
    users,
    posts,
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
