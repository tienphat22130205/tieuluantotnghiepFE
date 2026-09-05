import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const FORCED_LOGOUT_NOTICE_KEY = 'auth_forced_logout_notice'
const LOCKED_NOTICE_TOAST_ID = 'auth-locked-notice'

const normalizeForCompare = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const isLockedMessage = (value) => {
  const normalized = normalizeForCompare(value)
  return /(khoa|banned|disabled|ban|vo hieu hoa|account_banned|account_disabled)/i.test(normalized)
}

const readForcedLogoutNotice = () => {
  try {
    const raw = window.sessionStorage.getItem(FORCED_LOGOUT_NOTICE_KEY)
    if (!raw) return ''

    window.sessionStorage.removeItem(FORCED_LOGOUT_NOTICE_KEY)
    const parsed = JSON.parse(raw)
    const persistedMessage = String(parsed?.message || '').trim()
    return persistedMessage || ''
  } catch {
    return ''
  }
}

const useLockNotice = () => {
  const [notice, setNotice] = useState('')

  const isLockedNotice = useMemo(() => isLockedMessage(notice), [notice])

  const triggerToast = (msg) => {
    const text = String(msg || '').trim()
    if (!text) return

    if (isLockedMessage(text)) {
      toast.error(text, {
        toastId: LOCKED_NOTICE_TOAST_ID,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        pauseOnHover: true,
        pauseOnFocusLoss: true,
      })
    } else {
      toast.error(text, {
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      })
    }
  }

  // Check for forced logout / lock notice from previous session on mount
  useEffect(() => {
    const initialNotice = readForcedLogoutNotice()
    if (initialNotice) {
      setNotice(initialNotice)
      triggerToast(initialNotice)
    }
  }, [])

  const showNotice = (message) => {
    const normalized = String(message || '').trim()
    setNotice(normalized)
    triggerToast(normalized)
  }

  const clearNotice = () => {
    setNotice('')
    toast.dismiss(LOCKED_NOTICE_TOAST_ID)
  }

  return {
    notice,
    isLockedNotice,
    showNotice,
    clearNotice,
  }
}

export default useLockNotice
