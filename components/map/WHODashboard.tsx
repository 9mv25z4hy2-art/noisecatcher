"use client";

import { useMemo, useState } from "react";
import type { NoisePin } from "@/lib/pins";
import type { NoiseReport } from "@/lib/db";
import { X } from "lucide-react";

interface Props {
  pins: NoisePin[];
  reports?: NoiseReport[];
  onClose: () => void;
}

function leq(values: number[]): number {
  if (!values.length) return 0;
  return 10 * Math.log10(values.reduce((acc, v) => acc + Math.pow(10, v / 10), 0) / values.length);
}

function localHour(iso: string): number {
  return new Date(iso).getHours();
}

// Lden = 10·log10((12/24)·10^(Ld/10) + (4/24)·10^((Le+5)/10) + (8/24)·10^((Ln+10)/10))
// Day 7–19h, Evening 19–23h (+5 dB), Night 23–7h (+10 dB) — WHO 2018 Environmental Noise Guidelines
type MeasuredEntry = { db: number; createdAt: string };

function computeLden(pins: MeasuredEntry[]): { lden: number | null; lday: number | null; levening: number | null; lnight: number | null } {
  const day     = pins.filter(p => { const h = localHour(p.createdAt); return h >= 7 && h < 19; });
  const evening = pins.filter(p => { const h = localHour(p.createdAt); return h >= 19 && h < 23; });
  const night   = pins.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; });

  const lday     = day.length     ? leq(day.map(p => p.db))     : null;
  const levening = evening.length ? leq(evening.map(p => p.db)) : null;
  const lnight   = night.length   ? leq(night.map(p => p.db))   : null;

  const parts: number[] = [];
  if (lday     !== null) parts.push((12 / 24) * Math.pow(10, lday / 10));
  if (levening !== null) parts.push((4  / 24) * Math.pow(10, (levening + 5) / 10));
  if (lnight   !== null) parts.push((8  / 24) * Math.pow(10, (lnight + 10) / 10));

  const lden = parts.length ? 10 * Math.log10(parts.reduce((a, b) => a + b, 0)) : null;
  return { lden, lday, levening, lnight };
}

function Gauge({ value, limit, label, sublabel }: { value: number | null; limit: number; label: string; sublabel: string }) {
  if (value === null) return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]" style={{ color: "var(--nc-text-3)" }}>
        <span>{label}</span><span>—</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--nc-border)" }} />
      <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>{sublabel}</span>
    </div>
  );

  const ratio = Math.min(value / (limit * 1.5), 1);
  const over = value > limit;
  const barColor = over ? "#f87171" : value > limit * 0.85 ? "#fb923c" : "#4ade80";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]" style={{ color: "var(--nc-text-3)" }}>
        <span>{label}</span>
        <span className="font-mono font-semibold" style={{ color: barColor }}>
          {Math.round(value)} dB(A) {over ? `(+${Math.round(value - limit)} over)` : "✓"}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--nc-border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${ratio * 100}%`, background: barColor }} />
      </div>
      <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>{sublabel}</span>
    </div>
  );
}

export default function WHODashboard({ pins, reports = [], onClose }: Props) {
  // Capture mount time once so Date.now() is not called on every render
  const [mountTime] = useState(() => Date.now());

  const measured = useMemo(() => {
    const pinEntries = pins.filter(p => p.pinType !== "earwitness").map(p => ({ db: p.db, createdAt: p.createdAt }));
    const reportEntries = reports.filter(r => r.lat != null && r.lng != null).map(r => ({ db: r.leq, createdAt: r.timestamp }));
    return [...pinEntries, ...reportEntries];
  }, [pins, reports]);

  const { lden, lday, levening, lnight } = useMemo(() => computeLden(measured), [measured]);

  const cutoff7  = useMemo(() => new Date(mountTime - 7  * 24 * 3600 * 1000).toISOString(), [mountTime]);
  const cutoff30 = useMemo(() => new Date(mountTime - 30 * 24 * 3600 * 1000).toISOString(), [mountTime]);

  const last7  = useMemo(() => measured.filter(p => p.createdAt >= cutoff7),  [measured, cutoff7]);
  const last30 = useMemo(() => measured.filter(p => p.createdAt >= cutoff30), [measured, cutoff30]);

  const night7 = useMemo(
    () => last7.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; }),
    [last7]
  );
  const night30 = useMemo(
    () => last30.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; }),
    [last30]
  );
  const lnight7  = useMemo(() => night7.length  ? leq(night7.map(p => p.db))  : null, [night7]);
  const lnight30 = useMemo(() => night30.length ? leq(night30.map(p => p.db)) : null, [night30]);

  return (
    <div
      className="absolute bottom-10 left-2 z-[1001] rounded-xl overflow-hidden w-72"
      style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>WHO Health Risk</span>
        <button onClick={onClose} aria-label="Close WHO dashboard" style={{ color: "var(--nc-text-3)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>All-time ({measured.length} measurements)</span>
          <Gauge value={lden}     limit={53} label="Lden"    sublabel="WHO road traffic guideline: 53 dB(A)" />
          <Gauge value={lnight}   limit={40} label="Lnight"  sublabel="WHO night noise guideline: 40 dB(A)" />
          <Gauge value={lday}     limit={60} label="Lday"    sublabel="Day 7–19h · no WHO absolute limit shown" />
          <Gauge value={levening} limit={55} label="Levening" sublabel="Evening 19–23h (+5 dB penalty in Lden)" />
        </div>

        <div style={{ borderTop: "1px solid var(--nc-border)" }} className="pt-2 flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Recent night noise</span>
          <Gauge value={lnight7}  limit={40} label="Lnight — last 7 days"  sublabel={`${night7.length} night measurements`} />
          <Gauge value={lnight30} limit={40} label="Lnight — last 30 days" sublabel={`${night30.length} night measurements`} />
        </div>

        <p className="text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          WHO Environmental Noise Guidelines for the European Region (2018). Leq energy averages — not calibrated SPL.
        </p>
      </div>
    </div>
  );
}
