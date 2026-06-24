"use client";

import { useState } from "react";
import { Search, ExternalLink, ChevronRight } from "lucide-react";
import {
  ADVOCACY_DATA, searchAdvocacy, ALL_REGIONS, REGION_LABELS, REGION_EMOJIS,
  type AdvocacyRegion, type LinkType,
} from "@/lib/advocacy";
import { useI18n } from "@/lib/i18n/context";

const TYPE_LABELS: Record<LinkType, string> = {
  gov:       "GOV",
  ngo:       "NGO",
  legal:     "LAW",
  scientific:"SCI",
  map:       "MAP",
};
const TYPE_COLORS: Record<LinkType, string> = {
  gov:       "#60a5fa",
  ngo:       "#34d399",
  legal:     "#f59e0b",
  scientific:"#a78bfa",
  map:       "#22c55e",
};

export default function AdvocacySearch() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<AdvocacyRegion | "all">("all");

  const results = searchAdvocacy(query, region);
  const totalEntries = ADVOCACY_DATA.length;
  const totalLinks = ADVOCACY_DATA.reduce((n, e) => n + e.links.length, 0);

  return (
    <div className="flex flex-col gap-5">

      {/* Stats row */}
      <p className="te-label" style={{ color: "var(--nc-text-3)" }}>
        {totalEntries} countries & regions · {totalLinks} resources worldwide
      </p>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: "var(--nc-text-3)" }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.act_search_placeholder}
          aria-label={t.act_search_placeholder}
          className="nc-input w-full rounded-lg pl-9 pr-4 py-2.5 text-sm"
          style={{ fontFamily: "var(--font-display)" }}
        />
      </div>

      {/* Region filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            aria-pressed={region === r}
            className="text-[10px] px-2.5 py-1 rounded-full transition-colors uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-display)",
              background: region === r ? "var(--nc-text)" : "var(--nc-bg-panel)",
              color:      region === r ? "var(--nc-bg)"  : "var(--nc-text-2)",
              border:     `1px solid ${region === r ? "var(--nc-text)" : "var(--nc-border-mid)"}`,
            }}
          >
            {REGION_EMOJIS[r]} {r === "all" ? t.act_all_regions : REGION_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <p className="te-label text-center py-8" style={{ color: "var(--nc-text-3)" }}>
          {t.act_no_results}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((entry) => (
            <div key={entry.slug} className="flex flex-col gap-2">
              {/* Country header */}
              <p className="text-sm font-semibold" style={{ color: "var(--nc-text)" }}>
                {entry.country}
                <span
                  className="ms-2 text-[9px] uppercase tracking-wider align-middle px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--nc-bg-panel)",
                    border: "1px solid var(--nc-border)",
                    color: "var(--nc-text-3)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {REGION_LABELS[entry.region]}
                </span>
              </p>

              {/* Links — key uses slug+index to avoid duplicate-key errors when
                  the same URL appears more than once in an entry's link list */}
              {entry.links.map(({ label, href, type }, li) => (
                <a
                  key={`${entry.slug}-${li}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors group pl-2"
                  style={{ color: "var(--nc-text-2)" }}
                >
                  <ChevronRight
                    className="w-3 h-3 shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--nc-text-3)" }}
                  />
                  <span className="flex-1 leading-snug group-hover:underline underline-offset-2">
                    {label}
                  </span>
                  {type && (
                    <span
                      className="text-[9px] font-bold tracking-wider shrink-0"
                      style={{
                        color: TYPE_COLORS[type],
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {TYPE_LABELS[type]}
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-30 group-hover:opacity-70" />
                </a>
              ))}

              {/* Contextual note */}
              {entry.note && (
                <p
                  className="text-[11px] leading-relaxed pl-2 italic"
                  style={{ color: "var(--nc-text-3)" }}
                >
                  {entry.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
