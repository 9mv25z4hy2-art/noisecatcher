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

function leqCalc(values: number[]): number {
  if (!values.length) return 0;
  return 10 * Math.log10(values.reduce((acc, v) => acc + Math.pow(10, v / 10), 0) / values.length);
}

function localHour(iso: string): number {
  return new Date(iso).getHours();
}

type MeasuredEntry = { db: number; createdAt: string };

// EU / WHO: Lden — Day 7–19h, Evening 19–23h (+5 dB), Night 23–7h (+10 dB)
function computeLden(entries: MeasuredEntry[]) {
  const day     = entries.filter(p => { const h = localHour(p.createdAt); return h >= 7 && h < 19; });
  const evening = entries.filter(p => { const h = localHour(p.createdAt); return h >= 19 && h < 23; });
  const night   = entries.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; });
  const lday     = day.length     ? leqCalc(day.map(p => p.db))     : null;
  const levening = evening.length ? leqCalc(evening.map(p => p.db)) : null;
  const lnight   = night.length   ? leqCalc(night.map(p => p.db))   : null;
  const parts: number[] = [];
  if (lday     !== null) parts.push((12 / 24) * Math.pow(10, lday / 10));
  if (levening !== null) parts.push((4  / 24) * Math.pow(10, (levening + 5) / 10));
  if (lnight   !== null) parts.push((8  / 24) * Math.pow(10, (lnight + 10) / 10));
  const lden = parts.length ? 10 * Math.log10(parts.reduce((a, b) => a + b, 0)) : null;
  return { lden, lday, levening, lnight };
}

// USA / Canada: DNL (Ldn) — Day 7am–10pm (15h), Night 10pm–7am (+10 dB penalty)
function computeDNL(entries: MeasuredEntry[]) {
  const day   = entries.filter(p => { const h = localHour(p.createdAt); return h >= 7 && h < 22; });
  const night = entries.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 22; });
  const lday   = day.length   ? leqCalc(day.map(p => p.db))   : null;
  const lnight = night.length ? leqCalc(night.map(p => p.db)) : null;
  const parts: number[] = [];
  if (lday   !== null) parts.push((15 / 24) * Math.pow(10, lday / 10));
  if (lnight !== null) parts.push((9  / 24) * Math.pow(10, (lnight + 10) / 10));
  const ldn = parts.length ? 10 * Math.log10(parts.reduce((a, b) => a + b, 0)) : null;
  return { ldn, lday, lnight };
}

// Japan: LAeq day (6–22h) / LAeq night (22–6h) — no evening weighting
function computeJapan(entries: MeasuredEntry[]) {
  const day   = entries.filter(p => { const h = localHour(p.createdAt); return h >= 6 && h < 22; });
  const night = entries.filter(p => { const h = localHour(p.createdAt); return h < 6 || h >= 22; });
  return {
    lday:   day.length   ? leqCalc(day.map(p => p.db))   : null,
    lnight: night.length ? leqCalc(night.map(p => p.db)) : null,
  };
}

type Jurisdiction = "WHO" | "EU" | "USA" | "Canada" | "Australia" | "Japan";

const JURISDICTIONS: { key: Jurisdiction; label: string }[] = [
  { key: "WHO",       label: "WHO" },
  { key: "EU",        label: "EU" },
  { key: "USA",       label: "USA" },
  { key: "Canada",    label: "Canada" },
  { key: "Australia", label: "AUS" },
  { key: "Japan",     label: "Japan" },
];

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
  const [mountTime] = useState(() => Date.now());
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("WHO");

  const measured = useMemo(() => {
    const pinEntries = pins.filter(p => p.pinType !== "earwitness").map(p => ({ db: p.db, createdAt: p.createdAt }));
    const reportEntries = reports.filter(r => r.lat != null && r.lng != null).map(r => ({ db: r.leq, createdAt: r.timestamp }));
    return [...pinEntries, ...reportEntries];
  }, [pins, reports]);

  const lden_data   = useMemo(() => computeLden(measured), [measured]);
  const dnl_data    = useMemo(() => computeDNL(measured), [measured]);
  const japan_data  = useMemo(() => computeJapan(measured), [measured]);

  const cutoff7  = useMemo(() => new Date(mountTime - 7  * 24 * 3600 * 1000).toISOString(), [mountTime]);
  const cutoff30 = useMemo(() => new Date(mountTime - 30 * 24 * 3600 * 1000).toISOString(), [mountTime]);
  const last7    = useMemo(() => measured.filter(p => p.createdAt >= cutoff7),  [measured, cutoff7]);
  const last30   = useMemo(() => measured.filter(p => p.createdAt >= cutoff30), [measured, cutoff30]);
  const night7   = useMemo(() => last7.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; }), [last7]);
  const night30  = useMemo(() => last30.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; }), [last30]);
  const lnight7  = useMemo(() => night7.length  ? leqCalc(night7.map(p => p.db))  : null, [night7]);
  const lnight30 = useMemo(() => night30.length ? leqCalc(night30.map(p => p.db)) : null, [night30]);

  function renderMetrics() {
    switch (jurisdiction) {
      case "WHO":
        return (
          <>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>All-time · {measured.length} measurements</span>
            <Gauge value={lden_data.lden}     limit={53} label="Lden"     sublabel="WHO 2018 road traffic guideline: 53 dB(A)" />
            <Gauge value={lden_data.lnight}   limit={45} label="Lnight"   sublabel="WHO night noise guideline: 45 dB(A)" />
            <Gauge value={lden_data.lday}     limit={60} label="Lday"     sublabel="Day 7–19h (no WHO absolute limit)" />
            <Gauge value={lden_data.levening} limit={55} label="Levening" sublabel="Evening 19–23h (+5 dB penalty in Lden)" />
          </>
        );
      case "EU":
        return (
          <>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>EU END 2002/49/EC · {measured.length} measurements</span>
            <Gauge value={lden_data.lden}   limit={55} label="Lden"   sublabel="Action threshold road traffic: 55 dB(A)" />
            <Gauge value={lden_data.lnight} limit={50} label="Lnight" sublabel="Night action threshold: 50 dB(A)" />
            <Gauge value={lden_data.lday}   limit={60} label="Lday"   sublabel="Day 7–19h" />
          </>
        );
      case "USA":
        return (
          <>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>USA EPA DNL (Ldn) · {measured.length} measurements</span>
            <Gauge value={dnl_data.ldn}    limit={55} label="DNL (Ldn)"  sublabel="EPA residential target: 55 dB(A). HUD unacceptable: >65 dB(A)" />
            <Gauge value={dnl_data.lday}   limit={60} label="Lday"      sublabel="Day 7am–10pm (15h)" />
            <Gauge value={dnl_data.lnight} limit={45} label="Lnight"    sublabel="Night 10pm–7am (+10 dB penalty in DNL)" />
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
              OSHA occupational: TWA 90 dB(A) / 8h mandatory · 85 dB(A) recommended. FAA aviation: 65 dB(A) DNL for new housing.
            </p>
          </>
        );
      case "Canada":
        return (
          <>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Canada Health Canada / CMHC · {measured.length} measurements</span>
            <Gauge value={dnl_data.ldn}    limit={55}  label="DNL (Ldn)"  sublabel="CMHC residential guideline: 55 dB(A)" />
            <Gauge value={dnl_data.lnight} limit={40}  label="Lnight"     sublabel="Health Canada night recommendation: 40 dB(A)" />
            <Gauge value={lden_data.lday}  limit={55}  label="Lday"       sublabel="Ontario MOE: 55 dB(A) daytime (sensitive use)" />
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
              No single federal environmental noise standard. Quebec: Lnight &lt; 40 dB(A). Ontario: LAeq 24h &lt; 45 dB(A) for sensitive receptors.
            </p>
          </>
        );
      case "Australia":
        return (
          <>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Australia EPA / AS 1055 · {measured.length} measurements</span>
            <Gauge value={lden_data.lday}   limit={55} label="LAeq day"   sublabel="AS 1055 residential: 55 dB(A) day (6am–10pm)" />
            <Gauge value={lden_data.lnight} limit={45} label="LAeq night" sublabel="AS 1055 residential: 45 dB(A) night (10pm–6am)" />
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
              Standards vary by state. EPA Victoria: LAeq night &lt; 50 dB(A) residential. NSW: comply with DECCW guidelines.
            </p>
          </>
        );
      case "Japan":
        return (
          <>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Japan Environmental Quality Standards · {measured.length} measurements</span>
            <Gauge value={japan_data.lday}   limit={55} label="LAeq day"   sublabel="Residential zone (Class A): 55 dB(A) — 6am–10pm" />
            <Gauge value={japan_data.lnight} limit={45} label="LAeq night" sublabel="Residential zone (Class A): 45 dB(A) — 10pm–6am" />
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
              Class B (mixed residential/commercial): 60/50 dB(A). Commercial zones: 65/60 dB(A). Strict enforcement via prefecture Environment Bureaus.
            </p>
          </>
        );
    }
  }

  return (
    <div
      className="fixed left-2 z-[1001] rounded-xl overflow-hidden w-72"
      style={{ bottom: "calc(var(--nc-nav-bottom) + 8px)", background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>Noise Standards</span>
        <button onClick={onClose} aria-label="Close dashboard" style={{ color: "var(--nc-text-3)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Jurisdiction selector */}
      <div className="flex gap-1 px-3 pt-2 pb-1 flex-wrap">
        {JURISDICTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setJurisdiction(key)}
            className="px-2 py-0.5 rounded text-[9px] font-medium transition-colors"
            style={jurisdiction === key
              ? { background: "var(--nc-text)", color: "var(--nc-bg)" }
              : { background: "transparent", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-3">
        {renderMetrics()}

        <div style={{ borderTop: "1px solid var(--nc-border)" }} className="pt-2 flex flex-col gap-2">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Recent night noise (all jurisdictions)</span>
          <Gauge value={lnight7}  limit={45} label="Lnight — last 7 days"  sublabel={`${night7.length} night measurements`} />
          <Gauge value={lnight30} limit={45} label="Lnight — last 30 days" sublabel={`${night30.length} night measurements`} />
        </div>

        <p className="text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          Leq energy averages from your pins. Not calibrated SPL — measurements are relative ±3 dB without a calibration offset.
        </p>
      </div>
    </div>
  );
}
