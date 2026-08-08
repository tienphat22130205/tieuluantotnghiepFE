import { create } from 'zustand'
import Peer from 'peerjs'
import { getSocket, deriveSocketUrl } from '@/services/socketClient'
import { toast } from 'react-toastify'

const INCOMING_RING_URL = 'https://assets.mixkit.co/active_storage/sfx/1359/1359-84.wav'
const OUTGOING_RING_URL = 'https://assets.mixkit.co/active_storage/sfx/2056/2056-84.wav'

// Module-level non-reactive references to avoid unnecessary re-renders
let peerInstance = null
let activeCall = null
let localStreamRef = null
let incomingRingAudio = null
let outgoingRingAudio = null
let socketInstance = null

const initAudio = () => {
  if (typeof window !== 'undefined') {
    if (!incomingRingAudio) {
      incomingRingAudio = new Audio(INCOMING_RING_URL)
      incomingRingAudio.loop = true
    }
    if (!outgoingRingAudio) {
      outgoingRingAudio = new Audio(OUTGOING_RING_URL)
      outgoingRingAudio.loop = true
    }
  }
}

const startSound = (type) => {
  initAudio()
  stopSounds()
  try {
    if (type === 'incoming' && incomingRingAudio) {
      incomingRingAudio.play().catch((e) => console.warn('Audio play block:', e))
    } else if (type === 'outgoing' && outgoingRingAudio) {
      outgoingRingAudio.play().catch((e) => console.warn('Audio play block:', e))
    }
  } catch (e) {
    console.warn('Sound play error:', e)
  }
}

const stopSounds = () => {
  try {
    if (incomingRingAudio) {
      incomingRingAudio.pause()
      incomingRingAudio.currentTime = 0
    }
    if (outgoingRingAudio) {
      outgoingRingAudio.pause()
      outgoingRingAudio.currentTime = 0
    }
  } catch (e) {
    console.warn('Sound pause error:', e)
  }
}

export const useCallStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  callStatus: 'idle', // 'idle' | 'ringing_in' | 'ringing_out' | 'connected'
  isVideoCall: false,
  isMuted: false,
  isCamOff: false,
  callInfo: null, // { userId, fullName, avatar }
  localStream: null,
  remoteStream: null,

  // Actions
  initPeer: (user, token) => {
    // Prevent duplicate peer creation
    if (!user || !token) {
      get().destroyPeer()
      return
    }

    if (peerInstance && get().user?.id === user.id) {
      return
    }

    set({ user, token })
    socketInstance = getSocket(token)

    const currentUserId = String(user.id || user._id)
    const socketUrl = deriveSocketUrl()
    let peerHost = 'localhost'
    let peerPort = 5000
    let peerSecure = false

    try {
      const url = new URL(socketUrl)
      peerHost = url.hostname
      peerPort = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80)
      peerSecure = url.protocol === 'https:'
    } catch (e) {
      console.warn('Failed to parse socketUrl for Peer, falling back to localhost:5000', e)
    }

    // Destroy existing peer connection first
    if (peerInstance) {
      peerInstance.destroy()
      peerInstance = null
    }

    const peer = new Peer(currentUserId, {
      host: peerHost,
      port: peerPort,
      path: '/peerjs',
      secure: peerSecure,
      debug: 1,
    })

    peer.on('open', (id) => {
      console.log('[PeerJS] Connected to server with ID:', id)
    })

    peer.on('error', (err) => {
      console.error('[PeerJS] Connection error:', err)
      if (err.type === 'peer-unavailable') {
        toast.error('Người nhận hiện không trực tuyến hoặc không thể kết nối.')
        get().cleanCallState()
      } else if (err.type === 'unavailable-id') {
        console.warn('[PeerJS] ID already taken. This is normal in React StrictMode development.')
      }
    })

    peer.on('call', (incomingCall) => {
      console.log('[PeerJS] Incoming call from:', incomingCall.peer)
      const { callStatus } = get()
      if (activeCall || callStatus !== 'idle') {
        incomingCall.answer() // Answer with no stream, then immediately close
        incomingCall.close()
        return
      }
      activeCall = incomingCall
    })

    peerInstance = peer

    // Bind Socket.io events
    if (socketInstance) {
      const handleIncomingCallAlert = ({ callerId, callerName, callerAvatar, isVideo }) => {
        const { callStatus } = get()
        if (callStatus !== 'idle') {
          socketInstance.emit('call:busy', { callerId })
          return
        }

        console.log('[Socket] Incoming call from user:', callerId)
        set({
          isVideoCall: isVideo,
          callInfo: { userId: callerId, fullName: callerName, avatar: callerAvatar },
          callStatus: 'ringing_in',
        })
        startSound('incoming')
      }

      const handleCallAccepted = ({ calleeId }) => {
        console.log('[Socket] Call accepted by:', calleeId)
        stopSounds()

        if (activeCall || !localStreamRef) return

        try {
          const outgoingCall = peerInstance.call(calleeId, localStreamRef)
          activeCall = outgoingCall
          set({ callStatus: 'connected' })

          outgoingCall.on('stream', (rStream) => {
            console.log('[PeerJS] Received remote media stream.')
            set({ remoteStream: rStream })
          })

          outgoingCall.on('close', () => {
            console.log('[PeerJS] Outgoing Call closed by remote.')
            get().cleanCallState()
          })
        } catch (e) {
          console.error('[PeerJS] Error calling callee:', e)
          toast.error('Không thể kết nối cuộc gọi.')
          get().cleanCallState()
        }
      }

      const handleCallRejected = ({ reason }) => {
        toast.info(reason === 'busy' ? 'Người dùng bận.' : 'Cuộc gọi bị từ chối.')
        get().cleanCallState()
      }

      const handleCallEnded = () => {
        console.log('[Socket] Call ended by remote.')
        get().cleanCallState()
      }

      const handleCallBusying = () => {
        toast.warn('Người dùng đang trong một cuộc gọi khác.')
        get().cleanCallState()
      }

      socketInstance.on('call:incoming', handleIncomingCallAlert)
      socketInstance.on('call:accepted', handleCallAccepted)
      socketInstance.on('call:rejected', handleCallRejected)
      socketInstance.on('call:ended', handleCallEnded)
      socketInstance.on('call:busying', handleCallBusying)
    }
  },

  destroyPeer: () => {
    get().cleanCallState()
    if (peerInstance) {
      peerInstance.destroy()
      peerInstance = null
    }

    if (socketInstance) {
      socketInstance.off('call:incoming')
      socketInstance.off('call:accepted')
      socketInstance.off('call:rejected')
      socketInstance.off('call:ended')
      socketInstance.off('call:busying')
      socketInstance = null
    }
  },

  makeCall: async (targetUser, isVideo) => {
    if (!socketInstance || !peerInstance) return

    const { user } = get()
    const targetUserId = targetUser.userId || targetUser.id || targetUser._id

    set({
      isVideoCall: isVideo,
      isMuted: false,
      isCamOff: false,
      callInfo: {
        userId: targetUserId,
        fullName: targetUser.fullName || targetUser.full_name || 'Người dùng',
        avatar: targetUser.avatar,
      },
      callStatus: 'ringing_out',
    })
    startSound('outgoing')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      })
      localStreamRef = stream
      set({ localStream: stream })

      socketInstance.emit('call:request', {
        targetUserId: String(targetUserId),
        callerId: String(user.id || user._id),
        callerName: user.fullName || user.full_name || 'Người dùng',
        callerAvatar: user.avatar || '',
        isVideo,
      })
    } catch (e) {
      console.error('Camera/Microphone access denied:', e)
      toast.error('Cần quyền truy cập Camera/Microphone để thực hiện cuộc gọi.')
      get().cleanCallState()
    }
  },

  answerCall: async () => {
    if (!activeCall || !socketInstance) return
    stopSounds()

    try {
      const { isVideoCall, user } = get()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall,
      })
      localStreamRef = stream
      set({ localStream: stream })

      const incomingCall = activeCall
      incomingCall.answer(stream)

      incomingCall.on('stream', (rStream) => {
        console.log('[PeerJS] Received remote stream.')
        set({ remoteStream: rStream })
      })

      incomingCall.on('close', () => {
        console.log('[PeerJS] Incoming Call closed by remote.')
        get().cleanCallState()
      })

      set({ callStatus: 'connected' })

      socketInstance.emit('call:accept', {
        callerId: incomingCall.peer,
        calleeId: String(user.id || user._id),
      })
    } catch (e) {
      console.error('Microphone/Camera access error on answer:', e)
      toast.error('Không thể truy cập camera/microphone.')
      get().rejectCall()
    }
  },

  rejectCall: () => {
    const { callInfo } = get()
    if (socketInstance && callInfo) {
      socketInstance.emit('call:reject', {
        callerId: callInfo.userId,
        reason: 'declined',
      })
    }
    if (activeCall) {
      activeCall.close()
      activeCall = null
    }
    get().cleanCallState()
  },

  endCall: () => {
    const { callInfo, user } = get()
    if (socketInstance && callInfo) {
      socketInstance.emit('call:end', {
        targetUserId: callInfo.userId,
        senderId: String(user.id || user._id),
      })
    }
    get().cleanCallState()
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

  cleanCallState: () => {
    stopSounds()

    if (localStreamRef) {
      localStreamRef.getTracks().forEach((track) => track.stop())
      localStreamRef = null
    }

    if (activeCall) {
      try {
        activeCall.close()
      } catch (e) {}
      activeCall = null
    }

    set({
      localStream: null,
      remoteStream: null,
      callStatus: 'idle',
      isMuted: false,
      isCamOff: false,
      callInfo: null,
    })
  },
}))
