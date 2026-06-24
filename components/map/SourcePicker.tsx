"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { NOISE_SOURCE_CATEGORIES } from "@/lib/noiseSources";
import type { NoiseCategoryDef } from "@/lib/noiseSources";
import type { NoiseCategory } from "@/lib/pins";

interface Props {
  value: NoiseCategory;
  subValue: string;
  onChange: (category: NoiseCategory, sub: string) => void;
}

export default function SourcePicker({ value, subValue, onChange }: Props) {
  const [openCat, setOpenCat] = useState<string | null>(value !== "other" ? value : null);

  function selectCategory(cat: NoiseCategoryDef) {
    const same = openCat === cat.id;
    setOpenCat(same ? null : cat.id);
    if (!same) {
      onChange(cat.id as NoiseCategory, "");
    }
  }

  function selectSub(catId: string, subId: string) {
    onChange(catId as NoiseCategory, subId);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ── Category row ── */}
      <div className="flex flex-wrap gap-1.5">
        {NOISE_SOURCE_CATEGORIES.map((cat) => {
          const isOpen = openCat === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat)}
              aria-pressed={openCat === cat.id}
              aria-label={cat.label}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: isOpen ? cat.color + "28" : "transparent",
                border: `1px solid ${isOpen ? cat.color : "var(--nc-border-mid)"}`,
                color: isOpen ? cat.color : "var(--nc-text-2)",
                fontFamily: "var(--font-display)",
              }}
            >
              <span className="text-sm leading-none">{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          );
        })}
        {/* Any / skip */}
        <button
          type="button"
          onClick={() => { setOpenCat(null); onChange("other", ""); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: !openCat ? "var(--nc-hover)" : "transparent",
            border: `1px solid ${!openCat ? "var(--nc-border-mid)" : "var(--nc-border)"}`,
            color: !openCat ? "var(--nc-text-2)" : "var(--nc-text-3)",
            fontFamily: "var(--font-display)",
          }}
        >
          Any / skip
        </button>
      </div>

      {/* ── Subcategories (inline, slides open) ── */}
      {openCat && (() => {
        const cat = NOISE_SOURCE_CATEGORIES.find((c) => c.id === openCat)!;
        return (
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{
              background: cat.color + "10",
              border: `1px solid ${cat.color}33`,
            }}
          >
            {/* Conflict zone safety warning */}
            {cat.sensitive && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed"
                style={{ background: "#7f1d1d44", border: "1px solid #ef444466", color: "#fca5a5" }}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {cat.id === "harassment" ? (
                    <><strong>Safety note:</strong> Recordings and GPS data are valuable evidence.
                    If you are in immediate danger, prioritise your safety first.
                    Store recordings in a secure location or cloud backup as soon as possible.</>
                  ) : (
                    <><strong>Safety note:</strong> In a conflict zone, GPS data and recordings create
                    personal risk. Consider disabling location services or reducing GPS accuracy in
                    your phone settings before using this category.</>
                  )}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              {cat.subs.map((sub) => {
                const isSel = subValue === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => selectSub(cat.id, sub.id)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-all"
                    style={{
                      background: isSel ? cat.color + "30" : "var(--nc-bg-panel)",
                      border: `1px solid ${isSel ? cat.color : "var(--nc-border)"}`,
                      color: isSel ? cat.color : "var(--nc-text-2)",
                    }}
                  >
                    <span className="text-sm leading-none shrink-0">{sub.emoji}</span>
                    <span className="leading-tight">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Selection summary ── */}
      {value !== "other" && (
        <p className="text-[10px]" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
          {NOISE_SOURCE_CATEGORIES.find((c) => c.id === value)?.emoji}{" "}
          {NOISE_SOURCE_CATEGORIES.find((c) => c.id === value)?.label}
          {subValue && (() => {
            const sub = NOISE_SOURCE_CATEGORIES.find((c) => c.id === value)?.subs.find((s) => s.id === subValue);
            return sub ? ` › ${sub.emoji} ${sub.label}` : "";
          })()}
        </p>
      )}
    </div>
  );
}
