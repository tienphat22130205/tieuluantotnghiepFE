import io from 'socket.io-client'
import { getAuthToken } from '@/utils/authStorage'

let socket = null
let statsListeners = []

const getSocketUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`
  return baseUrl.replace(/\/$/, '')
}

export const initSocket = () => {
  if (socket?.connected) return socket

  try {
    const token = getAuthToken()
    socket = io(getSocketUrl(), {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      socket.emit('stats:join')
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('stats:update', (data) => {
      statsListeners.forEach((listener) => listener(data))
    })

    return socket
  } catch (error) {
    console.error('Failed to initialize socket:', error)
    return null
  }
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const onStatsUpdate = (callback) => {
  statsListeners.push(callback)
  return () => {
    statsListeners = statsListeners.filter((l) => l !== callback)
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.emit('stats:leave')
    socket.disconnect()
    socket = null
  }
}

export default {
  initSocket,
  getSocket,
  onStatsUpdate,
  disconnectSocket,
}
