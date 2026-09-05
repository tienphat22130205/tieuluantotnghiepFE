/**
 * ProfileSkeleton – Hiệu ứng khung xương tải trang sang trọng cho ProfilePage.
 */
const ProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="mx-auto max-w-5xl">
          {/* Cover Photo Skeleton */}
          <div className="h-44 sm:h-56 md:h-68 bg-slate-200 dark:bg-slate-800" />

          {/* Profile Info Skeleton */}
          <div className="relative px-4 sm:px-6 pb-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 pb-4">
              {/* Avatar Skeleton */}
              <div className="-mt-16 sm:-mt-20 flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />
              </div>

              {/* Name & Stats Skeleton */}
              <div className="flex-1 min-w-0 space-y-2 pt-2 sm:pt-4">
                <div className="h-7 w-48 sm:w-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-750" />
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-4">
                <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex gap-3">
              <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-20 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="mx-auto max-w-5xl px-1 sm:px-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left Column (Intro / Photos / Friends) */}
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full rounded-md bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-3/4 rounded-md bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-1/2 rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Posts) */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>

            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-36 rounded-md bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-20 rounded-md bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-md bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 w-4/5 rounded-md bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSkeleton
