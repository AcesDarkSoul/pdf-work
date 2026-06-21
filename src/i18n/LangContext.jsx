import { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LangContext = createContext(null);

const applyTheme = (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(
    () => localStorage.getItem('sw_lang_code') || 'en'
  );
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('sw_dark') === 'true';
    applyTheme(saved);   // apply on first render
    return saved;
  });

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem('sw_lang_code', l);
  };

  const toggleDark = (val) => {
    const next = val !== undefined ? val : !isDark;
    setIsDark(next);
    localStorage.setItem('sw_dark', String(next));
    applyTheme(next);
  };

  const t = (key) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, switchLang, t, isDark, toggleDark }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) return { lang: 'en', switchLang: () => {}, t: (k) => k, isDark: false, toggleDark: () => {} };
  return ctx;
};
