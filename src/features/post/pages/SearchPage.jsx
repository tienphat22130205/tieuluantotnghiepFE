import { Link } from 'react-router-dom'
import { AiOutlineClose, AiOutlineSearch } from 'react-icons/ai'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Avatar, Button } from '@/components/ui'
import useUserSearchPage from '../hooks/search/useUserSearchPage'

const SearchPage = () => {
  const {
    query,
    page,
    users,
    isLoading,
    error,
    totalPages,
    recentSearches,
    hasPrev,
    hasNext,
    summaryText,
    goToSearchQuery,
    clearRecentSearches,
  } = useUserSearchPage()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h1 className="text-xl font-black tracking-tight text-slate-900">Tìm kiếm tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Tìm theo username, firstName hoặc lastName từ ô tìm kiếm chính.</p>
        <p className={`mt-3 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>{summaryText}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <AiOutlineSearch size={18} className="text-slate-500" />
            Tìm kiếm gần đây
          </p>
          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {recentSearches.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => goToSearchQuery(keyword, 1)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <AiOutlineSearch size={13} />
                {keyword}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Chưa có từ khóa tìm kiếm gần đây.
          </p>
        )}
      </section>

      {query.length >= 2 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="space-y-3">
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-3">
                    <Skeleton height={48} />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && users.map((item) => {
              const userId = item?._id || item?.id
              const displayName = item?.full_name || item?.username || 'Người dùng'

              return (
                <Link
                  key={userId}
                  to={userId ? `/profile/${userId}` : '#'}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-primary-300 hover:bg-primary-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar src={item?.avatar} name={displayName} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                      {item?.username && <p className="truncate text-xs text-slate-500">@{item.username}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary-600">Xem</span>
                </Link>
              )
            })}

            {!isLoading && users.length === 0 && !error && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Không có dữ liệu hiển thị.
              </p>
            )}
          </div>

          {query.length >= 2 && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToSearchQuery(query, page - 1)}
                disabled={!hasPrev || isLoading}
              >
                Trang trước
              </Button>
              <span className="text-sm font-semibold text-slate-600">{page}/{totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToSearchQuery(query, page + 1)}
                disabled={!hasNext || isLoading}
              >
                Trang sau
              </Button>
            </div>
          )}
        </section>
      )}

      {query.length > 0 && query.length < 2 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 shadow-sm">
          Từ khóa cần ít nhất 2 ký tự để tìm kiếm.
        </section>
      )}
    </div>
  )
}

export default SearchPage
