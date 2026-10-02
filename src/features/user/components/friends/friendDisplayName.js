import { COMMON_TEXT } from '@/constants/messages'

export const getDisplayName = (user) =>
  user?.full_name ||
  user?.fullName ||
  `${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`.trim() ||
  user?.name ||
  user?.username ||
  COMMON_TEXT.unknownUser
