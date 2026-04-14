import { extractItems, getUserId } from '@/utils/friendship'

export const initialRelationshipState = {
  currentUserId: null,
  targetUserId: null,
  areFriends: false,
  hasIncomingRequest: false,
  hasSentRequest: false,
  requestId: null,
}

export const appendUniqueUserById = (list = [], user) => {
  const userId = getUserId(user)
  if (!userId) return list

  const exists = list.some((item) => String(getUserId(item)) === String(userId))
  if (exists) return list

  return [...list, user]
}

export const removeUserById = (list = [], userId) => {
  if (!userId) return list
  return list.filter((item) => String(getUserId(item)) !== String(userId))
}

export const normalizeUserCollection = (payload) =>
  extractItems(payload)
    .map((item) => item?.user || item?.friend || item)
    .filter((item) => Boolean(getUserId(item)))
