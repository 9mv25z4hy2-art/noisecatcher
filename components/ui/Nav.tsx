"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Map, BookOpen, Info, Zap, Sun, Moon, Languages, HelpCircle, BookMarked, FlaskConical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALE_ORDER, LOCALES, LOCALE_FLAGS, NON_LATIN_LOCALES, type Locale } from "@/lib/i18n/locales";

function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? !document.documentElement.classList.contains("light")
      : true
  );

  function toggle() {
    const isLight = document.documentElement.classList.contains("light");
    const next = isLight ? "dark" : "light";
    if (isLight) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("nc-theme", next);
    document.cookie = `nc-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setDark(isLight);
  }

  return { dark, toggle };
}

function LangSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Change language"
        className="min-h-[44px] min-w-[44px] px-2 rounded-sm transition-colors flex items-center gap-1.5"
        style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}
        aria-label="Language selector"
      >
        <Languages className="w-3.5 h-3.5" />
        <span
          className="text-[10px] uppercase tracking-wider hidden sm:inline"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {locale}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[140px] rounded-md shadow-xl overflow-hidden overflow-y-auto"
          style={{
            background: "var(--nc-bg-raised)",
            border: "1px solid var(--nc-border-mid)",
            maxHeight: "min(420px, 80vh)",
          }}
        >
          {LOCALE_ORDER.map((l: Locale) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2"
              style={{
                background: locale === l ? "var(--nc-hover)" : "transparent",
                color: locale === l ? "var(--nc-text)" : "var(--nc-text-2)",
                fontFamily: NON_LATIN_LOCALES.has(l) ? "system-ui, sans-serif" : "var(--font-display)",
              }}
            >
              <span className="text-base leading-none shrink-0">{LOCALE_FLAGS[l]}</span>
              <span>{LOCALES[l].langName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const links = [
    { href: "/meter",      label: t.nav_meter,      icon: Mic,         mobileHide: false },
    { href: "/map",        label: t.nav_map,         icon: Map,         mobileHide: false },
    { href: "/abecedaire", label: t.nav_abecedaire,  icon: BookOpen,    mobileHide: false },
    { href: "/act",        label: t.nav_act,         icon: Zap,         mobileHide: false },
    { href: "/methodology",label: "Method",          icon: FlaskConical,mobileHide: true  },
    { href: "/carnets",    label: t.nav_carnets,     icon: BookMarked,  mobileHide: false },
    { href: "/help",       label: t.nav_help,        icon: HelpCircle,  mobileHide: true  },
    { href: "/about",      label: t.nav_about,       icon: Info,        mobileHide: false },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <header
        className="px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur border-b"
        style={{ background: "var(--nc-nav-bg)", borderColor: "var(--nc-border)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-5 h-5 rounded-sm flex items-center justify-center"
            style={{ background: "var(--nc-text)" }}
          >
            <Mic className="w-2.5 h-2.5" style={{ color: "var(--nc-bg)" }} />
          </div>
          <span
            className="font-bold tracking-[0.06em] text-sm uppercase"
            style={{ fontFamily: "var(--font-display)", color: "var(--nc-text)" }}
          >
            Noisecatcher
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5 mr-2" aria-label="Main navigation">
            {links.map(({ href, label }) => {
              const active = mounted && pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="px-3 py-1.5 min-h-[44px] flex items-center rounded-sm text-[11px] tracking-wider uppercase transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: active ? "var(--nc-text)" : "var(--nc-text-2)",
                    background: active ? "var(--nc-hover)" : "transparent",
                  }}
                >
                  {mounted ? label : ""}
                </Link>
              );
            })}
          </nav>

          {/* Language switcher */}
          <LangSwitcher />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm transition-colors"
            style={{ border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}
          >
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur border-t flex"
        style={{ background: "var(--nc-nav-bg)", borderColor: "var(--nc-border)" }}
        aria-label="Mobile navigation"
      >
        {links.filter((l) => !l.mobileHide).map(({ href, label, icon: Icon }) => {
          const active = mounted && pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              style={{ color: active ? "var(--nc-text)" : "var(--nc-text-3)" }}
            >
              <Icon className="w-4 h-4" />
              <span
                className="text-[8px] tracking-widest uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mounted ? label : ""}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="sm:hidden h-16" aria-hidden />
    </>
  );
}
