import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enText from '~/assets/locales/en.json'
import viText from '~/assets/locales/vi.json'

export const resources = {
  enText,
  viText,
} as const

i18n.use(initReactI18next).use(LanguageDetector).init({
  lng: 'viText',
  resources,
  fallbackLng: 'enText',
})

export default i18n
