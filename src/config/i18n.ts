import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { pt } from '../locales/pt'
import { en } from '../locales/en'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    debug: false,
    resources: {
      'pt-BR': { translation: pt },
      pt: { translation: pt },
      'en-US': { translation: en },
      en: { translation: en },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false, // React já protege contra XSS
    },
  })

export default i18n
