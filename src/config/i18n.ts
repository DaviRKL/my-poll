import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "pt-BR",
    resources: {
      "pt-BR": { translation: {/* Chaves em Português */} },
      "en-US": { translation: {/* Chaves em Inglês */} },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
