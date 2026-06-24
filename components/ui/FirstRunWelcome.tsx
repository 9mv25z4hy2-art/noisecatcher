"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, HelpCircle, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

const STORAGE_KEY = "nc_onboarded";

export default function FirstRunWelcome() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setVisible(!localStorage.getItem(STORAGE_KEY)), []);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "nc-welcome-title";

  useEffect(() => {
    if (!visible) return;
    const el = dialogRef.current;
    if (!el) return;
    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
    );
    focusable[0]?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { dismiss(); return; }
      if (e.key !== "Tab") return;
      const els = Array.from(
        el!.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
      );
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault(); els[els.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
        e.preventDefault(); els[0].focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={dismiss}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "var(--nc-bg-raised)",
          border: "1px solid var(--nc-border-mid)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1 rounded-sm transition-colors"
          style={{ color: "var(--nc-text-3)" }}
          aria-label="Close welcome dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + headline */}
        <div className="flex flex-col gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--nc-text)" }}
          >
            <Mic className="w-5 h-5" style={{ color: "var(--nc-bg)" }} />
          </div>
          <div>
            <h2
              id={titleId}
              className="text-lg font-bold nc-text"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
            >
              {t.welcome_title}
            </h2>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              {t.welcome_subtitle}
            </p>
          </div>
        </div>

        {/* Quick steps */}
        <div className="flex flex-col gap-2.5">
          {[
            { n: "1", text: t.welcome_step1 },
            { n: "2", text: t.welcome_step2 },
            { n: "3", text: t.welcome_step3 },
            { n: "4", text: t.welcome_step4 },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-3 items-start text-sm">
              <span
                className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{
                  background: "var(--nc-hover)",
                  border: "1px solid var(--nc-border-mid)",
                  color: "var(--nc-text-2)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {n}
              </span>
              <span style={{ color: "var(--nc-text-2)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <Link
            href="/help"
            onClick={dismiss}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: "var(--nc-hover)",
              border: "1px solid var(--nc-border-mid)",
              color: "var(--nc-text-2)",
              fontFamily: "var(--font-display)",
            }}
          >
            <HelpCircle className="w-4 h-4" />
            {t.welcome_guide_btn}
          </Link>
          <button
            onClick={dismiss}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: "var(--nc-text)",
              color: "var(--nc-bg)",
              fontFamily: "var(--font-display)",
            }}
          >
            {t.welcome_start_btn}
          </button>
        </div>

        <p className="text-[10px] text-center" style={{ color: "var(--nc-text-3)" }}>
          {t.welcome_privacy}
        </p>
      </div>
    </div>
  );
}
