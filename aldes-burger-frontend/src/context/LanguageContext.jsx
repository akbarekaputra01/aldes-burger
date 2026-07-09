import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../locales/translations'

const STORAGE_KEY = 'aldes_language'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'id' || saved === 'en' ? saved : 'en'
  })

  const changeLanguage = useCallback((lang) => {
    if (lang === 'en' || lang === 'id') {
      setLanguage(lang)
      localStorage.setItem(STORAGE_KEY, lang)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}

/**
 * useTranslation() — returns a `t` function that resolves translation keys.
 *
 * Usage:
 *   const { t } = useTranslation()
 *   t('navbar.menu')           → "Menu" / "Menu"
 *   t('cart.selectAll', 3)     → "SELECT ALL (3 ITEMS)" / "PILIH SEMUA (3 ITEM)"
 */
export function useTranslation() {
  const { language } = useLanguage()

  const t = useCallback(
    (key, ...args) => {
      const keys = key.split('.')
      let value = translations[language]

      for (const k of keys) {
        if (value == null) return key
        value = value[k]
      }

      if (typeof value === 'function') return value(...args)
      if (typeof value === 'string') return value
      return key
    },
    [language],
  )

  return { t, language }
}
