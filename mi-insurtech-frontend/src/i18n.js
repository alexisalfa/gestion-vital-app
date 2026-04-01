// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 🚀 IMPORTAMOS LOS 5 "MINI CEREBRITOS" (Archivos JSON)
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import zhTranslation from './locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation },
      de: { translation: deTranslation },
      fr: { translation: frTranslation },
      zh: { translation: zhTranslation }
    },
    lng: "es", // Idioma por defecto
    fallbackLng: "en", // Si falla algo, muestra Inglés
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;