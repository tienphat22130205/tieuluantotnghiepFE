import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createEvent, respondToEvent } from '../store/groupSlice'
import { toast } from 'react-toastify'
import { AiOutlinePlus, AiOutlineClose, AiOutlineCalendar, AiOutlineCompass, AiOutlineLink } from 'react-icons/ai'
import { resolveMediaUrl } from '@/utils/mediaUrl'
import { Avatar } from '@/components/ui'

const GroupEvents = ({ groupId, isAdmin }) => {
  const dispatch = useDispatch()
  const events = useSelector((state) => state.group.events)
  const { user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [onlineLink, setOnlineLink] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !startAt || !endAt) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và thời gian!')
      return
    }

    if (new Date(startAt) >= new Date(endAt)) {
      toast.error('Thời gian bắt đầu phải trước thời gian kết thúc!')
      return
    }

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('location', location.trim())
    formData.append('onlineLink', onlineLink.trim())
    formData.append('startAt', new Date(startAt).toISOString())
    formData.append('endAt', new Date(endAt).toISOString())
    if (coverImage) {
      formData.append('coverImage', coverImage)
    }

    setSubmitting(true)
    try {
      await dispatch(createEvent({ groupId, formData })).unwrap()
      toast.success('Tạo sự kiện thành công!')
      setTitle('')
      setDescription('')
      setLocation('')
      setOnlineLink('')
      setStartAt('')
      setEndAt('')
      setCoverImage(null)
      setCoverPreview(null)
      setShowCreate(false)
    } catch (err) {
      toast.error(err?.message || 'Lỗi tạo sự kiện!')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRSVP = async (eventId, status) => {
    try {
      await dispatch(respondToEvent({ groupId, eventId, status })).unwrap()
      toast.success('Đã gửi phản hồi tham gia sự kiện!')
    } catch (err) {
      toast.error(err?.message || 'Lỗi phản hồi sự kiện!')
    }
  }

  const formatDateTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Sự kiện sắp diễn ra</h3>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          {showCreate ? <AiOutlineClose size={14} /> : <AiOutlinePlus size={14} />}
          {showCreate ? 'Hủy tạo' : 'Tạo sự kiện mới'}
        </button>
      </div>

      {/* Creation form */}
      {showCreate && (
        <form onSubmit={handleCreateSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title & Desc */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">TÊN SỰ KIỆN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tên sự kiện..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">MÔ TẢ</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu nội dung sự kiện..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Time & Location */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">BẮT ĐẦU <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">KẾT THÚC <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ĐỊA ĐIỂM (OFFLINE)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Địa chỉ tổ chức sự kiện..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ĐƯỜNG LINK (ONLINE)</label>
                <input
                  type="url"
                  value={onlineLink}
                  onChange={(e) => setOnlineLink(e.target.value)}
                  placeholder="https://zoom.us/j/... hoặc Google Meet"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>

          {/* Upload Image Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">ẢNH BÌA SỰ KIỆN</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs text-slate-500"
              />
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Preview"
                  className="w-40 h-24 object-cover rounded-xl border border-slate-200"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-primary-500/10"
            >
              {submitting ? 'Đang tạo...' : 'Tạo sự kiện'}
            </button>
          </div>
        </form>
      )}

      {/* Events Listing */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          <p className="text-xs font-normal">Chưa có sự kiện nào sắp diễn ra.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const coverUrl = resolveMediaUrl(event.coverImage) || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60'
            const author = event.author || {}
            
            // Stats RSVP
            const attendees = event.attendees || []
            const goingCount = attendees.filter((a) => a.status === 'going').length
            const interestedCount = attendees.filter((a) => a.status === 'interested').length

            // User status
            const myRsvp = attendees.find((a) => String(a.user?._id || a.user) === String(currentUserId))
            const myStatus = myRsvp ? myRsvp.status : null

            return (
              <div
                key={event._id || event.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Image & Date Badge */}
                <div className="h-36 overflow-hidden relative bg-slate-100 shrink-0">
                  <img
                    src={coverUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 rounded-xl px-2.5 py-1.5 flex flex-col items-center justify-center text-slate-800 shadow-sm border border-slate-100">
                    <span className="text-[10px] font-bold text-red-500 uppercase">Thg {new Date(event.startAt).getMonth() + 1}</span>
                    <span className="text-base font-extrabold leading-none">{new Date(event.startAt).getDate()}</span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{event.title}</h4>
                    
                    {/* Time Details */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                      <AiOutlineCalendar size={13} className="text-slate-400" />
                      <span>{formatDateTime(event.startAt)}</span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                        <AiOutlineCompass size={13} className="text-slate-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {/* Link */}
                    {event.onlineLink && (
                      <div className="flex items-center gap-1.5 text-[11px] text-primary-600 font-semibold">
                        <AiOutlineLink size={13} className="text-primary-500" />
                        <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                          Đường link online
                        </a>
                      </div>
                    )}

                    <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-2 pt-1">
                      {event.description || 'Không có mô tả chi tiết cho sự kiện này.'}
                    </p>
                  </div>

                  {/* Attendees RSVP and action button */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{goingCount} đi • {interestedCount} quan tâm</span>
                      <span className="text-primary-600 font-bold">
                        {myStatus === 'going' ? 'Bạn sẽ tham gia' : myStatus === 'interested' ? 'Bạn quan tâm' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRSVP(event._id || event.id, 'going')}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                          myStatus === 'going'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Sẽ tham gia
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRSVP(event._id || event.id, 'interested')}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                          myStatus === 'interested'
                            ? 'bg-primary-50 text-primary-600 border-primary-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Quan tâm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRSVP(event._id || event.id, 'not_going')}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                          myStatus === 'not_going'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GroupEvents
