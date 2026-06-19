import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  AiOutlineGlobal,
  AiOutlineLock,
  AiOutlinePlus,
  AiOutlineUsergroupAdd,
  AiOutlinePicture,
  AiOutlineClose,
  AiOutlineDoubleRight,
} from 'react-icons/ai'
import useGroupDetail from '../hooks/useGroupDetail'
import { createGroupPost, deleteGroup } from '../store/groupSlice'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { Avatar, ConfirmModal } from '@/components/ui'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GroupPostCard from '../components/GroupPostCard'
import GroupChat from '../components/GroupChat'
import GroupPolls from '../components/GroupPolls'
import GroupEvents from '../components/GroupEvents'
import GroupMembers from '../components/GroupMembers'

const GroupDetailPage = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  // Tab state
  const [activeSubTab, setActiveSubTab] = useState('feed') // 'feed' | 'chat' | 'polls' | 'events' | 'members'

  // Hook details
  const {
    currentGroup,
    memberStatus,
    isJoined,
    isAdmin,
    posts,
    members,
    pendingMembers,
    isLoading,
    error,
    handleJoinGroup,
    handleLeaveGroup,
  } = useGroupDetail(groupId)

  // Simple post form state
  const [postText, setPostText] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [posting, setPosting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > 10) {
      toast.warning('Tối đa đăng 10 ảnh!')
      return
    }
    const nextFiles = [...selectedImages, ...files]
    setSelectedImages(nextFiles)
    
    const nextPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...nextPreviews])
  }

  const handleRemoveSelectedImage = (index) => {
    setSelectedImages(selectedImages.filter((_, idx) => idx !== index))
    setImagePreviews(imagePreviews.filter((_, idx) => idx !== index))
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!postText.trim() && selectedImages.length === 0) {
      toast.error('Nội dung bài viết không được trống!')
      return
    }

    const formData = new FormData()
    formData.append('content', postText.trim())
    selectedImages.forEach((file) => {
      formData.append('images', file)
    })

    setPosting(true)
    try {
      await dispatch(createGroupPost({ groupId, formData })).unwrap()
      toast.success('Đăng bài thành công!')
      setPostText('')
      setSelectedImages([])
      setImagePreviews([])
    } catch (err) {
      toast.error(err?.message || 'Không thể đăng bài viết!')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteGroup = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteGroup = async () => {
    setShowDeleteConfirm(false)
    try {
      await dispatch(deleteGroup(groupId)).unwrap()
      toast.success('Đã giải tán nhóm!')
      navigate('/groups')
    } catch (err) {
      toast.error(err?.message || 'Không thể giải tán nhóm!')
    }
  }

  if (isLoading && !currentGroup) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !currentGroup) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <p className="text-red-500 font-bold text-sm">Lỗi: {error || 'Không tìm thấy nhóm'}</p>
        <Link to="/groups" className="text-primary-600 hover:underline text-xs font-semibold block mt-4">
          Quay lại danh sách nhóm
        </Link>
      </div>
    )
  }

  const coverUrl = resolveMediaUrl(currentGroup.coverImage) || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80'
  const avatarUrl = resolveMediaUrl(currentGroup.avatar) || ''

  const isPrivate = currentGroup.privacy === 'private'
  const canAccessContent = !isPrivate || isJoined

  return (
    <div className="space-y-6">
      {/* Group Info Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover image */}
        <div className="h-48 md:h-64 relative bg-slate-100">
          <img
            src={coverUrl}
            alt={currentGroup.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Group details bar */}
        <div className="p-5 relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Avatar overlay */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12 md:-mt-16 relative">
            <div className="shrink-0 z-10">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={currentGroup.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white bg-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-2xl border-4 border-white shadow-md">
                  {currentGroup.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left pt-2 pb-1 space-y-1">
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {currentGroup.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  {isPrivate ? <AiOutlineLock size={14} /> : <AiOutlineGlobal size={14} />}
                  {isPrivate ? 'Nhóm riêng tư' : 'Nhóm công khai'}
                </span>
                <span>•</span>
                <span>{currentGroup.memberCount || 1} thành viên</span>
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center justify-center gap-2.5 shrink-0 self-center md:self-end">
            {!isAdmin ? (
              <button
                type="button"
                onClick={isJoined || memberStatus === 'pending' ? handleLeaveGroup : handleJoinGroup}
                className={`flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-extrabold transition border cursor-pointer ${
                  isJoined
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : memberStatus === 'pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-700'
                }`}
              >
                <AiOutlineUsergroupAdd size={16} />
                {isJoined ? 'Rời nhóm' : memberStatus === 'pending' ? 'Hủy yêu cầu tham gia' : 'Tham gia nhóm'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-4 py-2.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100">
                  Quản trị viên
                </span>
                {currentGroup.creator?._id === currentUserId && (
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    className="rounded-full bg-red-50 border border-red-100 hover:bg-red-100 hover:text-red-700 text-red-600 px-4 py-2.5 text-xs font-extrabold transition cursor-pointer"
                  >
                    Giải tán nhóm
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection (only visible if accessible) */}
        {canAccessContent && (
          <div className="border-t border-slate-100 px-5 flex overflow-x-auto shrink-0 select-none">
            {[
              { id: 'feed', label: 'Thảo luận' },
              { id: 'chat', label: 'Trò chuyện' },
              { id: 'polls', label: 'Khảo sát' },
              { id: 'events', label: 'Sự kiện' },
              { id: 'members', label: 'Thành viên' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-4 px-4 font-bold text-xs border-b-2 transition relative -mb-px shrink-0 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Group Detail Body Contents */}
      {!canAccessContent ? (
        /* Blocked View (Private group without membership) */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <AiOutlineLock size={32} />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Đây là nhóm Riêng tư</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-normal leading-relaxed">
            Bạn cần phải là thành viên để có thể xem các bài viết, cuộc trò chuyện, khảo sát ý kiến, sự kiện hoặc danh sách thành viên của nhóm này.
          </p>
          <button
            type="button"
            onClick={memberStatus === 'pending' ? handleLeaveGroup : handleJoinGroup}
            className="rounded-full bg-primary-600 text-white hover:bg-primary-700 px-6 py-2.5 text-xs font-extrabold shadow-md shadow-primary-500/10 cursor-pointer"
          >
            {memberStatus === 'pending' ? 'Hủy yêu cầu tham gia' : 'Gửi yêu cầu tham gia'}
          </button>
        </div>
      ) : (
        /* Standard Tabs Views */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Main Area */}
          <div className="space-y-6">
            {/* DISCUSSION TAB */}
            {activeSubTab === 'feed' && (
              <div className="space-y-4">
                {/* Inline Post Form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
                  <div className="flex gap-3">
                    <Avatar src={user?.avatar} name={user?.full_name} size="md" />
                    <textarea
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder={`Đăng gì đó vào nhóm ${currentGroup.name}...`}
                      rows={3}
                      className="flex-1 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 border border-slate-100 rounded-xl p-2 bg-slate-50">
                      {imagePreviews.map((prev, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                          <img src={prev} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                          >
                            <AiOutlineClose size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition select-none">
                      <AiOutlinePicture size={16} className="text-emerald-500" />
                      Thêm ảnh
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagesSelect}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handlePostSubmit}
                      disabled={posting || (!postText.trim() && selectedImages.length === 0)}
                      className="rounded-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-5 py-2.5 shadow-md shadow-primary-500/10 disabled:opacity-50 transition cursor-pointer"
                    >
                      {posting ? 'Đang đăng...' : 'Đăng bài'}
                    </button>
                  </div>
                </div>

                {/* Posts List */}
                {posts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
                    <p className="text-xs font-normal">Chưa có cuộc thảo luận nào. Hãy bắt đầu câu chuyện đầu tiên!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <GroupPostCard
                        key={post._id}
                        post={post}
                        groupId={groupId}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {activeSubTab === 'chat' && <GroupChat groupId={groupId} />}

            {/* POLLS TAB */}
            {activeSubTab === 'polls' && <GroupPolls groupId={groupId} isAdmin={isAdmin} />}

            {/* EVENTS TAB */}
            {activeSubTab === 'events' && <GroupEvents groupId={groupId} isAdmin={isAdmin} />}

            {/* MEMBERS TAB */}
            {activeSubTab === 'members' && (
              <GroupMembers
                groupId={groupId}
                members={members}
                pendingMembers={pendingMembers}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {/* Sidebar Info Area */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Giới thiệu nhóm</h3>
              <p className="text-xs text-slate-600 font-normal leading-relaxed break-all">
                {currentGroup.description || 'Chưa có phần giới thiệu chi tiết.'}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                <span>Tạo bởi: {currentGroup.creator?.full_name || currentGroup.creator?.username || 'Quản trị viên'}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        message="Bạn có chắc chắn muốn giải tán nhóm này không? Hành động này sẽ xóa vĩnh viễn nhóm và toàn bộ dữ liệu bài viết, tin nhắn, không thể khôi phục."
        onConfirm={confirmDeleteGroup}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default GroupDetailPage
