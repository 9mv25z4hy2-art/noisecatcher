"use client";

import { useMemo, useState } from "react";
import type { NoisePin } from "@/lib/pins";
import { pinColor } from "@/lib/pins";
import { leq } from "@/lib/audio/stats";
import { X } from "lucide-react";

interface Props {
  pins: NoisePin[];
  onClose: () => void;
}

type View = "scatter" | "daily" | "daynight" | "heatmap";

const W = 320;
const H = 140;
const PAD = { top: 8, right: 12, bottom: 28, left: 34 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const REFS = [
  { db: 55, label: "55 WHO day" },
  { db: 70, label: "70" },
  { db: 85, label: "85" },
];

// Calendar date string "YYYY-MM-DD" from ISO timestamp
function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

// Hour 0-23 from ISO timestamp using local time
function localHour(iso: string): number {
  return new Date(iso).getHours();
}

interface YAxisProps {
  yTicks: number[];
  ty: (db: number) => number;
  dbMin: number;
  dbMax: number;
}

function YAxis({ yTicks, ty, dbMin, dbMax }: YAxisProps) {
  return (
    <>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD.left - 3} y1={ty(v)} x2={PAD.left} y2={ty(v)} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <text x={PAD.left - 5} y={ty(v) + 3.5} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.25)">{v}</text>
        </g>
      ))}
      {REFS.filter((r) => r.db >= dbMin && r.db <= dbMax).map((r) => (
        <line key={r.db} x1={PAD.left} y1={ty(r.db)} x2={W - PAD.right} y2={ty(r.db)}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3 3" />
      ))}
      <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={W - PAD.right} y2={PAD.top + PLOT_H}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
    </>
  );
}

interface DayXLabelsProps {
  days: { date: string; pins: NoisePin[] }[];
  nDays: number;
  barX: (i: number) => number;
  barW: number;
}

function DayXLabels({ days, nDays, barX, barW }: DayXLabelsProps) {
  const step = Math.max(1, Math.ceil(nDays / 4));
  return (
    <>
      {days.map((d, i) => {
        if (i % step !== 0 && i !== nDays - 1) return null;
        const parts = d.date.split("-");
        const label = `${parts[1]}/${parts[2]}`;
        return (
          <text key={d.date} x={barX(i) + barW / 2} y={H - 6}
            textAnchor="middle" fontSize={7.5} fill="rgba(255,255,255,0.25)">
            {label}
          </text>
        );
      })}
    </>
  );
}

// Group pins by calendar day, return sorted array of { date, pins }
function groupByDay(pins: NoisePin[]): { date: string; pins: NoisePin[] }[] {
  const map = new Map<string, NoisePin[]>();
  for (const p of pins) {
    const k = dateKey(p.createdAt);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(p);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pins]) => ({ date, pins }));
}

export default function TimelinePanel({ pins, onClose }: Props) {
  const [view, setView] = useState<View>("scatter");

  const sorted = useMemo(
    () => [...pins].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [pins],
  );

  // ── All useMemo hooks must run unconditionally (Rules of Hooks) ──────
  const days = useMemo(() => groupByDay(sorted), [sorted]);
  const dayLeqs = useMemo(() => days.map((d) => leq(d.pins.map((p) => p.db))), [days]);
  const dayPins = useMemo(() => days.map((d) => d.pins.filter((p) => {
    const h = localHour(p.createdAt); return h >= 7 && h < 23;
  })), [days]);
  const nightPins = useMemo(() => days.map((d) => d.pins.filter((p) => {
    const h = localHour(p.createdAt); return h < 7 || h >= 23;
  })), [days]);
  const dayLeqPerDay  = useMemo(() => dayPins.map((ps)   => ps.length ? leq(ps.map((p) => p.db))   : null), [dayPins]);
  const nightLeqPerDay = useMemo(() => nightPins.map((ps) => ps.length ? leq(ps.map((p) => p.db)) : null), [nightPins]);
  const heatmapGrid = useMemo(() => {
    const buckets: number[][][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => []));
    for (const p of sorted) {
      const d = new Date(p.createdAt);
      const dow = (d.getDay() + 6) % 7;
      buckets[dow][d.getHours()].push(p.db);
    }
    return buckets.map((row) => row.map((cell) => (cell.length > 0 ? leq(cell) : null)));
  }, [sorted]);

  // ── Early return for empty state (after all hooks) ───────────────────
  if (sorted.length === 0) {
    return (
      <div
        className="absolute bottom-10 left-2 z-[1001] px-4 py-3 rounded-xl flex items-center gap-3 text-xs"
        style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", backdropFilter: "blur(8px)" }}
      >
        <span style={{ color: "var(--nc-text-3)" }}>No pins to display.</span>
        <button onClick={onClose} aria-label="Close timeline" style={{ color: "var(--nc-text-3)" }}><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  // ── Shared axis helpers ──────────────────────────────────────────────
  const dbMin = 30;
  const dbMax = Math.max(100, ...sorted.map((p) => p.db)) + 5;
  const dbRange = dbMax - dbMin;

  function ty(db: number) {
    return PAD.top + PLOT_H - ((db - dbMin) / dbRange) * PLOT_H;
  }

  const yTicks: number[] = [];
  for (let v = Math.ceil(dbMin / 20) * 20; v <= dbMax; v += 20) yTicks.push(v);

  // ── Scatter view helpers ──────────────────────────────────────────────
  const tMin = new Date(sorted[0].createdAt).getTime();
  const tMax = new Date(sorted[sorted.length - 1].createdAt).getTime();
  const tRange = tMax - tMin || 1;

  function tx(t: number) {
    return PAD.left + ((t - tMin) / tRange) * PLOT_W;
  }

  const xLabels: { t: number; label: string }[] = [
    { t: tMin, label: new Date(tMin).toLocaleDateString(undefined, { month: "short", day: "numeric" }) },
  ];
  if (tRange > 2 * 86400 * 1000) {
    xLabels.push({
      t: (tMin + tMax) / 2,
      label: new Date((tMin + tMax) / 2).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }
  if (tMax > tMin) {
    xLabels.push({
      t: tMax,
      label: new Date(tMax).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }

  // ── Daily / day-night helpers ────────────────────────────────────────
  const nDays = days.length;
  const barW = Math.max(4, Math.min(28, Math.floor((PLOT_W - (nDays - 1) * 2) / Math.max(nDays, 1))));
  const barGap = nDays > 1 ? (PLOT_W - nDays * barW) / (nDays - 1) : 0;

  function barX(i: number) {
    return PAD.left + i * (barW + barGap);
  }

  function barHeight(db: number): number {
    return Math.max(2, Math.min(PLOT_H, ((db - dbMin) / dbRange) * PLOT_H));
  }

  // ── Heatmap layout constants ─────────────────────────────────────────
  const HM_LEFT = 22; const HM_TOP = 14; const HM_CPAD = 1;
  const HM_CW = Math.floor((W - HM_LEFT - 4) / 24);
  const HM_CH = Math.floor((H - HM_TOP - 4) / 7);
  const DOW_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const scatterAriaLabel = `Scatter timeline of ${sorted.length} noise pin${sorted.length !== 1 ? "s" : ""}, ranging from ${Math.round(Math.min(...sorted.map(p => p.db)))} to ${Math.round(Math.max(...sorted.map(p => p.db)))} dB(A)`;
  const dailyAriaLabel   = `Daily Leq chart over ${nDays} day${nDays !== 1 ? "s" : ""}`;
  const dnAriaLabel      = `Day (7–23h) vs night (23–7h) Leq comparison over ${nDays} day${nDays !== 1 ? "s" : ""}`;
  const heatmapAriaLabel = `Hour-of-day vs day-of-week heatmap over ${sorted.length} pins`;

  return (
    <div
      className="absolute bottom-10 left-2 z-[1001] rounded-xl overflow-hidden"
      style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", backdropFilter: "blur(8px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest shrink-0" style={{ color: "var(--nc-text-3)" }}>
            {sorted.length}p
          </span>
          {/* View tabs */}
          {(["scatter", "daily", "daynight", "heatmap"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors"
              style={{
                background: view === v ? "var(--nc-text)" : "transparent",
                color: view === v ? "var(--nc-bg)" : "var(--nc-text-3)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.08em",
              }}
            >
              {v === "scatter" ? "All" : v === "daily" ? "Leq/day" : v === "daynight" ? "Day/Night" : "Heat"}
            </button>
          ))}
        </div>
        <button onClick={onClose} aria-label="Close timeline" className="ml-2 shrink-0" style={{ color: "var(--nc-text-3)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart */}
      <svg
        width={W}
        height={H}
        role="img"
        aria-label={view === "scatter" ? scatterAriaLabel : view === "daily" ? dailyAriaLabel : view === "daynight" ? dnAriaLabel : heatmapAriaLabel}
        style={{ display: "block" }}
      >
        <YAxis yTicks={yTicks} ty={ty} dbMin={dbMin} dbMax={dbMax} />

        {/* ── Scatter ── */}
        {view === "scatter" && (
          <>
            {xLabels.map(({ t, label }) => (
              <text key={t} x={tx(t)} y={H - 6} textAnchor="middle" fontSize={7.5} fill="rgba(255,255,255,0.25)">{label}</text>
            ))}
            {sorted.length > 1 && (
              <polyline
                points={sorted.map((p) => `${tx(new Date(p.createdAt).getTime())},${ty(p.db)}`).join(" ")}
                fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1}
              />
            )}
            {sorted.map((p) => {
              const cx = tx(new Date(p.createdAt).getTime());
              const cy = ty(p.db);
              return (
                <g key={p.id}>
                  <circle cx={cx} cy={cy} r={4} fill={pinColor(p.db)} opacity={0.85} />
                  <circle cx={cx} cy={cy} r={4} fill="none" stroke={pinColor(p.db)} strokeWidth={1} opacity={0.4} />
                </g>
              );
            })}
          </>
        )}

        {/* ── Daily Leq ── */}
        {view === "daily" && (
          <>
            <DayXLabels days={days} nDays={nDays} barX={barX} barW={barW} />
            {days.map((d, i) => {
              const db = dayLeqs[i];
              if (!db) return null;
              const bh = barHeight(db);
              const by = PAD.top + PLOT_H - bh;
              return (
                <g key={d.date}>
                  <rect x={barX(i)} y={by} width={barW} height={bh} fill={pinColor(db)} opacity={0.75} rx={1} />
                  {barW >= 14 && (
                    <text x={barX(i) + barW / 2} y={by - 2} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.45)">
                      {Math.round(db)}
                    </text>
                  )}
                </g>
              );
            })}
          </>
        )}

        {/* ── Day / Night ── */}
        {view === "daynight" && (
          <>
            <DayXLabels days={days} nDays={nDays} barX={barX} barW={barW} />
            {/* Legend */}
            <g>
              <rect x={PAD.left} y={PAD.top - 1} width={6} height={4} fill="#facc15" opacity={0.8} />
              <text x={PAD.left + 8} y={PAD.top + 3} fontSize={7} fill="rgba(255,255,255,0.4)">Day 7–23h</text>
              <rect x={PAD.left + 56} y={PAD.top - 1} width={6} height={4} fill="#818cf8" opacity={0.8} />
              <text x={PAD.left + 64} y={PAD.top + 3} fontSize={7} fill="rgba(255,255,255,0.4)">Night 23–7h</text>
            </g>
            {days.map((d, i) => {
              const halfW = Math.max(2, Math.floor(barW / 2) - 1);
              const ddb = dayLeqPerDay[i];
              const ndb = nightLeqPerDay[i];
              return (
                <g key={d.date}>
                  {ddb !== null && (() => {
                    const bh = barHeight(ddb);
                    return <rect x={barX(i)} y={PAD.top + PLOT_H - bh} width={halfW} height={bh} fill="#facc15" opacity={0.75} rx={1} />;
                  })()}
                  {ndb !== null && (() => {
                    const bh = barHeight(ndb);
                    return <rect x={barX(i) + halfW + 1} y={PAD.top + PLOT_H - bh} width={halfW} height={bh} fill="#818cf8" opacity={0.75} rx={1} />;
                  })()}
                </g>
              );
            })}
          </>
        )}
        {/* ── Heatmap ── */}
        {view === "heatmap" && (
          <>
            {/* Hour labels every 6 h */}
            {[0, 6, 12, 18, 23].map((h) => (
              <text key={h} x={HM_LEFT + h * HM_CW + HM_CW / 2} y={HM_TOP - 3}
                textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.25)">
                {h === 23 ? "24" : `${h}`}
              </text>
            ))}
            {/* Day-of-week labels */}
            {DOW_LABELS.map((lbl, di) => (
              <text key={lbl} x={HM_LEFT - 3} y={HM_TOP + di * HM_CH + HM_CH / 2 + 2.5}
                textAnchor="end" fontSize={7} fill="rgba(255,255,255,0.25)">
                {lbl}
              </text>
            ))}
            {/* Cells */}
            {heatmapGrid.map((row, di) =>
              row.map((avgDb, hi) => {
                const x = HM_LEFT + hi * HM_CW;
                const y = HM_TOP + di * HM_CH;
                if (avgDb === null) {
                  return (
                    <rect key={`${di}-${hi}`} x={x + HM_CPAD} y={y + HM_CPAD}
                      width={HM_CW - HM_CPAD * 2} height={HM_CH - HM_CPAD * 2}
                      fill="rgba(255,255,255,0.04)" rx={1} />
                  );
                }
                return (
                  <rect key={`${di}-${hi}`} x={x + HM_CPAD} y={y + HM_CPAD}
                    width={HM_CW - HM_CPAD * 2} height={HM_CH - HM_CPAD * 2}
                    fill={pinColor(avgDb)} opacity={0.8} rx={1}>
                    <title>{`${DOW_LABELS[di]} ${hi}:00 — ${Math.round(avgDb)} dB(A) Leq`}</title>
                  </rect>
                );
              })
            )}
          </>
        )}
      </svg>

      {/* Summary row */}
      {view !== "scatter" && view !== "heatmap" && (
        <div
          className="flex gap-4 px-3 py-1.5 text-[9px] uppercase tracking-wider"
          style={{ borderTop: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}
        >
          {view === "daily" && (
            <>
              <span>Leq overall: <strong style={{ color: "var(--nc-text-2)" }}>{Math.round(leq(sorted.map(p => p.db)))} dB(A)</strong></span>
              <span>Days: <strong style={{ color: "var(--nc-text-2)" }}>{nDays}</strong></span>
            </>
          )}
          {view === "daynight" && (
            <>
              {(() => {
                const allDay   = sorted.filter(p => { const h = localHour(p.createdAt); return h >= 7 && h < 23; });
                const allNight = sorted.filter(p => { const h = localHour(p.createdAt); return h < 7 || h >= 23; });
                return (
                  <>
                    {allDay.length   > 0 && <span>Lday: <strong style={{ color: "#facc15" }}>{Math.round(leq(allDay.map(p => p.db)))} dB(A)</strong></span>}
                    {allNight.length > 0 && <span>Lnight: <strong style={{ color: "#818cf8" }}>{Math.round(leq(allNight.map(p => p.db)))} dB(A)</strong></span>}
                    {allNight.length > 0 && <span style={{ color: allNight.length > 0 && leq(allNight.map(p=>p.db)) > 40 ? "#f87171" : "inherit" }}>
                      WHO Lnight: 40 dB(A)
                    </span>}
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
