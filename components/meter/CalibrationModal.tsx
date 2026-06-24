"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mic } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  currentDb: number | null;
  onCalibrate: (offset: number) => void;
  onClose: () => void;
}

const QUIET_BASELINE = 30;

export default function CalibrationModal({ currentDb, onCalibrate, onClose }: Props) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const [appliedOffset, setAppliedOffset] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "cal-modal-title";

  // Focus trap + Escape key
  useEffect(() => {
    const el = dialogRef.current as HTMLDivElement | null;
    if (!el) return;
    const firstBtn = el.querySelector<HTMLElement>("button:not([disabled]), [tabindex]:not([tabindex='-1'])");
    firstBtn?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>("button:not([disabled]), input, a[href], [tabindex]:not([tabindex='-1'])")
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleCalibrate() {
    if (currentDb === null) return;
    const offset = Math.max(-35, Math.min(35, QUIET_BASELINE - currentDb));
    localStorage.setItem("noisecatcher_calibration_offset", String(offset));
    setAppliedOffset(offset);
    setDone(true);
    onCalibrate(offset);
  }

  function handleReset() {
    localStorage.removeItem("noisecatcher_calibration_offset");
    setAppliedOffset(0);
    setDone(true);
    onCalibrate(0);
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        role="dialog"
        className="rounded-2xl w-full max-w-sm flex flex-col gap-5 p-5 shadow-2xl"
        style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)" }}
      >

        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-semibold text-base nc-text">{t.cal_title}</h2>
          <button onClick={onClose} aria-label="Close calibration" className="transition-colors" style={{ color: "var(--nc-text-3)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-2 text-sm leading-relaxed"
          style={{
            background: "var(--nc-bg-raised)",
            border: "1px solid var(--nc-border)",
            color: "var(--nc-text-2)",
          }}
        >
          <p>{t.cal_intro}</p>
          <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{t.cal_instruction}</p>
        </div>

        {!done ? (
          <>
            <div className="flex flex-col items-center gap-2 py-2">
              {currentDb !== null ? (
                <>
                  <span className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                    {t.cal_current_reading}
                  </span>
                  <span className="text-4xl font-bold nc-text tabular-nums">{Math.round(currentDb)}</span>
                  <span className="text-sm" style={{ color: "var(--nc-text-3)" }}>dB(A)</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--nc-text-3)" }}>
                  <Mic className="w-4 h-4" />
                  <span>{t.cal_start_first}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCalibrate}
                disabled={currentDb === null}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
              >
                {t.cal_btn_calibrate}
              </button>
              <button
                onClick={handleReset}
                className="w-full py-2 rounded-xl text-sm transition-colors"
                style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
              >
                {t.cal_btn_reset}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-green-900 border border-green-700 flex items-center justify-center">
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <p className="font-medium text-sm nc-text">{t.cal_success_title}</p>
            {appliedOffset !== null && appliedOffset !== 0 && (
              <p className="text-xs text-center" style={{ color: "var(--nc-text-2)" }}>
                {appliedOffset > 0 ? "+" : ""}{appliedOffset} {t.cal_offset_suffix}
              </p>
            )}
            {appliedOffset === 0 && (
              <p className="text-xs text-center" style={{ color: "var(--nc-text-2)" }}>{t.cal_offset_reset}</p>
            )}
            <button
              onClick={onClose}
              className="mt-1 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors"
              style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
            >
              {t.cal_btn_done}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
