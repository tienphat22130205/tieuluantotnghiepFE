import { useEffect, useRef } from 'react'
import { useCallStore } from '@/features/chat/store/useCallStore'
import { FiPhone, FiPhoneOff, FiVideo, FiVideoOff, FiMic, FiMicOff } from 'react-icons/fi'
import { Avatar } from '@/components/ui'

const VideoPlayer = ({ stream, muted, className }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover rounded-2xl ${className}`}
    />
  )
}

const AudioPlayer = ({ stream }) => {
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream
      audioRef.current.play().catch((e) => {
        console.warn('[AudioPlayer] Play error:', e)
      })
    }
  }, [stream])

  return <audio ref={audioRef} autoPlay playsInline />
}

const CallModal = () => {
  const {
    callStatus,
    isVideoCall,
    isMuted,
    isCamOff,
    callInfo,
    localStream,
    remoteStream,
    callDurationFormatted,
    answerCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam,
  } = useCallStore()

  if (callStatus === 'idle' || !callInfo) return null

  const isRingingIn = callStatus === 'ringing_in'
  const isRingingOut = callStatus === 'ringing_out'
  const isConnected = callStatus === 'connected'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-xl select-none text-white animate-fade-in p-4">
      {styleTag}

      {/* Glassmorphic Container Card */}
      <div className="relative w-full max-w-[480px] h-[640px] md:h-[680px] rounded-3xl overflow-hidden bg-slate-900/60 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col justify-between p-6 md:p-8 backdrop-blur-2xl">
        
        {/* Dynamic Glow Nodes */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* CALL HEADER: Info & Timer Area */}
        <div className="relative z-10 text-center flex flex-col items-center mt-4">
          {!isConnected || !isVideoCall ? (
            <>
              {/* Profile Avatar with pulsating wave effect */}
              <div className="relative mb-5">
                {isRingingIn || isRingingOut ? (
                  <>
                    <div className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping-slow scale-150" />
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow [animation-delay:0.6s] scale-125" />
                  </>
                ) : null}
                <Avatar
                  src={callInfo.avatar}
                  name={callInfo.fullName}
                  size="xl"
                  className="w-24 h-24 border-4 border-white/20 shadow-2xl relative z-10 ring-4 ring-primary-500/20"
                />
              </div>

              <h2 className="text-xl font-bold tracking-tight drop-shadow-md text-white">
                {callInfo.fullName}
              </h2>
              
              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                <span className="text-xs font-semibold tracking-wide uppercase text-slate-200">
                  {isRingingIn
                    ? 'Cuộc gọi đến...'
                    : isRingingOut
                    ? 'Đang đổ chuông...'
                    : `Đã kết nối • ${callDurationFormatted}`}
                </span>
              </div>
            </>
          ) : (
            /* Video Call Compact Top Bar */
            <div className="text-left w-full flex items-center justify-between bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <Avatar
                  src={callInfo.avatar}
                  name={callInfo.fullName}
                  size="sm"
                  className="border border-white/20"
                />
                <div>
                  <span className="text-xs font-bold block text-white">{callInfo.fullName}</span>
                  <span className="text-[10px] text-emerald-400 font-medium block uppercase tracking-wide">
                    Cuộc gọi Video • {callDurationFormatted}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MEDIA AREA: Stream Container */}
        <div className="flex-1 flex items-center justify-center my-4 relative min-h-0">
          {isConnected && isVideoCall ? (
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl">
              
              {/* Remote Stream (Main view) */}
              {remoteStream ? (
                <VideoPlayer stream={remoteStream} muted={false} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-3">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải luồng camera đối phương...</span>
                </div>
              )}

              {/* Local Stream (Small floating PIP) */}
              {localStream && !isCamOff ? (
                <div className="absolute bottom-3 right-3 w-[115px] h-[160px] rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl z-20 bg-slate-900">
                  <VideoPlayer stream={localStream} muted={true} />
                </div>
              ) : null}

              {/* Camera Off Indicator */}
              {isCamOff && (
                <div className="absolute bottom-3 right-3 w-[115px] h-[160px] rounded-xl border border-white/10 shadow-2xl z-20 bg-slate-800 flex items-center justify-center text-slate-400">
                  <FiVideoOff size={20} />
                </div>
              )}
            </div>
          ) : (
            /* Voice Call Wave Animation */
            <div className="w-full h-full flex items-center justify-center relative">
              {isConnected && remoteStream && <AudioPlayer stream={remoteStream} />}

              {isConnected && (
                <div className="flex items-center gap-2 justify-center h-12">
                  <span className="w-1.5 bg-primary-500 rounded-full animate-sound-wave h-10" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1.5 bg-primary-400 rounded-full animate-sound-wave h-6" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1.5 bg-primary-500 rounded-full animate-sound-wave h-12" style={{ animationDelay: '0.5s' }} />
                  <span className="w-1.5 bg-primary-300 rounded-full animate-sound-wave h-5" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 bg-primary-500 rounded-full animate-sound-wave h-8" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* CALL FOOTER: Action Controls */}
        <div className="relative z-10 flex flex-col gap-5 items-center">
          
          {/* Mute / Cam Toggles */}
          {isConnected && (
            <div className="flex gap-4">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-lg ${
                  isMuted
                    ? 'bg-red-500/30 border-red-500 text-red-400 hover:bg-red-500/40'
                    : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                }`}
                title={isMuted ? 'Mở tiếng' : 'Tắt tiếng'}
              >
                {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </button>

              {isVideoCall && (
                <button
                  onClick={toggleCam}
                  className={`p-4 rounded-full border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 shadow-lg ${
                    isCamOff
                      ? 'bg-red-500/30 border-red-500 text-red-400 hover:bg-red-500/40'
                      : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                  }`}
                  title={isCamOff ? 'Bật Camera' : 'Tắt Camera'}
                >
                  {isCamOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                </button>
              )}
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="flex gap-5 justify-center w-full">
            {isRingingIn ? (
              <>
                {/* Accept Button */}
                <button
                  onClick={answerCall}
                  className="flex-1 max-w-[170px] flex items-center justify-center gap-2.5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <FiPhone size={18} className="animate-bounce" />
                  <span>Trả lời</span>
                </button>

                {/* Reject Button */}
                <button
                  onClick={rejectCall}
                  className="flex-1 max-w-[170px] flex items-center justify-center gap-2.5 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <FiPhoneOff size={18} />
                  <span>Từ chối</span>
                </button>
              </>
            ) : (
              /* Hang up Button */
              <button
                onClick={endCall}
                className="w-full max-w-[200px] flex items-center justify-center gap-2.5 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-900/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <FiPhoneOff size={18} />
                <span>Gác máy</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// Inline Styles for Waves and Animations
const styleTag = (
  <style>{`
    @keyframes pingSlow {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }
    .animate-ping-slow {
      animation: pingSlow 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    }
    @keyframes soundWave {
      0%, 100% {
        transform: scaleY(1);
      }
      50% {
        transform: scaleY(2.4);
      }
    }
    .animate-sound-wave {
      animation: soundWave 0.6s ease-in-out infinite;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `}</style>
)

export default CallModal
