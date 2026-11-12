import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Remember less. Know more.",
      searchPlaceholder: "Search your memories...",
      mapTab: "Map",
      searchTab: "Search",
      inputTab: "Input",
      privacyTab: "Privacy"
    }
  },
  hr: {
    translation: {
      welcome: "Zapamtite manje. Znajte više.",
      searchPlaceholder: "Pretražite svoje memorije...",
      mapTab: "Karta",
      searchTab: "Pretraži",
      inputTab: "Unos",
      privacyTab: "Privatnost"
    }
  },
  de: {
    translation: {
      welcome: "Weniger merken. Mehr wissen.",
      searchPlaceholder: "Durchsuche deine Erinnerungen...",
      mapTab: "Karte",
      searchTab: "Suchen",
      inputTab: "Eingabe",
      privacyTab: "Datenschutz"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;