import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import vi from '@/assets/locales/vi.json'
import en from '@/assets/locales/en.json'

const TRANSLATIONS = { vi, en }

const findKeyInTree = (obj, key) => {
  if (!obj || typeof obj !== 'object') return null
  if (key in obj && typeof obj[key] === 'string') return obj[key]
  
  for (const childKey of Object.keys(obj)) {
    const child = obj[childKey]
    if (child && typeof child === 'object') {
      const found = findKeyInTree(child, key)
      if (found !== null) return found
    }
  }
  return null
}

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return null
    }
  }
  return typeof current === 'string' ? current : null
}

const PreferencesContext = createContext({
  isDarkMode: false,
  language: 'vi',
  setIsDarkMode: () => {},
  setLanguage: () => {},
  toggleDarkMode: () => {},
  t: (key) => key,
  translations: vi,
})

const getInitialPreferences = () => {
  try {
    const raw = localStorage.getItem('ui-preferences')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        isDarkMode: Boolean(parsed.isDarkMode),
        language: parsed.language === 'en' ? 'en' : 'vi',
      }
    }
  } catch {}
  return { isDarkMode: false, language: 'vi' }
}

export const PreferencesProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(getInitialPreferences)

  const applyPreferences = useCallback((newPrefs) => {
    document.documentElement.lang = newPrefs.language
    if (newPrefs.isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    applyPreferences(prefs)
  }, [prefs, applyPreferences])

  const setDarkMode = useCallback((value) => {
    setPrefs((prev) => {
      const isDark = typeof value === 'function' ? value(prev.isDarkMode) : Boolean(value)
      const next = { ...prev, isDarkMode: isDark }
      localStorage.setItem('ui-preferences', JSON.stringify(next))
      return next
    })
  }, [])

  const setLanguage = useCallback((lang) => {
    const validLang = lang === 'en' ? 'en' : 'vi'
    setPrefs((prev) => {
      const next = { ...prev, language: validLang }
      localStorage.setItem('ui-preferences', JSON.stringify(next))
      return next
    })
  }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [setDarkMode])

  const t = useCallback(
    (key) => {
      if (!key) return ''
      const currentDict = TRANSLATIONS[prefs.language] || TRANSLATIONS.vi
      const fallbackDict = TRANSLATIONS.vi

      // 1. Direct path lookup (e.g. "groups.title")
      const val = getNestedValue(currentDict, key)
      if (val !== null) return val

      // 2. Fallback path lookup
      const fallbackVal = getNestedValue(fallbackDict, key)
      if (fallbackVal !== null) return fallbackVal

      // 3. Flat recursive search if key without dot (e.g. "searchPlaceholder")
      const treeVal = findKeyInTree(currentDict, key)
      if (treeVal !== null) return treeVal

      const fallbackTreeVal = findKeyInTree(fallbackDict, key)
      if (fallbackTreeVal !== null) return fallbackTreeVal

      return key
    },
    [prefs.language]
  )

  const value = {
    isDarkMode: prefs.isDarkMode,
    language: prefs.language,
    setIsDarkMode: setDarkMode,
    setLanguage,
    toggleDarkMode,
    t,
    translations: TRANSLATIONS[prefs.language] || TRANSLATIONS.vi,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => useContext(PreferencesContext)
export default PreferencesContext
