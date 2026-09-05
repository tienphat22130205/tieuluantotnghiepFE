const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const REMEMBERED_EMAIL_KEY = 'remembered_login_email'
const REMEMBER_ME_FLAG_KEY = 'remember_me_flag'

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
  // No migration needed - we use localStorage and sessionStorage directly
}

export const getAuthToken = () =>
  safeGet(window.localStorage, TOKEN_KEY) || safeGet(window.sessionStorage, TOKEN_KEY)

export const setAuthToken = (token, rememberMe = true) => {
  if (!token) return
  if (rememberMe) {
    safeSet(window.localStorage, TOKEN_KEY, token)
    safeRemove(window.sessionStorage, TOKEN_KEY)
  } else {
    safeSet(window.sessionStorage, TOKEN_KEY, token)
    safeRemove(window.localStorage, TOKEN_KEY)
  }
}

export const removeAuthToken = () => {
  safeRemove(window.localStorage, TOKEN_KEY)
  safeRemove(window.sessionStorage, TOKEN_KEY)
}

export const getStoredAuthUser = () =>
  safeGet(window.localStorage, USER_KEY) || safeGet(window.sessionStorage, USER_KEY)

export const setStoredAuthUser = (user, rememberMe = true) => {
  if (!user) return
  const str = typeof user === 'string' ? user : JSON.stringify(user)
  if (rememberMe) {
    safeSet(window.localStorage, USER_KEY, str)
    safeRemove(window.sessionStorage, USER_KEY)
  } else {
    safeSet(window.sessionStorage, USER_KEY, str)
    safeRemove(window.localStorage, USER_KEY)
  }
}

export const removeStoredAuthUser = () => {
  safeRemove(window.localStorage, USER_KEY)
  safeRemove(window.sessionStorage, USER_KEY)
}

export const getRememberedEmail = () =>
  safeGet(window.localStorage, REMEMBERED_EMAIL_KEY) || ''

export const setRememberedEmail = (email) => {
  const trimmed = String(email || '').trim()
  if (trimmed) {
    safeSet(window.localStorage, REMEMBERED_EMAIL_KEY, trimmed)
  } else {
    safeRemove(window.localStorage, REMEMBERED_EMAIL_KEY)
  }
}

export const removeRememberedEmail = () => {
  safeRemove(window.localStorage, REMEMBERED_EMAIL_KEY)
}

export const getRememberMeFlag = () => {
  const val = safeGet(window.localStorage, REMEMBER_ME_FLAG_KEY)
  return val === null ? true : val === 'true'
}

export const setRememberMeFlag = (enabled) => {
  safeSet(window.localStorage, REMEMBER_ME_FLAG_KEY, String(Boolean(enabled)))
}
