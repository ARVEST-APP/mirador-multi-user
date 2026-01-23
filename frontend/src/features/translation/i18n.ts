import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en/translation.json";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/es";

dayjs.extend(localizedFormat);

// 🟢 Initialize i18next
i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng:
    localStorage.getItem("i18nextLng") ||
    navigator.language.split("-")[0] ||
    "en",
  interpolation: { escapeValue: false },
  resources: {
    en: { translation: en },
  },
});

const loadLanguage = async (lng: string): Promise<void> => {
  if (!i18n.hasResourceBundle(lng, "translation")) {
    try {
      const translations = await import(`./${lng}/translation.json`);
      i18n.addResourceBundle(
        lng,
        "translation",
        translations.default || translations,
      );
    } catch (error) {
      console.error(`❌ Error loading translations for ${lng}:`, error);
    }
  }

  const localeToSet = getAvailableLanguage(lng);

  dayjs.locale(localeToSet);
  console.log(`✅ Day.js locale set to: ${dayjs.locale()}`);

  await i18n.changeLanguage(lng);
};

const detectedLng =
  localStorage.getItem("i18nextLng") ||
  navigator.language.split("-")[0] ||
  "en";

loadLanguage(detectedLng);

export function getAvailableLanguage(lng: string) {
  const availableLocales = ["en", "fr"];
  return availableLocales.includes(lng) ? lng : "en";
}

export function getPreferredLanguageFromBrowser() {
  return getAvailableLanguage(detectedLng);
}

export const availableLanguages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export { loadLanguage };
export default i18n;
