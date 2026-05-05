import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 匯入 JSON 語言檔案
import translationEN from './locales/en-US.json';
import translationZH_TW from './locales/zh-TW.json';
import translationZH_CN from './locales/zh-CN.json';
import translationDE from './locales/de-DE.json';
import translationAR from './locales/ar-SA.json';
import translationES from './locales/es-ES.json';
import translationFR from './locales/fr-FR.json';
import translationHI from './locales/hi-IN.json';
import translationID from './locales/id-ID.json';
import translationIT from './locales/it-IT.json';
import translationJA from './locales/ja-JP.json';
import translationKO from './locales/ko-KR.json';
import translationMY from './locales/my-MM.json';
import translationNL from './locales/nl-NL.json';
import translationPT from './locales/pt-PT.json';
import translationRU from './locales/ru-RU.json';
import translationTH from './locales/th-TH.json';
import translationTR from './locales/tr-TR.json';
import translationVI from './locales/vi-VN.json';

const resources = {
  'en-US': { translation: translationEN },
  'zh-TW': { translation: translationZH_TW },
  'zh-CN': { translation: translationZH_CN },
  'de-DE': { translation: translationDE },
  'ar-SA': { translation: translationAR },
  'es-ES': { translation: translationES },
  'fr-FR': { translation: translationFR },
  'hi-IN': { translation: translationHI },
  'id-ID': { translation: translationID },
  'it-IT': { translation: translationIT },
  'ja-JP': { translation: translationJA },
  'ko-KR': { translation: translationKO },
  'my-MM': { translation: translationMY },
  'nl-NL': { translation: translationNL },
  'pt-PT': { translation: translationPT },
  'ru-RU': { translation: translationRU },
  'th-TH': { translation: translationTH },
  'tr-TR': { translation: translationTR },
  'vi-VN': { translation: translationVI }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    interpolation: { escapeValue: false }
  });

export default i18n;