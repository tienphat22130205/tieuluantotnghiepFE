export const COMMON_TEXT = {
  unknownUser: 'Người dùng',
}

export const FRIEND_MESSAGES = {
  requiredUserId: 'Vui lòng cung cấp ID người dùng',
  loadFriendsDataFailed: 'Không tải được dữ liệu bạn bè',
  acceptRequestSuccess: 'Đã chấp nhận lời mời kết bạn',
  declineRequestSuccess: 'Đã từ chối lời mời kết bạn',
  actionFailed: 'Thao tác thất bại',
  cancelSentRequestSuccess: 'Đã hủy lời mời đã gửi',
  cancelSentRequestFailed: 'Không hủy được lời mời',
  unfriendSuccess: 'Đã hủy kết bạn',
  unfriendFailed: 'Không hủy được kết bạn',
  cannotResolveTargetUserId: 'Không xác định được ID người dùng',
  cannotSendRequestToSelf: 'Không thể gửi lời mời kết bạn cho chính mình',
  acceptRequestOnProfileSuccess: 'Đã chấp nhận lời mời kết bạn',
  cancelRequestOnProfileSuccess: 'Đã hủy lời mời kết bạn',
  sendRequestSuccess: 'Đã gửi lời mời kết bạn',
  processFriendActionFailed: 'Không thể xử lý thao tác bạn bè',
}

export const PROFILE_MESSAGES = {
  invalidProfileRoute: 'Đường dẫn trang cá nhân không hợp lệ',
  invalidProfileData: 'Dữ liệu profile không hợp lệ',
  loadProfileFailed: 'Không tải được trang cá nhân',
  fallbackLoadUserProfileFailed: 'Không thể tải trang cá nhân người dùng',
  missingUserIdForProfile: 'Thiếu userId để tải profile',
}

export const PROFILE_ACTION_LABELS = {
  unfriend: 'Hủy kết bạn',
  acceptRequest: 'Chấp nhận lời mời',
  cancelRequest: 'Hủy lời mời',
  sendRequest: 'Kết bạn',
}

export const PROFILE_PAGE_TEXT = {
  loading: 'Đang tải trang cá nhân...',
  notFound: 'Không tìm thấy dữ liệu trang cá nhân.',
}

export const FRIENDS_PAGE_TEXT = {
  loading: 'Đang tải dữ liệu bạn bè...',
  incomingTitle: 'Lời mời kết bạn',
  incomingCount: (count) => `${count} lời mời đang chờ xử lý`,
  noIncoming: 'Bạn không có lời mời mới.',
  sentTitle: 'Lời mời đã gửi',
  sentCount: (count) => `${count} lời mời đang chờ chấp nhận`,
  noSent: 'Bạn chưa gửi lời mời nào.',
  friendsTitle: 'Bạn bè của tôi',
  friendsCount: (count) => `Tổng cộng ${count} bạn bè`,
  noFriends: 'Chưa có bạn bè nào.',
  accept: 'Chấp nhận',
  decline: 'Từ chối',
  cancelRequest: 'Hủy lời mời',
  unfriend: 'Hủy kết bạn',
}