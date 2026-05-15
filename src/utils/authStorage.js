const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const safeGet = (storage, key) => {
  try {
    return storage?.getItem(key) || null
  } catch {
    return null
  }
}

const safeSet = (storage, key, value) => {
  try {
    storage?.setItem(key, value)
  } catch {
    // Ignore storage quota/security errors.
  }
}

const safeRemove = (storage, key) => {
  try {
    storage?.removeItem(key)
  } catch {
    // Ignore storage quota/security errors.
  }
}

export const migrateLegacyAuthStorage = () => {
  // No migration needed - we use localStorage directly now for persistence
}

export const getAuthToken = () => safeGet(window.localStorage, TOKEN_KEY)

export const setAuthToken = (token) => {
  if (!token) return
  safeSet(window.localStorage, TOKEN_KEY, token)
}

export const removeAuthToken = () => {
  safeRemove(window.localStorage, TOKEN_KEY)
}

export const getStoredAuthUser = () => safeGet(window.localStorage, USER_KEY)

export const setStoredAuthUser = (user) => {
  if (!user) return
  safeSet(window.localStorage, USER_KEY, JSON.stringify(user))
}

export const removeStoredAuthUser = () => {
  safeRemove(window.localStorage, USER_KEY)
}
