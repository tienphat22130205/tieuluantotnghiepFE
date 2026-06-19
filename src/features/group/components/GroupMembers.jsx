import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  approveMember,
  rejectMember,
  banMember,
  promoteMember,
  demoteMember,
} from '../store/groupSlice'
import { toast } from 'react-toastify'
import { Avatar } from '@/components/ui'

const GroupMembers = ({ groupId, members, pendingMembers, isAdmin, currentUserId }) => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('members') // 'members' | 'pending'

  const handleApprove = async (userId, name) => {
    try {
      await dispatch(approveMember({ groupId, userId })).unwrap()
      toast.success(`Đã duyệt thành viên ${name || ''}`)
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra!')
    }
  }

  const handleReject = async (userId, name) => {
    try {
      await dispatch(rejectMember({ groupId, userId })).unwrap()
      toast.info(`Đã từ chối yêu cầu của ${name || ''}`)
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra!')
    }
  }

  const handleBan = async (userId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chặn thành viên ${name || ''} khỏi nhóm?`)) return
    try {
      await dispatch(banMember({ groupId, userId })).unwrap()
      toast.success(`Đã chặn thành viên ${name || ''}`)
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra!')
    }
  }

  const handlePromote = async (userId, name) => {
    if (!window.confirm(`Bạn muốn thăng làm quản trị viên cho ${name || ''}?`)) return
    try {
      await dispatch(promoteMember({ groupId, userId })).unwrap()
      toast.success(`Đã thăng ${name || ''} làm Quản trị viên`)
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra!')
    }
  }

  const handleDemote = async (userId, name) => {
    if (!window.confirm(`Bạn muốn giáng chức quản trị viên của ${name || ''}?`)) return
    try {
      await dispatch(demoteMember({ groupId, userId })).unwrap()
      toast.success(`Đã giáng ${name || ''} xuống làm Thành viên`)
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra!')
    }
  }

  return (
    <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      {/* Sub tabs for admin */}
      {isAdmin && (
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'members' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Thành viên ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Yêu cầu duyệt ({pendingMembers.length})
          </button>
        </div>
      )}

      {/* Members List tab */}
      {activeTab === 'members' && (
        <div className="divide-y divide-slate-100">
          {members.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Chưa có thành viên nào.</p>
          ) : (
            members.map((member) => {
              const u = member.user || {}
              const isSelf = String(u._id || u.id) === String(currentUserId)
              const roleLabel = member.role === 'admin' ? 'Quản trị viên' : member.role === 'moderator' ? 'Kiểm duyệt viên' : 'Thành viên'
              
              return (
                <div key={member._id || member.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={u.full_name} size="md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {u.full_name || 'Thành viên'}
                        {isSelf && <span className="ml-1 text-[10px] text-slate-400 font-normal">(Bạn)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">{roleLabel}</p>
                    </div>
                  </div>

                  {/* Actions for admin */}
                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-2">
                      {member.role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => handleDemote(u._id || u.id, u.full_name)}
                          className="text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg px-2.5 py-1.5 transition"
                        >
                          Giáng chức
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePromote(u._id || u.id, u.full_name)}
                          className="text-[10px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg px-2.5 py-1.5 transition"
                        >
                          Thăng làm Admin
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleBan(u._id || u.id, u.full_name)}
                        className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1.5 transition"
                      >
                        Chặn
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Pending Requests tab */}
      {activeTab === 'pending' && (
        <div className="divide-y divide-slate-100">
          {pendingMembers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Không có yêu cầu phê duyệt nào.</p>
          ) : (
            pendingMembers.map((member) => {
              const u = member.user || {}
              return (
                <div key={member._id || member.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={u.full_name} size="md" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{u.full_name || 'Thành viên'}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Yêu cầu lúc: {new Date(member.requestedAt || member.joinedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(u._id || u.id, u.full_name)}
                      className="text-[10px] font-extrabold text-white bg-primary-600 hover:bg-primary-700 rounded-lg px-3 py-1.5 shadow-xs transition"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(u._id || u.id, u.full_name)}
                      className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5 transition"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default GroupMembers
