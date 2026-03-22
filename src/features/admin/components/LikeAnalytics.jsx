import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { AiOutlineLike } from 'react-icons/ai'
import StatCard from './StatCard'

const LikeAnalytics = ({ posts }) => {
  const labels = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  })

  const likesByDay = Object.fromEntries(labels.map((label) => [label, 0]))

  posts.forEach((post) => {
    const label = new Date(post.created_at).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    })
    if (likesByDay[label] !== undefined) likesByDay[label] += post.likes?.length || 0
  })

  const likesOverTimeData = labels.map((label) => ({ name: label, Likes: likesByDay[label] }))

  const mostLikedTweetsData = posts
    .slice()
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 8)
    .map((post, index) => ({
      name: post.user?.username ? `@${post.user.username} #${index + 1}` : `Post ${index + 1}`,
      Likes: post.likes?.length || 0,
    }))

  const likerMap = new Map()
  posts.forEach((post) => {
    ;(post.likes || []).forEach((userId) => {
      likerMap.set(userId, (likerMap.get(userId) || 0) + 1)
    })
  })

  const mostActiveLikersData = [...likerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([userId, likes]) => ({ name: userId.slice(-6), Likes: likes }))

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Likes" value={totalLikes} icon={AiOutlineLike} tone="rose" />
      </div>

      <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Likes Activity Over Time</h2>
        <div className="mt-4 h-[300px] min-w-0 w-full">
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <LineChart data={likesOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Likes" stroke="#e11d48" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Most Liked Tweets</h2>
        <div className="mt-4 h-[360px] min-w-0 w-full">
          <ResponsiveContainer width="100%" height={360} minWidth={0}>
            <BarChart data={mostLikedTweetsData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Likes" fill="#e11d48" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Most Active Likers</h2>
        <div className="mt-4 h-[360px] min-w-0 w-full">
          <ResponsiveContainer width="100%" height={360} minWidth={0}>
            <BarChart data={mostActiveLikersData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Likes" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  )
}

export default LikeAnalytics
