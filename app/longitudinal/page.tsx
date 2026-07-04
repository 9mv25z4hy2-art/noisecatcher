"use client";

import { useEffect, useState, useMemo } from "react";
import { loadPins, type NoisePin, getCategoryMeta } from "@/lib/pins";
import { getThreshold } from "@/lib/thresholds";
import { TrendingUp, TrendingDown, Minus, MapPin, AlertTriangle } from "lucide-react";

const CLUSTER_RADIUS_KM = 0.1; // pins within 100 m are grouped as one location

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function energyAvg(levels: number[]): number {
  if (!levels.length) return 0;
  return 10 * Math.log10(levels.reduce((s, v) => s + Math.pow(10, v / 10), 0) / levels.length);
}

function fmt(n: number, d = 1) { return n.toFixed(d); }

interface Cluster {
  id: string;
  centroidLat: number;
  centroidLng: number;
  pins: NoisePin[];
  label: string;
}

function clusterPins(pins: NoisePin[]): Cluster[] {
  const clusters: Cluster[] = [];
  const assigned = new Set<string>();

  for (const pin of pins) {
    if (assigned.has(pin.id)) continue;
    const nearby = pins.filter(
      (p) => !assigned.has(p.id) && haversine(pin.lat, pin.lng, p.lat, p.lng) <= CLUSTER_RADIUS_KM
    );
    for (const p of nearby) assigned.add(p.id);
    const centroidLat = nearby.reduce((s, p) => s + p.lat, 0) / nearby.length;
    const centroidLng = nearby.reduce((s, p) => s + p.lng, 0) / nearby.length;
    clusters.push({
      id: pin.id,
      centroidLat,
      centroidLng,
      pins: nearby.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      label: nearby[0].description || `${centroidLat.toFixed(4)}, ${centroidLng.toFixed(4)}`,
    });
  }

  return clusters.filter((c) => c.pins.length >= 2).sort((a, b) => b.pins.length - a.pins.length);
}

function linearTrend(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// Sparkline SVG — 200×40 viewport
function Sparkline({ pins, width = 200, height = 40 }: { pins: NoisePin[]; width?: number; height?: number }) {
  if (pins.length < 2) return null;
  const t0 = new Date(pins[0].createdAt).getTime();
  const t1 = new Date(pins[pins.length - 1].createdAt).getTime();
  const tRange = t1 - t0 || 1;
  const dbMin = Math.min(...pins.map((p) => p.db)) - 2;
  const dbMax = Math.max(...pins.map((p) => p.db)) + 2;
  const dbRange = dbMax - dbMin || 1;

  function toX(iso: string) { return ((new Date(iso).getTime() - t0) / tRange) * (width - 8) + 4; }
  function toY(db: number) { return height - ((db - dbMin) / dbRange) * (height - 8) - 4; }

  const trend = linearTrend(pins.map((p) => ({ x: (new Date(p.createdAt).getTime() - t0) / tRange, y: p.db })));
  const trendY0 = trend.intercept;
  const trendY1 = trend.slope + trend.intercept;
  const trendColor = trend.slope > 1 ? "#ef4444" : trend.slope < -1 ? "#22c55e" : "#eab308";

  const points = pins.map((p) => `${toX(p.createdAt)},${toY(p.db)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 40, overflow: "visible" }}>
      {/* trend line */}
      <line
        x1={4} y1={toY(trendY0)}
        x2={width - 4} y2={toY(trendY1)}
        stroke={trendColor}
        strokeWidth={1}
        strokeDasharray="3 2"
        opacity={0.5}
      />
      {/* polyline */}
      <polyline points={points} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} strokeLinejoin="round" />
      {/* dots */}
      {pins.map((p) => (
        <circle
          key={p.id}
          cx={toX(p.createdAt)}
          cy={toY(p.db)}
          r={2}
          fill={getThreshold(p.db).color}
        />
      ))}
    </svg>
  );
}

interface ClusterCardProps {
  cluster: Cluster;
  expanded: boolean;
  onToggle: () => void;
}

function ClusterCard({ cluster, expanded, onToggle }: ClusterCardProps) {
  const { pins } = cluster;
  const first = pins[0];
  const last = pins[pins.length - 1];
  const firstLeq = energyAvg(pins.slice(0, Math.ceil(pins.length / 3)).map((p) => p.db));
  const lastLeq = energyAvg(pins.slice(-Math.ceil(pins.length / 3)).map((p) => p.db));
  const delta = lastLeq - firstLeq;
  const trend = linearTrend(pins.map((p, i) => ({ x: i, y: p.db })));

  const TrendIcon = trend.slope > 0.5 ? TrendingUp : trend.slope < -0.5 ? TrendingDown : Minus;
  const trendColor = trend.slope > 0.5 ? "#ef4444" : trend.slope < -0.5 ? "#22c55e" : "#eab308";
  const trendLabel = trend.slope > 0.5 ? "Getting louder" : trend.slope < -0.5 ? "Getting quieter" : "Stable";

  const spanDays = Math.round((new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime()) / 86_400_000);
  const categories = [...new Set(pins.map((p) => p.category))];

  return (
    <div className="te-panel rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: expanded ? "var(--nc-bg-raised)" : undefined }}
      >
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--nc-text-3)" }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="te-label text-xs font-semibold truncate" style={{ color: "var(--nc-text)" }}>{cluster.label}</span>
            <span className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>{pins.length} readings · {spanDays}d span</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[10px] tabular-nums" style={{ color: getThreshold(firstLeq).color }}>
              {fmt(firstLeq)} dB
            </span>
            <span className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>→</span>
            <span className="font-mono text-[10px] tabular-nums" style={{ color: getThreshold(lastLeq).color }}>
              {fmt(lastLeq)} dB
            </span>
            <span
              className="font-mono text-[10px] tabular-nums font-semibold"
              style={{ color: delta > 0 ? "#ef4444" : delta < 0 ? "#22c55e" : "#eab308" }}
            >
              {delta > 0 ? "+" : ""}{fmt(delta)} dB
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
          <span className="te-label text-[9px]" style={{ color: trendColor }}>{trendLabel}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t" style={{ borderColor: "var(--nc-border)" }}>
          {/* Sparkline */}
          <div className="pt-3">
            <Sparkline pins={pins} />
            <div className="flex justify-between te-label text-[9px] mt-1" style={{ color: "var(--nc-text-3)" }}>
              <span>{new Date(first.createdAt).toLocaleDateString()}</span>
              <span>— dashed line = linear trend —</span>
              <span>{new Date(last.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* WHO context */}
          <div className="rounded px-3 py-2 flex flex-col gap-1" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
            <span className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>WHO 2018 context</span>
            <div className="flex gap-4 flex-wrap">
              <span className="te-label text-[10px]" style={{ color: pins.filter((p) => p.db > 53).length > 0 ? "#ef4444" : "#22c55e" }}>
                {pins.filter((p) => p.db > 53).length} readings above Lden 53 dB
              </span>
              <span className="te-label text-[10px]" style={{ color: energyAvg(pins.map((p) => p.db)) > 53 ? "#ef4444" : "#22c55e" }}>
                Site Leq: {fmt(energyAvg(pins.map((p) => p.db)))} dB — {energyAvg(pins.map((p) => p.db)) > 53 ? "above" : "below"} WHO road traffic limit
              </span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const count = pins.filter((p) => p.category === cat).length;
              return (
                <span key={cat} className="te-label text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--nc-bg-raised)", color: "var(--nc-text-2)", border: "1px solid var(--nc-border)" }}>
                  {meta.emoji} {meta.label} ×{count}
                </span>
              );
            })}
          </div>

          {/* Pin timeline */}
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {pins.map((p, i) => {
              const thr = getThreshold(p.db);
              const meta = getCategoryMeta(p.category);
              return (
                <div key={p.id} className="flex items-center gap-2 py-1 border-b" style={{ borderColor: "var(--nc-border)" }}>
                  <span className="te-label text-[9px] tabular-nums w-5 shrink-0" style={{ color: "var(--nc-text-3)" }}>{i + 1}</span>
                  <span className="font-mono text-[10px] tabular-nums font-semibold shrink-0" style={{ color: thr.color }}>{fmt(p.db)}</span>
                  <span className="te-label text-[9px] shrink-0">{meta.emoji}</span>
                  <span className="te-label text-[9px] flex-1 min-w-0 truncate" style={{ color: "var(--nc-text-2)" }}>
                    {p.description || meta.label}
                  </span>
                  <span className="te-label text-[9px] shrink-0" style={{ color: "var(--nc-text-3)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* OSM link */}
          <a
            href={`https://www.openstreetmap.org/?mlat=${cluster.centroidLat}&mlon=${cluster.centroidLng}&zoom=17`}
            target="_blank"
            rel="noopener noreferrer"
            className="te-label text-[9px] self-start"
            style={{ color: "var(--nc-text-3)" }}
          >
            View on OpenStreetMap ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function LongitudinalPage() {
  const [allPins, setAllPins] = useState<NoisePin[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadPins().then(setAllPins);
  }, []);

  const clusters = useMemo(() => clusterPins(allPins), [allPins]);

  const totalDelta = clusters.reduce((s, c) => {
    const pins = c.pins;
    const first = energyAvg(pins.slice(0, Math.ceil(pins.length / 3)).map((p) => p.db));
    const last = energyAvg(pins.slice(-Math.ceil(pins.length / 3)).map((p) => p.db));
    return s + (last - first);
  }, 0);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <main id="nc-main" className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="w-5 h-5" style={{ color: "var(--nc-text-2)" }} />
          <h1 className="text-lg font-semibold" style={{ color: "var(--nc-text)" }}>Longitudinal noise change</h1>
        </div>
        <p className="te-label text-[11px]" style={{ color: "var(--nc-text-3)" }}>
          Track how sound levels at specific locations have changed over time. Locations are grouped by geographic proximity (100 m radius). Requires at least 2 pins per site.
        </p>
      </div>

      {allPins.length === 0 && (
        <div className="te-panel rounded-md px-4 py-6 flex flex-col items-center gap-3">
          <AlertTriangle className="w-6 h-6" style={{ color: "var(--nc-text-3)" }} />
          <p className="te-label text-center" style={{ color: "var(--nc-text-2)" }}>No pins found. Drop pins at the same location on different occasions to track acoustic change over time.</p>
        </div>
      )}

      {allPins.length > 0 && clusters.length === 0 && (
        <div className="te-panel rounded-md px-4 py-6 flex flex-col items-center gap-3">
          <AlertTriangle className="w-6 h-6" style={{ color: "var(--nc-text-3)" }} />
          <p className="te-label text-center" style={{ color: "var(--nc-text-2)" }}>
            No locations with multiple readings yet. Drop at least 2 pins within 100 m of each other on different occasions — the tracker will show how that corner has changed acoustically.
          </p>
        </div>
      )}

      {clusters.length > 0 && (
        <>
          {/* Summary banner */}
          <div className="te-panel rounded-md px-4 py-3 flex items-center gap-4 flex-wrap">
            <div className="flex flex-col">
              <span className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Tracked sites</span>
              <span className="font-mono text-sm font-semibold" style={{ color: "var(--nc-text)" }}>{clusters.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Total readings</span>
              <span className="font-mono text-sm font-semibold" style={{ color: "var(--nc-text)" }}>{clusters.reduce((s, c) => s + c.pins.length, 0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Net change (avg across sites)</span>
              <span className="font-mono text-sm font-semibold" style={{ color: totalDelta / clusters.length > 0 ? "#ef4444" : "#22c55e" }}>
                {totalDelta / clusters.length > 0 ? "+" : ""}{fmt(totalDelta / clusters.length)} dB
              </span>
            </div>
          </div>

          {/* Displacement warning */}
          {clusters.some((c) => {
            const first = energyAvg(c.pins.slice(0, Math.ceil(c.pins.length / 3)).map((p) => p.db));
            const last = energyAvg(c.pins.slice(-Math.ceil(c.pins.length / 3)).map((p) => p.db));
            return last - first > 10;
          }) && (
            <div className="rounded-md px-4 py-3 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
              <p className="te-label text-[10px] leading-relaxed" style={{ color: "rgba(239,68,68,0.9)" }}>
                One or more sites show a rise of 10 dB or more — a 10 dB increase corresponds to a perceived doubling of loudness and is consistent with the acoustic signature of sonic displacement (Canton 2023; de Monchaux 2022). This level of change may support a gentrification or environmental justice complaint.
              </p>
            </div>
          )}

          {/* Cluster list */}
          <div className="flex flex-col gap-2">
            {clusters.map((c) => (
              <ClusterCard
                key={c.id}
                cluster={c}
                expanded={expanded === c.id}
                onToggle={() => toggleExpand(c.id)}
              />
            ))}
          </div>
        </>
      )}

      <p className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>
        Clustering radius: 100 m · Linear trend uses ordinary least squares · First/last Leq computed from the earliest and latest third of readings at each site · Use the Evidence Dossier to convert this data into a filed complaint.
      </p>
    </main>
  );
}
