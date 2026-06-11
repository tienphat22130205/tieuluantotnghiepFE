import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineGlobal,
  AiOutlineLock,
  AiOutlineUsergroupAdd,
  AiOutlineClose,
} from 'react-icons/ai'

const INITIAL_GROUPS = [
  {
    id: 'group-1',
    name: 'Cộng đồng Web Developer Việt Nam 💻',
    desc: 'Nơi chia sẻ kiến thức, kinh nghiệm học tập và tìm kiếm cơ hội việc làm về ngành lập trình Web tại Việt Nam.',
    members: '24,530 thành viên',
    cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
    isJoined: true,
    privacy: 'public',
  },
  {
    id: 'group-2',
    name: 'Hội đam mê xê dịch & du lịch bụi 🛵🏕️',
    desc: 'Giao lưu chia sẻ kinh nghiệm du lịch tự túc, khám phá các cung đường phượt và cắm trại trên khắp mọi miền tổ quốc.',
    members: '12,840 thành viên',
    cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=60',
    isJoined: false,
    privacy: 'public',
  },
  {
    id: 'group-3',
    name: 'Góc Thiết Kế & UI/UX Designers Việt Nam 🎨',
    desc: 'Cộng đồng giao lưu của các Designer chia sẻ portfolio, học hỏi kỹ năng thiết kế giao diện ứng dụng, Figma và Web design.',
    members: '8,920 thành viên',
    cover: 'https://images.unsplash.com/photo-1541462608141-2f682d6fe274?w=500&auto=format&fit=crop&q=60',
    isJoined: true,
    privacy: 'public',
  },
  {
    id: 'group-4',
    name: 'Cộng đồng yêu thú cưng & cứu hộ chó mèo Việt Nam 🐶🐱',
    desc: 'Chia sẻ kinh nghiệm chăm sóc cún mèo, hình ảnh đáng yêu của các boss và hỗ trợ tìm kiếm thú cưng thất lạc.',
    members: '32,150 thành viên',
    cover: 'https://images.unsplash.com/photo-1472586662442-3eec04b9dbda?w=500&auto=format&fit=crop&q=60',
    isJoined: false,
    privacy: 'public',
  },
  {
    id: 'group-5',
    name: 'Mọt Sách & Kẻ Mơ Mộng 📚☕️',
    desc: 'Không gian review sách hay, bàn luận về văn học và chia sẻ những câu nói tâm đắc, thói quen đọc sách mỗi ngày.',
    members: '15,400 thành viên',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60',
    isJoined: false,
    privacy: 'private',
  },
]

const GroupsPage = () => {
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [activeTab, setActiveTab] = useState('discover') // 'joined' | 'discover'
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('public')

  const handleToggleJoin = (groupId) => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          const updatedState = !g.isJoined
          toast.success(updatedState ? `Đã tham gia nhóm ${g.name}!` : `Đã rời nhóm ${g.name}.`, { autoClose: 2000 })
          return { ...g, isJoined: updatedState }
        }
        return g
      })
    )
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm!')
      return
    }

    const newGroup = {
      id: `group-local-${Date.now()}`,
      name: newGroupName.trim(),
      desc: newGroupDesc.trim() || 'Nhóm này chưa có phần mô tả ngắn.',
      members: '1 thành viên',
      cover: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60',
      isJoined: true,
      privacy: newGroupPrivacy,
    }

    setGroups([newGroup, ...groups])
    toast.success(`Tạo thành công nhóm "${newGroup.name}"!`, { autoClose: 2000 })
    setShowCreateModal(false)
    setNewGroupName('')
    setNewGroupDesc('')
    setNewGroupPrivacy('public')
    setActiveTab('joined') // Switch to show their new group
  }

  // Filter groups according to activeTab and search keyword
  const filteredGroups = groups.filter((g) => {
    const matchesTab = activeTab === 'joined' ? g.isJoined : true
    const matchesSearch = g.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          g.desc.toLowerCase().includes(searchKeyword.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
              <AiOutlineUsergroupAdd size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Nhóm</h1>
              <p className="text-sm text-slate-500 font-normal">Kết nối với những người có chung sở thích.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/10 hover:bg-primary-700 transition"
          >
            <AiOutlinePlus size={16} />
            Tạo nhóm mới
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Left Side: Groups List */}
        <div className="space-y-4">
          {/* Tab Selector & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'discover' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Khám phá nhóm
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('joined')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'joined' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nhóm của bạn
              </button>
            </div>

            {/* Local Search input */}
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm nhóm..."
                className="w-full sm:w-60 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
              />
              <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>

          {/* Groups Cards Grid */}
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs">
              <AiOutlineUsergroupAdd size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm">Không tìm thấy nhóm</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Không tìm thấy kết quả nào phù hợp với từ khóa tìm kiếm của bạn hoặc danh sách trống.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col h-full group"
                >
                  {/* Cover Photo */}
                  <div className="h-28 overflow-hidden relative bg-slate-100 shrink-0">
                    <img
                      src={group.cover}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/55 text-white backdrop-blur-xs text-[10px] font-bold rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                      {group.privacy === 'public' ? (
                        <>
                          <AiOutlineGlobal size={11} /> Công khai
                        </>
                      ) : (
                        <>
                          <AiOutlineLock size={11} /> Riêng tư
                        </>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                        {group.name}
                      </h4>
                      <p className="text-[10px] font-semibold text-primary-600 bg-primary-50 rounded-full px-2 py-0.5 w-max">
                        {group.members}
                      </p>
                      <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-2">
                        {group.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
                      {/* Avatar group stack */}
                      <div className="flex -space-x-2 overflow-hidden">
                        <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" alt="member" />
                        <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="member" />
                        <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80" alt="member" />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleJoin(group.id)}
                        className={`text-xs font-extrabold px-4 py-2 rounded-full transition-all duration-200 border ${
                          group.isJoined
                            ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-700'
                        }`}
                      >
                        {group.isJoined ? 'Rời nhóm' : 'Tham gia'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Informative Panel */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Gợi ý dành cho bạn</h3>
            <p className="text-xs text-slate-500 mt-1">Các nhóm được đề xuất dựa trên sở thích và hoạt động của bạn.</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  PT
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Học tập & Chia sẻ IT</p>
                  <p className="text-[10px] text-slate-400">12k thành viên • 3 bài viết/ngày</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                  HD
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Hội Đồ Họa & UI/UX</p>
                  <p className="text-[10px] text-slate-400">9.4k thành viên • 5 bài viết/ngày</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Quy tắc cộng đồng</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600 list-disc pl-4 font-normal">
              <li>Tôn trọng các thành viên khác trong nhóm.</li>
              <li>Không đăng tải nội dung rác, quảng cáo không đúng chủ đề.</li>
              <li>Tuyệt đối tuân thủ điều khoản dịch vụ của Zivo.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Create Group Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-[450px] shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Tạo nhóm mới</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tên nhóm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm muốn tạo..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mô tả nhóm
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Nhập vài dòng giới thiệu về mục đích của nhóm..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quyền riêng tư
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      newGroupPrivacy === 'public'
                        ? 'border-primary-600 bg-primary-50/20 text-primary-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={newGroupPrivacy === 'public'}
                      onChange={() => setNewGroupPrivacy('public')}
                      className="accent-primary-600"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold">Công khai</p>
                      <p className="text-[10px] text-slate-400 font-normal">Ai cũng có thể thấy nhóm</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      newGroupPrivacy === 'private'
                        ? 'border-primary-600 bg-primary-50/20 text-primary-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={newGroupPrivacy === 'private'}
                      onChange={() => setNewGroupPrivacy('private')}
                      className="accent-primary-600"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold">Riêng tư</p>
                      <p className="text-[10px] text-slate-400 font-normal">Chỉ thành viên mới thấy</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary-600 hover:bg-primary-700 px-5 py-2 text-xs font-bold text-white transition shadow-md shadow-primary-500/10"
                >
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsPage
