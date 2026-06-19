import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket, socketDebugLog } from '@/services/socketClient'
import { fetchGroupMessages, sendGroupMessage, appendRealtimeMessage } from '../store/groupSlice'

const useGroupChat = (groupId) => {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const messages = useSelector((state) => state.group.messages)

  const loadMessages = useCallback(() => {
    if (!groupId) return
    dispatch(fetchGroupMessages({ groupId }))
  }, [dispatch, groupId])

  useEffect(() => {
    if (groupId) {
      loadMessages()
    }
  }, [groupId, loadMessages])

  // Listen to group:new-message socket event
  useEffect(() => {
    if (!groupId || !token) return

    const socket = getSocket(token)
    if (!socket) return

    const handleNewMessage = (payload) => {
      socketDebugLog('socket event: group:new-message', payload)
      // Check if message belongs to current group
      const message = payload?.message || payload?.data?.message || payload
      if (message && String(message.group) === String(groupId)) {
        dispatch(appendRealtimeMessage(message))
      }
    }

    socket.on('group:new-message', handleNewMessage)

    return () => {
      socket.off('group:new-message', handleNewMessage)
    }
  }, [groupId, token, dispatch])

  const handleSendMessage = useCallback(async (content) => {
    if (!groupId || !content.trim()) return
    await dispatch(sendGroupMessage({ groupId, body: { content } })).unwrap()
  }, [dispatch, groupId])

  return {
    messages,
    sendMessage: handleSendMessage,
    refreshMessages: loadMessages,
  }
}

export default useGroupChat
