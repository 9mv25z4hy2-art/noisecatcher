"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { loadPins, type NoisePin, getCategoryMeta } from "@/lib/pins";
import { getThreshold } from "@/lib/thresholds";
import { ABECEDAIRE } from "@/lib/abecedaire";
import { SITE_DOMAIN } from "@/lib/config";
import { FileText, Filter, BarChart2, Scale, Printer, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, Users, BookOpen } from "lucide-react";

// Abécédaire terms surfaced at each step
const STEP_TERMS: Record<number, string[]> = {
  0: ["ear-witnessing", "citizen-sonic-archive", "dba-weighting"],
  1: ["lden", "who-noise-guidelines", "unweighted-noise-measurement"],
  2: ["echr-hatton-noise-rights", "sonic-apartheid", "distributed-acoustic-witnessing", "us-noise-control-act"],
  3: ["acoustic-evidence-chain-of-custody"],
};

function StepAbecedaire({ step }: { step: number }) {
  const ids = STEP_TERMS[step] ?? [];
  const entries = ABECEDAIRE.filter(e => ids.includes(e.id));
  if (!entries.length) return null;
  return (
    <div className="rounded-md p-3 flex flex-col gap-2" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
      <div className="flex items-center gap-1.5">
        <BookOpen className="w-3 h-3 shrink-0" style={{ color: "var(--nc-text-3)" }} />
        <span className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Abécédaire — relevant terms</span>
      </div>
      {entries.map(e => (
        <Link key={e.id} href={`/abecedaire#${e.id}`} className="flex flex-col gap-0.5 group">
          <span className="te-label text-[10px] font-semibold group-hover:underline" style={{ color: "var(--nc-text)" }}>{e.term}</span>
          <span className="te-label text-[9px] leading-relaxed line-clamp-2" style={{ color: "var(--nc-text-3)" }}>{e.definition}</span>
        </Link>
      ))}
    </div>
  );
}

// ── Threshold references ────────────────────────────────────────────────────
const STANDARDS = [
  { id: "who_lden", label: "WHO Lden road traffic", limit: 53, unit: "dB(A)", description: "WHO 2018 Environmental Noise Guidelines — annual average Lden limit for road traffic noise. Lden applies +5 dB evening (19–23h) and +10 dB night (23–7h) weighting." },
  { id: "who_lnight", label: "WHO Lnight road traffic", limit: 45, unit: "dB(A)", description: "WHO 2018 — annual average Lnight limit. Exceedance is associated with sleep disturbance and cardiovascular risk." },
  { id: "osha_action", label: "OSHA Action Level", limit: 85, unit: "dB(A)", description: "US OSHA 29 CFR 1910.95 — 8-hour TWA Action Level at 85 dB(A) triggers a Hearing Conservation Programme." },
  { id: "osha_pel", label: "OSHA PEL", limit: 90, unit: "dB(A)", description: "US OSHA Permissible Exposure Limit — 8-hour TWA at 90 dB(A). Exchange rate: 5 dB doubling." },
  { id: "niosh_rel", label: "NIOSH REL", limit: 85, unit: "dB(A)", description: "US NIOSH Recommended Exposure Limit — 8-hour TWA at 85 dB(A) with a 3 dB exchange rate (halving time = 3 dB)." },
  { id: "eu_env", label: "EU Environmental Noise Directive", limit: 55, unit: "dB Lden", description: "EU END 2002/49/EC — member states must produce noise maps and action plans above 55 dB Lden (55 dB is the major annoyance trigger level used by the EEA)." },
  { id: "local", label: "Local noise ordinance", limit: null, unit: "dB", description: "Specify the local limit in force (municipal bylaw, tenancy agreement, planning condition, etc.)." },
];

const LEGAL_BASES = [
  { id: "echr_8", label: "ECHR Article 8 — Right to respect for private and family life", description: "Hatton v. United Kingdom (2003): the European Court of Human Rights held that severe noise affecting sleep can violate Art. 8." },
  { id: "un_env", label: "UN Human Rights & Environment (SR Report A/76/179)", description: "The UN Special Rapporteur on human rights and the environment has identified acoustic pollution as a threat to the right to a healthy environment." },
  { id: "eu_end", label: "EU Environmental Noise Directive 2002/49/EC", description: "Requires competent authorities to produce strategic noise maps and action plans; citizens can request access to these maps." },
  { id: "national_env", label: "National environmental protection legislation", description: "Environmental Protection Act (UK), Code de l'environnement (FR), BImSchG (DE), etc. — cite the relevant statute." },
  { id: "tenancy", label: "Tenancy / lease agreement (quiet enjoyment)", description: "Most jurisdictions imply a covenant of quiet enjoyment. Documented noise breaching that covenant supports a complaint to a housing tribunal." },
  { id: "planning", label: "Planning condition / development consent", description: "Construction or operational noise limits are often attached as conditions to planning permissions." },
  { id: "echr_3", label: "ECHR Article 3 — Prohibition of inhuman or degrading treatment", description: "Applicable in extreme cases: acoustic torture, use of LRAD/sonic weapons, or deliberate extreme-noise persecution." },
];

// ── Stats helpers ───────────────────────────────────────────────────────────
function energyAvg(levels: number[]): number {
  if (!levels.length) return 0;
  return 10 * Math.log10(levels.reduce((s, v) => s + Math.pow(10, v / 10), 0) / levels.length);
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, idx)];
}

function getHour(pin: NoisePin): number {
  const t = pin.timeOfDay;
  if (t && t.match(/^\d{2}:\d{2}/)) return parseInt(t.slice(0, 2), 10);
  if (t === "morning") return 9;
  if (t === "afternoon") return 14;
  if (t === "evening") return 20;
  return 2;
}

function isNight(pin: NoisePin): boolean {
  const h = getHour(pin);
  return h >= 23 || h < 7;
}

function computeStats(pins: NoisePin[]) {
  if (!pins.length) return null;
  const dbs = pins.map((p) => p.db).sort((a, b) => a - b);
  const whoExceedDen = pins.filter((p) => {
    const h = getHour(p);
    const penalty = (h >= 19 && h < 23) ? 5 : (h >= 23 || h < 7) ? 10 : 0;
    return p.db + penalty > 53;
  }).length;
  const whoExceedNight = pins.filter((p) => isNight(p) && p.db > 45).length;
  const nightPins = pins.filter(isNight);
  const hourMap: Record<number, number[]> = {};
  for (const p of pins) {
    const h = getHour(p);
    if (!hourMap[h]) hourMap[h] = [];
    hourMap[h].push(p.db);
  }
  return {
    count: pins.length,
    worst: Math.max(...dbs),
    leq: energyAvg(pins.map((p) => p.db)),
    l10: percentile(dbs, 90),
    l50: percentile(dbs, 50),
    l90: percentile(dbs, 10),
    whoExceedDen,
    whoExceedNight,
    nightCount: nightPins.length,
    nightLeq: nightPins.length ? energyAvg(nightPins.map((p) => p.db)) : null,
    hourMap,
    categories: [...new Set(pins.map((p) => p.category))],
    dateRange: { from: pins[0].createdAt, to: pins[pins.length - 1].createdAt },
  };
}

function fmt(n: number, d = 1) { return n.toFixed(d); }

// ── Haversine distance (km) ─────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Main component ──────────────────────────────────────────────────────────
export default function DossierPage() {
  const [allPins, setAllPins] = useState<NoisePin[]>([]);
  const [step, setStep] = useState(0);

  // Step 0 — filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [radiusKm, setRadiusKm] = useState("");
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [selectedPinIds, setSelectedPinIds] = useState<Set<string>>(new Set());

  // Co-measurement corroboration
  const [showCorroborationImport, setShowCorroborationImport] = useState(false);
  const [corroborationJson, setCorroborationJson] = useState("");
  const [corroboration, setCorroboration] = useState<{
    label: string; leq: number; peak: number; l10: number; l50: number; l90: number;
    sampleCount: number; timestamp: string; durationS: number; calibrationOffset: number;
    location?: { lat: number; lng: number }; note?: string;
  } | null>(null);
  const [corroborationError, setCorroborationError] = useState<string | null>(null);

  function parseCorroboration() {
    try {
      const obj = JSON.parse(corroborationJson.trim());
      if (obj.type !== "noisecatcher-corroboration-v1") { setCorroborationError("Not a valid Noisecatcher corroboration export."); return; }
      setCorroboration(obj);
      setCorroborationError(null);
      setShowCorroborationImport(false);
      setCorroborationJson("");
    } catch {
      setCorroborationError("Invalid JSON — paste the full corroboration export.");
    }
  }

  // Step 2 — context
  const [selectedStandards, setSelectedStandards] = useState<Set<string>>(new Set(["who_lden", "who_lnight"]));
  const [localLimit, setLocalLimit] = useState("");
  const [selectedLegal, setSelectedLegal] = useState<Set<string>>(new Set());
  const [caseTitle, setCaseTitle] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [complaintType, setComplaintType] = useState("council");
  const [narrative, setNarrative] = useState("");

  useEffect(() => {
    loadPins().then((pins) => {
      const sorted = [...pins].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setAllPins(sorted);
      setSelectedPinIds(new Set(sorted.map((p) => p.id)));
    });
  }, []);

  const filteredPins = allPins.filter((p) => {
    if (dateFrom && p.createdAt < dateFrom) return false;
    if (dateTo && p.createdAt > dateTo + "T23:59:59") return false;
    if (centerLat && centerLng && radiusKm) {
      const lat = parseFloat(centerLat);
      const lng = parseFloat(centerLng);
      const r = parseFloat(radiusKm);
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(r)) {
        if (haversine(lat, lng, p.lat, p.lng) > r) return false;
      }
    }
    return true;
  });

  const selectedPins = filteredPins.filter((p) => selectedPinIds.has(p.id));
  const stats = computeStats(selectedPins);

  function togglePin(id: string) {
    setSelectedPinIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedPinIds(new Set(filteredPins.map((p) => p.id)));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenterLat(pos.coords.latitude.toFixed(5));
      setCenterLng(pos.coords.longitude.toFixed(5));
    });
  }

  const toggleStandard = useCallback((id: string) => {
    setSelectedStandards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const toggleLegal = useCallback((id: string) => {
    setSelectedLegal((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const appliedStandards = STANDARDS.filter((s) => selectedStandards.has(s.id));
  const appliedLegal = LEGAL_BASES.filter((l) => selectedLegal.has(l.id));

  const dateLabel = (iso: string) => new Date(iso).toLocaleString();

  const COMPLAINT_TYPES = [
    { value: "council", label: "Local council / municipal authority" },
    { value: "echr", label: "ECHR / European Court of Human Rights" },
    { value: "tenancy", label: "Tenancy tribunal / housing authority" },
    { value: "env_agency", label: "Environmental protection agency" },
    { value: "police", label: "Police / noise enforcement" },
    { value: "occupational", label: "Occupational health / labour authority" },
    { value: "other", label: "Other" },
  ];

  const steps = [
    { icon: Filter, label: "Select" },
    { icon: BarChart2, label: "Review" },
    { icon: Scale, label: "Context" },
    { icon: FileText, label: "Dossier" },
  ];

  return (
    <main id="nc-main" className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .te-panel { background: white !important; border: 1px solid #ccc !important; }
          .text-white, .text-white\\/80, .text-white\\/60 { color: black !important; }
          .text-white\\/40, .text-white\\/30, .text-white\\/25 { color: #555 !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print">
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5" style={{ color: "var(--nc-text-2)" }} />
          <h1 className="text-lg font-semibold" style={{ color: "var(--nc-text)" }}>Evidence Dossier</h1>
        </div>
        <p className="te-label text-[11px]" style={{ color: "var(--nc-text-3)" }}>
          Turn your pin data into a structured complaint document — ready to file with a council, tribunal, or human rights body.
        </p>
      </div>

      {/* Step indicator */}
      <div className="no-print flex items-center gap-0">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.label} className="flex items-center">
              <button
                onClick={() => i <= step && setStep(i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm te-label text-[10px] transition-colors"
                style={{
                  color: active ? "var(--nc-text)" : done ? "var(--nc-text-2)" : "var(--nc-text-3)",
                  background: active ? "var(--nc-bg-raised)" : "transparent",
                  border: active ? "1px solid var(--nc-border-mid)" : "1px solid transparent",
                }}
                disabled={i > step}
              >
                {done ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Icon className="w-3 h-3" />}
                {s.label}
              </button>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3" style={{ color: "var(--nc-border-mid)" }} />}
            </div>
          );
        })}
      </div>

      {allPins.length === 0 && (
        <div className="te-panel rounded-md px-4 py-6 flex flex-col items-center gap-3">
          <AlertTriangle className="w-6 h-6" style={{ color: "var(--nc-text-3)" }} />
          <p className="te-label text-center" style={{ color: "var(--nc-text-2)" }}>No pins found. Drop some pins on the map first, then return here to build a dossier.</p>
        </div>
      )}

      {/* ── STEP 0: Select pins ───────────────────────────────────────────── */}
      {step === 0 && allPins.length > 0 && (
        <div className="flex flex-col gap-4">
          <section className="te-panel rounded-md p-4 flex flex-col gap-4">
            <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Date range</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
              </div>
            </div>

            <h2 className="te-label text-[10px] uppercase tracking-wider mt-2" style={{ color: "var(--nc-text-3)" }}>Location radius (optional)</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Lat</label>
                <input
                  type="number"
                  value={centerLat}
                  onChange={(e) => setCenterLat(e.target.value)}
                  placeholder="48.8566"
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Lng</label>
                <input
                  type="number"
                  value={centerLng}
                  onChange={(e) => setCenterLng(e.target.value)}
                  placeholder="2.3522"
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Radius (km)</label>
                <input
                  type="number"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  placeholder="0.5"
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
              </div>
            </div>
            <button
              onClick={useCurrentLocation}
              className="te-label text-[10px] self-start px-2.5 py-1 rounded border transition-colors"
              style={{ borderColor: "var(--nc-border-mid)", color: "var(--nc-text-2)" }}
            >
              Use my current location
            </button>
          </section>

          {/* Pin list */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                {filteredPins.length} pin{filteredPins.length !== 1 ? "s" : ""} in filter · {selectedPinIds.size} selected
              </span>
              <button
                onClick={selectAllFiltered}
                className="te-label text-[10px] px-2 py-0.5 rounded border"
                style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}
              >
                Select all
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {filteredPins.map((p) => {
                const meta = getCategoryMeta(p.category);
                const thr = getThreshold(p.db);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer"
                    style={{ background: selectedPinIds.has(p.id) ? "var(--nc-bg-raised)" : "var(--nc-bg-panel)", border: "1px solid var(--nc-border)" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPinIds.has(p.id)}
                      onChange={() => togglePin(p.id)}
                      className="w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-sm shrink-0">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: thr.color }}>{fmt(p.db)} dB</span>
                        <span className="te-label text-[10px] truncate" style={{ color: "var(--nc-text-3)" }}>{p.description || meta.label}</span>
                      </div>
                      <span className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>{dateLabel(p.createdAt)}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Co-measurement corroboration */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Witness corroboration</span>
              <button
                onClick={() => setShowCorroborationImport(v => !v)}
                className="flex items-center gap-1.5 te-label text-[10px] px-2 py-1 rounded border transition-colors"
                style={{ borderColor: "var(--nc-border-mid)", color: corroboration ? "#4ade80" : "var(--nc-text-3)" }}
              >
                <Users className="w-3 h-3" />
                {corroboration ? "Corroboration attached" : "Import corroboration"}
              </button>
            </div>
            {showCorroborationImport && (
              <div className="te-panel rounded-md p-3 flex flex-col gap-2">
                <p className="te-label text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                  Paste a corroboration export from another Noisecatcher session. A witness independently measuring the same event significantly strengthens evidentiary value. To generate: in the meter, tap &ldquo;Copy session to share&rdquo; after stopping.
                </p>
                <textarea
                  rows={3}
                  value={corroborationJson}
                  onChange={e => { setCorroborationJson(e.target.value); setCorroborationError(null); }}
                  placeholder='{"type":"noisecatcher-corroboration-v1","leq":72.3,...}'
                  className="w-full px-2 py-1.5 rounded text-[10px] font-mono border focus:outline-none resize-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
                {corroborationError && <p className="te-label text-[9px]" style={{ color: "#f87171" }}>{corroborationError}</p>}
                <button
                  onClick={parseCorroboration}
                  disabled={!corroborationJson.trim()}
                  className="self-start px-3 py-1 rounded te-label text-[10px] disabled:opacity-40"
                  style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text)" }}
                >
                  Parse and attach
                </button>
              </div>
            )}
            {corroboration && (
              <div className="rounded-md px-3 py-2 flex flex-col gap-1" style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)" }}>
                <div className="flex items-center justify-between">
                  <span className="te-label text-[10px] font-semibold" style={{ color: "#4ade80" }}>✓ {corroboration.label || "Independent witness session"}</span>
                  <button onClick={() => setCorroboration(null)} className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>Remove</button>
                </div>
                <span className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>
                  Leq {corroboration.leq.toFixed(1)} dB · Peak {corroboration.peak.toFixed(1)} dB · {corroboration.sampleCount} samples · {new Date(corroboration.timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </section>

          <StepAbecedaire step={0} />

          <div className="flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={selectedPins.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded te-label text-sm transition-colors"
              style={{
                background: selectedPins.length ? "var(--nc-bg-raised)" : "transparent",
                border: "1px solid var(--nc-border-mid)",
                color: selectedPins.length ? "var(--nc-text)" : "var(--nc-text-3)",
              }}
            >
              Review statistics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Statistics ───────────────────────────────────────────── */}
      {step === 1 && stats && (
        <div className="flex flex-col gap-4">
          <section>
            <h2 className="te-label text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--nc-text-3)" }}>Summary — {stats.count} pins</h2>
            <div className="te-panel rounded-md grid grid-cols-2 divide-x divide-y" style={{ borderColor: "var(--nc-border)" }}>
              {[
                { label: "Worst reading", value: fmt(stats.worst), unit: "dB", color: getThreshold(stats.worst).color },
                { label: "Leq (energy avg)", value: fmt(stats.leq), unit: "dB", color: getThreshold(stats.leq).color },
                { label: "L10 (loud 10%)", value: fmt(stats.l10), unit: "dB", color: undefined },
                { label: "L50 (median)", value: fmt(stats.l50), unit: "dB", color: undefined },
                { label: "L90 (ambient 90%)", value: fmt(stats.l90), unit: "dB", color: undefined },
                { label: "Night readings", value: String(stats.nightCount), unit: `/ ${stats.count}`, color: undefined },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="flex flex-col items-center py-3 gap-0.5 divide-white/5">
                  <span className="te-label text-[9px] text-center px-1" style={{ color: "var(--nc-text-3)" }}>{label}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: color ?? "var(--nc-text)" }}>
                    {value}<span className="text-[9px] ml-0.5" style={{ color: "var(--nc-text-3)" }}>{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* WHO exceedances */}
          <section className="flex flex-col gap-2">
            <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>WHO 2018 exceedances</h2>
            <div className="te-panel rounded-md divide-y" style={{ borderColor: "var(--nc-border)" }}>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="te-label text-xs" style={{ color: "var(--nc-text)" }}>Lden &gt; 53 dB(A) road traffic limit</span>
                  <p className="te-label text-[9px] mt-0.5" style={{ color: "var(--nc-text-3)" }}>+5 dB evening, +10 dB night weighting applied to raw readings</p>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums ml-4 shrink-0" style={{ color: stats.whoExceedDen > 0 ? "#ef4444" : "#22c55e" }}>
                  {stats.whoExceedDen}/{stats.count}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="te-label text-xs" style={{ color: "var(--nc-text)" }}>Lnight &gt; 45 dB(A) night limit</span>
                  <p className="te-label text-[9px] mt-0.5" style={{ color: "var(--nc-text-3)" }}>Night pins (23:00–07:00 local time)</p>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums ml-4 shrink-0" style={{ color: stats.whoExceedNight > 0 ? "#ef4444" : "#22c55e" }}>
                  {stats.whoExceedNight}/{stats.nightCount}
                </span>
              </div>
            </div>
          </section>

          {/* Hour distribution */}
          {Object.keys(stats.hourMap).length > 0 && (
            <section>
              <h2 className="te-label text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--nc-text-3)" }}>Time-of-day distribution</h2>
              <div className="te-panel rounded-md px-4 py-3 flex flex-col gap-1.5">
                {Object.entries(stats.hourMap).sort(([a], [b]) => Number(a) - Number(b)).map(([hour, levels]) => {
                  const avg = energyAvg(levels);
                  const thr = getThreshold(avg);
                  const barW = Math.min(100, (levels.length / stats.count) * 100);
                  return (
                    <div key={hour} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tabular-nums w-6 shrink-0" style={{ color: "var(--nc-text-3)" }}>{hour.padStart(2, "0")}h</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--nc-bg-raised)" }}>
                        <div className="h-full rounded-full" style={{ width: `${barW}%`, background: thr.color }} />
                      </div>
                      <span className="font-mono text-[10px] tabular-nums w-14 text-right shrink-0" style={{ color: thr.color }}>{fmt(avg)} dB</span>
                      <span className="te-label text-[9px] w-8 text-right shrink-0" style={{ color: "var(--nc-text-3)" }}>×{levels.length}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <StepAbecedaire step={1} />

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-1 te-label text-sm" style={{ color: "var(--nc-text-3)" }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2 rounded te-label text-sm"
              style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text)" }}
            >
              Add legal context <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Legal context ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Case metadata */}
          <section className="te-panel rounded-md p-4 flex flex-col gap-3">
            <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Case details</h2>
            <div className="flex flex-col gap-1">
              <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Case / complaint title</label>
              <input type="text" value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)}
                placeholder="e.g. Noise complaint — 42 Rue de la Paix, Paris"
                className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Complainant name (optional)</label>
                <input type="text" value={complainantName} onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="Anonymous"
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Respondent / noise source</label>
                <input type="text" value={respondentName} onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="e.g. Construction site operator"
                  className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Location description</label>
              <input type="text" value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="e.g. Residential street, 3rd floor apartment, north-facing window"
                className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Filing with</label>
              <select value={complaintType} onChange={(e) => setComplaintType(e.target.value)}
                className="px-2 py-1.5 rounded text-xs te-label border focus:outline-none"
                style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}>
                {COMPLAINT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </section>

          {/* Standards */}
          <section className="te-panel rounded-md p-4 flex flex-col gap-3">
            <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Applicable noise standards</h2>
            <div className="flex flex-col gap-2">
              {STANDARDS.map((s) => (
                <label key={s.id} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={selectedStandards.has(s.id)} onChange={() => toggleStandard(s.id)} className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                  <div>
                    <span className="te-label text-xs" style={{ color: "var(--nc-text)" }}>{s.label}{s.limit !== null ? ` — ${s.limit} ${s.unit}` : ""}</span>
                    {s.id === "local" && selectedStandards.has(s.id) && (
                      <input type="text" value={localLimit} onChange={(e) => setLocalLimit(e.target.value)}
                        placeholder="e.g. 55 dB(A) daytime (Local Noise Management Plan 2023)"
                        className="mt-1 w-full px-2 py-1 rounded text-xs te-label border focus:outline-none"
                        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }} />
                    )}
                    <p className="te-label text-[9px] mt-0.5 leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{s.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Legal bases */}
          <section className="te-panel rounded-md p-4 flex flex-col gap-3">
            <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Legal basis</h2>
            <div className="flex flex-col gap-2">
              {LEGAL_BASES.map((l) => (
                <label key={l.id} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={selectedLegal.has(l.id)} onChange={() => toggleLegal(l.id)} className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                  <div>
                    <span className="te-label text-xs" style={{ color: "var(--nc-text)" }}>{l.label}</span>
                    <p className="te-label text-[9px] mt-0.5 leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{l.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Narrative */}
          <section className="te-panel rounded-md p-4 flex flex-col gap-2">
            <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Statement of harm (optional)</h2>
            <p className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>Describe the impact on your life: sleep disruption, health effects, inability to use your home, stress, work impairment, etc. This statement will appear verbatim in the dossier.</p>
            <textarea
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="e.g. Since construction began in March 2025, I have been unable to sleep before 2am on weekdays. I have been prescribed sleep medication for the first time in my life. My child's school performance has deteriorated..."
              className="w-full px-3 py-2 rounded text-xs te-label border focus:outline-none resize-none"
              style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
            />
          </section>

          <StepAbecedaire step={2} />

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 te-label text-sm" style={{ color: "var(--nc-text-3)" }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-4 py-2 rounded te-label text-sm"
              style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text)" }}
            >
              Generate dossier <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Printable dossier ─────────────────────────────────────── */}
      {step === 3 && stats && (
        <div className="flex flex-col gap-6">
          <div className="no-print flex items-center justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 te-label text-sm" style={{ color: "var(--nc-text-3)" }}>
              <ChevronLeft className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded te-label text-sm"
              style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text)" }}
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>

          {/* ── DOSSIER DOCUMENT ── */}
          <article className="te-panel rounded-md p-6 flex flex-col gap-6" style={{ fontFamily: "var(--font-ibm-mono)" }}>

            {/* Cover */}
            <header className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: "var(--nc-border)" }}>
              <div className="te-label text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--nc-text-3)" }}>
                Acoustic Evidence Dossier · Noisecatcher · Generated {new Date().toLocaleDateString()}
              </div>
              <h1 className="text-base font-semibold" style={{ color: "var(--nc-text)" }}>
                {caseTitle || "Untitled acoustic evidence dossier"}
              </h1>
              {complainantName && (
                <div className="te-label text-xs" style={{ color: "var(--nc-text-2)" }}>
                  Complainant: {complainantName}
                </div>
              )}
              {respondentName && (
                <div className="te-label text-xs" style={{ color: "var(--nc-text-2)" }}>
                  Respondent / noise source: {respondentName}
                </div>
              )}
              {locationDesc && (
                <div className="te-label text-xs" style={{ color: "var(--nc-text-2)" }}>
                  Location: {locationDesc}
                </div>
              )}
              <div className="te-label text-xs" style={{ color: "var(--nc-text-2)" }}>
                Filing type: {COMPLAINT_TYPES.find((t) => t.value === complaintType)?.label ?? ""}
              </div>
              <div className="te-label text-[10px] mt-1" style={{ color: "var(--nc-text-3)" }}>
                Evidence period: {new Date(stats.dateRange.from).toLocaleDateString()} — {new Date(stats.dateRange.to).toLocaleDateString()}
              </div>
            </header>

            {/* Statistical summary */}
            <section className="flex flex-col gap-3">
              <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>1. Statistical summary</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["Total readings", String(stats.count)],
                    ["Worst single reading", `${fmt(stats.worst)} dB(A) — ${getThreshold(stats.worst).label}`],
                    ["Leq (energy-average)", `${fmt(stats.leq)} dB(A)`],
                    ["L10 (exceeded 10% of the time)", `${fmt(stats.l10)} dB(A)`],
                    ["L50 (median level)", `${fmt(stats.l50)} dB(A)`],
                    ["L90 (background level)", `${fmt(stats.l90)} dB(A)`],
                    ["Night readings (23:00–07:00)", `${stats.nightCount} readings${stats.nightLeq != null ? ` · Leq ${fmt(stats.nightLeq)} dB(A)` : ""}`],
                    ["WHO Lden exceedances (>53 dB)", `${stats.whoExceedDen} of ${stats.count} readings (${((stats.whoExceedDen / stats.count) * 100).toFixed(0)}%)`],
                    ["WHO Lnight exceedances (>45 dB)", `${stats.whoExceedNight} of ${stats.nightCount} night readings`],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--nc-border)" }}>
                      <td className="te-label text-[10px] py-1.5 pr-4" style={{ color: "var(--nc-text-3)", width: "50%" }}>{label}</td>
                      <td className="font-mono text-[11px] py-1.5 font-semibold" style={{ color: "var(--nc-text)" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Applicable standards */}
            {appliedStandards.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>2. Applicable noise standards</h2>
                <div className="flex flex-col gap-2">
                  {appliedStandards.map((s) => {
                    const limit = s.id === "local" ? localLimit : (s.limit !== null ? `${s.limit} ${s.unit}` : null);
                    const exceedCount = s.limit !== null ? selectedPins.filter((p) => p.db > s.limit!).length : null;
                    return (
                      <div key={s.id} className="rounded px-3 py-2" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="te-label text-xs font-semibold" style={{ color: "var(--nc-text)" }}>{s.label}</span>
                          {limit && <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--nc-text-2)" }}>Limit: {limit}</span>}
                        </div>
                        {exceedCount !== null && (
                          <div className="te-label text-[10px] mt-0.5" style={{ color: exceedCount > 0 ? "#ef4444" : "#22c55e" }}>
                            {exceedCount} of {stats.count} readings exceed this limit ({((exceedCount / stats.count) * 100).toFixed(0)}%)
                          </div>
                        )}
                        <p className="te-label text-[9px] mt-1 leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{s.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Legal basis */}
            {appliedLegal.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>3. Legal basis</h2>
                <div className="flex flex-col gap-2">
                  {appliedLegal.map((l) => (
                    <div key={l.id} className="rounded px-3 py-2" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
                      <span className="te-label text-xs font-semibold" style={{ color: "var(--nc-text)" }}>{l.label}</span>
                      <p className="te-label text-[9px] mt-1 leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{l.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Statement of harm */}
            {narrative.trim() && (
              <section className="flex flex-col gap-2">
                <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>4. Statement of harm</h2>
                <div className="rounded px-3 py-3" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
                  <p className="te-label text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{narrative}</p>
                </div>
              </section>
            )}

            {/* Timestamped evidence log */}
            <section className="flex flex-col gap-3">
              <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                {narrative.trim() ? "5" : "4"}. Timestamped evidence log ({selectedPins.length} readings)
              </h2>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--nc-border-mid)" }}>
                      {["#", "Timestamp", "Level", "Category", "Time", "Coordinates", "Description"].map((h) => (
                        <th key={h} className="te-label text-left py-1.5 pr-3" style={{ color: "var(--nc-text-3)", fontWeight: "normal", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPins.map((p, i) => {
                      const meta = getCategoryMeta(p.category);
                      const thr = getThreshold(p.db);
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--nc-border)" }}>
                          <td className="py-1.5 pr-3 tabular-nums" style={{ color: "var(--nc-text-3)" }}>{i + 1}</td>
                          <td className="py-1.5 pr-3 font-mono" style={{ color: "var(--nc-text-2)", whiteSpace: "nowrap" }}>{new Date(p.createdAt).toLocaleString()}</td>
                          <td className="py-1.5 pr-3 font-mono font-semibold tabular-nums" style={{ color: thr.color }}>{fmt(p.db)} dB</td>
                          <td className="py-1.5 pr-3" style={{ color: "var(--nc-text-2)" }}>{meta.emoji} {meta.label}</td>
                          <td className="py-1.5 pr-3" style={{ color: "var(--nc-text-3)" }}>{p.timeOfDay}</td>
                          <td className="py-1.5 pr-3 font-mono" style={{ color: "var(--nc-text-3)", whiteSpace: "nowrap" }}>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</td>
                          <td className="py-1.5" style={{ color: "var(--nc-text-2)" }}>{p.description || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Corroboration */}
            {corroboration && (
              <section className="flex flex-col gap-3">
                <h2 className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                  {narrative.trim() ? "6" : "5"}. Independent witness corroboration
                </h2>
                <div className="rounded px-3 py-3" style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)" }}>
                  <p className="te-label text-[10px] font-semibold mb-2" style={{ color: "#4ade80" }}>
                    {corroboration.label || "Independent witness measurement — Noisecatcher corroboration export"}
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        ["Timestamp", new Date(corroboration.timestamp).toLocaleString()],
                        ["Leq (energy-average)", `${corroboration.leq.toFixed(1)} dB(A)`],
                        ["Peak", `${corroboration.peak.toFixed(1)} dB(A)`],
                        ["L10", `${corroboration.l10.toFixed(1)} dB(A)`],
                        ["L50", `${corroboration.l50.toFixed(1)} dB(A)`],
                        ["L90", `${corroboration.l90.toFixed(1)} dB(A)`],
                        ["Sample count", String(corroboration.sampleCount)],
                        ["Duration", `${Math.round(corroboration.durationS)} s`],
                        ["Calibration offset", `${corroboration.calibrationOffset > 0 ? "+" : ""}${corroboration.calibrationOffset} dB`],
                        ...(corroboration.location ? [["Location", `${corroboration.location.lat.toFixed(5)}, ${corroboration.location.lng.toFixed(5)}`]] : []),
                      ].map(([label, value]) => (
                        <tr key={label} style={{ borderBottom: "1px solid var(--nc-border)" }}>
                          <td className="te-label text-[9px] py-1 pr-4" style={{ color: "var(--nc-text-3)", width: "50%" }}>{label}</td>
                          <td className="font-mono text-[10px] py-1" style={{ color: "var(--nc-text)" }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {corroboration.note && (
                    <p className="te-label text-[9px] mt-2" style={{ color: "var(--nc-text-3)" }}>{corroboration.note}</p>
                  )}
                  <p className="te-label text-[9px] mt-2" style={{ color: "var(--nc-text-3)" }}>
                    This corroboration was provided independently — the witness used a separate Noisecatcher instance and exported their session data using the &ldquo;Copy session to share&rdquo; function. The two datasets were not coordinated prior to sharing.
                  </p>
                </div>
              </section>
            )}

            {/* Methodological note */}
            <section className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--nc-border)" }}>
              <h2 className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Methodological note</h2>
              <p className="te-label text-[9px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                Measurements were collected using Noisecatcher ({SITE_DOMAIN}), an A-weighted (IEC 61672-1:2013) acoustic measurement PWA. Leq is computed as the energy-average (10·log₁₀(mean(10^(v/10)))) of all readings — the quantity used by WHO and EEA in health guidelines. Measurements made with an uncalibrated smartphone microphone carry an uncertainty of approximately ±10 dB; calibrated measurements ±3 dB (95% confidence). L10, L50, and L90 represent the dB levels exceeded 10%, 50%, and 90% of the time respectively. WHO Lden exceedances are computed by applying +5 dB to evening readings (19:00–23:00) and +10 dB to night readings (23:00–07:00) before comparing to the 53 dB threshold — this approximates the Lden weighting scheme used in the WHO 2018 Environmental Noise Guidelines and the EU Environmental Noise Directive. These measurements may be submitted as supporting evidence but are not a substitute for regulatory noise assessments performed by a qualified acoustician under formal measurement protocols (BS 4142, NF S31-010, VDI 2058, etc.).
              </p>
            </section>

            <StepAbecedaire step={3} />

            {/* Footer */}
            <footer className="te-label text-[9px] border-t pt-3" style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-3)" }}>
              Generated by Noisecatcher · {new Date().toISOString()} · All times are device local time · Data stored client-side only, no server transmission
            </footer>
          </article>
        </div>
      )}
    </main>
  );
}
