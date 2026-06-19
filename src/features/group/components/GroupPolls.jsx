import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createPoll, votePoll, closePoll } from '../store/groupSlice'
import { toast } from 'react-toastify'
import { AiOutlinePlus, AiOutlineClose, AiOutlineCheck, AiOutlineLock } from 'react-icons/ai'
import { Avatar } from '@/components/ui'

const GroupPolls = ({ groupId, isAdmin }) => {
  const dispatch = useDispatch()
  const polls = useSelector((state) => state.group.polls)
  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  // Poll Creation Form state
  const [showCreate, setShowCreate] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [daysToExpire, setDaysToExpire] = useState(7)
  const [submitting, setSubmitting] = useState(false)

  // Local selection for multiple choice votes: { [pollId]: [optionId, ...] }
  const [selectedOptions, setSelectedOptions] = useState({})

  const handleAddOptionField = () => {
    if (options.length >= 10) return
    setOptions([...options, ''])
  }

  const handleRemoveOptionField = (index) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, idx) => idx !== index))
  }

  const handleOptionChange = (index, value) => {
    const next = [...options]
    next[index] = value
    setOptions(next)
  }

  const handleCreatePollSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim()) {
      toast.error('Vui lòng nhập câu hỏi!')
      return
    }

    const filteredOptions = options.map((opt) => opt.trim()).filter(Boolean)
    if (filteredOptions.length < 2) {
      toast.error('Vui lòng nhập ít nhất 2 phương án lựa chọn!')
      return
    }

    setSubmitting(true)
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + Number(daysToExpire))

      await dispatch(
        createPoll({
          groupId,
          body: {
            question: question.trim(),
            options: filteredOptions,
            allowMultiple,
            expiresAt: expiresAt.toISOString(),
          },
        })
      ).unwrap()

      toast.success('Tạo cuộc khảo sát thành công!')
      setQuestion('')
      setOptions(['', ''])
      setAllowMultiple(false)
      setShowCreate(false)
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo cuộc khảo sát!')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleOptionSelection = (pollId, optionId, allowMulti) => {
    if (!allowMulti) {
      // Single choice -> vote immediately
      handleVoteSubmit(pollId, [optionId])
      return
    }

    // Multiple choice -> update local selection state
    const currentSel = selectedOptions[pollId] || []
    let nextSel
    if (currentSel.includes(optionId)) {
      nextSel = currentSel.filter((id) => id !== optionId)
    } else {
      nextSel = [...currentSel, optionId]
    }

    setSelectedOptions({
      ...selectedOptions,
      [pollId]: nextSel,
    })
  }

  const handleVoteSubmit = async (pollId, optionIdsList) => {
    const list = optionIdsList || selectedOptions[pollId] || []
    if (list.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 phương án!')
      return
    }

    try {
      await dispatch(votePoll({ groupId, pollId, optionIds: list })).unwrap()
      toast.success('Bình chọn thành công!')
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra khi bình chọn!')
    }
  }

  const handleClosePoll = async (pollId) => {
    if (!window.confirm('Bạn có chắc chắn muốn đóng cuộc khảo sát này?')) return
    try {
      await dispatch(closePoll({ groupId, pollId })).unwrap()
      toast.success('Đã đóng cuộc khảo sát!')
    } catch (err) {
      toast.error(err?.message || 'Lỗi đóng cuộc khảo sát!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Khảo sát ý kiến</h3>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          {showCreate ? <AiOutlineClose size={14} /> : <AiOutlinePlus size={14} />}
          {showCreate ? 'Hủy tạo' : 'Tạo khảo sát mới'}
        </button>
      </div>

      {/* Creation Collapse Panel */}
      {showCreate && (
        <form onSubmit={handleCreatePollSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">CÂU HỎI KHẢO SÁT</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Bạn muốn hỏi mọi người điều gì?"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">CÁC PHƯƠNG ÁN LỰA CHỌN</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Phương án ${idx + 1}`}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOptionField(idx)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <AiOutlineClose size={16} />
                  </button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOptionField}
                className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1 mt-1.5"
              >
                + Thêm phương án khác
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="accent-primary-600 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="allowMultiple" className="text-xs text-slate-700 font-semibold cursor-pointer">
                Cho phép chọn nhiều phương án
              </label>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <label className="text-xs text-slate-700 font-semibold shrink-0">Hạn khảo sát:</label>
              <select
                value={daysToExpire}
                onChange={(e) => setDaysToExpire(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-bold outline-none cursor-pointer flex-1"
              >
                <option value={1}>1 ngày</option>
                <option value={3}>3 ngày</option>
                <option value={7}>7 ngày</option>
                <option value={30}>30 ngày</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-primary-500/10"
            >
              {submitting ? 'Đang tạo...' : 'Đăng khảo sát'}
            </button>
          </div>
        </form>
      )}

      {/* Polls Listing */}
      {polls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          <p className="text-xs font-normal">Chưa có cuộc khảo sát nào trong nhóm này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const author = poll.author || {}
            const isClosed = poll.isClosed || new Date(poll.expiresAt) < new Date()
            const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voters?.length || 0), 0)

            // Check if current user has voted for any option in this poll
            const userVotedOptionIds = poll.options
              .filter((opt) => opt.voters?.some((voterId) => String(voterId._id || voterId) === String(currentUserId)))
              .map((opt) => opt._id || opt.id)

            const hasVoted = userVotedOptionIds.length > 0
            const localPollSel = selectedOptions[poll._id || poll.id] || userVotedOptionIds

            return (
              <div
                key={poll._id || poll.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 relative"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={author.avatar} name={author.full_name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{author.full_name || 'Thành viên'}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Hạn bình chọn: {new Date(poll.expiresAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isClosed ? (
                      <span className="bg-red-50 text-red-600 border border-red-100 rounded-lg px-2.5 py-1 text-[10px] font-bold">
                        Đã kết thúc
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg px-2.5 py-1 text-[10px] font-bold">
                        Đang hoạt động
                      </span>
                    )}

                    {isAdmin && !isClosed && (
                      <button
                        type="button"
                        onClick={() => handleClosePoll(poll._id || poll.id)}
                        className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1 transition"
                      >
                        Đóng khảo sát
                      </button>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h4 className="text-sm font-bold text-slate-800 leading-snug">{poll.question}</h4>

                {/* Options List */}
                <div className="space-y-2.5">
                  {poll.options.map((option) => {
                    const optId = option._id || option.id
                    const voteCount = option.voters?.length || 0
                    const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
                    
                    // Is locally or server-side selected
                    const isSelected = localPollSel.includes(optId)
                    const isServerVoted = userVotedOptionIds.includes(optId)

                    return (
                      <div
                        key={optId}
                        onClick={() => !isClosed && handleToggleOptionSelection(poll._id || poll.id, optId, poll.allowMultiple)}
                        className={`relative rounded-xl border p-3 cursor-pointer transition select-none ${
                          isClosed
                            ? 'border-slate-200 cursor-not-allowed bg-slate-50'
                            : isSelected
                              ? 'border-primary-600 bg-primary-50/10'
                              : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {/* Progress bar background fill */}
                        <div
                          className="absolute inset-y-0 left-0 bg-primary-100/35 rounded-xl transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />

                        {/* Text and stats */}
                        <div className="relative flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 font-semibold text-slate-700 min-w-0">
                            {!isClosed && poll.allowMultiple && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="accent-primary-600 w-3.5 h-3.5"
                              />
                            )}
                            <span className="truncate">{option.text}</span>
                            {isServerVoted && <AiOutlineCheck className="text-primary-600 font-bold" />}
                          </div>
                          
                          <div className="font-bold text-slate-500 shrink-0 flex items-center gap-1 ml-2">
                            <span>{voteCount} phiếu</span>
                            <span>({percent}%)</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Multi-choice action button */}
                {poll.allowMultiple && !isClosed && (
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-400 font-medium">Bình chọn nhiều phương án</span>
                    <button
                      type="button"
                      onClick={() => handleVoteSubmit(poll._id || poll.id)}
                      className="rounded-lg bg-primary-600 text-white hover:bg-primary-700 px-3.5 py-1.5 font-bold shadow-sm"
                    >
                      Xác nhận bình chọn
                    </button>
                  </div>
                )}
                
                <div className="text-[10px] text-slate-400 font-normal">
                  Tổng số: {totalVotes} lượt bình chọn
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GroupPolls
