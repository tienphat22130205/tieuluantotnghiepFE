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

const CallModal = () => {
  const {
    callStatus,
    isVideoCall,
    isMuted,
    isCamOff,
    callInfo,
    localStream,
    remoteStream,
    answerCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam
  } = useCallStore()

  if (callStatus === 'idle' || !callInfo) return null

  const isRingingIn = callStatus === 'ringing_in'
  const isRingingOut = callStatus === 'ringing_out'
  const isConnected = callStatus === 'connected'

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md select-none text-white animate-fade-in">
      
      {styleTag}

      {/* Glassmorphic Container Card */}
      <div className="relative w-full max-w-[500px] h-[650px] md:h-[700px] rounded-3xl overflow-hidden bg-slate-900/40 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col justify-between p-8 backdrop-blur-xl">
        
        {/* Dynamic Glow Nodes */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* CALL HEADER: Info Area */}
        <div className="relative z-10 text-center flex flex-col items-center mt-6">
          {!isConnected || !isVideoCall ? (
            <>
              {/* Profile Avatar with waves */}
              <div className="relative mb-6">
                {isRingingIn || isRingingOut ? (
                  <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping-slow scale-150" />
                ) : null}
                <Avatar
                  src={callInfo.avatar}
                  name={callInfo.fullName}
                  size="xl"
                  className="w-24 h-24 border-4 border-white/10 shadow-2xl relative z-10"
                />
              </div>

              <h2 className="text-xl font-bold tracking-tight drop-shadow">
                {callInfo.fullName}
              </h2>
              
              <span className="text-xs text-slate-400 font-medium tracking-wide mt-2.5 block uppercase">
                {isRingingIn ? 'Cuộc gọi đến...' : isRingingOut ? 'Đang đổ chuông...' : 'Cuộc gọi đang kết nối...'}
              </span>
            </>
          ) : (
            <div className="text-left w-full flex items-center gap-3 bg-black/30 backdrop-blur-xs p-3 rounded-2xl border border-white/5 absolute top-0 left-0 right-0">
              <Avatar
                src={callInfo.avatar}
                name={callInfo.fullName}
                size="sm"
                className="border border-white/10"
              />
              <div>
                <span className="text-xs font-bold block">{callInfo.fullName}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wide">Video Call</span>
              </div>
            </div>
          )}
        </div>

        {/* MEDIA AREA: Video Tracks container */}
        <div className="flex-1 flex items-center justify-center my-6 relative min-h-0">
          {isConnected && isVideoCall ? (
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black/60 border border-white/5">
              
              {/* Remote stream video (Full screen card) */}
              {remoteStream ? (
                <VideoPlayer stream={remoteStream} muted={false} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Đang nhận luồng video...
                </div>
              )}

              {/* Local stream video (Small box in bottom right) */}
              {localStream && !isCamOff ? (
                <div className="absolute bottom-4 right-4 w-[110px] h-[155px] rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20 bg-slate-900">
                  <VideoPlayer stream={localStream} muted={true} />
                </div>
              ) : null}

              {/* If Local Camera is Off */}
              {isCamOff && (
                <div className="absolute bottom-4 right-4 w-[110px] h-[155px] rounded-xl border border-white/5 shadow-xl z-20 bg-slate-800 flex items-center justify-center text-slate-500">
                  <FiVideoOff size={18} />
                </div>
              )}
            </div>
          ) : (
            // Voice Call Center Indicator
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Hidden audio element to capture remote voice stream */}
              {isConnected && remoteStream ? (
                <audio
                  ref={(ref) => {
                    if (ref && remoteStream) ref.srcObject = remoteStream
                  }}
                  autoPlay
                />
              ) : null}

              {/* Sound wave graphics while talking */}
              {isConnected && (
                <div className="flex items-center gap-1.5 justify-center h-10">
                  <span className="w-1 bg-primary-500 rounded-full animate-sound-wave h-8" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 bg-primary-500 rounded-full animate-sound-wave h-5" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 bg-primary-500 rounded-full animate-sound-wave h-10" style={{ animationDelay: '0.5s' }} />
                  <span className="w-1 bg-primary-500 rounded-full animate-sound-wave h-4" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 bg-primary-500 rounded-full animate-sound-wave h-7" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* CALL FOOTER: Actions / Controls Bar */}
        <div className="relative z-10 flex flex-col gap-6 items-center">
          
          {/* Controls button row (Mute, Toggle Cam) */}
          {isConnected && (
            <div className="flex gap-4">
              {/* Microphone mute toggle */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  isMuted
                    ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30'
                    : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
                }`}
                title={isMuted ? 'Mở tiếng' : 'Tắt tiếng'}
              >
                {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </button>

              {/* Camera cam toggle (Video call only) */}
              {isVideoCall && (
                <button
                  onClick={toggleCam}
                  className={`p-4 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    isCamOff
                      ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30'
                      : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isCamOff ? 'Bật Camera' : 'Tắt Camera'}
                >
                  {isCamOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                </button>
              )}
            </div>
          )}

          {/* Accept / Decline Action Trigger Buttons */}
          <div className="flex gap-6 justify-center w-full mt-2">
            {isRingingIn ? (
              <>
                {/* Accept Button (Green) */}
                <button
                  onClick={answerCall}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer shadow-emerald-900/30"
                >
                  <FiPhone size={18} className="animate-bounce" />
                  <span>Trả lời</span>
                </button>

                {/* Decline Button (Red) */}
                <button
                  onClick={rejectCall}
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer shadow-red-900/30"
                >
                  <FiPhoneOff size={18} />
                  <span>Từ chối</span>
                </button>
              </>
            ) : (
              /* Outgoing call or connected call hang up button */
              <button
                onClick={endCall}
                className="flex items-center justify-center gap-2.5 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer shadow-red-900/30 w-[180px]"
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

// Inline Styles for Ripple and Waves
const styleTag = (
  <style>{`
    @keyframes pingSlow {
      0% {
        transform: scale(1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.5);
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
        transform: scaleY(2.2);
      }
    }
    .animate-sound-wave {
      animation: soundWave 0.6s ease-in-out infinite;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s ease-out forwards;
    }
  `}</style>
)

export default CallModal
