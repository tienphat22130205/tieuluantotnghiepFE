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
import { AiOutlineTeam, AiOutlineUserAdd, AiOutlineCheckCircle } from 'react-icons/ai'
import StatCard from './StatCard'

const UserAnalytics = ({ users }) => {
  const labels = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  })

  const totalUsers = users.length
  const newUsers = Math.max(1, Math.round(totalUsers * 0.2))
  const activeUsers = Math.max(1, Math.round(totalUsers * 0.65))

  const userGrowthData = labels.map((label, index) => ({
    name: label,
    Users: Math.max(1, Math.round((totalUsers / 7) * (index + 1))),
  }))

  const mostFollowedUsersData = users.slice(0, 10).map((user) => ({
    name: user.full_name,
    Followers: user.mutualFriends || 0,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={totalUsers} icon={AiOutlineTeam} tone="blue" />
        <StatCard title="New Users" value={newUsers} icon={AiOutlineUserAdd} tone="emerald" />
        <StatCard title="Active Users" value={activeUsers} icon={AiOutlineCheckCircle} tone="amber" />
      </div>

      <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
        <div className="mt-4 h-[300px] min-w-0 w-full">
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Users" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Most Followed Users</h2>
        <div className="mt-4 h-[360px] min-w-0 w-full">
          <ResponsiveContainer width="100%" height={360} minWidth={0}>
            <BarChart data={mostFollowedUsersData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Followers" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  )
}

export default UserAnalytics
