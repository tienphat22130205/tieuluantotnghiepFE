import {
  AiOutlineCalendar,
  AiOutlineIdcard,
  AiOutlineEnvironment,
  AiOutlineLink,
} from 'react-icons/ai'
import { formatDate } from '@/utils/formatDate'

/**
 * AboutTab – Nội dung tab "Giới thiệu" (full page version).
 * Props: profile
 */
const AboutTab = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">Giới thiệu</h3>
      <div className="space-y-3">
        {profile.bio && (
          <div className="flex items-start gap-3">
            <AiOutlineIdcard className="text-gray-400 mt-1" size={20} />
            <p className="text-sm text-gray-600">{profile.bio}</p>
          </div>
        )}
        {profile.location && (
          <div className="flex items-center gap-3">
            <AiOutlineEnvironment className="text-gray-400" size={20} />
            <span className="text-sm text-gray-700">
              Sống tại <strong>{profile.location}</strong>
            </span>
          </div>
        )}
        {profile.website && (
          <div className="flex items-center gap-3">
            <AiOutlineLink className="text-gray-400" size={20} />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              {profile.website}
            </a>
          </div>
        )}
        <div className="flex items-center gap-3">
          <AiOutlineCalendar className="text-gray-400" size={20} />
          <span className="text-sm text-gray-700">
            Tham gia vào {formatDate(profile.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AboutTab
