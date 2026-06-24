"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  ABECEDAIRE,
  searchEntries,
  getEntriesByCategory,
  CATEGORY_LABELS,
} from "@/lib/abecedaire";
import TermCard from "@/components/abecedaire/TermCard";
import { useI18n } from "@/lib/i18n/context";

type Category = "all" | "acoustic" | "health" | "social" | "legal" | "environmental";

export default function AbecedairePage() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filtered = (() => {
    let entries = query.trim() ? searchEntries(query) : ABECEDAIRE;
    if (category !== "all") {
      entries = entries.filter((e) => e.category === category);
    }
    return entries.sort((a, b) => a.term.localeCompare(b.term));
  })();

  const categories: Category[] = ["all", "acoustic", "health", "social", "legal", "environmental"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold nc-text">{t.abec_title}</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          {t.abec_subtitle}
        </p>
      </div>

      {/* English-only notice */}
      {locale !== "en" && t.en_only_notice && (
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
          role="note"
        >
          🌐 {t.en_only_notice}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--nc-text-3)" }} />
        <input
          type="text"
          placeholder={t.abec_search_placeholder}
          aria-label={t.abec_search_placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full nc-input rounded-lg pl-9 pr-4 py-3 text-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className="text-xs px-3 py-1.5 rounded-full border transition-colors"
            style={
              category === cat
                ? { background: "var(--nc-text)", color: "var(--nc-bg)", borderColor: "var(--nc-text)" }
                : { background: "transparent", color: "var(--nc-text-2)", borderColor: "var(--nc-border-mid)" }
            }
          >
            {cat === "all" ? t.abec_filter_all : CATEGORY_LABELS[cat]}
            {cat !== "all" && (
              <span className="ml-1" style={{ color: "var(--nc-text-3)" }}>
                ({getEntriesByCategory(cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
        {filtered.length} {filtered.length === 1 ? t.abec_entry_singular : t.abec_entry_plural}
        {query && ` ${t.abec_matching} "${query}"`}
      </p>

      {/* Entries */}
      <div className="flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((entry) => <TermCard key={entry.id} entry={entry} />)
        ) : (
          <div className="text-center py-12" style={{ color: "var(--nc-text-3)" }}>
            <p className="text-sm">{t.abec_no_results} &ldquo;{query}&rdquo;</p>
            <button
              onClick={() => { setQuery(""); setCategory("all"); }}
              className="text-xs mt-2 underline"
              style={{ color: "var(--nc-text-3)" }}
            >
              {t.abec_clear_search}
            </button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="nc-surface rounded-xl p-4 text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
        {t.abec_footer}
      </div>
    </div>
  );
}
