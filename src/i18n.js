// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Welcome",
          // add more translations here
        },
      },
      hin: {
        translation: {
          welcome: "स्वागत है",
          // add more translations here
        },
      },
      kan: {
        translation: {
          welcome: "ಸ್ವಾಗತ",
          // add more translations here
        },
      },
    },
  });

export default i18n;
