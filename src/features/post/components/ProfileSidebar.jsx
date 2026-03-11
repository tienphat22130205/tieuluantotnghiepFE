import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'

/**
 * ProfileSidebar – Sidebar trái hiển thị profile nhanh.
 * Props: user
 */
const ProfileSidebar = ({ user }) => {
  return (
    <aside className="hidden lg:block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
        {/* Mini profile */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold mb-3">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <h3 className="font-semibold text-gray-900">{user?.full_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">@{user?.username}</p>
        </div>

        <hr className="my-4" />

        {/* Thống kê nhanh */}
        <div className="flex justify-around text-center">
          <div>
            <p className="font-bold text-gray-900">{user?.following?.length || 0}</p>
            <p className="text-xs text-gray-500">Đang theo dõi</p>
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.followers?.length || 0}</p>
            <p className="text-xs text-gray-500">Người theo dõi</p>
          </div>
        </div>

        <hr className="my-4" />

        <Link
          to="/create"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
        >
          <AiOutlinePlusCircle size={18} />
          Tạo bài viết
        </Link>
      </div>
    </aside>
  )
}

export default ProfileSidebar
