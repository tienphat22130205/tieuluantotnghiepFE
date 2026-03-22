import DashboardOverview from './DashboardOverview'

const OverviewTab = ({ analytics, posts, isLoading }) => (
  <DashboardOverview analytics={analytics} posts={posts} isLoading={isLoading} />
)

export default OverviewTab
