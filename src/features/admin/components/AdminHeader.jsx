const AdminHeader = ({ tabs, activeTab, onTabChange }) => {
  return (
    <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Quản trị dữ liệu mạng xã hội: bài viết, người dùng và mức độ tương tác.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}

export default AdminHeader
