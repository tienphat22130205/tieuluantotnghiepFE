import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { Avatar } from '@/components/ui'
import friendService from '@/features/user/services/friendService'
import { extractItems } from '@/utils/friendship'

/**
 * ProfileSidebar – Sidebar trái hiển thị profile nhanh.
 * Props: user
 */
const ProfileSidebar = ({ user }) => {
  const displayName = user?.full_name || user?.fullName || user?.username || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Người dùng'
  const profileId = user?.id || user?._id
  const profilePath = profileId ? `/profile/${profileId}` : '/'
  const [socialCounts, setSocialCounts] = useState({ following: null, followers: null })

  useEffect(() => {
    let isMounted = true

    const getCount = (payload, collectionKey) => {
      if (typeof payload?.count === 'number') return payload.count
      if (typeof payload?.[`${collectionKey}Count`] === 'number') return payload[`${collectionKey}Count`]
      if (typeof payload?.data?.count === 'number') return payload.data.count
      if (typeof payload?.data?.[`${collectionKey}Count`] === 'number') return payload.data[`${collectionKey}Count`]
      return extractItems(payload).length
    }

    const loadSocialCounts = async () => {
      try {
        const [followingPayload, followersPayload] = await Promise.all([
          friendService.getMyFollowing(),
          friendService.getMyFollowers(),
        ])

        if (!isMounted) return

        setSocialCounts({
          following: getCount(followingPayload, 'following'),
          followers: getCount(followersPayload, 'followers'),
        })
      } catch {
        if (!isMounted) return
        setSocialCounts({ following: null, followers: null })
      }
    }

    loadSocialCounts()

    return () => {
      isMounted = false
    }
  }, [profileId])

  const followingCount = socialCounts.following ?? user?.stats?.followingCount ?? user?.following?.length ?? 0
  const followerCount = socialCounts.followers ?? user?.stats?.followerCount ?? user?.followers?.length ?? 0

  return (
    <aside className="hidden lg:block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
        {/* Mini profile */}
        <div className="text-center">
          <Link to={profilePath} className="inline-flex flex-col items-center hover:opacity-90 transition-opacity">
            <Avatar src={user?.avatar} name={displayName} size="xl" className="mb-3" />
          </Link>
          <h3 className="font-semibold text-gray-900">{displayName}</h3>
          <p className="text-sm text-gray-500 mt-0.5">@{user?.username}</p>
        </div>

        <hr className="my-4" />

        {/* Thống kê nhanh */}
        <div className="flex justify-around text-center">
          <div>
            <p className="font-bold text-gray-900">{followingCount}</p>
            <p className="text-xs text-gray-500">Đang theo dõi</p>
          </div>
          <div>
            <p className="font-bold text-gray-900">{followerCount}</p>
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
