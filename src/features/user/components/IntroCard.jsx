import {
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineLink,
} from 'react-icons/ai'
import { Button } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

/**
 * IntroCard – Sidebar card hiển thị thông tin giới thiệu.
 * Props: profile, isMyProfile
 */
const IntroCard = ({ profile, isMyProfile }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-bold text-gray-900 mb-3">Giới thiệu</h3>
      <div className="space-y-2.5">
        {profile.bio && (
          <p className="text-sm text-gray-600 text-center py-2">
            {profile.bio}
          </p>
        )}
        {profile.location && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <AiOutlineEnvironment className="text-gray-400" size={18} />
            <span>
              Sống tại <strong>{profile.location}</strong>
            </span>
          </div>
        )}
        {profile.website && (
          <div className="flex items-center gap-2 text-sm">
            <AiOutlineLink className="text-gray-400" size={18} />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline truncate"
            >
              {profile.website}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <AiOutlineCalendar className="text-gray-400" size={18} />
          <span>Tham gia {formatDate(profile.created_at)}</span>
        </div>
      </div>
      {isMyProfile && (
        <Button variant="outline" size="sm" className="w-full mt-4">
          Chỉnh sửa chi tiết
        </Button>
      )}
    </div>
  )
}

export default IntroCard
