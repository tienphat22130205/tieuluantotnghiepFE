import { AiOutlineCompass } from 'react-icons/ai'
import { BsPlay } from 'react-icons/bs'
import { Avatar } from '@/components/ui'

const WatchPlaylistSidebar = ({ videos, likesCount, onScrollToVideo }) => {
  return (
    <aside className="hidden xl:flex flex-col w-80 bg-white dark:bg-slate-900/90 border-l border-slate-200/80 dark:border-slate-800/80 p-4 shrink-0 overflow-y-auto text-slate-800 dark:text-white select-none transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <AiOutlineCompass size={18} className="text-primary-600 dark:text-primary-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gợi ý tiếp theo</h3>
        </div>
        <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-500/20 border border-primary-100 dark:border-primary-500/30 px-2 py-0.5 rounded-full">
          {videos.length} clips
        </span>
      </div>

      {/* Video Playlist Quick Cards */}
      <div className="space-y-2.5">
        {videos.slice(0, 6).map((vid, i) => (
          <div
            key={`thumb-${vid.id}`}
            onClick={() => onScrollToVideo(vid.id)}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 transition-all cursor-pointer group"
          >
            {/* Thumbnail Container */}
            <div className="relative w-18 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 shadow-sm group-hover:scale-102 transition-transform border border-slate-200 dark:border-slate-800/80">
              {vid.poster ? (
                <img
                  src={vid.poster}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={vid.link}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                  <BsPlay size={14} className="translate-x-0.5" />
                </div>
              </div>
              <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
                #{i + 1}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {vid.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Avatar src={vid.user.avatar} name={vid.user.name} size="xs" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{vid.user.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                <span>❤️ {likesCount[vid.id] || vid.likes}</span>
                <span>💬 {vid.commentsCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creator Hub Callout Card */}
      <div className="mt-auto pt-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/30 border border-primary-500/30">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">Sáng tạo nội dung</p>
          <h4 className="text-sm font-bold mt-1">Đăng video ngắn trên Zivo</h4>
          <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
            Chia sẻ khoảnh khắc đẹp đến hàng triệu người xem mỗi ngày.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default WatchPlaylistSidebar
