// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 🚀 IMPORTAMOS LOS 5 "MINI CEREBRITOS" (Archivos JSON)
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import zhTranslation from './locales/zh.json';

// 🕵️‍♂️ EL DETECTIVE DE IDIOMAS (Zero Costo, 100% Nativo)
const detectBrowserLanguage = () => {
  // 1. Leemos la configuración del navegador (ej. 'es-VE', 'en-US', 'zh-CN')
  const browserLang = navigator.language || navigator.userLanguage;
  
  // 2. Extraemos solo las dos primeras letras (ej. 'es', 'en', 'zh')
  const baseLang = browserLang.split('-')[0];
  
  // 3. Verificamos si tenemos ese idioma en nuestra bóveda
  const supportedLangs = ['es', 'en', 'de', 'fr', 'zh'];
  
  // 4. Si lo tenemos, lo usamos. Si entra alguien de Rusia ('ru') y no lo tenemos, le mostramos Español por defecto
  return supportedLangs.includes(baseLang) ? baseLang : 'es';
};

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
    // 🚀 AQUÍ INYECTAMOS LA MAGIA (Llamamos al detective en vez de forzar "es")
    lng: detectBrowserLanguage(), 
    fallbackLng: "en", // Si falla algo, muestra Inglés
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;