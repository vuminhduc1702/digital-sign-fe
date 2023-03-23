import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enText from '~/assets/locales/en.json'
import viText from '~/assets/locales/vi.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'vi',
    resources: {
      vi: {
        translation: viText,
      },
      en: {
        translation: enText,
      },
    },
    fallbackLng: 'en',
  })

export default i18n
