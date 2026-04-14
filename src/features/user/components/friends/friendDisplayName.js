import { COMMON_TEXT } from '@/constants/messages'

export const getDisplayName = (user) =>
  user?.full_name || user?.fullName || user?.username || COMMON_TEXT.unknownUser
