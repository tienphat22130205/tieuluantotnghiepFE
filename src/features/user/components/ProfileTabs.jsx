import {
  AiOutlineIdcard,
  AiOutlineUser,
  AiOutlinePicture,
  AiOutlineTeam,
} from 'react-icons/ai'

/**
 * ProfileTabs – Tab navigation bar (Bài viết, Giới thiệu, Ảnh, Bạn bè).
 * Props: activeTab (string), onTabChange (function)
 */
const tabs = [
  { id: 'posts', label: 'Bài viết', icon: AiOutlineIdcard },
  { id: 'about', label: 'Giới thiệu', icon: AiOutlineUser },
  { id: 'photos', label: 'Ảnh', icon: AiOutlinePicture },
  { id: 'friends', label: 'Bạn bè', icon: AiOutlineTeam },
]

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 font-medium'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileTabs
