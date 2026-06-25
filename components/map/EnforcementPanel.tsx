"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import type { NoisePin, NoiseCategory } from "@/lib/pins";
import { pinColor } from "@/lib/pins";
import { leq } from "@/lib/audio/stats";

interface Props {
  pins: NoisePin[];
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  traffic: "Traffic", construction: "Construction", industrial: "Industrial",
  entertainment: "Entertainment", neighbourhood: "Neighbourhood", emergency: "Emergency",
  municipal: "Municipal", conflict: "Conflict", police_force: "Police/Force",
  fascism: "Fascist/Hate", recreational: "Recreational", natural: "Natural",
  harassment: "Harassment", phones: "Phones/Devices",
  other: "Other", nightlife: "Nightlife (legacy)", aviation: "Aviation (legacy)",
};

export default function EnforcementPanel({ pins, onClose }: Props) {
  const measured = useMemo(() => pins.filter(p => p.pinType !== "earwitness" && p.db > 0), [pins]);

  const byCategory = useMemo(() => {
    const map = new Map<NoiseCategory, NoisePin[]>();
    for (const p of measured) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return [...map.entries()]
      .map(([cat, catPins]) => ({ cat, pins: catPins, count: catPins.length, leqVal: leq(catPins.map(p => p.db)) }))
      .sort((a, b) => b.leqVal - a.leqVal);
  }, [measured]);

  const maxCount = Math.max(...byCategory.map(c => c.count), 1);

  // WHO exceedance: Lden > 53 or Lnight > 40 considered actionable
  const totalAbove55 = measured.filter(p => p.db > 55).length;
  const totalAbove70 = measured.filter(p => p.db > 70).length;
  const totalAbove85 = measured.filter(p => p.db > 85).length;

  return (
    <div
      className="absolute left-2 z-[1001] rounded-xl overflow-hidden w-72"
      style={{ bottom: "calc(var(--nav-safe, 60px) + 8px)", background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>
          Enforcement Patterns
        </span>
        <button onClick={onClose} aria-label="Close enforcement panel" style={{ color: "var(--nc-text-3)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {byCategory.length === 0 ? (
        <div className="p-3 text-xs" style={{ color: "var(--nc-text-3)" }}>No measured pins to analyze.</div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* Threshold summary */}
          <div className="px-3 py-2 flex gap-3" style={{ borderBottom: "1px solid var(--nc-border)" }}>
            {[
              { label: ">55 dB", count: totalAbove55, color: "#fb923c" },
              { label: ">70 dB", count: totalAbove70, color: "#f87171" },
              { label: ">85 dB", count: totalAbove85, color: "#ef4444" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>{label}</span>
                <span className="text-sm font-bold font-mono" style={{ color }}>{count}</span>
              </div>
            ))}
          </div>

          {/* Category bars */}
          <div className="flex flex-col gap-0 p-2">
            {byCategory.map(({ cat, count, leqVal }) => {
              const barPct = (count / maxCount) * 100;
              const color = pinColor(leqVal);
              return (
                <div key={cat} className="flex items-center gap-2 py-1">
                  <div className="w-16 shrink-0 text-right">
                    <span className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  </div>
                  <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: "var(--nc-border)" }}>
                    <div
                      className="h-full rounded-sm"
                      style={{ width: `${barPct}%`, background: color, opacity: 0.8 }}
                    />
                  </div>
                  <div className="w-20 shrink-0 flex gap-1.5 items-center">
                    <span className="text-[10px] font-mono" style={{ color }}>{Math.round(leqVal)}</span>
                    <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>dB · {count}p</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-1.5" style={{ borderTop: "1px solid var(--nc-border)" }}>
            <p className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>
              Leq energy average per category · {measured.length} measured pins
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
