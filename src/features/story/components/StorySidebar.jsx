import { FiX, FiPlus } from 'react-icons/fi'
import { Avatar } from '@/components/ui'

const StorySidebar = ({
  groups = [],
  currentGroupIndex,
  setCurrentGroupIndex,
  setCurrentStoryIndex,
  onClose,
  setIsArchiveOpen,
}) => {
  return (
    <div className="w-[360px] hidden md:flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 shrink-0 z-10">
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Đóng bảng tin"
          >
            <FiX size={20} />
          </button>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 flex-shrink-0">
            <img src="/Zlogo.png" alt="Zivo" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="flex justify-between items-end pt-1">
          <h1 className="text-2xl font-bold">Tin</h1>
          <div className="flex gap-2.5 text-xs text-primary-400 font-semibold">
            <span onClick={() => setIsArchiveOpen(true)} className="hover:underline cursor-pointer">Kho lưu trữ</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Cài đặt</span>
          </div>
        </div>
      </div>

      {/* Story List Items grouped by user */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {/* Tin của bạn (Create Shortcut) */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 block mb-2">Tin của bạn</span>
          <div className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-900/60 cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-800">
            <div className="relative w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 shrink-0 shadow border border-slate-700 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
              <FiPlus size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-sm font-bold block">Tạo tin</span>
              <span className="text-xs text-slate-400 block mt-0.5">Chia sẻ ảnh, video hoặc viết gì đó</span>
            </div>
          </div>
        </div>

        {/* Tất cả tin */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 block mb-2">Tất cả tin</span>
          <div className="space-y-1">
            {groups.map((group, idx) => {
              const isActive = idx === currentGroupIndex
              return (
                <div
                  key={String(group.userId)}
                  onClick={() => {
                    setCurrentGroupIndex(idx)
                    setCurrentStoryIndex(0)
                  }}
                  className={`flex items-center gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'bg-primary-600/10 text-primary-300 border-primary-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]'
                      : 'hover:bg-slate-900/40 border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar
                      src={group.user.avatar}
                      name={group.user.fullName}
                      size="md"
                      className={`border-2 transition-all ${
                        isActive ? 'border-primary-500 shadow-lg' : 'border-slate-800'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold block truncate ${isActive ? 'text-primary-300' : 'text-slate-200'}`}>{group.user.fullName}</span>
                    <span className="text-xs text-slate-500 block truncate mt-0.5">
                      {group.stories.length} tin hoạt động
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StorySidebar
