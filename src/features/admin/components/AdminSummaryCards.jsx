import { usePreferences } from '@/context/PreferencesContext'

const AdminSummaryCards = ({
  users = [],
  posts = [],
  comments = [],
  documents = [],
  userStats = null,
  overview = null,
}) => {
  const { t } = usePreferences()
  const activeUsers = userStats?.activeUsers ?? users.filter((user) => user.status === 'active').length
  const lockedUsers = userStats?.lockedUsers ?? (users.length - activeUsers)
  const pendingPosts = posts.filter((post) => post.status === 'pending').length
  const totalPosts = overview?.summary?.totalPosts ?? posts.length

  const cards = [
    { title: t('admin.activeUsers'), value: activeUsers },
    { title: t('admin.lockedUsers'), value: lockedUsers },
    { title: t('admin.totalPosts'), value: totalPosts },
    { title: t('admin.pendingPosts'), value: pendingPosts },
    { title: t('admin.pendingComments'), value: comments.length },
  ]

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{card.value}</h3>
        </article>
      ))}
    </section>
  )
}

export default AdminSummaryCards
