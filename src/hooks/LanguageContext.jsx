// src/hooks/LanguageContext.js
import React, { createContext, useContext, useState } from "react";
import i18n from "../i18n";
import EnglishIcon from "/assets/icons/ic_flag_en.svg";
import HindiIcon from "/assets/icons/ic_flag_hin.svg";
import KannadaIcon from "/assets/icons/ic_flag_kan.svg";

export const LANGS = [
  {
    value: "en",
    label: "English",
    icon: EnglishIcon,
  },
  {
    value: "hin",
    label: "हिंदी",
    icon: HindiIcon,
  },
  {
    value: "kan",
    label: "ಕನ್ನಡ",
    icon: KannadaIcon,
  },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(LANGS[0]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang.value);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
