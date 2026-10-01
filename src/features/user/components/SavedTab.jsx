import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BsBookmark, BsBookmarkFill, BsGrid3X3Gap, BsListUl, BsSearch } from 'react-icons/bs'
import { AiOutlineCompass, AiOutlineClose } from 'react-icons/ai'
import { AnimatePresence } from 'framer-motion'
import { getSavedPosts, fetchSavedPostsFromApi } from '@/features/post/utils/savedPostsStorage'
import SavedPostCard from './SavedPostCard'
import { LoadingSpinner } from '@/components/ui'

/**
 * SavedTab – Hiển thị danh sách các bài viết đã lưu (Bookmark) nhỏ gọn, tinh tế.
 */
const SavedTab = () => {
  const [savedPosts, setSavedPosts] = useState(() => getSavedPosts())
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // 1. Initial fetch from fast local cache
    setSavedPosts(getSavedPosts())

    // 2. Đồng bộ ngầm từ Backend MongoDB
    setIsLoading(true)
    fetchSavedPostsFromApi()
      .then((items) => {
        if (Array.isArray(items)) {
          setSavedPosts(items)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })

    // 3. Listen for bookmark updates in real-time
    const handleSavedUpdate = (e) => {
      if (Array.isArray(e.detail?.list)) {
        setSavedPosts(e.detail.list)
      } else {
        setSavedPosts(getSavedPosts())
      }
    }

    window.addEventListener('zivo_saved_posts_updated', handleSavedUpdate)
    return () => window.removeEventListener('zivo_saved_posts_updated', handleSavedUpdate)
  }, [])

  // Filter posts by search query (author name or post content)
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return savedPosts

    return savedPosts.filter((post) => {
      const content = String(post.content || post.text || post.caption || '').toLowerCase()
      const author = post.user || post.author || {}
      const name = String(
        author.full_name || author.fullName || author.username || `${author.firstName || ''} ${author.lastName || ''}`
      ).toLowerCase()
      return content.includes(q) || name.includes(q)
    })
  }, [savedPosts, searchQuery])

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner & Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <BsBookmarkFill size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Bài viết đã lưu</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Riêng tư
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chỉ bạn mới có thể nhìn thấy danh sách bài viết này.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Counter badge */}
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-xl border border-blue-100 dark:border-blue-900/40">
              {savedPosts.length} bài viết
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Dạng lưới"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <BsGrid3X3Gap size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Dạng danh sách"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <BsListUl size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Search bar inside header if posts exist */}
        {savedPosts.length > 0 && (
          <div className="pt-3">
            <div className="relative">
              <BsSearch
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm trong bài viết đã lưu theo nội dung hoặc người đăng..."
                className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <AiOutlineClose size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Saved Posts Grid/List Feed */}
      {filteredPosts.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4'
              : 'space-y-3 sm:space-y-3.5'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <SavedPostCard
                key={post._id || post.id}
                post={post}
                viewMode={viewMode}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : isLoading ? (
        <div className="py-16 flex justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <LoadingSpinner text="Đang tải bài viết đã lưu..." />
        </div>
      ) : savedPosts.length > 0 ? (
        /* Empty Search Results */
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Không tìm thấy bài viết đã lưu nào khớp với từ khóa{' '}
            <strong className="text-slate-800 dark:text-slate-200">"{searchQuery}"</strong>.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-2xs">
            <BsBookmark size={26} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Chưa có bài viết nào được lưu
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Khi bạn thấy một bài viết hoặc hình ảnh thú vị trên bảng tin, hãy nhấn biểu tượng bookmark để lưu lại xem sau tại đây.
          </p>
          <div className="mt-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition"
            >
              <AiOutlineCompass size={16} />
              <span>Khám phá bảng tin</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedTab
