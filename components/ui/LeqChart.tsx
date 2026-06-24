"use client";

import type { NoiseReport } from "@/lib/db";

// WHO Environmental Noise Guidelines 2018 time periods (local clock hour)
// Lday: 07–19, Levening: 19–23, Lnight: 23–07
// Lden = 10·log10((12·10^(Ld/10) + 4·10^((Le+5)/10) + 8·10^((Ln+10)/10)) / 24)
function energyAvg(leqs: number[]): number | null {
  if (leqs.length === 0) return null;
  return 10 * Math.log10(leqs.reduce((s, v) => s + Math.pow(10, v / 10), 0) / leqs.length);
}

function lden(lday: number | null, levening: number | null, lnight: number | null): number | null {
  if (lday === null && levening === null && lnight === null) return null;
  const d = lday   ?? (levening ?? lnight)!;
  const e = levening ?? lday ?? lnight!;
  const n = lnight  ?? lday ?? levening!;
  return 10 * Math.log10((12 * Math.pow(10, d / 10) + 4 * Math.pow(10, (e + 5) / 10) + 8 * Math.pow(10, (n + 10) / 10)) / 24);
}

function hourOf(isoTimestamp: string): number {
  return new Date(isoTimestamp).getHours();
}

interface Props {
  reports: NoiseReport[];
  title: string;
}

const REFS = [
  { db: 85, color: "rgba(239,68,68,0.25)" },
  { db: 70, color: "rgba(249,115,22,0.20)" },
  { db: 55, color: "rgba(250,204,21,0.15)" },
];

function Sparkline({
  values,
  color,
  label,
  min,
  max,
  zeroLine,
}: {
  values: (number | null)[];
  color: string;
  label: string;
  min: number;
  max: number;
  zeroLine?: boolean;
}) {
  const W = 340; const H = 36;
  const PL = 28; const PR = 8; const PT = 4; const PB = 4;
  const iW = W - PL - PR; const iH = H - PT - PB;
  const range = max - min || 1;

  const valid = values.map((v, i) => ({ v, i })).filter((x) => x.v !== null);
  if (valid.length < 2) return null;

  const toX = (i: number) => PL + (i / (values.length - 1)) * iW;
  const toY = (v: number) => PT + (1 - (v - min) / range) * iH;

  const pts = valid.map(({ v, i }) => `${toX(i)},${toY(v!)}`).join(" ");
  const zeroY = zeroLine ? toY(0) : null;

  return (
    <div>
      <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
        {label}
      </span>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {zeroY !== null && (
          <line x1={PL} x2={W - PR} y1={zeroY} y2={zeroY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3 2" />
        )}
        <text x={2} y={PT + 5} fontSize={7} fill="rgba(255,255,255,0.3)" fontFamily="monospace">{max.toFixed(1)}</text>
        <text x={2} y={H - PB + 3} fontSize={7} fill="rgba(255,255,255,0.3)" fontFamily="monospace">{min.toFixed(1)}</text>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {valid.map(({ v, i }) => (
          <circle key={i} cx={toX(i)} cy={toY(v!)} r={2.5} fill={color} stroke="var(--nc-bg-raised)" strokeWidth={1} />
        ))}
      </svg>
    </div>
  );
}

export default function LeqChart({ reports, title }: Props) {
  if (reports.length < 2) return null;

  const sorted = [...reports].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const leqValues = sorted.map((r) => r.leq);

  // WHO time-of-day segmentation
  const dayLeqs     = sorted.filter((r) => { const h = hourOf(r.timestamp); return h >= 7 && h < 19; }).map((r) => r.leq);
  const eveningLeqs = sorted.filter((r) => { const h = hourOf(r.timestamp); return h >= 19 && h < 23; }).map((r) => r.leq);
  const nightLeqs   = sorted.filter((r) => { const h = hourOf(r.timestamp); return h >= 23 || h < 7; }).map((r) => r.leq);
  const lDay   = energyAvg(dayLeqs);
  const lEve   = energyAvg(eveningLeqs);
  const lNight = energyAvg(nightLeqs);
  const lDen   = lden(lDay, lEve, lNight);
  const hasTimeBreakdown = lDay !== null || lEve !== null || lNight !== null;
  const minLeq = Math.max(20, Math.min(...leqValues) - 8);
  const maxLeq = Math.min(140, Math.max(...leqValues) + 8);
  const range = maxLeq - minLeq || 1;

  const W = 340; const H = 90;
  const PL = 28; const PR = 8; const PT = 8; const PB = 16;
  const iW = W - PL - PR; const iH = H - PT - PB;

  const toX = (i: number) => PL + (i / (sorted.length - 1)) * iW;
  const toY = (leq: number) => PT + (1 - (leq - minLeq) / range) * iH;
  const pts = sorted.map((r, i) => `${toX(i)},${toY(r.leq)}`);

  const xLabels: { i: number; label: string }[] = [
    { i: 0, label: new Date(sorted[0].timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) },
  ];
  if (sorted.length >= 5) {
    const mid = Math.floor((sorted.length - 1) / 2);
    xLabels.push({ i: mid, label: new Date(sorted[mid].timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) });
  }
  xLabels.push({ i: sorted.length - 1, label: new Date(sorted[sorted.length - 1].timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) });

  // ACI/NDSI — only show if at least 2 sessions have values
  const aciValues = sorted.map((r) => r.aci ?? null);
  const ndsiValues = sorted.map((r) => r.ndsi ?? null);
  const hasAci = aciValues.filter((v) => v !== null).length >= 2;
  const hasNdsi = ndsiValues.filter((v) => v !== null).length >= 2;

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}
    >
      <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
        {title}
      </span>

      {/* Leq chart */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        {REFS.map(({ db, color }) => {
          const y = toY(db);
          if (y < PT || y > PT + iH) return null;
          return (
            <g key={db}>
              <line x1={PL} x2={W - PR} y1={y} y2={y} stroke={color} strokeWidth={1} strokeDasharray="3 2" />
              <text x={2} y={y + 3} fontSize={6} fill="rgba(255,255,255,0.2)" fontFamily="monospace">{db}</text>
            </g>
          );
        })}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PL} x2={W - PR} y1={PT + f * iH} y2={PT + f * iH} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        ))}
        <polygon points={[`${PL},${PT + iH}`, ...pts, `${W - PR},${PT + iH}`].join(" ")} fill="rgba(52,211,153,0.07)" />
        <polyline points={pts.join(" ")} fill="none" stroke="rgba(52,211,153,0.65)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {sorted.map((r, i) => (
          <circle key={r.id} cx={toX(i)} cy={toY(r.leq)} r={3} fill={r.thresholdColor || "rgb(52,211,153)"} stroke="var(--nc-bg-raised)" strokeWidth={1} />
        ))}
        <text x={2} y={PT + 5} fontSize={7} fill="rgba(255,255,255,0.3)" fontFamily="monospace">{maxLeq.toFixed(0)}</text>
        <text x={2} y={PT + iH + 3} fontSize={7} fill="rgba(255,255,255,0.3)" fontFamily="monospace">{minLeq.toFixed(0)}</text>
        <text x={PL + 2} y={PT + 5} fontSize={6} fill="rgba(255,255,255,0.15)" fontFamily="monospace">dB</text>
        {xLabels.map(({ i, label }) => (
          <text key={i} x={toX(i)} y={H - 1} fontSize={7} fill="rgba(255,255,255,0.25)" fontFamily="monospace"
            textAnchor={i === 0 ? "start" : i === sorted.length - 1 ? "end" : "middle"}>
            {label}
          </text>
        ))}
      </svg>

      {/* ACI sparkline */}
      {hasAci && (
        <Sparkline
          values={aciValues}
          color="rgba(167,139,250,0.8)"
          label="ACI · Acoustic Complexity Index"
          min={0}
          max={Math.max(0.5, ...aciValues.filter((v): v is number => v !== null)) + 0.05}
        />
      )}

      {/* NDSI sparkline */}
      {hasNdsi && (
        <Sparkline
          values={ndsiValues}
          color="rgba(52,211,153,0.6)"
          label="NDSI · biophony / anthrophony ratio"
          min={-1}
          max={1}
          zeroLine
        />
      )}

      {/* Summary row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[9px] tabular-nums" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
          {sorted.length} sessions
        </span>
        <span className="text-[9px] tabular-nums" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
          avg {(leqValues.reduce((s, v) => s + v, 0) / leqValues.length).toFixed(1)} dB
        </span>
        <span className="text-[9px] tabular-nums" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
          peak {Math.max(...leqValues).toFixed(1)} dB
        </span>
      </div>

      {/* WHO Lnight / Lday / Lden breakdown */}
      {hasTimeBreakdown && (
        <div
          className="rounded-lg px-3 py-2 flex flex-col gap-1.5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
            WHO time-of-day · energy average
          </span>
          <div className="flex gap-3 flex-wrap">
            {lDay !== null && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Lday 07–19</span>
                <span className="font-mono text-xs tabular-nums" style={{ color: lDay > 65 ? "#f87171" : lDay > 53 ? "#fb923c" : "#4ade80" }}>
                  {lDay.toFixed(1)} dB
                </span>
                <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.15)" }}>WHO &lt;53</span>
              </div>
            )}
            {lEve !== null && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Levening 19–23</span>
                <span className="font-mono text-xs tabular-nums" style={{ color: lEve > 60 ? "#f87171" : lEve > 53 ? "#fb923c" : "#4ade80" }}>
                  {lEve.toFixed(1)} dB
                </span>
                <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.15)" }}>+5 dB penalty in Lden</span>
              </div>
            )}
            {lNight !== null && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Lnight 23–07</span>
                <span className="font-mono text-xs tabular-nums" style={{ color: lNight > 45 ? "#f87171" : lNight > 40 ? "#fb923c" : "#4ade80" }}>
                  {lNight.toFixed(1)} dB
                </span>
                <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.15)" }}>WHO &lt;40</span>
              </div>
            )}
            {lDen !== null && (
              <div className="flex flex-col items-center gap-0.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 8 }}>
                <span className="text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Lden</span>
                <span className="font-mono text-xs tabular-nums font-semibold" style={{ color: lDen > 65 ? "#f87171" : lDen > 55 ? "#fb923c" : "#4ade80" }}>
                  {lDen.toFixed(1)} dB
                </span>
                <span className="text-[7px]" style={{ color: "rgba(255,255,255,0.15)" }}>WHO &lt;53</span>
              </div>
            )}
          </div>
          {sorted.length < 3 && (
            <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.15)" }}>
              Indicative — more sessions across different times of day improve accuracy.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
