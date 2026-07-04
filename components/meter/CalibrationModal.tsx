"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mic } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { getDeviceProfile } from "@/lib/deviceCalibration";

interface Props {
  currentDb: number | null;
  onCalibrate: (offset: number) => void;
  onClose: () => void;
}

const QUIET_BASELINE = 30;
type Mode = "quiet" | "reference";

export default function CalibrationModal({ currentDb, onCalibrate, onClose }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("quiet");
  const deviceProfile = getDeviceProfile();
  const [referenceDb, setReferenceDb] = useState<string>("");
  const [done, setDone] = useState(false);
  const [appliedOffset, setAppliedOffset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "cal-modal-title";

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

  function applyOffset(offset: number) {
    const clamped = Math.max(-35, Math.min(35, offset));
    localStorage.setItem("noisecatcher_calibration_offset", String(clamped));
    setAppliedOffset(clamped);
    setDone(true);
    onCalibrate(clamped);
  }

  function handleCalibrateQuiet() {
    if (currentDb === null) return;
    applyOffset(QUIET_BASELINE - currentDb);
  }

  function handleCalibrateReference() {
    const known = parseFloat(referenceDb);
    if (isNaN(known) || known < 20 || known > 140) {
      setError("Enter a value between 20 and 140 dB(A).");
      return;
    }
    if (currentDb === null) {
      setError("Start the meter first.");
      return;
    }
    setError(null);
    applyOffset(known - currentDb);
  }

  function handleReset() {
    localStorage.removeItem("noisecatcher_calibration_offset");
    setAppliedOffset(0);
    setDone(true);
    onCalibrate(0);
  }

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        role="dialog"
        className="rounded-2xl w-full max-w-sm flex flex-col shadow-2xl"
        style={{
          background: "var(--nc-bg-panel)",
          border: "1px solid var(--nc-border-mid)",
          maxHeight: "min(90dvh, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px))",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 id={titleId} className="font-semibold text-base nc-text">{t.cal_title}</h2>
          <button onClick={onClose} aria-label="Close calibration" className="transition-colors p-1 -mr-1" style={{ color: "var(--nc-text-3)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-4 px-5 pb-5 overflow-y-auto flex-1 min-h-0" style={{ overscrollBehavior: "contain" }}>

          {!done ? (
            <>
              {/* Device fingerprint */}
              <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Device</span>
                  <span className="text-[10px] font-mono" style={{ color: deviceProfile.canMeetClass2 ? "#4ade80" : "#fb923c" }}>
                    {deviceProfile.typicalUncertaintyDb} uncalibrated
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--nc-text)" }}>{deviceProfile.label}</span>
                <p className="text-[10px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{deviceProfile.note}</p>
                <p className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>Source: {deviceProfile.source}</p>
              </div>

              {/* Mode selector */}
              <div className="flex gap-1.5">
                {([["quiet", "Quiet environment"], ["reference", "Known reference"]] as [Mode, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null); }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={mode === m
                      ? { background: "var(--nc-text)", color: "var(--nc-bg)" }
                      : { background: "transparent", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "quiet" ? (
                <div className="rounded-xl p-4 flex flex-col gap-2 text-sm leading-relaxed" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}>
                  <p>{t.cal_intro}</p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{t.cal_instruction}</p>
                </div>
              ) : (
                <div className="rounded-xl p-4 flex flex-col gap-3 text-sm leading-relaxed" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}>
                  <p>Point the microphone at a known sound source — a calibrated SLM, a reference tone from a trusted device, or a spec-verified environment. Enter the actual SPL value below.</p>
                  <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
                    Example: stand next to a certified sound level meter. It reads 72 dB(A). Enter 72. Noisecatcher calculates the offset to match.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                      Known reference level dB(A)
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={140}
                      step={0.5}
                      value={referenceDb}
                      onChange={e => { setReferenceDb(e.target.value); setError(null); }}
                      placeholder="e.g. 72"
                      className="w-full rounded-lg px-3 py-2 text-sm font-mono"
                      style={{ background: "var(--nc-bg)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text)" }}
                    />
                    {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                    Modern flagship phones (iPhone 12+, Pixel 4+, Galaxy S20+) measure within ±2–3 dB of calibrated SLMs under controlled conditions (Kardous & Shaw, JASA 2014). After calibration, your export includes the applied offset and a measurement uncertainty note for legal documentation.
                  </p>
                </div>
              )}

              {/* Live reading */}
              <div className="flex flex-col items-center gap-2 py-1">
                {currentDb !== null ? (
                  <>
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                      {t.cal_current_reading}
                    </span>
                    <span className="text-4xl font-bold nc-text tabular-nums">{Math.round(currentDb)}</span>
                    <span className="text-sm" style={{ color: "var(--nc-text-3)" }}>dB(A) — uncalibrated</span>
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
                  onClick={mode === "quiet" ? handleCalibrateQuiet : handleCalibrateReference}
                  disabled={currentDb === null || (mode === "reference" && !referenceDb)}
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
                  {appliedOffset > 0 ? "+" : ""}{appliedOffset.toFixed(1)} {t.cal_offset_suffix}
                  {mode === "reference" && (
                    <span className="block mt-1" style={{ color: "var(--nc-text-3)" }}>
                      Referenced against known source. Offset is included in GeoJSON exports.
                    </span>
                  )}
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
    </div>
  );
}
