"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { lsGet, lsSet } from "../storage";
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

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  // Initialise from the server-provided locale (read from the cookie in the
  // root layout). SSR and the first client render therefore use the SAME locale,
  // which avoids the hydration mismatch that reading localStorage during render
  // caused for every non-English user.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Keep dir/lang attributes in sync with locale
  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  // Migrate a pre-cookie locale that only exists in localStorage: apply it once
  // and write the cookie so future SSR renders in the right language. Runs after
  // mount, so it does not affect hydration.
  useEffect(() => {
    const stored = lsGet(STORAGE_KEY) as Locale | null;
    if (stored && LOCALE_ORDER.includes(stored) && stored !== locale) {
      setLocale(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    lsSet(STORAGE_KEY, l);
    // The cookie is what the server reads to SSR the correct language (same
    // mechanism as nc-theme) — this is what keeps every section consistent.
    try {
      document.cookie = `${STORAGE_KEY}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    } catch { /* cookies blocked — in-session state still updates */ }
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
