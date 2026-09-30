import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AiOutlineClose,
  AiOutlineSearch,
  AiOutlineCheckCircle,
  AiOutlineTag,
  AiOutlineUser,
  AiOutlineFileText,
  AiOutlineClockCircle,
} from 'react-icons/ai'
import { BsStars } from 'react-icons/bs'
import { FiArrowRight } from 'react-icons/fi'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Avatar, Button } from '@/components/ui'
import { usePreferences } from '@/context/PreferencesContext'
import useUserSearchPage from '../hooks/search/useUserSearchPage'
import PostCard from '../components/PostCard'

const SearchPage = () => {
  const { t } = usePreferences()
  const {
    query,
    page,
    tab,
    users,
    posts,
    aiOverview,
    keyInsights,
    suggestedKeywords,
    isLoading,
    error,
    totalPages,
    totalItems,
    recentSearches,
    hasPrev,
    hasNext,
    summaryText,
    goToSearchQuery,
    clearRecentSearches,
  } = useUserSearchPage()

  const [searchKeyword, setSearchKeyword] = useState(query)

  useEffect(() => {
    setSearchKeyword(query)
  }, [query])

  const handleSearchSubmit = () => {
    const trimmed = searchKeyword.trim()
    goToSearchQuery(trimmed, 1)
  }

  const handleClearInput = () => {
    setSearchKeyword('')
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-3.5 sm:space-y-5 px-3 sm:px-4 md:px-0 pb-24 md:pb-12">
      {/* 1. Main Search Header Card */}
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 md:p-6 shadow-xs transition-colors">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tìm kiếm</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            Khám phá bài viết, hình ảnh và kết nối bạn bè bằng công nghệ AI
          </p>
        </div>
        
        {/* Search input field with clear button & compact action */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <AiOutlineSearch
              size={18}
              className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearchSubmit()
                }
              }}
              placeholder="Nhập từ khóa, chủ đề, đồ vật hoặc câu hỏi..."
              className="w-full rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 sm:pl-11 pr-9 sm:pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Xóa chữ"
              >
                <AiOutlineClose size={14} />
              </button>
            )}
          </div>
          <Button
            size="md"
            onClick={handleSearchSubmit}
            className="rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-6 text-xs sm:text-sm font-bold shrink-0 shadow-xs hover:shadow-sm transition"
          >
            Tìm kiếm
          </Button>
        </div>

        {/* Tab Navigation Segmented Bar (Symmetrical & Compact on Mobile) */}
        {query.length >= 2 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl max-w-md">
              <button
                type="button"
                onClick={() => goToSearchQuery(query, 1, 'posts')}
                className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer outline-none ${
                  tab === 'posts'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <AiOutlineFileText size={15} className="shrink-0" />
                <span>Bài viết</span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold rounded-md ${
                    tab === 'posts'
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-100 dark:bg-primary-950/70 text-primary-600 dark:text-primary-400'
                  }`}
                >
                  <BsStars size={10} />
                  <span>AI</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToSearchQuery(query, 1, 'users')}
                className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer outline-none ${
                  tab === 'users'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <AiOutlineUser size={15} className="shrink-0" />
                <span>Tài khoản</span>
              </button>
            </div>
          </div>
        )}

        {query.length >= 2 && summaryText && (
          <div className="mt-2.5 flex items-center justify-between text-[11px] sm:text-xs">
            <p className={error ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400 font-medium'}>
              {summaryText}
            </p>
          </div>
        )}
      </section>

      {/* 2. Recent Searches (Quick Pills) */}
      {recentSearches.length > 0 && (
        <section className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
            <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <AiOutlineClockCircle size={13} />
              <span>Tìm kiếm gần đây</span>
            </p>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-[11px] sm:text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline transition cursor-pointer"
            >
              Xóa lịch sử
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {recentSearches.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => goToSearchQuery(keyword, 1)}
                className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer active:scale-95"
              >
                <AiOutlineSearch size={11} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">{keyword}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. AI Overview Card (for Posts Search) */}
      {query.length >= 2 && tab === 'posts' && (
        <>
          {isLoading && (
            <div className="rounded-2xl sm:rounded-3xl border border-primary-200/90 dark:border-primary-800/60 bg-primary-50/40 dark:bg-slate-900 p-3.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-xl bg-primary-600 text-white">
                  <BsStars size={15} className="animate-spin" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    AI Search Overview
                  </h3>
                  <p className="text-[11px] sm:text-xs text-primary-600 dark:text-primary-400 font-semibold">
                    Đang phân tích ngữ nghĩa văn bản & quét hình ảnh thực tế...
                  </p>
                </div>
              </div>
              <Skeleton count={2} height={14} />
              <div className="flex gap-2 pt-1">
                <Skeleton width={110} height={24} borderRadius={10} />
                <Skeleton width={140} height={24} borderRadius={10} />
              </div>
            </div>
          )}

          {!isLoading && aiOverview && (
            <div className="rounded-2xl sm:rounded-3xl border border-primary-200 dark:border-primary-800/70 bg-primary-50/50 dark:bg-slate-900/90 p-3.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-4 transition-all">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-500/25 shrink-0">
                    <BsStars size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                      <span>AI Search Overview</span>
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-950/70 px-1.5 py-0.5 rounded border border-primary-200/60 dark:border-primary-800/60">
                        Multimodal Gemini
                      </span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
                      Tổng hợp từ ngữ nghĩa bài viết và nhận diện thị giác trong ảnh
                    </p>
                  </div>
                </div>
              </div>

              {/* Overview Summary */}
              <div className="rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800/70 p-3 sm:p-4 border border-primary-100 dark:border-slate-800 shadow-2xs">
                <p className="text-xs sm:text-[14px] text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                  {aiOverview}
                </p>
              </div>

              {/* Key Insights Bullet Points */}
              {Array.isArray(keyInsights) && keyInsights.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 pt-1">
                  <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Điểm nổi bật:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {keyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 shadow-2xs"
                      >
                        <AiOutlineCheckCircle size={14} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Keywords / Related searches */}
              {Array.isArray(suggestedKeywords) && suggestedKeywords.length > 0 && (
                <div className="pt-2 border-t border-primary-200/60 dark:border-slate-800">
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Từ khóa liên quan gợi ý:
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {suggestedKeywords.map((kw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => goToSearchQuery(kw, 1, 'posts')}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                      >
                        <AiOutlineTag size={11} className="text-primary-500 shrink-0" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 4. Results List: Users Grid or Posts Feed */}
      {query.length >= 2 && (
        <section className="space-y-3 sm:space-y-4">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className={tab === 'users' ? "grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" : "space-y-3 sm:space-y-4"}>
              {Array.from({ length: tab === 'users' ? 6 : 2 }).map((_, index) => (
                <div key={index} className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-white dark:bg-slate-900 shadow-xs">
                  <Skeleton height={tab === 'users' ? 48 : 130} borderRadius={10} />
                </div>
              ))}
            </div>
          )}

          {/* User Results (Compact Mobile List, Grid on Tablet/Desktop) */}
          {!isLoading && tab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {users.map((item) => {
                const userId = item?._id || item?.id
                const userIdentifier = item?.username ? String(item.username).replace(/^@/, '') : userId
                const displayName = item?.full_name || item?.username || 'Người dùng'

                return (
                  <Link
                    key={userId}
                    to={userIdentifier ? `/profile/${userIdentifier}` : '#'}
                    className="flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 hover:border-primary-400 dark:hover:border-primary-700 hover:shadow-xs active:scale-[0.99] transition group"
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <Avatar src={item?.avatar} name={displayName} size="md" className="shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                          {displayName}
                        </p>
                        {item?.username && (
                          <p className="truncate text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                            @{item.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-primary-600 dark:text-primary-400 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-primary-50 dark:bg-primary-950/50 group-hover:bg-primary-600 group-hover:text-white transition">
                      Xem <FiArrowRight size={11} />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Post Results (Post Cards List) */}
          {!isLoading && tab === 'posts' && (
            <div className="space-y-3 sm:space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Empty State for Users */}
          {!isLoading && tab === 'users' && users.length === 0 && !error && (
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center shadow-xs">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-2.5 sm:mb-3">
                <AiOutlineUser size={20} className="sm:text-2xl" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Không tìm thấy tài khoản phù hợp
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hãy thử tìm kiếm với họ tên hoặc tên người dùng khác.
              </p>
            </div>
          )}

          {/* Empty State for Posts */}
          {!isLoading && tab === 'posts' && posts.length === 0 && !error && (
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center shadow-xs">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-2.5 sm:mb-3">
                <AiOutlineFileText size={20} className="sm:text-2xl" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Không tìm thấy bài viết phù hợp
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bạn có thể thử tìm bằng từ khóa ngữ nghĩa hoặc tên đồ vật/chủ đề trong ảnh.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {query.length >= 2 && totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 shadow-xs transition-colors">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToSearchQuery(query, page - 1, tab)}
                disabled={!hasPrev || isLoading}
                className="rounded-lg sm:rounded-xl text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5"
              >
                Trang trước
              </Button>
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToSearchQuery(query, page + 1, tab)}
                disabled={!hasNext || isLoading}
                className="rounded-lg sm:rounded-xl text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5"
              >
                Trang sau
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Warning short keyword */}
      {query.length > 0 && query.length < 2 && (
        <section className="rounded-xl sm:rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-3 sm:p-4 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-xs">
          Vui lòng nhập ít nhất 2 ký tự để bắt đầu tìm kiếm.
        </section>
      )}
    </div>
  )
}

export default SearchPage
