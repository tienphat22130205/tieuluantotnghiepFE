import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import userService from '@/features/user/services/userService'
import { getUserId, extractItems } from '@/utils/friendship'
import { AiOutlineSearch } from 'react-icons/ai'
import { Button, LoadingSpinner } from '@/components/ui'
import useFriendsPage from '../hooks/useFriendsPage'
import { FRIENDS_PAGE_TEXT } from '@/constants/messages'
import FriendsMobileDrawer from '../components/friends/FriendsMobileDrawer'
import FriendsSidebar from '../components/friends/FriendsSidebar'
import FriendsMobileHeader from '../components/friends/FriendsMobileHeader'
import FriendsTabContent from '../components/friends/FriendsTabContent'
import { usePreferences } from '@/context/PreferencesContext'

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

const FriendsPage = () => {
  const { t } = usePreferences()
  const [activeMenu, setActiveMenu] = useState('home')
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { user: currentUser } = useSelector((state) => state.auth)
  const currentUserId = getUserId(currentUser)

  const {
    incomingRequests,
    sentRequests,
    friends,
    suggestions,
    isLoading,
    actingRequestId,
    actingFriendId,
    actingSuggestionId,
    handleRespondRequest,
    handleCancelSentRequest,
    handleUnfriend,
    handleSendRequest,
    handleSendRequestFromSuggestion,
  } = useFriendsPage()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const performUserSearch = async () => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) return

    setIsSearching(true)
    setSearchError('')
    setHasSearched(true)

    try {
      const response = await userService.searchUsers({ q: trimmed, page: 1, limit: 20 })
      const normalizedUsers = normalizeUsersFromResponse(response).filter(
        (item) => String(getUserId(item)) !== String(currentUserId)
      )
      setSearchResults(normalizedUsers)
    } catch (err) {
      setSearchResults([])
      setSearchError(err?.message || 'Không thể tìm kiếm tài khoản')
    } finally {
      setIsSearching(false)
    }
  }

  const getRelationship = (userId) => {
    const targetId = String(userId)
    const isFriend = friends.some((f) => String(getUserId(f)) === targetId)
    if (isFriend) return { type: 'friend' }

    const incoming = incomingRequests.find((r) => String(getUserId(r.user)) === targetId)
    if (incoming) return { type: 'incoming', requestId: incoming._id }

    const sent = sentRequests.find((r) => String(getUserId(r.user)) === targetId)
    if (sent) return { type: 'sent', requestId: sent._id }

    return { type: 'none' }
  }

  const homeRequests = useMemo(() => incomingRequests.slice(0, 6), [incomingRequests])
  const homeSuggestions = useMemo(() => suggestions.slice(0, 8), [suggestions])

  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return friends
    const query = friendSearchQuery.toLowerCase()
    return friends.filter((friend) => {
      const name = (friend.full_name || friend.fullName || friend.username || '').toLowerCase()
      return name.includes(query)
    })
  }, [friends, friendSearchQuery])

  if (isLoading) {
    return <LoadingSpinner text={FRIENDS_PAGE_TEXT.loading} />
  }

  return (
    <div className="min-h-[70vh] relative">
      {/* 1. Giao diện Mobile Drawer (trượt từ phải sang) */}
      <FriendsMobileDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        t={t}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* 2. Giao diện Desktop Sidebar (sticky bên trái) */}
        <FriendsSidebar
          activeMenu={activeMenu}
          onSelectMenu={setActiveMenu}
          t={t}
        />

        <main className="space-y-6">
          {/* Header Mobile với nút mở Drawer danh mục */}
          <FriendsMobileHeader
            title={t('friends.title')}
            onOpenMenu={() => setIsMenuOpen(true)}
          />

          {/* Global Friends Search input */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2 transition-colors">
            <div className="relative flex-1">
              <AiOutlineSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (!e.target.value.trim()) {
                    setSearchResults([])
                    setHasSearched(false)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    performUserSearch()
                  }
                }}
                placeholder={t('friends.searchPlaceholder')}
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button
              onClick={performUserSearch}
              disabled={isSearching || searchQuery.trim().length < 2}
              className="rounded-full px-5 py-2 font-semibold shrink-0"
            >
              {t('friends.searchBtn')}
            </Button>
          </div>

          {/* Nội dung danh mục hoặc kết quả tìm kiếm */}
          <FriendsTabContent
            t={t}
            hasSearched={hasSearched}
            searchQuery={searchQuery}
            isSearching={isSearching}
            searchResults={searchResults}
            onCloseSearch={() => {
              setSearchQuery('')
              setSearchResults([])
              setHasSearched(false)
            }}
            getRelationship={getRelationship}
            actingFriendId={actingFriendId}
            actingRequestId={actingRequestId}
            actingSuggestionId={actingSuggestionId}
            handleUnfriend={handleUnfriend}
            handleRespondRequest={handleRespondRequest}
            handleCancelSentRequest={handleCancelSentRequest}
            handleSendRequest={handleSendRequest}
            handleSendRequestFromSuggestion={handleSendRequestFromSuggestion}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            incomingRequests={incomingRequests}
            sentRequests={sentRequests}
            friends={friends}
            filteredFriends={filteredFriends}
            suggestions={suggestions}
            homeRequests={homeRequests}
            homeSuggestions={homeSuggestions}
            friendSearchQuery={friendSearchQuery}
            setFriendSearchQuery={setFriendSearchQuery}
          />
        </main>
      </div>
    </div>
  )
}

export default FriendsPage
