"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/pins";
import type { NoiseCategory } from "@/lib/pins";
import { Layers, Radio, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  category: NoiseCategory | "all";
  minDb: number;
  pinCount: number;
  densityMode: boolean;
  showNoisePlanet: boolean;
  showCommunity: boolean;
  communityCount: number;
  communityCategory: NoiseCategory | "all";
  onCategory: (v: NoiseCategory | "all") => void;
  onMinDb: (v: number) => void;
  onDensityToggle: () => void;
  onNoisePlanetToggle: () => void;
  onCommunityToggle: () => void;
  onCommunityCategory: (v: NoiseCategory | "all") => void;
}

const pill = (active: boolean) =>
  `shrink-0 flex items-center gap-1 px-2.5 py-1 min-h-[36px] rounded-lg border transition-colors` +
  (active
    ? ` border-[var(--nc-text)] bg-[var(--nc-text)] text-[var(--nc-bg)]`
    : ` border-[var(--nc-border-mid)] bg-[var(--nc-map-overlay)] text-[var(--nc-text-2)] hover:text-[var(--nc-text)] hover:border-[var(--nc-text-2)]`);

export default function FilterBar({
  category, minDb, pinCount, densityMode, showNoisePlanet, showCommunity, communityCount,
  communityCategory, onCategory, onMinDb, onDensityToggle, onNoisePlanetToggle,
  onCommunityToggle, onCommunityCategory,
}: Props) {
  const { t } = useI18n();
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [minDb > 20, densityMode, showCommunity, showNoisePlanet].filter(Boolean).length;

  return (
    <div className="absolute top-2 left-0 right-0 z-[1000] flex flex-col gap-1.5 px-2 pointer-events-none">

      {/* ── Row 1: category chips (scrollable) + filter icon ── */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          <button
            onClick={() => onCategory("all")}
            className={pill(category === "all")}
            style={{ fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {t.filter_all}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategory(cat.value)}
              className={pill(category === cat.value)}
              style={{ fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              <span className="text-xs">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter icon — shows active badge when filters deviate from defaults */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle filters"
            aria-pressed={showFilters}
            className="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors"
            style={{
              background: showFilters ? "var(--nc-text)" : "var(--nc-map-overlay)",
              color: showFilters ? "var(--nc-bg)" : "var(--nc-text-2)",
              borderColor: showFilters ? "var(--nc-text)" : "var(--nc-border-mid)",
              backdropFilter: "blur(8px)",
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold pointer-events-none"
              style={{ background: "rgb(52,211,153)", color: "#000" }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      {/* ── Row 2: collapsible filters ── */}
      {showFilters && (
        <div className="flex items-center gap-2 pointer-events-auto overflow-x-auto scrollbar-hide">
          {/* dB slider */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0"
            style={{ background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)", minWidth: 180 }}
          >
            <span className="te-label shrink-0" style={{ color: "var(--nc-text-2)" }}>{t.filter_min_label}</span>
            <input
              type="range" min={20} max={120} value={minDb}
              onChange={(e) => onMinDb(Number(e.target.value))}
              className="w-full accent-white flex-1"
              style={{ height: "2px" }}
            />
            <span className="shrink-0 w-10 text-right" style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--nc-text)" }}>
              {minDb}+
            </span>
            <span className="te-label shrink-0" style={{ color: "var(--nc-text-3)" }}>{pinCount}p</span>
          </div>

          {/* Density toggle */}
          <button
            onClick={onDensityToggle}
            aria-label={densityMode ? "Switch to pin view" : "Switch to density view"}
            aria-pressed={densityMode}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg border transition-colors"
            style={{
              fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: densityMode ? "var(--nc-text)" : "var(--nc-map-overlay)",
              color: densityMode ? "var(--nc-bg)" : "var(--nc-text-2)",
              borderColor: densityMode ? "var(--nc-text)" : "var(--nc-border-mid)",
            }}
          >
            <Layers className="w-3 h-3" />
            {densityMode ? t.map_density : t.map_pins}
          </button>

          {/* P2P community pins toggle */}
          <button
            onClick={onCommunityToggle}
            aria-label={showCommunity ? "Hide community P2P pins" : "Show community P2P pins"}
            aria-pressed={showCommunity}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg border transition-colors"
            style={{
              fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: showCommunity ? "rgba(52,211,153,0.15)" : "var(--nc-map-overlay)",
              color: showCommunity ? "rgb(52,211,153)" : "var(--nc-text-2)",
              borderColor: showCommunity ? "rgba(52,211,153,0.4)" : "var(--nc-border-mid)",
            }}
          >
            <Radio className="w-3 h-3" />
            {t.community_layer_btn}{showCommunity && communityCount > 0 ? ` · ${communityCount}` : ""}
          </button>

          {/* Noise-Planet overlay toggle */}
          <button
            onClick={onNoisePlanetToggle}
            aria-label={showNoisePlanet ? "Hide Noise-Planet community data" : "Show Noise-Planet community noise heatmap"}
            aria-pressed={showNoisePlanet}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-lg border transition-colors"
            style={{
              fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: showNoisePlanet ? "rgba(52,211,153,0.15)" : "var(--nc-map-overlay)",
              color: showNoisePlanet ? "rgb(52,211,153)" : "var(--nc-text-2)",
              borderColor: showNoisePlanet ? "rgba(52,211,153,0.4)" : "var(--nc-border-mid)",
            }}
          >
            <Radio className="w-3 h-3" />
            NP
          </button>
        </div>
      )}

      {/* ── Community category chips — only when P2P active ── */}
      {showCommunity && (
        <div className="pointer-events-auto flex gap-1 overflow-x-auto scrollbar-hide pb-0.5 pr-2">
          {([["all", "All"] as const, ...CATEGORIES.map((c) => [c.value, c.emoji] as const)]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onCommunityCategory(val as NoiseCategory | "all")}
              className="shrink-0 px-2 py-0.5 min-h-[36px] rounded-lg border transition-colors text-[10px]"
              style={{
                fontFamily: "var(--font-display)",
                background: communityCategory === val ? "rgba(52,211,153,0.2)" : "var(--nc-map-overlay)",
                color: communityCategory === val ? "rgb(52,211,153)" : "var(--nc-text-3)",
                borderColor: communityCategory === val ? "rgba(52,211,153,0.5)" : "var(--nc-border-mid)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── NP legend — only when overlay active ── */}
      {showNoisePlanet && (
        <div
          className="pointer-events-auto rounded-lg px-2.5 py-2 flex flex-col gap-1 self-end"
          style={{ background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)", backdropFilter: "blur(6px)", minWidth: "108px" }}
          aria-label="Noise-Planet colour scale"
        >
          <span className="text-[9px] uppercase tracking-wider mb-0.5 whitespace-nowrap" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
            NP · community LAeq
          </span>
          {[
            { color: "#4ade80", label: "< 45 dB" },
            { color: "#a3e635", label: "45–55 dB" },
            { color: "#facc15", label: "55–65 dB" },
            { color: "#f97316", label: "65–75 dB" },
            { color: "#ef4444", label: "> 75 dB" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
              <span className="text-[9px] font-mono whitespace-nowrap" style={{ color: "var(--nc-text-2)" }}>{label}</span>
            </div>
          ))}
          <a href="https://noise-planet.org" target="_blank" rel="noopener noreferrer"
            className="text-[8px] mt-0.5 whitespace-nowrap" style={{ color: "var(--nc-text-3)" }}>
            noise-planet.org
          </a>
        </div>
      )}
    </div>
  );
}
