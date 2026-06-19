import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import groupService from '../services/groupService'

// Helper to normalize images
const normalizeImages = (images) => {
  if (!images) return []
  if (Array.isArray(images)) {
    return images.map(img => (typeof img === 'string' ? img : img.url || img.image_url || img.path)).filter(Boolean)
  }
  if (typeof images === 'string') return [images]
  return []
}

// Normalize group post for UI
const normalizeGroupPost = (post) => {
  if (!post) return null
  const author = post.author || post.user || {}
  const rawImages = post.images || []
  return {
    ...post,
    _id: post._id || post.id,
    content: post.content || '',
    images: normalizeImages(rawImages),
    created_at: post.created_at || post.createdAt,
    comments_count: post.comments_count || post.commentsCount || (Array.isArray(post.comments) ? post.comments.length : 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    likes: Array.isArray(post.likes) ? post.likes : [],
    isLiked: post.isLiked ?? post.liked ?? false,
    likeCount: post.likeCount ?? post.likes?.length ?? 0,
    author: {
      _id: author._id || author.id || null,
      username: author.username || 'user',
      full_name: author.full_name || author.fullName || 'Anonymous',
      avatar: author.avatar || null,
    },
  }
}

// ── Async Thunks ──

export const searchGroups = createAsyncThunk(
  'group/search',
  async (params, { rejectWithValue }) => {
    try {
      return await groupService.searchGroups(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tìm kiếm nhóm')
    }
  }
)

export const fetchMyGroups = createAsyncThunk(
  'group/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      return await groupService.getMyGroups(params)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi lấy danh sách nhóm của tôi')
    }
  }
)

export const fetchGroupDetail = createAsyncThunk(
  'group/fetchDetail',
  async (groupId, { rejectWithValue }) => {
    try {
      return await groupService.getGroupById(groupId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi lấy thông tin chi tiết nhóm')
    }
  }
)

export const createGroup = createAsyncThunk(
  'group/create',
  async (formData, { rejectWithValue }) => {
    try {
      return await groupService.createGroup(formData)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tạo nhóm')
    }
  }
)

export const updateGroup = createAsyncThunk(
  'group/update',
  async ({ groupId, formData }, { rejectWithValue }) => {
    try {
      return await groupService.updateGroup(groupId, formData)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi cập nhật thông tin nhóm')
    }
  }
)

export const deleteGroup = createAsyncThunk(
  'group/delete',
  async (groupId, { rejectWithValue }) => {
    try {
      await groupService.deleteGroup(groupId)
      return groupId
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi xóa nhóm')
    }
  }
)

export const joinGroup = createAsyncThunk(
  'group/join',
  async (groupId, { rejectWithValue }) => {
    try {
      return await groupService.joinGroup(groupId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tham gia nhóm')
    }
  }
)

export const leaveGroup = createAsyncThunk(
  'group/leave',
  async (groupId, { rejectWithValue }) => {
    try {
      return await groupService.leaveGroup(groupId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi rời nhóm')
    }
  }
)

export const fetchGroupMembers = createAsyncThunk(
  'group/fetchMembers',
  async ({ groupId, params }, { rejectWithValue }) => {
    try {
      return await groupService.getMembers(groupId, params)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tải thành viên nhóm')
    }
  }
)

export const fetchPendingMembers = createAsyncThunk(
  'group/fetchPending',
  async (groupId, { rejectWithValue }) => {
    try {
      return await groupService.getPendingMembers(groupId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tải danh sách chờ duyệt')
    }
  }
)

export const approveMember = createAsyncThunk(
  'group/approveMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const data = await groupService.approveMember(groupId, userId)
      return { userId, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi duyệt thành viên')
    }
  }
)

export const rejectMember = createAsyncThunk(
  'group/rejectMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const data = await groupService.rejectMember(groupId, userId)
      return { userId, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi từ chối thành viên')
    }
  }
)

export const banMember = createAsyncThunk(
  'group/banMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const data = await groupService.banMember(groupId, userId)
      return { userId, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi chặn thành viên')
    }
  }
)

export const promoteMember = createAsyncThunk(
  'group/promoteMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const data = await groupService.promoteMember(groupId, userId)
      return { userId, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi thăng chức thành viên')
    }
  }
)

export const demoteMember = createAsyncThunk(
  'group/demoteMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const data = await groupService.demoteMember(groupId, userId)
      return { userId, data }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi giáng chức thành viên')
    }
  }
)

export const fetchGroupPosts = createAsyncThunk(
  'group/fetchPosts',
  async ({ groupId, params }, { rejectWithValue }) => {
    try {
      return await groupService.getGroupPosts(groupId, params)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tải bài viết nhóm')
    }
  }
)

export const createGroupPost = createAsyncThunk(
  'group/createPost',
  async ({ groupId, formData }, { rejectWithValue }) => {
    try {
      return await groupService.createGroupPost(groupId, formData)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi đăng bài viết vào nhóm')
    }
  }
)

export const deleteGroupPost = createAsyncThunk(
  'group/deletePost',
  async ({ groupId, postId }, { rejectWithValue }) => {
    try {
      await groupService.deleteGroupPost(groupId, postId)
      return postId
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi xóa bài viết')
    }
  }
)

export const togglePinGroupPost = createAsyncThunk(
  'group/pinPost',
  async ({ groupId, postId }, { rejectWithValue }) => {
    try {
      return await groupService.pinGroupPost(groupId, postId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi ghim bài viết')
    }
  }
)

export const toggleLikeGroupPost = createAsyncThunk(
  'group/toggleLikePost',
  async ({ groupId, postId, isLiked }, { rejectWithValue }) => {
    try {
      if (isLiked) {
        return await groupService.unlikeGroupPost(groupId, postId)
      } else {
        return await groupService.likeGroupPost(groupId, postId)
      }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi thích bài viết')
    }
  }
)

export const addGroupComment = createAsyncThunk(
  'group/addComment',
  async ({ groupId, postId, content }, { rejectWithValue }) => {
    try {
      return await groupService.addGroupComment(groupId, postId, content)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi thêm bình luận')
    }
  }
)

export const deleteGroupComment = createAsyncThunk(
  'group/deleteComment',
  async ({ groupId, postId, commentId }, { rejectWithValue }) => {
    try {
      await groupService.deleteGroupComment(groupId, postId, commentId)
      return { postId, commentId }
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi xóa bình luận')
    }
  }
)

export const fetchGroupMessages = createAsyncThunk(
  'group/fetchMessages',
  async ({ groupId, params }, { rejectWithValue }) => {
    try {
      return await groupService.getGroupMessages(groupId, params)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tải tin nhắn nhóm')
    }
  }
)

export const sendGroupMessage = createAsyncThunk(
  'group/sendMessage',
  async ({ groupId, body }, { rejectWithValue }) => {
    try {
      return await groupService.sendGroupMessage(groupId, body)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi gửi tin nhắn')
    }
  }
)

export const fetchGroupPolls = createAsyncThunk(
  'group/fetchPolls',
  async (groupId, { rejectWithValue }) => {
    try {
      return await groupService.getGroupPolls(groupId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tải danh sách khảo sát')
    }
  }
)

export const createPoll = createAsyncThunk(
  'group/createPoll',
  async ({ groupId, body }, { rejectWithValue }) => {
    try {
      return await groupService.createPoll(groupId, body)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tạo khảo sát')
    }
  }
)

export const votePoll = createAsyncThunk(
  'group/votePoll',
  async ({ groupId, pollId, optionIds }, { rejectWithValue }) => {
    try {
      return await groupService.votePoll(groupId, pollId, optionIds)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi bình chọn')
    }
  }
)

export const closePoll = createAsyncThunk(
  'group/closePoll',
  async ({ groupId, pollId }, { rejectWithValue }) => {
    try {
      return await groupService.closePoll(groupId, pollId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi đóng khảo sát')
    }
  }
)

export const fetchGroupEvents = createAsyncThunk(
  'group/fetchEvents',
  async (groupId, { rejectWithValue }) => {
    try {
      return await groupService.getGroupEvents(groupId)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tải danh sách sự kiện')
    }
  }
)

export const createEvent = createAsyncThunk(
  'group/createEvent',
  async ({ groupId, formData }, { rejectWithValue }) => {
    try {
      return await groupService.createEvent(groupId, formData)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi tạo sự kiện')
    }
  }
)

export const respondToEvent = createAsyncThunk(
  'group/respondEvent',
  async ({ groupId, eventId, status }, { rejectWithValue }) => {
    try {
      return await groupService.respondToEvent(groupId, eventId, status)
    } catch (err) {
      return rejectWithValue(err.message || 'Lỗi phản hồi sự kiện')
    }
  }
)

// ── Slice ──

const initialState = {
  groups: [],
  myGroups: [],
  currentGroup: null,
  memberStatus: null, // 'admin' | 'moderator' | 'member' | 'pending' | null
  posts: [],
  messages: [],
  polls: [],
  events: [],
  members: [],
  pendingMembers: [],
  isLoading: false,
  error: null,
}

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    clearCurrentGroup: (state) => {
      state.currentGroup = null
      state.memberStatus = null
      state.posts = []
      state.messages = []
      state.polls = []
      state.events = []
      state.members = []
      state.pendingMembers = []
    },
    // Realtime action handlers
    appendRealtimeMessage: (state, action) => {
      const message = action.payload
      if (!message || !state.currentGroup || String(message.group) !== String(state.currentGroup._id)) return
      // Check for duplicates
      const exists = state.messages.some((msg) => String(msg._id || msg.id) === String(message._id || message.id))
      if (!exists) {
        state.messages.push(message)
      }
    },
    upsertRealtimeGroupPost: (state, action) => {
      const post = normalizeGroupPost(action.payload)
      if (!post || !state.currentGroup || String(post.group) !== String(state.currentGroup._id)) return
      const idx = state.posts.findIndex((p) => String(p._id) === String(post._id))
      if (idx !== -1) {
        state.posts[idx] = { ...state.posts[idx], ...post }
      } else {
        state.posts.unshift(post)
      }
    },
    applyRealtimeGroupPostLike: (state, action) => {
      const { postId, likeCount, liked, userId } = action.payload
      const idx = state.posts.findIndex((p) => String(p._id) === String(postId))
      if (idx === -1) return
      
      state.posts[idx].likeCount = likeCount
      state.posts[idx].isLiked = liked
      
      let likes = state.posts[idx].likes || []
      if (liked) {
        if (!likes.includes(userId)) {
          state.posts[idx].likes = [...likes, userId]
        }
      } else {
        state.posts[idx].likes = likes.filter((id) => id !== userId)
      }
    },
    applyRealtimeGroupPostComment: (state, action) => {
      const { postId, comment, commentCount } = action.payload
      const idx = state.posts.findIndex((p) => String(p._id) === String(postId))
      if (idx === -1) return

      if (commentCount !== undefined) {
        state.posts[idx].comments_count = commentCount
      } else {
        state.posts[idx].comments_count += 1
      }
      
      if (comment) {
        state.posts[idx].comments = [...(state.posts[idx].comments || []), comment]
      }
    },
    applyRealtimeGroupPollVote: (state, action) => {
      const { pollId, options } = action.payload
      const idx = state.polls.findIndex((p) => String(p._id || p.id) === String(pollId))
      if (idx !== -1) {
        state.polls[idx].options = options
      }
    },
    applyRealtimeNewPoll: (state, action) => {
      const poll = action.payload
      if (!poll || !state.currentGroup || String(poll.group) !== String(state.currentGroup._id)) return
      const exists = state.polls.some((p) => String(p._id || p.id) === String(poll._id || poll.id))
      if (!exists) {
        state.polls.unshift(poll)
      }
    },
    applyRealtimeNewEvent: (state, action) => {
      const event = action.payload
      if (!event || !state.currentGroup || String(event.group) !== String(state.currentGroup._id)) return
      const exists = state.events.some((e) => String(e._id || e.id) === String(event._id || event.id))
      if (!exists) {
        state.events.unshift(event)
      }
    },
    applyRealtimeMemberChange: (state, action) => {
      const { userId, role, status } = action.payload
      if (state.members && state.members.length > 0) {
        const idx = state.members.findIndex((m) => String(m.user?._id || m.user?.id || m.user) === String(userId))
        if (idx !== -1) {
          if (status === 'banned' || status === 'rejected') {
            state.members.splice(idx, 1)
          } else {
            state.members[idx].role = role
            state.members[idx].status = status
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(searchGroups.pending, (state) => {
        state.isLoading = true
      })
      .addCase(searchGroups.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload || {}
        state.groups = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [])
      })
      .addCase(searchGroups.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Fetch My Groups
      .addCase(fetchMyGroups.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload || {}
        state.myGroups = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [])
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Fetch Detail
      .addCase(fetchGroupDetail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGroupDetail.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload || {}
        state.currentGroup = payload.group || payload
        state.memberStatus = payload.memberStatus || null
      })
      .addCase(fetchGroupDetail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Group
      .addCase(createGroup.fulfilled, (state, action) => {
        const newGroup = action.payload?.group || action.payload
        if (newGroup) {
          state.myGroups.unshift(newGroup)
        }
      })

      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const updated = action.payload?.group || action.payload
        if (updated) {
          if (state.currentGroup && String(state.currentGroup._id) === String(updated._id)) {
            state.currentGroup = { ...state.currentGroup, ...updated }
          }
          const myIdx = state.myGroups.findIndex((g) => String(g._id) === String(updated._id))
          if (myIdx !== -1) {
            state.myGroups[myIdx] = { ...state.myGroups[myIdx], ...updated }
          }
        }
      })

      // Join Group
      .addCase(joinGroup.fulfilled, (state, action) => {
        const res = action.payload || {}
        const membership = res.member || res.membership || {}
        state.memberStatus = membership.status || 'approved'
        if (state.currentGroup) {
          if (membership.status === 'approved') {
            state.currentGroup.memberCount = (state.currentGroup.memberCount || 0) + 1
          }
        }
      })

      // Leave Group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.memberStatus = null
        const groupId = action.meta.arg
        state.myGroups = state.myGroups.filter((g) => String(g._id) !== String(groupId))
        if (state.currentGroup) {
          state.currentGroup.memberCount = Math.max(0, (state.currentGroup.memberCount || 1) - 1)
        }
      })

      // Fetch Members
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.members = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [])
      })

      // Fetch Pending
      .addCase(fetchPendingMembers.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.pendingMembers = Array.isArray(payload.pending) ? payload.pending : (Array.isArray(payload) ? payload : [])
      })

      // Approve Member
      .addCase(approveMember.fulfilled, (state, action) => {
        const { userId } = action.payload
        state.pendingMembers = state.pendingMembers.filter((m) => String(m.user?._id || m.user?.id || m.user) !== String(userId))
        if (state.currentGroup) {
          state.currentGroup.memberCount = (state.currentGroup.memberCount || 0) + 1
        }
      })

      // Reject Member
      .addCase(rejectMember.fulfilled, (state, action) => {
        const { userId } = action.payload
        state.pendingMembers = state.pendingMembers.filter((m) => String(m.user?._id || m.user?.id || m.user) !== String(userId))
      })

      // Ban Member
      .addCase(banMember.fulfilled, (state, action) => {
        const { userId } = action.payload
        state.members = state.members.filter((m) => String(m.user?._id || m.user?.id || m.user) !== String(userId))
        if (state.currentGroup) {
          state.currentGroup.memberCount = Math.max(0, (state.currentGroup.memberCount || 1) - 1)
        }
      })

      // Promote / Demote Member
      .addCase(promoteMember.fulfilled, (state, action) => {
        const { userId } = action.payload
        const idx = state.members.findIndex((m) => String(m.user?._id || m.user?.id || m.user) === String(userId))
        if (idx !== -1) {
          state.members[idx].role = 'admin'
        }
      })
      .addCase(demoteMember.fulfilled, (state, action) => {
        const { userId } = action.payload
        const idx = state.members.findIndex((m) => String(m.user?._id || m.user?.id || m.user) === String(userId))
        if (idx !== -1) {
          state.members[idx].role = 'member'
        }
      })

      // Fetch Posts
      .addCase(fetchGroupPosts.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchGroupPosts.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload || {}
        const rawPosts = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [])
        state.posts = rawPosts.map(normalizeGroupPost)
      })
      .addCase(fetchGroupPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Post
      .addCase(createGroupPost.fulfilled, (state, action) => {
        const newPost = normalizeGroupPost(action.payload?.post || action.payload)
        if (newPost) {
          state.posts.unshift(newPost)
        }
      })

      // Delete Post
      .addCase(deleteGroupPost.fulfilled, (state, action) => {
        const postId = action.payload
        state.posts = state.posts.filter((p) => String(p._id) !== String(postId))
      })

      // Pin Post
      .addCase(togglePinGroupPost.fulfilled, (state, action) => {
        const updated = action.payload?.post || action.payload
        if (updated) {
          state.posts = state.posts.map((p) => {
            if (String(p._id) === String(updated._id)) {
              return { ...p, isPinned: updated.isPinned }
            }
            // Mongoose logic typically allows only one pinned post, or multiple. We handle updating current.
            if (updated.isPinned) {
              return { ...p, isPinned: false } // unpin others
            }
            return p
          })
        }
      })

      // Like Post
      .addCase(toggleLikeGroupPost.fulfilled, (state, action) => {
        const res = action.payload || {}
        const postId = action.meta.arg.postId
        const idx = state.posts.findIndex((p) => String(p._id) === String(postId))
        if (idx !== -1) {
          state.posts[idx].isLiked = res.liked ?? !action.meta.arg.isLiked
          state.posts[idx].likeCount = res.likeCount ?? (res.liked ? state.posts[idx].likeCount + 1 : Math.max(0, state.posts[idx].likeCount - 1))
        }
      })

      // Add Comment
      .addCase(addGroupComment.fulfilled, (state, action) => {
        const res = action.payload || {}
        const postId = action.meta.arg.postId
        const idx = state.posts.findIndex((p) => String(p._id) === String(postId))
        if (idx !== -1) {
          state.posts[idx].comments_count = res.commentCount ?? ((state.posts[idx].comments_count || 0) + 1)
          if (res.comment) {
            state.posts[idx].comments = [...(state.posts[idx].comments || []), res.comment]
          }
        }
      })

      // Delete Comment
      .addCase(deleteGroupComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload
        const idx = state.posts.findIndex((p) => String(p._id) === String(postId))
        if (idx !== -1) {
          state.posts[idx].comments_count = Math.max(0, (state.posts[idx].comments_count || 1) - 1)
          state.posts[idx].comments = (state.posts[idx].comments || []).filter((c) => String(c._id || c.id) !== String(commentId))
        }
      })

      // Chat Messages
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.messages = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [])
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        const msg = action.payload?.message || action.payload
        if (msg) {
          const exists = state.messages.some((m) => String(m._id || m.id) === String(msg._id || msg.id))
          if (!exists) {
            state.messages.push(msg)
          }
        }
      })

      // Polls
      .addCase(fetchGroupPolls.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.polls = Array.isArray(payload.polls) ? payload.polls : (Array.isArray(payload) ? payload : [])
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        const newPoll = action.payload?.poll || action.payload
        if (newPoll) {
          state.polls.unshift(newPoll)
        }
      })
      .addCase(votePoll.fulfilled, (state, action) => {
        const updated = action.payload?.poll || action.payload
        if (updated) {
          const idx = state.polls.findIndex((p) => String(p._id || p.id) === String(updated._id || updated.id))
          if (idx !== -1) {
            state.polls[idx] = updated
          }
        }
      })
      .addCase(closePoll.fulfilled, (state, action) => {
        const updated = action.payload?.poll || action.payload
        if (updated) {
          const idx = state.polls.findIndex((p) => String(p._id || p.id) === String(updated._id || updated.id))
          if (idx !== -1) {
            state.polls[idx] = updated
          }
        }
      })

      // Events
      .addCase(fetchGroupEvents.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.events = Array.isArray(payload.events) ? payload.events : (Array.isArray(payload) ? payload : [])
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        const newEvent = action.payload?.event || action.payload
        if (newEvent) {
          state.events.unshift(newEvent)
        }
      })
      .addCase(respondToEvent.fulfilled, (state, action) => {
        const updated = action.payload?.event || action.payload
        if (updated) {
          const idx = state.events.findIndex((e) => String(e._id || e.id) === String(updated._id || updated.id))
          if (idx !== -1) {
            state.events[idx] = updated
          }
        }
      })
  },
})

export const {
  clearCurrentGroup,
  appendRealtimeMessage,
  upsertRealtimeGroupPost,
  applyRealtimeGroupPostLike,
  applyRealtimeGroupPostComment,
  applyRealtimeGroupPollVote,
  applyRealtimeNewPoll,
  applyRealtimeNewEvent,
  applyRealtimeMemberChange,
} = groupSlice.actions

export default groupSlice.reducer
