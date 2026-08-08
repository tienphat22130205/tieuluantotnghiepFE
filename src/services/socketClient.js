import { io } from 'socket.io-client'

let socketInstance = null
let activeToken = null
const SOCKET_DEBUG_ENABLED = String(import.meta.env.VITE_SOCKET_DEBUG || '').toLowerCase() === 'true'

export const isSocketDebugEnabled = () => SOCKET_DEBUG_ENABLED
export const socketDebugLog = (...args) => {
  if (!SOCKET_DEBUG_ENABLED) return
  console.log('[socket]', ...args)
}

const trimSlash = (value) => value?.replace(/\/+$/, '') || ''

export const deriveSocketUrl = () => {
  const rawApiUrl = trimSlash(import.meta.env.VITE_API_URL)

  if (!rawApiUrl) {
    return window.location.origin
  }

  if (rawApiUrl.endsWith('/api')) {
    return rawApiUrl.slice(0, -4)
  }

  return rawApiUrl
}

const createSocket = (token) => io(deriveSocketUrl(), {
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true,
  auth: token ? { token } : undefined,
})

export const getSocket = (token) => {
  if (!token) {
    return null
  }

  if (!socketInstance) {
    socketInstance = createSocket(token)
    socketInstance.on('connect', () => {
      socketDebugLog('connected', { id: socketInstance?.id })
    })
    socketInstance.on('disconnect', (reason) => {
      socketDebugLog('disconnected', { reason })
    })
    socketInstance.on('connect_error', (error) => {
      socketDebugLog('connect_error', { message: error?.message })
    })
    activeToken = token
    socketInstance.connect()
    return socketInstance
  }

  if (activeToken !== token) {
    socketInstance.auth = { token }
    activeToken = token
    if (socketInstance.connected) {
      socketInstance.disconnect()
    }
    socketInstance.connect()
  } else if (!socketInstance.connected) {
    socketInstance.connect()
  }

  return socketInstance
}

export const closeSocket = () => {
  if (!socketInstance) return

  socketInstance.disconnect()
  socketInstance = null
  activeToken = null
}
