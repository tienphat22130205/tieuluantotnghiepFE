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
    <div className="mx-auto w-full max-w-4xl space-y-5 pb-12">
      {/* 1. Main Search Header Card */}
      <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Tìm kiếm</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Khám phá bài viết, hình ảnh và kết nối bạn bè bằng công nghệ AI
            </p>
          </div>
        </div>
        
        {/* Search input field with clear button */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <AiOutlineSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
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
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-3 focus:ring-primary-500/15"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Xóa chữ"
              >
                <AiOutlineClose size={15} />
              </button>
            )}
          </div>
          <Button
            size="md"
            onClick={handleSearchSubmit}
            className="rounded-2xl py-3 px-6 font-bold shrink-0 shadow-xs hover:shadow-sm transition"
          >
            Tìm kiếm
          </Button>
        </div>

        {/* Tab Navigation Pill Bar */}
        {query.length >= 2 && (
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToSearchQuery(query, 1, 'posts')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150 cursor-pointer outline-none ${
                tab === 'posts'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <AiOutlineFileText size={16} />
              <span>Bài viết</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                tab === 'posts'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400'
              }`}>
                <BsStars size={10} /> AI Multimodal
              </span>
            </button>

            <button
              type="button"
              onClick={() => goToSearchQuery(query, 1, 'users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150 cursor-pointer outline-none ${
                tab === 'users'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <AiOutlineUser size={16} />
              <span>Tài khoản</span>
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs">
          <p className={error ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
            {summaryText}
          </p>
        </div>
      </section>

      {/* 2. Recent Searches (Quick Pills) */}
      {recentSearches.length > 0 && (
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <AiOutlineClockCircle size={14} />
              Tìm kiếm gần đây
            </p>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline transition cursor-pointer"
            >
              Xóa lịch sử
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => goToSearchQuery(keyword, 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer"
              >
                <AiOutlineSearch size={13} className="text-slate-400 dark:text-slate-500" />
                <span>{keyword}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. AI Overview Card (for Posts Search) */}
      {query.length >= 2 && tab === 'posts' && (
        <>
          {isLoading && (
            <div className="rounded-3xl border border-primary-200/90 dark:border-primary-800/60 bg-primary-50/40 dark:bg-slate-900 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-600 text-white">
                  <BsStars size={16} className="animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    AI Search Overview
                  </h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                    Đang phân tích ngữ nghĩa văn bản & quét hình ảnh thực tế...
                  </p>
                </div>
              </div>
              <Skeleton count={2} height={16} />
              <div className="flex gap-2 pt-1">
                <Skeleton width={130} height={28} borderRadius={12} />
                <Skeleton width={160} height={28} borderRadius={12} />
              </div>
            </div>
          )}

          {!isLoading && aiOverview && (
            <div className="rounded-3xl border border-primary-200 dark:border-primary-800/70 bg-primary-50/50 dark:bg-slate-900/90 p-5 md:p-6 shadow-xs space-y-4 transition-all">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-500/25">
                    <BsStars size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      AI Search Overview
                      <span className="text-[10px] font-extrabold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-950/70 px-2 py-0.5 rounded-md border border-primary-200/60 dark:border-primary-800/60">
                        Multimodal Gemini
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tổng hợp từ ngữ nghĩa bài viết và nhận diện thị giác trong ảnh
                    </p>
                  </div>
                </div>
              </div>

              {/* Overview Summary */}
              <div className="rounded-2xl bg-white dark:bg-slate-800/70 p-4 border border-primary-100 dark:border-slate-800 shadow-2xs">
                <p className="text-[14px] text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                  {aiOverview}
                </p>
              </div>

              {/* Key Insights Bullet Points */}
              {Array.isArray(keyInsights) && keyInsights.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Điểm nổi bật:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {keyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-2xs"
                      >
                        <AiOutlineCheckCircle size={15} className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Keywords / Related searches */}
              {Array.isArray(suggestedKeywords) && suggestedKeywords.length > 0 && (
                <div className="pt-2 border-t border-primary-200/60 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                    Từ khóa liên quan gợi ý:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedKeywords.map((kw, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => goToSearchQuery(kw, 1, 'posts')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <AiOutlineTag size={12} className="text-primary-500" />
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
        <section className="space-y-4">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className={tab === 'users' ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-4"}>
              {Array.from({ length: tab === 'users' ? 6 : 2 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 shadow-xs">
                  <Skeleton height={tab === 'users' ? 56 : 140} borderRadius={12} />
                </div>
              ))}
            </div>
          )}

          {/* User Results (Modern Grid Layout on Web) */}
          {!isLoading && tab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((item) => {
                const userId = item?._id || item?.id
                const userIdentifier = item?.username ? String(item.username).replace(/^@/, '') : userId
                const displayName = item?.full_name || item?.username || 'Người dùng'

                return (
                  <Link
                    key={userId}
                    to={userIdentifier ? `/profile/${userIdentifier}` : '#'}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 hover:border-primary-400 dark:hover:border-primary-700 hover:shadow-xs transition group"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={item?.avatar} name={displayName} size="md" className="shrink-0 ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                          {displayName}
                        </p>
                        {item?.username && (
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            @{item.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 px-3 py-1 rounded-xl bg-primary-50 dark:bg-primary-950/50 group-hover:bg-primary-600 group-hover:text-white transition">
                      Xem <FiArrowRight size={12} />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Post Results (Post Cards List) */}
          {!isLoading && tab === 'posts' && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Empty State for Users */}
          {!isLoading && tab === 'users' && users.length === 0 && !error && (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <AiOutlineUser size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không tìm thấy tài khoản phù hợp
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hãy thử tìm kiếm với họ tên hoặc tên người dùng khác.
              </p>
            </div>
          )}

          {/* Empty State for Posts */}
          {!isLoading && tab === 'posts' && posts.length === 0 && !error && (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <AiOutlineFileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không tìm thấy bài viết phù hợp
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bạn có thể thử tìm bằng từ khóa ngữ nghĩa hoặc tên đồ vật/chủ đề trong ảnh.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {query.length >= 2 && totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs transition-colors">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToSearchQuery(query, page - 1, tab)}
                disabled={!hasPrev || isLoading}
                className="rounded-xl font-semibold"
              >
                Trang trước
              </Button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToSearchQuery(query, page + 1, tab)}
                disabled={!hasNext || isLoading}
                className="rounded-xl font-semibold"
              >
                Trang sau
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Warning short keyword */}
      {query.length > 0 && query.length < 2 && (
        <section className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-semibold text-amber-700 dark:text-amber-300 shadow-xs">
          Vui lòng nhập ít nhất 2 ký tự để bắt đầu tìm kiếm.
        </section>
      )}
    </div>
  )
}

export default SearchPage
