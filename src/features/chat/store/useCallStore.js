import { create } from 'zustand'
import { getSocket } from '@/services/socketClient'
import { toast } from 'react-toastify'
import chatService from '../services/chatService'
import { useChatStore } from './useChatStore'
import { normalizeChatMessage } from '@/utils/chatConversationAdapters'

// Comprehensive STUN servers for WebRTC NAT traversal
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.ekiga.net' },
    { urls: 'stun:stun.ideasip.com' },
    { urls: 'stun:stun.voiparound.com' },
    { urls: 'stun:stun.voipbuster.com' },
  ],
}

// Module-level non-reactive references
let rtcPeerConnection = null
let iceCandidatesQueue = []
let localStreamRef = null
let ringInterval = null
let socketInstance = null
let callTimerInterval = null
let callConnectedTime = null
let audioCtx = null

const playRingtoneBeep = (isIncoming) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!audioCtx) audioCtx = new AudioContextClass()
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const ctx = audioCtx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(isIncoming ? 440 : 480, ctx.currentTime)

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.8)
  } catch (e) {
    console.warn('Web Audio synthesis error:', e)
  }
}

const startSound = (type) => {
  stopSounds()
  try {
    playRingtoneBeep(type === 'incoming')
    ringInterval = setInterval(() => {
      playRingtoneBeep(type === 'incoming')
    }, 2000)
  } catch (e) {
    console.warn('Sound start error:', e)
  }
}

const stopSounds = () => {
  if (ringInterval) {
    clearInterval(ringInterval)
    ringInterval = null
  }
}

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const resolveDisplayName = (userObj) => {
  if (!userObj) return 'Người dùng'
  if (typeof userObj === 'string') return userObj
  if (userObj.fullName) return userObj.fullName
  if (userObj.full_name) return userObj.full_name

  const first = (userObj.firstName || userObj.first_name || '').trim()
  const last = (userObj.lastName || userObj.last_name || '').trim()
  if (first || last) {
    return `${last} ${first}`.trim()
  }

  return userObj.username || userObj.name || userObj.email || 'Người dùng'
}

const closePeerConnection = () => {
  if (rtcPeerConnection) {
    try {
      rtcPeerConnection.ontrack = null
      rtcPeerConnection.onicecandidate = null
      rtcPeerConnection.onconnectionstatechange = null
      rtcPeerConnection.close()
    } catch (e) {
      console.warn('Error closing peer connection:', e)
    }
    rtcPeerConnection = null
  }
  iceCandidatesQueue = []
}

const createPeerConnection = (targetUserId, socket, set) => {
  closePeerConnection()

  const pc = new RTCPeerConnection(RTC_CONFIG)
  rtcPeerConnection = pc

  // Attach local media stream tracks
  if (localStreamRef) {
    localStreamRef.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef)
    })
  }

  // Handle outgoing ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate && socket && targetUserId) {
      socket.emit('webrtc:ice-candidate', {
        targetUserId: String(targetUserId),
        candidate: event.candidate,
      })
    }
  }

  // Handle incoming remote media tracks
  pc.ontrack = (event) => {
    console.log('[WebRTC] Received remote media track:', event.track?.kind, event.streams?.[0])
    if (event.streams && event.streams[0]) {
      set({ remoteStream: event.streams[0] })
    } else if (event.track) {
      set((state) => {
        const currentStream = state.remoteStream || new MediaStream()
        currentStream.addTrack(event.track)
        return { remoteStream: currentStream }
      })
    }
  }

  pc.onconnectionstatechange = () => {
    console.log('[WebRTC] Connection state:', pc.connectionState)
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      console.warn('[WebRTC] Connection disconnected or failed')
    }
  }

  return pc
}

const processIceCandidatesQueue = async (pc) => {
  while (iceCandidatesQueue.length > 0) {
    const candidate = iceCandidatesQueue.shift()
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (e) {
      console.warn('[WebRTC] Error adding queued ICE candidate:', e)
    }
  }
}

// User media request with clear error handling & audio fallback
const requestUserMedia = async (isVideo) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: isVideo,
    })
    return stream
  } catch (err) {
    console.warn('[WebRTC] Media access error:', err.name || err.message)

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      toast.error('Quyền truy cập Camera/Microphone bị từ chối. Vui lòng cho phép quyền trên trình duyệt để gọi điện.')
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      toast.error('Không tìm thấy thiết bị Camera/Microphone trên máy tính/điện thoại của bạn.')
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      toast.error('Camera/Microphone đang được ứng dụng khác (như Zoom, Zalo) sử dụng.')
    } else {
      toast.error('Không thể truy cập thiết bị âm thanh/hình ảnh. Vui lòng kiểm tra quyền cài đặt trình duyệt.')
    }

    // Try fallback to audio-only if video call failed
    if (isVideo) {
      try {
        console.log('[WebRTC] Retrying fallback to audio-only...')
        toast.info('Chuyển sang cuộc gọi thoại không dùng Camera...')
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        })
        return audioStream
      } catch (audioErr) {
        console.error('[WebRTC] Audio fallback also failed:', audioErr)
      }
    }

    return null
  }
}

export const useCallStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  callStatus: 'idle', // 'idle' | 'ringing_in' | 'ringing_out' | 'connected'
  isVideoCall: false,
  isCaller: false, // true if current user initiated the call
  isMuted: false,
  isCamOff: false,
  callInfo: null, // { userId, fullName, avatar }
  localStream: null,
  remoteStream: null,
  callDuration: 0,
  callDurationFormatted: '00:00',

  // Actions
  initPeer: (user, token) => {
    if (!user || !token) {
      get().destroyPeer()
      return
    }

    if (socketInstance && get().user?.id === user.id) {
      return
    }

    set({ user, token })
    socketInstance = getSocket(token)

    if (socketInstance) {
      // 1. Incoming Call Event
      const handleIncomingCallAlert = ({ callerId, callerName, callerAvatar, isVideo }) => {
        const { callStatus } = get()
        if (callStatus !== 'idle') {
          socketInstance.emit('call:busy', { callerId })
          return
        }

        console.log('[Socket] Incoming call from:', callerId)
        set({
          isVideoCall: isVideo,
          isCaller: false,
          callInfo: {
            userId: callerId,
            fullName: resolveDisplayName({ fullName: callerName }),
            avatar: callerAvatar,
          },
          callStatus: 'ringing_in',
          callDuration: 0,
          callDurationFormatted: '00:00',
        })
        startSound('incoming')
      }

      // 2. Call Accepted Event (Caller side)
      const handleCallAccepted = async ({ calleeId }) => {
        console.log('[Socket] Call accepted by callee:', calleeId)
        stopSounds()
        get().startCallTimer()
        set({ callStatus: 'connected' })

        try {
          const pc = createPeerConnection(calleeId, socketInstance, set)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)

          socketInstance.emit('webrtc:offer', {
            targetUserId: String(calleeId),
            offer,
          })
        } catch (e) {
          console.error('[WebRTC] Offer creation error:', e)
          toast.error('Không thể khởi tạo cuộc gọi WebRTC.')
          get().cleanCallState('ended')
        }
      }

      // 3. WebRTC Offer Received Event (Callee side)
      const handleWebRtcOffer = async ({ senderId, offer }) => {
        console.log('[WebRTC] Received offer from:', senderId)
        try {
          let pc = rtcPeerConnection
          if (!pc) {
            pc = createPeerConnection(senderId, socketInstance, set)
          }

          await pc.setRemoteDescription(new RTCSessionDescription(offer))
          await processIceCandidatesQueue(pc)

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          socketInstance.emit('webrtc:answer', {
            targetUserId: String(senderId),
            answer,
          })
        } catch (e) {
          console.error('[WebRTC] Answer creation error:', e)
        }
      }

      // 4. WebRTC Answer Received Event (Caller side)
      const handleWebRtcAnswer = async ({ senderId, answer }) => {
        console.log('[WebRTC] Received answer from:', senderId)
        try {
          if (rtcPeerConnection) {
            await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
            await processIceCandidatesQueue(rtcPeerConnection)
          }
        } catch (e) {
          console.error('[WebRTC] Remote description error:', e)
        }
      }

      // 5. WebRTC ICE Candidate Received Event
      const handleWebRtcIceCandidate = async ({ senderId, candidate }) => {
        try {
          if (rtcPeerConnection && rtcPeerConnection.remoteDescription) {
            await rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          } else {
            iceCandidatesQueue.push(candidate)
          }
        } catch (e) {
          console.warn('[WebRTC] Candidate error:', e)
        }
      }

      // 6. Call Rejected Event
      const handleCallRejected = ({ reason }) => {
        toast.info(reason === 'busy' ? 'Người dùng bận.' : 'Cuộc gọi bị từ chối.')
        get().cleanCallState('rejected')
      }

      // 7. Call Ended Event
      const handleCallEnded = () => {
        console.log('[Socket] Call ended by remote peer.')
        get().cleanCallState('ended')
      }

      // 8. Call Busying Event
      const handleCallBusying = () => {
        toast.warn('Người dùng đang trong một cuộc gọi khác.')
        get().cleanCallState('busy')
      }

      // Clean old listeners first
      socketInstance.off('call:incoming', handleIncomingCallAlert)
      socketInstance.off('call:accepted', handleCallAccepted)
      socketInstance.off('webrtc:offer', handleWebRtcOffer)
      socketInstance.off('webrtc:answer', handleWebRtcAnswer)
      socketInstance.off('webrtc:ice-candidate', handleWebRtcIceCandidate)
      socketInstance.off('call:rejected', handleCallRejected)
      socketInstance.off('call:ended', handleCallEnded)
      socketInstance.off('call:busying', handleCallBusying)

      // Bind active listeners
      socketInstance.on('call:incoming', handleIncomingCallAlert)
      socketInstance.on('call:accepted', handleCallAccepted)
      socketInstance.on('webrtc:offer', handleWebRtcOffer)
      socketInstance.on('webrtc:answer', handleWebRtcAnswer)
      socketInstance.on('webrtc:ice-candidate', handleWebRtcIceCandidate)
      socketInstance.on('call:rejected', handleCallRejected)
      socketInstance.on('call:ended', handleCallEnded)
      socketInstance.on('call:busying', handleCallBusying)
    }
  },

  destroyPeer: () => {
    get().cleanCallState('ended')

    if (socketInstance) {
      socketInstance.off('call:incoming')
      socketInstance.off('call:accepted')
      socketInstance.off('webrtc:offer')
      socketInstance.off('webrtc:answer')
      socketInstance.off('webrtc:ice-candidate')
      socketInstance.off('call:rejected')
      socketInstance.off('call:ended')
      socketInstance.off('call:busying')
      socketInstance = null
    }
  },

  startCallTimer: () => {
    if (callTimerInterval) clearInterval(callTimerInterval)
    callConnectedTime = Date.now()
    set({ callDuration: 0, callDurationFormatted: '00:00' })

    callTimerInterval = setInterval(() => {
      if (!callConnectedTime) return
      const elapsedSeconds = Math.floor((Date.now() - callConnectedTime) / 1000)
      set({
        callDuration: elapsedSeconds,
        callDurationFormatted: formatDuration(elapsedSeconds),
      })
    }, 1000)
  },

  makeCall: async (targetUser, isVideo) => {
    if (!socketInstance || !targetUser) return

    const { user } = get()
    const targetUserId = targetUser.userId || targetUser.id || targetUser._id
    const displayName = resolveDisplayName(targetUser)
    const callerName = resolveDisplayName(user)

    set({
      isVideoCall: isVideo,
      isCaller: true,
      isMuted: false,
      isCamOff: false,
      callInfo: {
        userId: String(targetUserId),
        fullName: displayName,
        avatar: targetUser.avatar || '',
      },
      callStatus: 'ringing_out',
      callDuration: 0,
      callDurationFormatted: '00:00',
    })
    startSound('outgoing')

    const stream = await requestUserMedia(isVideo)
    if (!stream) {
      get().cleanCallState('error')
      return
    }

    localStreamRef = stream
    set({ localStream: stream })

    socketInstance.emit('call:request', {
      targetUserId: String(targetUserId),
      callerId: String(user.id || user._id),
      callerName,
      callerAvatar: user.avatar || '',
      isVideo,
    })
  },

  answerCall: async () => {
    const { callInfo, isVideoCall } = get()
    if (!socketInstance || !callInfo) return
    stopSounds()

    const stream = await requestUserMedia(isVideoCall)
    if (!stream) {
      get().rejectCall()
      return
    }

    localStreamRef = stream
    get().startCallTimer()
    set({ localStream: stream, callStatus: 'connected' })

    socketInstance.emit('call:accept', {
      callerId: String(callInfo.userId),
      calleeId: String(get().user?.id || get().user?._id),
    })
  },

  rejectCall: () => {
    const { callInfo } = get()
    if (socketInstance && callInfo) {
      socketInstance.emit('call:reject', {
        callerId: String(callInfo.userId),
        reason: 'declined',
      })
    }
    get().cleanCallState('rejected')
  },

  endCall: () => {
    const { callInfo, user } = get()
    if (socketInstance && callInfo) {
      socketInstance.emit('call:end', {
        targetUserId: String(callInfo.userId),
        senderId: String(user?.id || user?._id),
      })
    }
    get().cleanCallState('ended')
  },

  toggleMic: () => {
    if (localStreamRef) {
      const audioTrack = localStreamRef.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        set({ isMuted: !audioTrack.enabled })
      }
    }
  },

  toggleCam: () => {
    if (localStreamRef) {
      const videoTrack = localStreamRef.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        set({ isCamOff: !videoTrack.enabled })
      }
    }
  },

  cleanCallState: (endReason = 'ended') => {
    const snapshotCallInfo = get().callInfo
    const snapshotIsVideoCall = get().isVideoCall
    const snapshotIsCaller = get().isCaller
    const snapshotCallDurationFormatted = get().callDurationFormatted
    const snapshotCallStatus = get().callStatus

    // 1. Immediately reset state FIRST so UI and media tracks close cleanly
    stopSounds()
    closePeerConnection()

    if (callTimerInterval) {
      clearInterval(callTimerInterval)
      callTimerInterval = null
    }

    if (localStreamRef) {
      localStreamRef.getTracks().forEach((track) => track.stop())
      localStreamRef = null
    }

    set({
      localStream: null,
      remoteStream: null,
      callStatus: 'idle',
      isCaller: false,
      isMuted: false,
      isCamOff: false,
      callInfo: null,
      callDuration: 0,
      callDurationFormatted: '00:00',
    })

    // 2. Safe async recording of Call History into Chat Conversation (CALLER ONLY)
    if (snapshotIsCaller && snapshotCallInfo?.userId && snapshotCallStatus !== 'idle') {
      const targetUserId = snapshotCallInfo.userId
      let historyText = ''
      const callTypeLabel = snapshotIsVideoCall ? 'Cuộc gọi video' : 'Cuộc gọi thoại'

      if (snapshotCallStatus === 'connected' && callConnectedTime) {
        const durationStr = snapshotCallDurationFormatted || '00:00'
        historyText = `${callTypeLabel} - ${durationStr}`
      } else if (snapshotCallStatus === 'ringing_in' || snapshotCallStatus === 'ringing_out') {
        historyText = endReason === 'rejected' ? `${callTypeLabel} bị từ chối` : `${callTypeLabel} nhỡ`
      }

      callConnectedTime = null

      if (historyText) {
        chatService
          .createOrGetDirectConversation(targetUserId)
          .then((res) => {
            const convId = res?.data?._id || res?.data?.id
            if (convId) {
              return chatService.sendMessage(convId, historyText, { type: 'call' })
            }
          })
          .then((msgRes) => {
            const newMsg = msgRes?.data || msgRes
            if (newMsg) {
              const chatStoreState = useChatStore.getState()
              const activeConvId = chatStoreState.activeConversationId
              const convId = String(newMsg.conversation?._id || newMsg.conversation || '')

              if (activeConvId && String(activeConvId) === convId) {
                const normalized = normalizeChatMessage(newMsg, { forceMine: true })
                useChatStore.setState((state) => ({
                  messages: [...state.messages, normalized],
                }))
              }

              chatStoreState.updateFriendPreview(targetUserId, historyText, { createdAt: new Date().toISOString() })
            }
          })
          .catch((err) => {
            console.warn('[CallHistory] Failed to record call message:', err)
          })
      }
    } else {
      callConnectedTime = null
    }
  },
}))
