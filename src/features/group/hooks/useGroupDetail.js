import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket, socketDebugLog } from '@/services/socketClient'
import {
  fetchGroupDetail,
  clearCurrentGroup,
  fetchGroupPosts,
  fetchGroupMembers,
  fetchPendingMembers,
  fetchGroupPolls,
  fetchGroupEvents,
  joinGroup,
  leaveGroup,
  upsertRealtimeGroupPost,
  applyRealtimeGroupPostLike,
  applyRealtimeGroupPostComment,
  applyRealtimeGroupPollVote,
  applyRealtimeNewPoll,
  applyRealtimeNewEvent,
  applyRealtimeMemberChange,
} from '../store/groupSlice'

const useGroupDetail = (groupId) => {
  const dispatch = useDispatch()
  const { token, user } = useSelector((state) => state.auth)
  const currentUserId = user?.id || user?._id

  const {
    currentGroup,
    memberStatus,
    posts,
    members,
    pendingMembers,
    polls,
    events,
    isLoading,
    error,
  } = useSelector((state) => state.group)

  const isJoined = memberStatus === 'approved' || memberStatus === 'admin' || memberStatus === 'moderator'
  const isAdmin = memberStatus === 'admin' || (currentGroup && String(currentGroup.creator?._id || currentGroup.creator) === String(currentUserId))

  // Fetch initial group info & posts/members/etc.
  const loadGroupData = useCallback(() => {
    if (!groupId) return
    dispatch(fetchGroupDetail(groupId))
    dispatch(fetchGroupPosts({ groupId }))
    dispatch(fetchGroupMembers({ groupId }))
    dispatch(fetchGroupPolls(groupId))
    dispatch(fetchGroupEvents(groupId))
  }, [dispatch, groupId])

  // Load pending list if admin
  useEffect(() => {
    if (groupId && isAdmin) {
      dispatch(fetchPendingMembers(groupId))
    }
  }, [dispatch, groupId, isAdmin])

  useEffect(() => {
    if (!groupId) return
    loadGroupData()
    return () => {
      dispatch(clearCurrentGroup())
    }
  }, [groupId, loadGroupData, dispatch])

  // Realtime sockets connection
  useEffect(() => {
    if (!groupId || !token) return

    const socket = getSocket(token)
    if (!socket) return

    socketDebugLog(`group join room emit: group:${groupId}`)
    socket.emit('group:join', groupId)

    const handleNewPost = (payload) => {
      socketDebugLog('socket event: group:new-post', payload)
      dispatch(upsertRealtimeGroupPost(payload))
    }

    const handlePostLiked = (payload) => {
      socketDebugLog('socket event: group:post-liked', payload)
      dispatch(applyRealtimeGroupPostLike({ ...payload, liked: true }))
    }

    const handlePostUnliked = (payload) => {
      socketDebugLog('socket event: group:post-unliked', payload)
      dispatch(applyRealtimeGroupPostLike({ ...payload, liked: false }))
    }

    const handlePostCommented = (payload) => {
      socketDebugLog('socket event: group:post-commented', payload)
      dispatch(applyRealtimeGroupPostComment(payload))
    }

    const handlePollVoted = (payload) => {
      socketDebugLog('socket event: group:poll-voted', payload)
      dispatch(applyRealtimeGroupPollVote(payload))
    }

    const handleNewPoll = (payload) => {
      socketDebugLog('socket event: group:new-poll', payload)
      dispatch(applyRealtimeNewPoll(payload))
    }

    const handleNewEvent = (payload) => {
      socketDebugLog('socket event: group:new-event', payload)
      dispatch(applyRealtimeNewEvent(payload))
    }

    const handleMemberJoined = (payload) => {
      socketDebugLog('socket event: group:member-joined', payload)
      dispatch(applyRealtimeMemberChange({ ...payload, status: 'approved' }))
      dispatch(fetchGroupMembers({ groupId }))
    }

    const handleMemberBanned = (payload) => {
      socketDebugLog('socket event: group:member-banned', payload)
      dispatch(applyRealtimeMemberChange({ ...payload, status: 'banned' }))
      dispatch(fetchGroupMembers({ groupId }))
    }

    socket.on('group:new-post', handleNewPost)
    socket.on('group:post-liked', handlePostLiked)
    socket.on('group:post-unliked', handlePostUnliked)
    socket.on('group:post-commented', handlePostCommented)
    socket.on('group:poll-voted', handlePollVoted)
    socket.on('group:new-poll', handleNewPoll)
    socket.on('group:new-event', handleNewEvent)
    socket.on('group:member-joined', handleMemberJoined)
    socket.on('group:member-banned', handleMemberBanned)

    return () => {
      socketDebugLog(`group leave room emit: group:${groupId}`)
      socket.emit('group:leave', groupId)

      socket.off('group:new-post', handleNewPost)
      socket.off('group:post-liked', handlePostLiked)
      socket.off('group:post-unliked', handlePostUnliked)
      socket.off('group:post-commented', handlePostCommented)
      socket.off('group:poll-voted', handlePollVoted)
      socket.off('group:new-poll', handleNewPoll)
      socket.off('group:new-event', handleNewEvent)
      socket.off('group:member-joined', handleMemberJoined)
      socket.off('group:member-banned', handleMemberBanned)
    }
  }, [groupId, token, dispatch])

  // Join/leave action triggers
  const handleJoinGroup = useCallback(() => {
    if (!groupId) return
    dispatch(joinGroup(groupId))
  }, [dispatch, groupId])

  const handleLeaveGroup = useCallback(() => {
    if (!groupId) return
    dispatch(leaveGroup(groupId))
  }, [dispatch, groupId])

  return {
    currentGroup,
    memberStatus,
    isJoined,
    isAdmin,
    posts,
    members,
    pendingMembers,
    polls,
    events,
    isLoading,
    error,
    handleJoinGroup,
    handleLeaveGroup,
    refreshGroupData: loadGroupData,
  }
}

export default useGroupDetail
