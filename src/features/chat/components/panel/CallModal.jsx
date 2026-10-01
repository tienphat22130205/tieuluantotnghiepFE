import { useEffect, useRef, useState } from 'react'
import { useCallStore } from '@/features/chat/store/useCallStore'
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  SwitchCamera,
} from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'

const VideoPlayer = ({ stream, muted, className, mirror = false }) => {
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
      className={`w-full h-full object-cover ${mirror ? '-scale-x-100' : ''} ${className || ''}`}
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

  const { t } = usePreferences()
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)

  if (callStatus === 'idle' || !callInfo) return null

  const isRingingIn = callStatus === 'ringing_in'
  const isRingingOut = callStatus === 'ringing_out'
  const isConnected = callStatus === 'connected'
  const isVideoConnected = isConnected && isVideoCall

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md select-none text-white animate-fade-in p-0 sm:p-4">
      {styleTag}

      {/* Main Container - smartphone frame on desktop, fullscreen on mobile */}
      <div className="relative w-full h-full sm:h-[680px] sm:max-w-[390px] sm:rounded-[38px] overflow-hidden bg-slate-950 sm:border sm:border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col justify-between">
        
        {/* AUDIO PLAYER (invisible, for voice reception) */}
        {isConnected && remoteStream && <AudioPlayer stream={remoteStream} />}

        {/* ------------------------------------------------------------- */}
        {/* CASE 1: ACTIVE VIDEO CALL (Matching Image 1)                   */}
        {/* ------------------------------------------------------------- */}
        {isVideoConnected ? (
          <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden">
            {/* Remote Video (Main background view) */}
            <div className="absolute inset-0 w-full h-full z-0 bg-slate-900">
              {remoteStream ? (
                <VideoPlayer stream={remoteStream} muted={false} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  {callInfo.avatar && (
                    <img
                      src={callInfo.avatar}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125"
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl mb-1">
                      {callInfo.avatar ? (
                        <img src={callInfo.avatar} alt={callInfo.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white">
                          {callInfo.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="w-6 h-6 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-slate-300">{t('call.videoLoading')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Top Bar: Floating Compact Info Pill */}
            <div className="relative z-30 pt-5 px-5 flex items-center justify-between pointer-events-none">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {callInfo.fullName}
                </span>
                <span className="text-[11px] font-medium text-slate-300">
                  {callDurationFormatted}
                </span>
              </div>
            </div>

            {/* Top-Right PiP: Local Video (Matching Image 1 selfie window) */}
            <div className="absolute top-5 right-5 w-24 h-36 sm:w-28 sm:h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 bg-slate-900 z-30 transition-transform duration-200 hover:scale-105">
              {localStream && !isCamOff ? (
                <VideoPlayer stream={localStream} muted={true} mirror={true} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2">
                  <VideoOff size={22} />
                  <span className="text-[10px] mt-1 font-medium">{t('call.camOff')}</span>
                </div>
              )}
            </div>

            {/* Bottom Floating Control Bar (Matching Image 1: Camera flip/toggle, End Call, Mic) */}
            <div className="relative z-30 pb-8 pt-20 px-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-center gap-6">
              {/* Left: Camera Switch / Toggle (White circle) */}
              <button
                type="button"
                onClick={toggleCam}
                title={isCamOff ? t('call.turnOnCam') : t('call.turnOffCam')}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl active:scale-95 ${
                  isCamOff
                    ? 'bg-red-500/90 text-white hover:bg-red-600'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isCamOff ? <VideoOff size={24} /> : <SwitchCamera size={24} />}
              </button>

              {/* Center: End Call (Red circle) */}
              <button
                type="button"
                onClick={endCall}
                title={t('call.endCall')}
                className="w-16 h-16 rounded-full bg-[#f03a3a] hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <PhoneOff size={28} />
              </button>

              {/* Right: Mic Mute / Unmute (White circle) */}
              <button
                type="button"
                onClick={toggleMic}
                title={isMuted ? t('call.unmute') : t('call.mute')}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl active:scale-95 ${
                  isMuted
                    ? 'bg-red-500/90 text-white hover:bg-red-600'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* CASE 2: CALLING / OUTGOING / VOICE CALL (Matching Image 2)     */
          /* ------------------------------------------------------------- */
          <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 z-10 overflow-hidden">
            {/* Dreamy Blurred Avatar Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              {callInfo.avatar ? (
                <img
                  src={callInfo.avatar}
                  alt=""
                  className="w-full h-full object-cover blur-3xl scale-150 opacity-35"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-950" />
              )}
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xl" />
            </div>

            {/* Top Bar / Status badge if connected */}
            <div className="w-full pt-2 flex justify-center">
              {isConnected && (
                <div className="px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{callDurationFormatted}</span>
                </div>
              )}
            </div>

            {/* Center Area: Big Avatar + "Calling" + Name (Exact Image 2) */}
            <div className="flex flex-col items-center text-center -mt-8">
              {/* Recipient Avatar */}
              <div className="relative mb-5">
                {isRingingOut && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-white/15 animate-ping-slow scale-150" />
                    <div className="absolute inset-0 rounded-full bg-white/10 animate-ping-slow [animation-delay:0.6s] scale-125" />
                  </>
                )}
                {isRingingIn && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping-slow scale-150" />
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping-slow [animation-delay:0.6s] scale-125" />
                  </>
                )}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl relative z-10 ring-4 ring-white/10 bg-slate-800">
                  {callInfo.avatar ? (
                    <img
                      src={callInfo.avatar}
                      alt={callInfo.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-primary-600">
                      {callInfo.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Text (e.g. "Calling" like Image 2) */}
              <p className="text-sm font-medium text-slate-300/90 tracking-wide mb-1">
                {isRingingOut
                  ? t('call.calling')
                  : isRingingIn
                  ? t('call.incoming')
                  : isConnected
                  ? `${t('call.connected')} (${callDurationFormatted})`
                  : t('call.connecting')}
              </p>

              {/* Name */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
                {callInfo.fullName}
              </h2>

              {/* Sound wave if connected voice call */}
              {isConnected && !isVideoCall && (
                <div className="flex items-center gap-1.5 justify-center h-8 mt-5">
                  <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave h-6" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave h-4" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave h-8" style={{ animationDelay: '0.5s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave h-3" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave h-5" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {/* Bottom Actions Area (Exact Image 2 layout) */}
            <div className="w-full pb-4">
              {isRingingIn ? (
                /* Incoming Call: Decline or Answer */
                <div className="flex items-center justify-around px-4">
                  {/* Decline Button */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={rejectCall}
                      className="w-16 h-16 rounded-full bg-[#f03a3a] hover:bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                    >
                      <PhoneOff size={26} />
                    </button>
                    <span className="text-xs text-slate-300 font-medium">{t('call.decline')}</span>
                  </div>

                  {/* Answer Button */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={answerCall}
                      className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition cursor-pointer animate-bounce"
                    >
                      <Phone size={26} />
                    </button>
                    <span className="text-xs text-slate-300 font-medium">{t('call.answer')}</span>
                  </div>
                </div>
              ) : (
                /* Outgoing / Active Voice Call (Exact 3 buttons like Image 2) */
                <div className="flex items-center justify-around px-2">
                  {/* Left: Speaker */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSpeakerOn((prev) => !prev)}
                      title={isSpeakerOn ? t('call.turnOffSpeaker') : t('call.turnOnSpeaker')}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 transition active:scale-95 shadow-lg cursor-pointer ${
                        isSpeakerOn
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-white/10 text-slate-400 hover:bg-white/20'
                      }`}
                    >
                      {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <span className="text-xs text-slate-300 font-medium">{t('call.speaker')}</span>
                  </div>

                  {/* Center: End Call */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={endCall}
                      title={t('call.endCall')}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#e05353] hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                    >
                      <PhoneOff size={28} />
                    </button>
                    <span className="text-xs text-transparent select-none">End</span>
                  </div>

                  {/* Right: Mute */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMic}
                      title={isMuted ? t('call.unmute') : t('call.mute')}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/10 transition active:scale-95 shadow-lg cursor-pointer ${
                        isMuted
                          ? 'bg-red-500/40 text-red-300 border-red-400/30'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <span className="text-xs text-slate-300 font-medium">{isMuted ? t('call.unmute') : t('call.mute')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
