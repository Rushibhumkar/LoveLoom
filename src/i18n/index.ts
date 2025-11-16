import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import { getData } from '../hooks/useAsyncStorage'; // import your util
import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

// default to device language until we check storage
const deviceLanguage = RNLocalize.getLocales()[0]?.languageCode || 'en';

// temporary init
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// 🔥 Load stored language asynchronously and apply globally
(async () => {
  try {
    const savedLang = await getData('appLanguage');
    if (savedLang && savedLang !== i18n.language) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (err) {
    console.log('Language load error', err);
  }
})();

export default i18n;
