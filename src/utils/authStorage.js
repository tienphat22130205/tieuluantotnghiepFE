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
  const hasSessionToken = safeGet(window.sessionStorage, TOKEN_KEY)
  const hasSessionUser = safeGet(window.sessionStorage, USER_KEY)

  if (hasSessionToken || hasSessionUser) {
    return
  }

  const legacyToken = safeGet(window.localStorage, TOKEN_KEY)
  const legacyUser = safeGet(window.localStorage, USER_KEY)

  if (legacyToken) {
    safeSet(window.sessionStorage, TOKEN_KEY, legacyToken)
  }
  if (legacyUser) {
    safeSet(window.sessionStorage, USER_KEY, legacyUser)
  }

  // Clear old shared-tab auth values to avoid cross-tab account overwrite.
  safeRemove(window.localStorage, TOKEN_KEY)
  safeRemove(window.localStorage, USER_KEY)
}

export const getAuthToken = () => safeGet(window.sessionStorage, TOKEN_KEY)

export const setAuthToken = (token) => {
  if (!token) return
  safeSet(window.sessionStorage, TOKEN_KEY, token)
}

export const removeAuthToken = () => {
  safeRemove(window.sessionStorage, TOKEN_KEY)
  safeRemove(window.localStorage, TOKEN_KEY)
}

export const getStoredAuthUser = () => safeGet(window.sessionStorage, USER_KEY)

export const setStoredAuthUser = (user) => {
  if (!user) return
  safeSet(window.sessionStorage, USER_KEY, JSON.stringify(user))
}

export const removeStoredAuthUser = () => {
  safeRemove(window.sessionStorage, USER_KEY)
  safeRemove(window.localStorage, USER_KEY)
}
