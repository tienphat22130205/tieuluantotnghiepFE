import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiTrash, FiSend, FiEye } from 'react-icons/fi'
import { Avatar } from '@/components/ui'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const getSpotifyEmbedWithAutoplay = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('autoplay=1')) return trimmed;
  const separator = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${separator}autoplay=1`;
};

const StoryCard = ({
  activeStory: propActiveStory,
  story,
  activeStories = [],
  activeGroup,
  author,
  currentStoryIndex,
  setCurrentStoryIndex,
  progress,
  isPaused,
  setIsPaused,
  isMuted,
  setIsMuted,
  isMyStory,
  handleDeleteClick,
  floatingEmojis = [],
  handleEmojiClick,
  replyText,
  setReplyText,
  handleSendReply,
  reactionEmojis = [],
  setShowViewersList,
  shouldPause,
  children,
}) => {
  const activeStory = propActiveStory || story
  const displayAuthor = activeGroup?.user || author

  if (!activeStory) return null
  return (
    <div
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative w-full max-w-[420px] h-[92vh] rounded-2xl overflow-hidden bg-slate-900 flex flex-col justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-slate-800"
    >
      {/* Background Story Content */}
      <div className="absolute inset-0 z-0">
        {activeStory.bgColor ? (
          <div
            className="w-full h-full flex items-center justify-center p-6 text-center"
            style={{ background: activeStory.bgColor }}
          >
            <span
              className="text-lg md:text-xl font-bold max-w-full break-words whitespace-pre-wrap drop-shadow-md"
              style={{ color: activeStory.textColor || '#fff' }}
            >
              {activeStory.textContent}
            </span>
          </div>
        ) : activeStory.mediaType === 'video' ? (
          <video
            src={resolveMediaUrl(activeStory.mediaUrl)}
            className={`w-full h-full object-${activeStory.objectFit || 'cover'}`}
            style={{ filter: activeStory.imageFilter && activeStory.imageFilter !== 'none' ? activeStory.imageFilter : undefined }}
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />
        ) : (
          <img
            src={resolveMediaUrl(activeStory.mediaUrl)}
            alt={activeGroup.user.fullName}
            className={`w-full h-full object-${activeStory.objectFit || 'cover'}`}
            style={{ filter: activeStory.imageFilter && activeStory.imageFilter !== 'none' ? activeStory.imageFilter : undefined }}
          />
        )}
        {/* Top and bottom dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/70" />
      </div>

      {/* Top Interface: Dashboards & Info header */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="relative z-20 p-4 pb-0 space-y-3"
      >
        {/* Dash progress bars (specific to the active user group only) */}
        <div className="flex gap-1.5 w-full">
          {activeStories.map((story, idx) => {
            let dashProgress = 0
            if (idx < currentStoryIndex) dashProgress = 100
            if (idx === currentStoryIndex) dashProgress = progress

            const storyId = story.id || story._id
            return (
              <div
                key={String(storyId)}
                onClick={() => setCurrentStoryIndex(idx)}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
              >
                <div
                  className="h-full bg-white"
                  style={{
                    width: `${dashProgress}%`,
                    transition: idx === currentStoryIndex && dashProgress > 0 && dashProgress < 100 && !shouldPause ? 'width 100ms linear' : 'none'
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Author info & Theater Mode settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={activeGroup.user.avatar}
              name={activeGroup.user.fullName}
              size="sm"
              className="border-2 border-white/60 shadow"
            />
            <div>
              <span className="text-sm font-bold text-white block leading-none">
                {activeGroup.user.fullName}
              </span>
              <span className="text-[10px] text-slate-300 block mt-1 leading-none">
                {activeStory.createdAt}
              </span>
              {/* Music title under name and time */}
              {((activeStory.music && activeStory.music.title) || activeStory.spotifyUrl) && (
                <div 
                  onClick={() => activeStory.spotifyUrl && window.open(activeStory.spotifyUrl, '_blank')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-white/95 mt-1 hover:underline cursor-pointer select-none drop-shadow-sm"
                  title={activeStory.spotifyUrl ? "Nghe trên Spotify" : ""}
                >
                  <span className="truncate max-w-[180px]">
                    🎵 {activeStory.music?.title || 'Spotify Song'} - {activeStory.music?.artist || 'Spotify Artist'}
                  </span>
                  <span className="text-[10px] shrink-0 font-bold">&gt;</span>
                </div>
              )}
            </div>
          </div>

          {/* Header Action controls */}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xs rounded-full p-1 border border-white/5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              title={isPaused ? 'Phát' : 'Tạm dừng'}
            >
              {isPaused ? <FiPlay size={16} /> : <FiPause size={16} />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
              title={isMuted ? 'Bật âm' : 'Tắt âm'}
            >
              {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
            </button>
            {isMyStory && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition cursor-pointer"
                title="Xóa tin này"
              >
                <FiTrash size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spotify Mini Player – compact, shown at bottom of story */}
      {activeStory.spotifyUrl && (
        <div className="absolute bottom-[130px] left-4 right-4 z-20">
          <iframe
            id="spotify-story-iframe"
            key={activeStory.id || activeStory._id}
            title="Spotify Player"
            src={getSpotifyEmbedWithAutoplay(activeStory.spotifyUrl)}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style={{ borderRadius: '12px', border: 'none' }}
          />
        </div>
      )}

      {/* Floating animations layer */}
      <div className="absolute inset-x-0 bottom-[140px] top-[140px] pointer-events-none z-30 overflow-hidden">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-0 emoji-float text-4xl"
            style={{
              left: `${item.leftOffset}%`,
              transform: `rotate(${item.rotate}deg)`,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Bottom Interface: Messages & Emoji Panel / Viewer Info */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="relative z-20 p-4 space-y-3.5"
      >
        {isMyStory ? (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setShowViewersList(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/55 hover:bg-slate-900/65 backdrop-blur-xs rounded-full border border-white/5 text-xs font-semibold text-white/95 hover:text-white transition cursor-pointer shadow"
            >
              <FiEye size={14} className="text-primary-400" />
              <span>
                {activeStory.viewers?.length || 0}
              </span>
            </button>
          </div>
        ) : (
          <>
            {/* Quick emoji reaction row */}
            <div className="flex gap-2.5 justify-center py-1.5 bg-slate-950/40 backdrop-blur-xs rounded-full border border-slate-800/50 max-w-[340px] mx-auto px-4 shadow">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-3xl hover:scale-130 active:scale-95 transition-transform duration-100 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* DM Chat input */}
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Gửi tin nhắn..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-10 h-10 rounded-full bg-primary-600 disabled:bg-white/10 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 transition duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                <FiSend size={15} />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Render children (like viewers bottom sheet) inside the card */}
      {children}
    </div>
  )
}

export default StoryCard
