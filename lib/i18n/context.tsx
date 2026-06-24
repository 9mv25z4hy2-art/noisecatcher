"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LOCALES, LOCALE_ORDER, type Locale, type LocaleStrings } from "./locales";

const STORAGE_KEY = "noisecatcher_locale";

interface I18nContextValue {
  locale: Locale;
  t: LocaleStrings;
  setLocale: (l: Locale) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: LOCALES.en,
  setLocale: () => {},
  isRTL: false,
});

// IBM Plex Mono lacks Ɗ/Ṣ/Ọ — these locales need system-ui for .te-label
// to avoid mid-string glyph substitution causing size mismatches on uppercase
const DIACRITIC_LOCALES = new Set(["ha", "yo"]);
const DIACRITIC_STYLE_ID = "nc-diacritic-font";

function applyLocale(l: Locale) {
  const { dir } = LOCALES[l];
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", l);

  const existing = document.getElementById(DIACRITIC_STYLE_ID);
  if (DIACRITIC_LOCALES.has(l)) {
    if (!existing) {
      const s = document.createElement("style");
      s.id = DIACRITIC_STYLE_ID;
      s.textContent = ".te-label { font-family: system-ui, sans-serif !important; }";
      document.head.appendChild(s);
    }
  } else {
    existing?.remove();
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof localStorage === "undefined") return "en";
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    return stored && LOCALE_ORDER.includes(stored) ? stored : "en";
  });

  // Keep dir/lang attributes in sync with locale
  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    applyLocale(l);
  }

  const t = LOCALES[locale];
  const isRTL = t.dir === "rtl";

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
