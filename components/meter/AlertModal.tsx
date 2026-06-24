"use client";

import { useEffect, useRef } from "react";
import { X, AlertTriangle, BookOpen, Zap } from "lucide-react";
import { Threshold } from "@/lib/thresholds";
import Link from "next/link";
import { Haptics } from "@/lib/haptics";

interface AlertModalProps {
  threshold: Threshold;
  db: number;
  onDismiss: () => void;
}

const THRESHOLD_ABECEDAIRE: Record<string, { id: string; label: string }> = {
  caution: { id: "cardiovascular-noise", label: "Cardiovascular effects" },
  dangerous: { id: "noise-induced-hearing-loss", label: "Noise-induced hearing loss" },
  critical: { id: "noise-induced-hearing-loss", label: "Noise-induced hearing loss" },
  extreme:  { id: "acoustic-trauma", label: "Acoustic trauma" },
};

export default function AlertModal({ threshold, db, onDismiss }: AlertModalProps) {
  const abecedaireLink = THRESHOLD_ABECEDAIRE[threshold.level];
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "alert-modal-title";

  // Focus trap + Escape key
  useEffect(() => {
    const el = dialogRef.current as HTMLDivElement | null;
    if (!el) return;

    // Move focus into the dialog on open
    const firstBtn = el.querySelector<HTMLElement>("button, a[href]");
    firstBtn?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onDismiss(); return; }
      if (e.key !== "Tab" || !el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")
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
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        role="dialog"
        className={`w-full max-w-md rounded-2xl border-2 bg-gray-950 p-6 flex flex-col gap-4 ${threshold.borderColor}`}
        style={{ boxShadow: `0 0 60px ${threshold.color}30` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${threshold.color}20`, border: `1px solid ${threshold.color}50` }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: threshold.color }} />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Noise Alert</p>
              <p id={titleId} className="font-bold text-white text-lg">
                {Math.round(db)} dB(A) —{" "}
                <span style={{ color: threshold.color }}>{threshold.label}</span>
              </p>
            </div>
          </div>
          <button onClick={onDismiss} aria-label="Dismiss alert" className="text-gray-600 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Text */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-200 text-sm leading-relaxed">{threshold.healthAlert}</p>
        </div>

        {/* Vulnerable populations */}
        <div className="flex items-start gap-2">
          <div className="w-1 rounded-full self-stretch shrink-0" style={{ backgroundColor: threshold.color }} />
          <p className="text-gray-400 text-xs leading-relaxed">{threshold.vulnerable}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 flex-wrap">
          {abecedaireLink && (
            <Link
              href={`/abecedaire#${abecedaireLink.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
              onClick={onDismiss}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {abecedaireLink.label}
            </Link>
          )}
          <Link
            href="/abecedaire#who-noise-guidelines"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
            onClick={onDismiss}
          >
            <BookOpen className="w-3.5 h-3.5" />
            WHO guidelines
          </Link>
          <Link
            href="/act"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
            onClick={onDismiss}
          >
            <Zap className="w-3.5 h-3.5" />
            What to do
          </Link>
          <button
            onClick={() => { Haptics.alertDismiss(); onDismiss(); }}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-gray-900 min-w-[100px]"
            style={{ backgroundColor: threshold.color }}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
