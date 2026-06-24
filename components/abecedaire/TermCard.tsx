"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { AbecedaireEntry, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/abecedaire";

interface TermCardProps {
  entry: AbecedaireEntry;
}

export default function TermCard({ entry }: TermCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={entry.id}
      className="rounded-xl overflow-hidden transition-colors nc-surface"
      style={{ border: "1px solid var(--nc-border)" }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-start justify-between p-5 text-left gap-4"
      >
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base nc-text">{entry.term}</h3>
            {entry.phonetic && (
              <span className="text-xs italic" style={{ color: "var(--nc-text-3)" }}>{entry.phonetic}</span>
            )}
          </div>
          <span
            className={`self-start text-xs px-2 py-0.5 rounded border font-medium ${CATEGORY_COLORS[entry.category]}`}
          >
            {CATEGORY_LABELS[entry.category]}
          </span>
          {!expanded && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              {entry.definition}
            </p>
          )}
        </div>
        <div className="mt-1 shrink-0" style={{ color: "var(--nc-text-3)" }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* Definition */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--nc-text-3)" }}>Definition</p>
            <p className="text-sm leading-relaxed nc-text">{entry.definition}</p>
          </div>

          {/* Context */}
          <div className="pl-4" style={{ borderLeft: "2px solid var(--nc-border-mid)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--nc-text-3)" }}>Context</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{entry.context}</p>
          </div>

          {/* Related dB threshold */}
          {entry.relatedDbThreshold !== undefined && (
            <div
              className="rounded-lg px-4 py-3 flex items-center gap-3"
              style={{ background: "var(--nc-bg-raised)" }}
            >
              <div className="w-1 h-6 rounded-full bg-orange-500" />
              <div>
                <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>Relevant from</p>
                <p className="text-sm font-mono font-semibold nc-text">
                  {entry.relatedDbThreshold} dB(A)
                </p>
              </div>
            </div>
          )}

          {/* Related Terms */}
          {entry.relatedTerms && entry.relatedTerms.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--nc-text-3)" }}>Related Terms</p>
              <div className="flex flex-wrap gap-2">
                {entry.relatedTerms.map((term) => (
                  <span
                    key={term}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: "var(--nc-bg-raised)",
                      color: "var(--nc-text-2)",
                      border: "1px solid var(--nc-border)",
                    }}
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--nc-text-3)" }}>Sources</p>
            <ul className="flex flex-col gap-1">
              {entry.sources.map((source, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--nc-text-3)" }}>
                  <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
