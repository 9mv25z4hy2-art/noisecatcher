"use client";

import Link from "next/link";
import { Mic, Map, BookOpen, Zap, Settings, AlertTriangle, HelpCircle, ChevronRight, Smartphone, Volume2, Pin, FileJson, Layers, FileText, BookMarked, MicVocal } from "lucide-react";
import { NOISE_SOURCE_CATEGORIES } from "@/lib/noiseSources";
import { useI18n } from "@/lib/i18n/context";

/* ── Section wrapper ── */
function Section({ id, title, icon: Icon, children }: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-20">
      <h2
        className="flex items-center gap-2.5 text-base font-semibold nc-text nc-divider-b pb-2"
      >
        <span
          className="w-6 h-6 rounded flex items-center justify-center shrink-0"
          style={{ background: "var(--nc-hover)", border: "1px solid var(--nc-border-mid)" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: "var(--nc-text-2)" }} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ── Numbered step ── */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ background: "var(--nc-text)", color: "var(--nc-bg)", fontFamily: "var(--font-display)" }}
      >
        {n}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold nc-text">{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{children}</p>
      </div>
    </div>
  );
}

/* ── Tip box ── */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex gap-2.5 text-sm leading-relaxed"
      style={{
        background: "var(--nc-bg-panel)",
        border: "1px solid var(--nc-border-mid)",
        color: "var(--nc-text-2)",
      }}
    >
      <span className="shrink-0 mt-0.5 text-base">💡</span>
      <span>{children}</span>
    </div>
  );
}

/* ── Warning box ── */
function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex gap-2.5 text-sm leading-relaxed"
      style={{
        background: "var(--nc-bg-panel)",
        border: "1px solid #7f1d1d",
        color: "var(--nc-text-2)",
      }}
    >
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
      <span>{children}</span>
    </div>
  );
}

/* ── dB colour legend ── */
const LEVELS = [
  { range: "0–54 dB", label: "Safe", color: "#22c55e",   bg: "#14532d22", desc: "Normal conversation, quiet office, birdsong." },
  { range: "55–69 dB", label: "Caution", color: "#eab308", bg: "#71350022", desc: "Busy restaurant, TV at normal volume. WHO recommends limiting exposure." },
  { range: "70–84 dB", label: "Dangerous", color: "#f97316", bg: "#7c2d1222", desc: "Heavy traffic, loud music, lawnmower. Long exposure causes hearing damage." },
  { range: "85+ dB",   label: "Critical", color: "#ef4444", bg: "#7f1d1d22", desc: "Motorcycles, concerts, power tools. OSHA limit: 90 dB over 8 hours." },
];

const SECTIONS = [
  { id: "start",      label: "Getting started",        icon: Mic        },
  { id: "gauge",      label: "Reading the gauge",       icon: Volume2    },
  { id: "report",     label: "Noise reports",           icon: FileText   },
  { id: "pins",       label: "Dropping pins",           icon: Pin        },
  { id: "categories", label: "Noise source categories", icon: Layers     },
  { id: "map",        label: "Using the map",           icon: Map        },
  { id: "voice",      label: "Voice notes",             icon: MicVocal   },
  { id: "carnets",    label: "Field Notebooks",          icon: BookMarked },
  { id: "export",     label: "Exporting your data",     icon: FileJson   },
  { id: "fieldcraft",  label: "Field recording practice",  icon: Mic        },
  { id: "calib",      label: "Calibration",             icon: Settings   },
  { id: "ios",        label: "iPhone & iOS quirks",     icon: Smartphone },
  { id: "faq",        label: "FAQ",                     icon: HelpCircle },
];

export default function HelpPage() {
  const { t, locale } = useI18n();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-12">

      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl font-bold nc-text"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
        >
          {t.help_title}
        </h1>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          {t.help_subtitle}
        </p>
      </div>

      {/* English-only notice for non-English locales */}
      {locale !== "en" && t.en_only_notice && (
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
          role="note"
          aria-label={t.en_only_notice}
        >
          🌐 {t.en_only_notice}
        </div>
      )}

      {/* ── Quick nav ── */}
      <nav className="nc-surface rounded-xl overflow-hidden">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-3 px-4 py-3 text-sm transition-colors nc-divider-t first:border-t-0"
            style={{ color: "var(--nc-text-2)" }}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--nc-text-3)" }} />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--nc-text-3)" }} />
          </a>
        ))}
      </nav>

      {/* ══════════════════════════════════════════════ */}
      {/* 1. Getting started */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="start" title="Getting started" icon={Mic}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Noisecatcher uses your device&apos;s built-in microphone to measure ambient sound levels in real time.
          It works entirely in your browser — no account, no installation, and nothing leaves your device
          unless you choose to export.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Open the Meter page">
            Tap <strong className="nc-text">Meter</strong> in the navigation bar (or the mic icon on mobile).
            This is where all measurements happen.
          </Step>
          <Step n={2} title="Allow microphone access">
            When you tap <strong className="nc-text">Start Measuring</strong>, your browser will ask for
            microphone permission. Tap <em>Allow</em> — the app cannot function without this.
            Your audio is never recorded or sent anywhere; only the computed volume level is used.
          </Step>
          <Step n={3} title="Hold your phone steady">
            For consistent readings, hold the device at chest height with the microphone facing the
            noise source. Avoid covering the mic with your hand or case.
          </Step>
          <Step n={4} title="Wait for stabilisation">
            The gauge takes 2–3 seconds to stabilise. The <strong className="nc-text">● LEVEL</strong>{" "}
            indicator turns green once the reading has been steady for at least 1.5 seconds — this is the
            best moment to drop a pin.
          </Step>
          <Step n={5} title="Stop measuring or generate a report">
            Tap <strong className="nc-text">Stop</strong> to end the session, or — after at least 5 readings —
            tap <strong className="nc-text">Stop &amp; Report</strong> to save a full session summary and
            navigate directly to your noise report.
          </Step>
        </div>

        <Tip>
          The first reading after starting is often unreliable as the audio engine initialises.
          Wait for the gauge arc to settle before interpreting results.
        </Tip>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 2. Reading the gauge */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="gauge" title="Reading the gauge" icon={Volume2}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The large arc gauge displays the current sound level in decibels (dB). The value shown is
          a short-term average (Leq), not a peak. Decibels follow a <em>logarithmic scale</em> —
          a 10 dB increase means roughly double the perceived loudness.
        </p>

        {/* Level legend */}
        <div className="flex flex-col gap-2">
          {LEVELS.map(({ range, label, color, bg, desc }) => (
            <div
              key={range}
              className="rounded-xl px-4 py-3 flex gap-3 items-start text-sm"
              style={{ background: bg, border: `1px solid ${color}33` }}
            >
              <div className="flex flex-col gap-0.5 shrink-0 w-24">
                <span className="font-bold font-mono text-xs" style={{ color }}>{range}</span>
                <span className="text-xs font-semibold" style={{ color }}>{label}</span>
              </div>
              <p className="leading-relaxed text-xs" style={{ color: "var(--nc-text-2)" }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold nc-text">What each readout means</h3>
          {[
            { label: "Main number", desc: "Current short-term average level (updates ~4×/sec)." },
            { label: "Peak", desc: "Highest instantaneous value recorded in this session." },
            { label: "Leq", desc: "Session energy-equivalent level (Leq) — most useful for documenting chronic exposure." },
            { label: "Samples", desc: "Total number of measurements taken. More samples = more reliable average." },
            { label: "● LEVEL", desc: "Stability indicator. Green = steady reading. If flashing, wait for it to settle." },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-3 text-sm">
              <span
                className="shrink-0 w-20 text-xs font-semibold pt-0.5"
                style={{ color: "var(--nc-text)", fontFamily: "var(--font-display)" }}
              >
                {label}
              </span>
              <span style={{ color: "var(--nc-text-2)" }}>{desc}</span>
            </div>
          ))}
        </div>

        <Warning>
          Noisecatcher uses a smartphone microphone, not a calibrated sound level meter.
          Readings are indicative — useful for documenting patterns and comparing locations,
          but not equivalent to IEC 61672-certified measurements used in legal proceedings.
        </Warning>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 3. Noise reports */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="report" title="Noise reports" icon={FileText}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          A noise report captures the complete picture of a measurement session in a single
          shareable document — statistics, health context, psychoacoustic profile, dose, and optionally
          a voice commentary. Reports are stored permanently in your device and can be printed or saved as PDF.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Start measuring">
            Begin a session on the Meter page as normal.
          </Step>
          <Step n={2} title="Tap 'Stop & Report'">
            Once at least 5 readings have been recorded, the <strong className="nc-text">Stop &amp; Report</strong> button
            appears next to the Stop button. Tap it to save the session and open the report.
          </Step>
          <Step n={3} title="Review the report">
            The report shows Leq, peak, L10/L50/L90 percentiles, EU and OSHA noise dose, psychoacoustic
            metrics (loudness, sharpness, roughness, annoyance), ACI, and HF deterrent scan results.
          </Step>
          <Step n={4} title="Add a voice note">
            Tap <strong className="nc-text">Add voice note</strong> to attach an audio commentary — useful
            for describing the noise context, source, or impact.
          </Step>
          <Step n={5} title="Print or save as PDF">
            Tap <strong className="nc-text">Print / Save PDF</strong>. Your browser&apos;s native print dialog opens;
            choose &apos;Save as PDF&apos; to keep a file, or send to a printer.
          </Step>
        </div>

        <div className="nc-surface rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>
            Each report records
          </p>
          {[
            "Leq (energy-average), Peak, L10, L50, L90 (percentile levels)",
            "EU Directive 2003/10/EC noise dose (80 dB / 8 h reference)",
            "OSHA PEL noise dose (90 dB / 8 h reference)",
            "Loudness (sone), Sharpness (acum), Roughness (asper), Psychoacoustic Annoyance",
            "Acoustic Complexity Index (ACI)",
            "HF deterrent scan — 15–20 kHz band energy",
            "Calibration offset applied",
            "Optional voice note attachment",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0 mt-1.5" />
              <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>{item}</p>
            </div>
          ))}
        </div>

        <Tip>
          Reports are linked by URL — you can bookmark or share the address
          (<code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">/report/[id]</code>) and it will
          load the same data on the same device. The data lives only in your browser&apos;s IndexedDB.
        </Tip>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 4. Dropping pins */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="pins" title="Dropping pins" icon={Pin}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          A pin saves your current dB reading, GPS location, timestamp, and bearing (compass direction)
          as a single data point. Pins are stored locally on your device — they are never uploaded.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Start measuring">
            You must be actively measuring to drop a pin. The microphone must be running.
          </Step>
          <Step n={2} title="Wait for a stable reading">
            Watch the <strong className="nc-text">● LEVEL</strong> indicator. When it turns green,
            the reading has stabilised and is ready to save.
          </Step>
          <Step n={3} title="Tap 'Pin this reading'">
            Press the <strong className="nc-text">Pin this reading on map</strong> button below the gauge.
            This navigates you to the <Link href="/map" className="underline underline-offset-2 nc-text">Map</Link> page.
            Once there, tap the spot on the map where you were standing — the pin form opens at that location.
            Choose a noise category and confirm to save.
          </Step>
          <Step n={4} title="View your pin on the map">
            Your pin appears as a coloured dot — green for safe, yellow for caution, orange for dangerous,
            red for critical. An arrow inside the dot shows the bearing you were facing.
          </Step>
        </div>

        <Tip>
          Drop multiple pins at the same location at different times of day to build a complete picture —
          noise levels near roads can vary by 15 dB between peak and off-peak hours.
        </Tip>

        <div className="nc-surface rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>
            Each pin records
          </p>
          {["dB level (current reading at time of pin)", "GPS coordinates (lat/lng)", "Timestamp (ISO 8601)", "Compass bearing (if orientation permission granted)", "Noise category (safe / caution / dangerous / critical)"].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0 mt-1.5" />
              <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>{item}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 4. Noise source categories */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="categories" title="Noise source categories" icon={Layers}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          When dropping a pin, you can tag the type of noise source. This makes your data
          far more useful for advocacy, legal complaints, and research — a lawyer or city
          official can immediately see whether you documented construction drilling,
          an ambulance siren, or gunfire.
        </p>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold nc-text">How the picker works</h3>
          <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--nc-text-2)" }}>
            <p>
              <strong className="nc-text">Step 1 — choose a category.</strong> A row of category
              buttons appears in the pin form. Each one represents a top-level noise type (Traffic,
              Emergency, Construction, etc.). Tap one to select it.
            </p>
            <p>
              <strong className="nc-text">Step 2 — choose a subcategory.</strong> As soon as you
              tap a category, its specific subtypes appear directly below — no new screen, no menu
              diving. Tap the exact source that matches.
            </p>
            <p>
              <strong className="nc-text">Skip if unsure.</strong> Tapping <em>Any / skip</em> saves
              the pin without a source tag. The dB reading and location are still recorded.
            </p>
          </div>
        </div>

        {/* Category reference grid */}
        <div className="flex flex-col gap-3">
          {NOISE_SOURCE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${cat.color}33` }}
            >
              {/* Category header */}
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ background: cat.color + "18" }}
              >
                <span className="text-base">{cat.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: cat.color }}>
                  {cat.label}
                </span>
                {cat.sensitive && (
                  <span
                    className="ms-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "#7f1d1d", color: "#fca5a5" }}
                  >
                    Safety warning
                  </span>
                )}
              </div>
              {/* Subcategories */}
              <div className="px-4 py-2.5 flex flex-wrap gap-x-3 gap-y-1">
                {cat.subs.map((sub) => (
                  <span
                    key={sub.id}
                    className="text-xs"
                    style={{ color: "var(--nc-text-2)" }}
                  >
                    {sub.emoji} {sub.label}
                  </span>
                ))}
              </div>
              {/* Conflict zone note */}
              {cat.sensitive && (
                <div
                  className="mx-4 mb-3 rounded-lg px-3 py-2 flex gap-2 text-xs leading-relaxed"
                  style={{ background: "#7f1d1d33", border: "1px solid #ef444455", color: "#fca5a5" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    If you are in a conflict zone, be aware that precise GPS coordinates stored on
                    your device or shared via GeoJSON can identify your position. Consider reducing
                    GPS accuracy in your phone settings, or export data only when safe to do so.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Tip>
          The subcategory is saved in the GeoJSON export as the <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">sourceSub</code> field.
          When you share your data with city authorities, legal aid organisations, or researchers,
          this field allows them to filter and analyse specific noise types — far more useful than
          a raw dB number alone.
        </Tip>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 5. Map */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="map" title="Using the map" icon={Map}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The <Link href="/map" className="underline underline-offset-2 nc-text">Map page</Link> shows
          all your saved pins on an interactive OpenStreetMap map. Each pin is colour-coded by severity
          and shows a directional arrow for bearing.
        </p>

        <div className="flex flex-col gap-3">
          {[
            { icon: "🟢", title: "Green pin — Safe (0–54 dB)", desc: "Below WHO recommended thresholds. Documenting quiet areas is as valuable as documenting loud ones — they establish a baseline." },
            { icon: "🟡", title: "Yellow pin — Caution (55–69 dB)", desc: "Within range WHO recommends limiting for long-term outdoor residential exposure." },
            { icon: "🟠", title: "Orange pin — Dangerous (70–84 dB)", desc: "Exceeds WHO 70 dB threshold for leisure venues. Chronic exposure at these levels degrades hearing." },
            { icon: "🔴", title: "Red pin — Critical (85+ dB)", desc: "OSHA occupational safety limit. Short-term exposure (< 30 min) at 100 dB can cause permanent hearing damage." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3 nc-surface rounded-xl p-3">
              <span className="text-lg shrink-0">{icon}</span>
              <div>
                <p className="text-sm font-semibold nc-text">{title}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--nc-text-2)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold nc-text">Map controls</h3>
          {[
            { ctrl: "Tap a pin", desc: "Shows the dB reading, timestamp, and category in a popup." },
            { ctrl: "Locate me", desc: "Flies the map to your current GPS position without dropping a pin." },
            { ctrl: "GPS me", desc: "Gets your GPS position, flies the map there, and opens the pin form pre-filled at your coordinates — so you can document a noise event exactly where you are in one tap." },
            { ctrl: "Density toggle", desc: "Switch between individual pins and a heatmap density view." },
            { ctrl: "Export GeoJSON", desc: "Download all pins as a GeoJSON file for use in QGIS, ArcGIS, or any GIS tool." },
            { ctrl: "Tap to drop pin", desc: "Tapping the map creates a manual pin at that location — useful for marking a spot you visited earlier." },
          ].map(({ ctrl, desc }) => (
            <div key={ctrl} className="flex gap-3 text-sm">
              <span
                className="shrink-0 w-28 text-xs font-semibold pt-0.5"
                style={{ color: "var(--nc-text)", fontFamily: "var(--font-display)" }}
              >
                {ctrl}
              </span>
              <span style={{ color: "var(--nc-text-2)" }}>{desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* Voice notes */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="voice" title="Voice notes" icon={MicVocal}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Voice notes let you record up to 60 seconds of audio commentary and attach it to a noise report
          or a notebook. Use them to describe the context, the noise source, or your reaction — information
          that numbers alone cannot capture.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Find the voice recorder">
            Voice note recorders appear on the <strong className="nc-text">Report</strong> page (after generating
            a session report) and inside each <strong className="nc-text">Notebook</strong> under the
            &quot;Add note&quot; section.
          </Step>
          <Step n={2} title="Start recording">
            Tap the microphone button. Your browser will request microphone access if not already granted.
            Recording begins immediately — a pulsing red dot and a live timer confirm it is active.
          </Step>
          <Step n={3} title="Stop recording">
            Tap <strong className="nc-text">Release to stop</strong>, or recording stops automatically at 60 seconds.
          </Step>
          <Step n={4} title="Play or delete">
            After saving, tap <strong className="nc-text">Play</strong> to listen back, or the trash icon to delete
            and re-record. The audio is stored as a base64 data URL in IndexedDB — it never leaves your device.
          </Step>
        </div>

        <Tip>
          Speak clearly and describe: the time, the source, how long it has been occurring, and how it affects you.
          This narrative context is often what turns raw data into a compelling complaint.
        </Tip>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* Field Notebooks */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="carnets" title="Field Notebooks" icon={BookMarked}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          A field notebook is a named container that groups pins, reports, and voice notes belonging to the
          same noise problem — a building site near your home, a neighbour&apos;s sound system, a road you
          cross every day. Building a notebook over time creates a structured, chronological dossier you can
          share with authorities or legal counsel.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Create a notebook">
            Navigate to <Link href="/carnets" className="underline underline-offset-2 nc-text">Notebooks</Link>,
            tap <strong className="nc-text">+ New notebook</strong>, give it a name, optional notes, and a colour.
            Tap <strong className="nc-text">Create</strong>.
          </Step>
          <Step n={2} title="Open the notebook">
            Tap the notebook card to open the detail view. You will see sections for pins, reports, and voice notes
            that belong to this notebook, plus the voice recorder to add a new note instantly.
          </Step>
          <Step n={3} title="Link future recordings">
            When generating a noise report with <strong className="nc-text">Stop &amp; Report</strong>, you will
            be able to assign it to a notebook. Pins dropped from the map can also be linked via the pin form.
          </Step>
          <Step n={4} title="Use as a dossier">
            A well-built notebook — spanning multiple days, times of day, and noise events — is a strong basis for
            a formal complaint to your local authority, an ombudsman, or a noise pollution legal aid service.
          </Step>
        </div>

        <Warning>
          Notebooks are stored locally in your browser. If you clear your browser data or uninstall the PWA,
          all notebooks, reports, and voice notes will be lost. There is currently no cloud sync or backup.
          Export your GeoJSON pins regularly, and use the browser&apos;s print function to PDF your reports.
        </Warning>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* Exporting data */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="export" title="Exporting your data" icon={FileJson}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          All pins are stored only on your device (IndexedDB). To preserve your data, share it,
          or use it in external tools, export it as GeoJSON.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Go to the Map page">
            Navigate to <Link href="/map" className="underline underline-offset-2 nc-text">Map</Link>.
          </Step>
          <Step n={2} title="Tap '↓ Export GeoJSON'">
            The button appears in the toolbar above the map. A <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">.geojson</code> file
            will be downloaded to your device.
          </Step>
          <Step n={3} title="Use your data">
            Open the file in QGIS, Google Maps, ArcGIS, or any GIS platform. Each feature includes
            properties: <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">db</code>,{" "}
            <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">timestamp</code>,{" "}
            <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">category</code>,{" "}
            <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">bearing</code>.
          </Step>
        </div>

        <Tip>
          Export regularly if you are building a long-term dataset — the data exists only in your browser&apos;s
          IndexedDB and could be lost if you clear site data or switch browsers.
        </Tip>

        <div className="nc-surface rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ color: "var(--nc-text-2)" }}>
{`{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [2.3522, 48.8566]
    },
    "properties": {
      "db": 72.4,
      "category": "dangerous",
      "timestamp": "2026-06-08T14:32:00Z",
      "bearing": 245
    }
  }]
}`}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* Field recording practice */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="fieldcraft" title="Field recording practice" icon={Mic}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Your smartphone is an acoustic instrument. These practices improve measurement
          consistency, protect recordings from artefacts, and align your method with the
          counter-forensic ethos of Noisecatcher.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Position the microphone correctly">
            <p>Hold the device at chest height, microphone facing the sound source.
            Most smartphones have their microphone at the bottom edge. On iPhones,
            the primary mic is at the bottom; a second mic for noise cancellation is
            at the top or rear — this one is not used by the Web Audio API.
            Avoid covering the mic grille with your palm or case material.</p>
          </Step>

          <Step n={2} title="Stabilise before you read">
            <p>The Leq (energy average) takes 2–3 seconds to stabilise. Wait for
            the <strong>● LEVEL</strong> indicator to turn green before dropping a pin.
            Transient sounds in the first second (traffic passing, a door closing)
            will skew the reading if you measure too quickly.</p>
          </Step>

          <Step n={3} title="Keep the device still">
            <p>Movement creates handling noise. Rest the device on a surface, use a small
            tripod, or brace it against your body. If you are measuring a stationary
            source (HVAC unit, transformer, construction site), a fixed position gives
            more reproducible results. Note your exact position in the pin description
            for future reference.</p>
          </Step>

          <Step n={4} title="Manage wind noise">
            <p>Wind across the microphone generates low-frequency turbulence that
            inflates readings by 5–15 dB. Outdoors: shield the mic with a foam windscreen
            (any lavalier foam works), a piece of fabric, or by pointing the device
            slightly away from the wind. Note wind conditions in your pin description.
            Readings taken in wind above Beaufort 3 should be flagged as unreliable.</p>
          </Step>

          <Step n={5} title="Enable Airplane mode">
            <p>Incoming calls, SMS, and cellular radio events cause electromagnetic
            interference that appears as brief spikes or a rhythmic buzzing at ~217 Hz
            (GSM) in recordings. Switch to Airplane mode — then re-enable Wi-Fi only if
            you need maps or federation data. This eliminates RF artefacts from your
            measurements.</p>
          </Step>

          <Step n={6} title="Avoid Active Noise Cancellation">
            <p>Never use earphones with Active Noise Cancellation (ANC) when measuring.
            ANC earphones include a pass-through microphone whose input has been
            electronically modified. The signal Noisecatcher receives will not reflect
            the actual acoustic environment. See the <em>About</em> page for the full
            ethos argument.</p>
          </Step>

          <Step n={7} title="Use an external microphone when possible">
            <p>An omnidirectional lavalier (worn at chest height) gives a more consistent,
            body-referenced measurement of personal noise exposure than the phone
            microphone. A USB-C or Lightning stereo microphone (e.g. Shure MV88, Rode
            VideoMic Me-L/Me-C) gives spatial information. See the{" "}
            <a href="/microphones" className="underline" style={{ color: "var(--nc-accent)" }}>
              Microphones guide
            </a>{" "}
            for hardware recommendations aligned with Noisecatcher&apos;s ethos.</p>
          </Step>

          <Step n={8} title="Calibrate at the start of each session">
            <p>Use the Calibration tool (tap the sliders icon on the Meter screen) to
            anchor your device against a known quiet environment or a reference sound level
            meter. A single calibration offset applies to the entire session. If you change
            location or device orientation significantly, re-calibrate. Log your offset
            value in the Notebook notes for the session.</p>
          </Step>

          <Step n={9} title="Document what you hear, not just what you measure">
            <p>The most powerful Noisecatcher record combines: the dB reading (objective),
            a voice note (subjective description), a pin category (contextual), and
            GPS coordinates (spatial). Describe what you hear in the voice note immediately
            after recording — the smell of exhaust, the vibration through the floor,
            the emotional state it produces. These details cannot be recovered later
            from numbers alone.</p>
          </Step>
        </div>

        <Tip>
          Repeat measurements at the same location at different times of day and across
          multiple days. A single reading is an anecdote. A series is evidence.
          The Field Notebooks system is designed for exactly this kind of longitudinal documentation.
        </Tip>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 7. Calibration */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="calib" title="Calibration" icon={Settings}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Different devices have different microphone sensitivities, so raw dB values vary between phones.
          Calibration applies a fixed offset so your readings match a known reference.
        </p>

        <div className="flex flex-col gap-4">
          <Step n={1} title="Get a reference reading">
            Use a calibrated sound level meter (or a certified app) to measure the level of a stable
            sound source — e.g. a pink noise generator, a fan, or road traffic from a fixed position.
          </Step>
          <Step n={2} title="Measure the same source in Noisecatcher">
            Start measuring and wait for the reading to stabilise.
          </Step>
          <Step n={3} title="Apply the offset">
            Tap <strong className="nc-text">Calibrate</strong> on the Meter page.
            Enter the difference between the reference reading and Noisecatcher&apos;s reading.
            For example: if reference = 65 dB and Noisecatcher shows 59 dB, enter <code className="text-xs nc-surface rounded px-1 py-0.5 nc-text">+6</code>.
          </Step>
        </div>

        <Tip>
          Without calibration, Noisecatcher readings are still useful for <em>relative comparisons</em> —
          comparing one location to another, or the same location at different times — even if the
          absolute values are off by a few dB.
        </Tip>

        <Warning>
          Calibration offsets are stored in your browser and apply globally. If you switch devices,
          re-calibrate. The offset does not automatically adjust for different microphone hardware.
        </Warning>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 8. iOS quirks */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="ios" title="iPhone &amp; iOS quirks" icon={Smartphone}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          iOS has stricter browser APIs than Android. Here is what to expect on iPhone and iPad.
        </p>

        <div className="flex flex-col gap-4">
          {[
            {
              title: "Microphone permission",
              body: "Safari will ask once per site. If you tapped 'Don't Allow' by mistake: go to Settings → Safari → tap the Noisecatcher site → Microphone → Allow.",
            },
            {
              title: "Compass / bearing arrows",
              body: "iOS requires a user gesture to enable DeviceOrientationEvent. When you tap 'Start Measuring', the app will request orientation access. If a permission dialog appears, tap Allow. If no dialog appears (iOS 12 and earlier do not require permission), bearing tracking starts automatically.",
            },
            {
              title: "Haptic feedback",
              body: "Standard Vibration API is not available on iOS. Noisecatcher uses a workaround (toggling a native switch element) to trigger UIImpactFeedbackGenerator on iOS 18+. On older iOS versions, haptic feedback is silent — the app still functions fully.",
            },
            {
              title: "PWA installation",
              body: "To install Noisecatcher as an app: open in Safari → tap the Share button (rectangle with arrow) → tap 'Add to Home Screen'. Chrome and Firefox on iOS cannot install PWAs due to Apple restrictions.",
            },
            {
              title: "Background audio",
              body: "iOS suspends audio processing when the screen locks or the app goes to background. Keep the screen on while measuring for uninterrupted readings.",
            },
          ].map(({ title, body }) => (
            <div key={title} className="nc-surface rounded-xl p-4 flex flex-col gap-1.5">
              <p className="text-sm font-semibold nc-text">{title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/* 9. FAQ */}
      {/* ══════════════════════════════════════════════ */}
      <Section id="faq" title="FAQ" icon={HelpCircle}>
        <div className="flex flex-col gap-5">
          {[
            {
              q: "Is this app accurate enough to use in a legal complaint?",
              a: "Smartphone readings are indicative, not certified. They can support a complaint as corroborating evidence alongside other documentation (photos, videos, witness statements), and they are strong grounds for requesting an official certified measurement. They cannot alone serve as sole technical evidence in court proceedings.",
            },
            {
              q: "Why does the dB value jump around so much?",
              a: "Sound levels fluctuate naturally. Traffic, wind, voices, and environmental noise vary second to second. The 'Leq' value is more stable and more meaningful for documenting exposure over time. The '● LEVEL' stability indicator tells you when the reading is consistent enough to pin.",
            },
            {
              q: "What is the dB(A) weighting?",
              a: "dB(A) is a frequency-weighted measurement that approximates how human ears perceive loudness — lower frequencies (bass) are de-emphasised, high frequencies less so. Most noise regulation standards use dB(A). Noisecatcher applies the IEC 61672-1:2013 A-weighting curve bin-by-bin to the FFT frequency data, then sums the weighted energy to produce the final dB(A) reading. This closely matches a true A-weighted measurement; it is not a calibrated instrument, but the weighting is applied correctly.",
            },
            {
              q: "Can I use this indoors?",
              a: "Yes. Indoor measurements are useful for documenting noise intrusion from outside (traffic, neighbours, HVAC). For indoor measurements, be aware that room acoustics (reflections, reverberation) affect readings. Measure from the centre of the room where possible, not directly against a wall.",
            },
            {
              q: "Will my data be deleted if I clear my browser history?",
              a: "Yes. Pins are stored in IndexedDB; calibration settings in localStorage. Clearing site data or browser history will erase both. Export your GeoJSON file regularly as a backup.",
            },
            {
              q: "Can I contribute my data to a shared noise map?",
              a: "Yes — Noisecatcher has a built-in P2P community layer powered by Gun.js. Enable it on the map via the P2P toggle: your pins are shared in real time with nearby users without any central server. Sensitive categories (conflict, police force, harassment) require an explicit confirmation before sharing and are never shared silently. You can also export your data as GeoJSON and contribute it manually to Noise Planet (noise-planet.org) or OpenStreetMap-based noise mapping initiatives.",
            },
            {
              q: "What is the difference between a pin and a report?",
              a: "A pin is a single point-in-time reading — one dB value, one location, one timestamp. A report is a full session summary covering an entire measurement period: Leq, percentiles, noise dose, psychoacoustics, and more. Use pins to map the spatial distribution of noise; use reports to document sustained exposure over time.",
            },
            {
              q: "How do I build a dossier for a formal noise complaint?",
              a: "Create a notebook for the noise problem. Over several days and times of day, use Stop & Report to generate session reports and attach them to the notebook. Add voice notes describing what you hear and how it affects you. Drop pins on the map to show the spatial pattern. When ready, print each report to PDF and export your pins as GeoJSON. Together these form a structured, time-stamped dossier.",
            },
            {
              q: "The microphone permission was denied. How do I fix it?",
              a: (
                <span>
                  <strong className="nc-text">Android (Chrome):</strong> tap the lock icon in the address bar → Site settings → Microphone → Allow. Reload the page.
                  <br /><br />
                  <strong className="nc-text">iPhone (Safari):</strong> Settings app → Safari → Advanced → Website Data, or Settings → Privacy & Security → Microphone → enable for Safari. Then reload.
                  <br /><br />
                  <strong className="nc-text">Desktop Chrome:</strong> Click the camera/mic icon in the address bar → Always allow on this site. Or: chrome://settings/content/microphone → add the site.
                </span>
              ),
            },
          ].map(({ q, a }) => (
            <div key={q} className="flex flex-col gap-1.5 nc-divider-b pb-5 last:border-0 last:pb-0">
              <p className="text-sm font-semibold nc-text">{q}</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Footer links ── */}
      <div className="nc-surface rounded-xl p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>
          Explore further
        </p>
        {[
          { href: "/abecedaire", label: "Glossary — noise concepts & definitions", icon: BookOpen },
          { href: "/carnets",    label: "Notebooks — your field notebooks",          icon: BookMarked },
          { href: "/act",        label: "Act — what to do with your measurements",   icon: Zap },
          { href: "/about",      label: "About — methodology & technical notes",     icon: HelpCircle },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 text-sm transition-colors"
            style={{ color: "var(--nc-text-2)" }}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--nc-text-3)" }} />
            {label}
            <ChevronRight className="w-3.5 h-3.5 ms-auto shrink-0" style={{ color: "var(--nc-text-3)" }} />
          </Link>
        ))}
      </div>

    </div>
  );
}
