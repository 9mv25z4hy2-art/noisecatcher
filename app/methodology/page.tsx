"use client";

import { ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function MethodologyPage() {
  const { t, locale } = useI18n();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-10">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold nc-text">Methodology</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          How Noisecatcher measures sound, what the numbers mean, what they cannot prove,
          and how to use them as evidence.
        </p>
      </div>

      {locale !== "en" && t.en_only_notice && (
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
          role="note"
        >
          🌐 {t.en_only_notice}
        </div>
      )}

      {/* ── Measurement science ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Measurement science</h2>

        <div className="nc-surface rounded-xl p-5 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">How the dB(A) reading is produced</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            Noisecatcher captures audio via the Web Audio API and runs a 2048-point FFT on every animation
            frame (~60 Hz). Each frequency bin is weighted by the IEC 61672-1:2013 A-weighting formula
            before the energy is summed and converted back to decibels. A-weighting reflects the ear&apos;s
            reduced sensitivity to low and very-high frequencies, giving readings close to true dB(A)
            without requiring specialised hardware.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            A user-adjustable calibration offset (±35 dB, persisted in localStorage) lets you anchor readings
            against a known reference — typically a quiet environment or a calibrated meter. This is a single
            additive correction applied uniformly across the spectrum; it compensates for microphone sensitivity
            but not for the device&apos;s frequency-response curve.
          </p>
        </div>

        <div className="nc-surface rounded-xl p-5 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">Smartphone accuracy — what the research says</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            Kardous &amp; Shaw (JASA, 2014) tested 192 sound measurement apps against a Class 1 SLM.
            Only 4 iOS apps achieved within ±2 dB across the 65–95 dB test range. Zero Android apps
            met the ±2 dB criterion — attributed to OS fragmentation and inconsistent hardware
            integration. A 2016 follow-up found external calibrated microphones substantially improved
            accuracy on all platforms. Murphy &amp; King (Applied Acoustics, 2016) tested 1,472 measurements
            on 100 phones; one app was within 1 dB(A) of true levels.
          </p>
          <div className="nc-surface rounded-lg overflow-hidden">
            {[
              { condition: "Uncalibrated, built-in mic", accuracy: "±5–10 dB", use: "Rough screening only" },
              { condition: "Calibrated, flagship iOS, selected app", accuracy: "±2–3 dB", use: "Community monitoring, trend documentation" },
              { condition: "Calibrated app + external calibrated mic", accuracy: "±1–2 dB", use: "Approaches Class 2 SLM accuracy" },
              { condition: "Regulatory / occupational assessment", accuracy: "Not met", use: "Requires certified Class 1/2 SLM" },
            ].map(({ condition, accuracy, use }) => (
              <div key={condition} className="grid grid-cols-3 gap-2 px-4 py-3 nc-divider-t first:border-t-0 text-xs">
                <span style={{ color: "var(--nc-text-2)" }}>{condition}</span>
                <span className="font-mono font-semibold nc-text">{accuracy}</span>
                <span style={{ color: "var(--nc-text-3)" }}>{use}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
            Sources: Kardous &amp; Shaw, JASA 2014 &amp; 2016; Murphy &amp; King, Applied Acoustics 2016.
            Android accuracy has improved on newer flagship devices but remains variable across manufacturers.
          </p>
        </div>

        <div className="nc-surface rounded-xl p-5 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">dBC and dBZ — low-frequency weighting</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            Noisecatcher also computes C-weighted (dBC) and unweighted (dBZ) levels from the same FFT data,
            displayed in the Spectral Weighting panel during live measurement. A-weighting suppresses
            frequencies below ~200 Hz by up to 40 dB, making it blind to low-frequency industrial noise
            from data centres, shipping yards, HVAC systems, and freight infrastructure that causes
            documented health harm.
          </p>
          <div className="nc-surface rounded-lg overflow-hidden mt-1">
            {[
              { label: "dBA", desc: "A-weighted — standard environmental and health measurement (IEC 61672). Attenuates below 200 Hz and above 10 kHz." },
              { label: "dBC", desc: "C-weighted — retains energy to ~16 Hz. Use when documenting LFN from machinery, generators, or transport infrastructure (ISO 1996)." },
              { label: "dBZ", desc: "Unweighted — flat response, full spectrum. Use for forensic documentation where no frequency preference is appropriate." },
            ].map(({ label, desc }) => (
              <div key={label} className="flex gap-3 px-4 py-3 nc-divider-t first:border-t-0">
                <span className="font-mono text-xs font-semibold nc-text w-8 shrink-0 mt-0.5">{label}</span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
            A dBC − dBA difference of more than 6 dB indicates significant low-frequency content —
            a signal worth investigating and categorising as LFN in your pin description.
          </p>
        </div>

        <div className="nc-surface rounded-xl p-5 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">Statistical metrics — Leq, L10, L50, L90</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            During a session, Noisecatcher accumulates individual dBA readings and computes:
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Leq", def: "Equivalent continuous sound level — energy average over the session. The standard metric for long-term noise assessment (ISO 1996)." },
              { label: "L10", def: "Exceeded 10% of the time — captures loud intrusions and peaks. Relevant for traffic noise regulation." },
              { label: "L50", def: "Exceeded 50% of the time — the median. Represents the 'typical' noise level during the session." },
              { label: "L90", def: "Exceeded 90% of the time — background level. Useful for baseline documentation: what the environment sounds like at its quietest." },
            ].map(({ label, def }) => (
              <div key={label} className="flex gap-3">
                <span className="font-mono text-xs font-semibold nc-text w-8 shrink-0 mt-0.5">{label}</span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Psychoacoustic metrics ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Psychoacoustic metrics</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Decibels measure energy. They do not measure how sound is perceived or what damage it causes.
          Noisecatcher computes four psychoacoustic metrics using the Zwicker model (ISO 532-1), which
          better reflects the physiological and psychological impact of complex sounds.
        </p>
        <div className="nc-surface rounded-xl overflow-hidden">
          {[
            {
              label: "Loudness",
              unit: "sone",
              def: "Perceived volume — how loud the sound subjectively feels, not merely how much energy it carries. Non-linear: a doubling of sone value corresponds to a perceived doubling of loudness.",
            },
            {
              label: "Sharpness",
              unit: "acum",
              def: "Concentration of energy in high frequencies. High sharpness values (>2 acum) indicate sounds perceived as harsh or piercing — relevant for machinery, sirens, and acoustic deterrent devices.",
            },
            {
              label: "Roughness",
              unit: "asper",
              def: "Rapid amplitude modulation (15–300 Hz) producing a grating, unpleasant sensation. High roughness characterises aggressive sounds — grinding machinery, distorted loudspeakers, diesel engines under load.",
            },
            {
              label: "Psychoacoustic Annoyance",
              unit: "PA",
              def: "A combined index (Zwicker-Fastl) integrating loudness, sharpness, and roughness into a single annoyance score. Better predicts community complaint rates than dBA alone.",
            },
          ].map(({ label, unit, def }) => (
            <div key={label} className="flex gap-3 px-4 py-3 nc-divider-t first:border-t-0">
              <div className="w-32 shrink-0">
                <p className="text-xs font-semibold nc-text">{label}</p>
                <p className="font-mono text-[10px]" style={{ color: "var(--nc-text-3)" }}>{unit}</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{def}</p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          All psychoacoustic metrics are computed in JavaScript from the FFT data and are approximations
          of the ISO 532-1 model. They are indicative, not certified measurements. Cross-reference with
          a specialist if these values are to be used in formal proceedings.
        </p>
      </section>

      {/* ── Ecological metrics ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Ecological metrics</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The same FFT the meter computes for noise measurement also encodes information about the
          ecological health of the acoustic environment. Two indices are computed during live sessions:
        </p>

        <div className="nc-surface rounded-xl p-5 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">NDSI — Normalized Difference Soundscape Index</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            NDSI measures the ratio of biological sound energy (biophony: 2–8 kHz) to human-generated
            sound energy (anthrophony: 200 Hz–2 kHz) in the recording:
          </p>
          <div
            className="font-mono text-sm text-center py-3 rounded-lg"
            style={{ background: "var(--nc-bg-raised)", color: "var(--nc-text)" }}
          >
            NDSI = (biophony − anthrophony) / (biophony + anthrophony)
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { range: "+0.4 to +1.0", label: "Biologically dominated — ecological refuge", color: "#4ade80" },
              { range: "+0.1 to +0.4", label: "Mixed — moderate biological activity", color: "#86efac" },
              { range: "−0.2 to +0.1", label: "Anthropophony beginning to dominate", color: "#fb923c" },
              { range: "−1.0 to −0.2", label: "Strongly anthropogenic — biological sound suppressed", color: "#f87171" },
            ].map(({ range, label, color }) => (
              <div key={range} className="flex items-center gap-3">
                <span className="font-mono text-[10px] w-28 shrink-0 tabular-nums" style={{ color }}>{range}</span>
                <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
            NDSI was developed by Pijanowski et al. (2011) for soundscape ecology. In Noisecatcher it
            provides a real-time biodiversity health reading alongside the noise pollution measurement.
            NDSI is suppressed when total band energy is below the noise floor (silence, or indoor
            environments with no meaningful biophony signal). <strong className="nc-text">Important limitation:</strong> the
            frequency band assignments (1–2 kHz for anthrophony; 2–8 kHz for biophony) are not universal
            — many anthropogenic sources emit above 2 kHz; many biological calls occur below 2 kHz.
            NDSI should be used as a comparative, relative indicator — same location over time, or different
            locations on the same device — not as an absolute biodiversity score. A 2024 JASA paper
            (&ldquo;Rethinking ecoacoustic indices&rdquo;) calls for reconsidering the conceptual foundations of NDSI
            and related indices.
          </p>
        </div>

        <div className="nc-surface rounded-xl p-5 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">ACI — Acoustic Complexity Index</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            ACI (Farina 2010) measures the variability of spectral energy across time. Natural biological
            soundscapes produce rapidly varying, spectrally complex audio; continuous tonal industrial
            noise (machinery, deterrent devices) produces a low, monotone ACI score.
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              { range: "> 0.30", label: "Complex / natural soundscape — high ecological signal", color: "#4ade80" },
              { range: "0.10–0.30", label: "Mixed soundscape", color: "#fb923c" },
              { range: "< 0.10", label: "Monotone / tonal — possible deterrent, machinery, or HVAC", color: "#f87171" },
            ].map(({ range, label, color }) => (
              <div key={range} className="flex items-center gap-3">
                <span className="font-mono text-[10px] w-20 shrink-0" style={{ color }}>{range}</span>
                <p className="text-xs" style={{ color: "var(--nc-text-2)" }}>{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
            ACI is particularly useful for detecting the Mosquito high-frequency deterrent (17–18.5 kHz):
            its continuous tonal emission produces a sharply anomalous ACI reading in an otherwise natural
            or mixed soundscape. See the HF Deterrent Scanner panel in the meter for direct frequency detection.
            <strong className="nc-text"> Important limitation:</strong> ACI is biased in urban and anthropogenically
            disturbed environments — diverse human-generated sounds inflate ACI values without reflecting
            biological richness. Farina (2025, Oikos) — the original creator — has revisited ACI&apos;s
            theoretical foundations; the index performs inconsistently as a biodiversity proxy across
            ecosystem types (meta-analysis, PMC 2022). Use ACI as a comparative indicator, not a calibrated
            biodiversity measurement.
          </p>
        </div>
      </section>

      {/* ── Known limitations ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Known limitations</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          These are structural gaps, not cosmetic ones. A tool that overstates its own reliability
          is a liability to the communities that depend on it.
        </p>
        <div className="flex flex-col gap-4">
          {[
            {
              n: "1",
              title: "dBZ and dBC only as indicative — LF microphone rolloff uncorrected",
              body: "The dBC and dBZ values computed by Noisecatcher apply the correct weighting formulae to the FFT bins, but do not compensate for the microphone's own frequency response below ~100 Hz. Consumer MEMS microphones roll off sharply at low frequencies — some attenuate 20 Hz signals by 15–25 dB compared to 1 kHz. The dBC − dBA difference is therefore informative as a relative indicator of LF content, but absolute dBC/dBZ readings should not be treated as calibrated measurements without a device-specific compensation curve.",
            },
            {
              n: "2",
              title: "Device microphone frequency response not corrected",
              body: "A-weighting and the calibration offset together bring the mid-frequency range (200 Hz–8 kHz) close to true dB(A) for most devices. Very low and very high frequencies remain device-dependent. Readings are internally consistent within a single device and session; they are not comparable across different phone models without cross-calibration against a certified Class 1 or Class 2 sound level meter (IEC 61672-1:2013 — note: older ANSI terminology used ‘Type 1/2’; IEC 61672 replaced this with ‘Class 1/2’).",
            },
            {
              n: "3",
              title: "Shared map is P2P, not persistent — data remains device-local",
              body: "Every pin, report, and voice note lives in your browser's IndexedDB. The P2P community layer (Gun.js) lets you share pins with nearby peers in real time, but there is no central server or shared database — Gun relays messages and peers cache what they see. If no peer is online when you publish, your pin is not saved elsewhere. The NoiseCapture GeoJSON export is a file you send manually. Collective evidence-building across time still requires coordination outside the app.",
            },
            {
              n: "4",
              title: "Chain of custody: capture-time hash, but no hardware attestation",
              body: "Noisecatcher computes a SHA-256 hash of the session data (Leq, peak, L10/50/90, timestamp, GPS, calibration offset) before saving — not at export time. This is better than an export-time hash, but still does not constitute a forensic chain of custody under ISO/IEC 27037: a hash stored in the browser's IndexedDB can be replaced. Forensic-grade evidence additionally requires a hardware-attested timestamp at the moment of capture, an unbroken custody log, and ideally a trusted-timestamp server or immutable storage anchor. The downloadable evidence proof JSON is a useful starting document for formal complaints, not a substitute for certified forensic process.",
            },
            {
              n: "5",
              title: "Longitudinal visualisation: Leq trend, no Lnight/Lday breakdown",
              body: "Noisecatcher now shows a Leq time-series chart across all sessions and within each Field Notebook, with ACI and NDSI sparklines. The WHO Health Risk panel (map page) computes Lnight, Lday, Levening, and Lden from all pins and session reports, with 7-day and 30-day Lnight gauges. What the Leq time-series chart still does not provide is a longitudinal Lnight vs. Lday trend — comparing how night-time and day-time levels evolve across sessions over weeks or months. That requires timestamp-aware aggregation across sessions, which the chart does not yet perform.",
            },
            {
              n: "6",
              title: "Distributed witnessing: shared sessions work, hardware sync does not",
              body: "Multiple phones can now join a shared session via a 6-character code. Live dB readings sync across devices in real time over Gun.js P2P. TDOA (Time Difference of Arrival) triangulation estimates the distance difference and, with 3+ GPS-enabled devices detecting a shared peak, the estimated source position. The remaining limitation is clock accuracy: TDOA precision depends on the arrival timestamps, which are computed from the JavaScript event loop — not a hardware interrupt. Internet latency between peers (typically 20–200 ms) limits triangulation accuracy to tens of metres at best. Hardware-synchronised clocks (GPS-disciplined, IEEE 1588 PTP) would be needed for sub-metre accuracy.",
            },
            {
              n: "7",
              title: "YAMNet classification: training-data bias",
              body: "The YAMNet classifier was trained on AudioSet — YouTube audio predominantly from wealthy, urban, anglophone environments. It displays results down to 2% confidence with no 'unknown' fallback. Misclassification in non-Western acoustic contexts is documented but not surfaced to the user. Treat classification results as starting hypotheses, not verdicts. Your own knowledge of local acoustic culture takes precedence.",
            },
            {
              n: "8",
              title: "NDSI: consumer microphone rolloff affects biophony bands",
              body: "The NDSI biophony band (2–8 kHz) is within the range most consumer microphones handle well. The anthrophony band (200 Hz–2 kHz) includes some low frequencies where microphone response may vary. The index is useful as a relative, comparative measure — comparing the same location at different times, or different locations on the same device — more than as an absolute ecological score.",
            },
            {
              n: "9",
              title: "Psychoacoustic metrics: JavaScript approximations of ISO 532-1",
              body: "Loudness, Sharpness, Roughness, and Psychoacoustic Annoyance follow the Zwicker model implemented in JavaScript from the FFT data. They are indicative, not certified. A respondent's psychoacoustician working from calibrated studio recordings and validated software will produce more reliable values. Use these metrics for awareness and pattern documentation, not as the sole quantitative basis for formal proceedings.",
            },
            {
              n: "10",
              title: "Long-form content is English-only",
              body: "UI strings are translated across 16 locales. The Abécédaire, About, Methodology, and Act pages are hardcoded English JSX. The political ambition of the tool is global; its primary analytical language is not.",
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-3">
              <span className="text-xs font-mono mt-0.5 shrink-0 w-4" style={{ color: "var(--nc-text-3)" }}>{n}</span>
              <div className="flex flex-col gap-1">
                <p className="nc-text text-sm font-medium">{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Forensic documentation ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Forensic documentation of acoustic events</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Forensic Architecture — the research agency at Goldsmiths — has developed rigorous methods
          for making sound into legal evidence. Their work is directly applicable to Noisecatcher data,
          especially in conflict, protest, and political violence contexts.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: "👂",
              title: "Ear witnessing",
              body: "When you cannot record — when a phone marks you as a target, or the event is over before you react — a disciplined description of what you heard is still forensic evidence. Note the sound, its direction, its duration, whether it was continuous or impulsive, how far it seemed to travel, what changed around you. Forensic Architecture reconstructed a torture prison from this kind of testimony alone. Your description field matters.",
            },
            {
              icon: "🔗",
              title: "Multi-source synchronisation",
              body: "Multiple recordings of the same event can be aligned by cross-correlating shared peaks — a siren, a bang, an announcement. This creates a unified timeline harder to dismiss than any single recording. Export your pins with timestamps and coordinate with others to do the same. Convergence of independent records is what makes acoustic evidence robust.",
            },
            {
              icon: "📍",
              title: "Triangulation from multiple positions",
              body: "Sound travels at ~343 m/s. Three or more recordings of the same impulsive event from known GPS positions enable Time Difference of Arrival triangulation to locate the source geometrically. For sudden events — explosions, stun grenades, LRAD bursts — coordinated multi-point recording turns a noise complaint into a spatial argument.",
            },
            {
              icon: "🗂️",
              title: "Evidence packaging",
              body: "Every Noisecatcher export includes GPS, timestamps, bearing, dB reading, and category. Add: your device model, distance and orientation to the source, weather conditions, and any corroborating footage. Note the calibration offset applied, so a technical reviewer can reverse it. The more complete the record, the harder it is to dismiss.",
            },
          ].map((card) => (
            <div key={card.title} className="nc-surface rounded-xl p-4 flex gap-3">
              <span className="text-xl shrink-0 mt-0.5">{card.icon}</span>
              <div className="flex flex-col gap-1">
                <p className="nc-text font-semibold text-sm">{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{card.body}</p>
              </div>
            </div>
          ))}
        </div>
        <a
          href="https://forensic-architecture.org"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: "var(--nc-text-3)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Forensic Architecture — forensic-architecture.org
        </a>
      </section>

      {/* ── AI classification ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">AI sound classification — use with scepticism</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The YAMNet classifier built into Noisecatcher was trained on{" "}
          <strong className="nc-text">AudioSet</strong> — a Google dataset from YouTube videos that
          systematically overrepresents wealthy, urban, English-speaking acoustic environments.
          UrbanSound8K (the other major benchmark) is New York City recordings. ESC-50 is largely European.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          In practice: the AI recognises a New York siren confidently but may misclassify the siren tones
          used in France, the horn patterns of South Asian traffic, or the construction sounds of methods
          that don&apos;t appear in YouTube content. This is structural bias baked into the training data,
          not a bug to be patched.
        </p>
        <div
          className="nc-surface rounded-xl p-4 text-xs leading-relaxed"
          style={{ color: "var(--nc-text-3)" }}
        >
          <strong className="nc-text">How to read AI results:</strong> treat classification as a starting
          hypothesis, not a verdict. Your own knowledge of local acoustic culture — what this sound means
          in this place — takes precedence over the model&apos;s output. Document your own label in the
          pin description. Collecting and labelling local training data from the Global South is an open
          research priority.
        </div>
      </section>

      {/* ── From recording to accountability ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">From recording to accountability — the activism gap</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          A field recorder answers: <em className="nc-text">what did this place sound like?</em>{" "}
          A noise-activism tool must answer: who is causing the sound, who is affected, what are the
          consequences, how does it change over time, and what can be done about it?
        </p>
        <div className="nc-surface rounded-xl overflow-hidden">
          {[
            {
              layer: "Longitudinal evidence",
              status: "live",
              have: "Leq time-series chart across all sessions and per-notebook; ACI/NDSI stored per session and charted longitudinally; GeoJSON export with timestamps",
              missing: "No automated pattern detection or Lnight vs. Lday breakdown",
            },
            {
              layer: "Collective / distributed witnessing",
              status: "live",
              have: "Shared session via 6-char code (Gun.js P2P); live dB sync across devices; TDOA source-distance estimation from peak arrival times; grid-search source position with 3+ GPS devices",
              missing: "No hardware-synchronised clock; TDOA accuracy limited by internet latency between peers",
            },
            {
              layer: "Source attribution",
              status: "partial",
              have: "14 categories + 90+ subcategories; YAMNet ML classifier (521 AudioSet classes); live OpenSky aircraft lookup near GPS position",
              missing: "No permit database integration; aircraft lookup requires GPS and internet",
            },
            {
              layer: "Harm documentation",
              status: "live",
              have: "Structured harm fields (sleep disruption, conversation interference, anxiety 0–5 index, free-text notes); downloadable harm declaration for complaints; harm data included in evidence proof file",
              missing: "Self-reported only — no medical or clinical validation of harm scores",
            },
            {
              layer: "dBC / dBZ measurement",
              status: "live",
              have: "dBC and dBZ computed from existing FFT; spectral weighting panel + LFN warning",
              missing: "Device microphone LF rolloff not compensated — readings are relative, not certified",
            },
            {
              layer: "Speech intelligibility (SII)",
              status: "live",
              have: "ANSI S3.5-1997 SII computed live from FFT 1/3-octave bands; 0–1 score with Good/Fair/Poor/Very poor label; colour-coded bar displayed during measurement",
              missing: "Indicative only — device microphone frequency response not calibrated",
            },
            {
              layer: "Ecological impact (NDSI / ACI)",
              status: "live",
              have: "NDSI and ACI computed live; both stored per session; longitudinal trend chart in Field Notebooks shows ACI and NDSI across sessions",
              missing: "ACI and NDSI are indicative; no certified bioacoustic reference calibration",
            },
            {
              layer: "Legal chain of custody",
              status: "partial",
              have: "SHA-256 of recording blob computed at capture (not export); SHA-256 of session stats (Leq, peak, L10/50/90, timestamp, calibration) computed before saving; downloadable evidence proof JSON; hashes displayed in report and audio panel",
              missing: "No hardware attestation; no IPFS/blockchain anchoring — proof file must be manually timestamped by a trusted third party",
            },
          ].map((row) => {
            const statusColor =
              row.status === "live"
                ? { bg: "rgba(74,222,128,0.12)", color: "rgb(134,239,172)" }
                : row.status === "missing"
                ? { bg: "rgba(239,68,68,0.12)", color: "rgb(252,165,165)" }
                : { bg: "rgba(250,204,21,0.1)", color: "rgb(253,224,71)" };
            return (
              <div key={row.layer} className="px-4 py-3 nc-divider-t first:border-t-0 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold nc-text flex-1">{row.layer}</p>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: statusColor.bg, color: statusColor.color }}
                  >
                    {row.status === "live" ? "✓ live" : row.status === "missing" ? "not yet" : "partial"}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
                  <span className="nc-text">Have: </span>{row.have}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                  <span>Gap: </span>{row.missing}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Advanced sensing techniques ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Advanced sensing techniques</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The smartphone&apos;s greatest advantage is not that it contains a microphone — it is that it
          combines a microphone with GPS, orientation, networking, and computation. These techniques
          leverage the full sensor stack.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: "📡",
              title: "Distributed Soundscape Transect Recording",
              body: "Walk a route through a contested acoustic environment, stopping every 20 metres to make a 30-second Noisecatcher recording with GPS and bearing logged. The result is a linked acoustic portrait of how sound changes across a space, not how one point sounds at one moment. When multiple community members walk parallel transects, the aggregate produces an acoustic map with spatial resolution that no fixed monitoring station can match. Export each pin as GeoJSON and overlay in QGIS to visualise the acoustic gradient.",
            },
            {
              icon: "🔔",
              title: "Transient acoustic profiling",
              body: "Emit a controlled clap or spring-loaded clicker at 1 metre from the phone. The transient propagates outward and reflects from surrounding surfaces back to the microphone. Import the recording into Noisecatcher's audio analyser: the waveform shows the direct sound followed by echoes whose timing reveals the acoustic geometry of the space. Distance to each reflector: d = (c × Δt) / 2, where c ≈ 343 m/s and Δt is the delay between direct and reflected arrivals. Useful for documenting hostile architectural design or creating a permanent acoustic fingerprint of threatened spaces.",
            },
            {
              icon: "🎙️",
              title: "Bypass the DSP layer for accurate measurement",
              body: "Consumer smartphones apply AGC, dynamic range compression, and high-pass filters to the microphone by default. On Android, apps can request the UNPROCESSED audio source (AudioRecord API) to disable these. On iOS, setting CoreAudio to measurement mode disables voice processing. Noisecatcher uses standard Web Audio API constraints with echoCancellation, noiseSuppression, and autoGainControl all set to false — the nearest equivalent available in a browser context. For the most accurate low-frequency and peak measurements in critical situations, record with a dedicated native app that requests raw audio, then import the file into Noisecatcher's audio analyser.",
            },
            {
              icon: "🧭",
              title: "Participatory soundwalk protocol",
              body: "Coordinate a group of community members to walk a shared route simultaneously, each recording with Noisecatcher. Debrief together: project the aggregate pin map and collectively interpret what the measurements mean for your neighbourhood, your planning dispute, or your legal case. Export GeoJSON from all participants, merge the files, and present the aggregate to local authorities or journalists as community-generated evidence. Technical measurements anchor the discussion; collective interpretation gives them political meaning.",
            },
          ].map((card) => (
            <div key={card.title} className="nc-surface rounded-xl p-4 flex gap-3">
              <span className="text-xl shrink-0 mt-0.5">{card.icon}</span>
              <div className="flex flex-col gap-1">
                <p className="nc-text font-semibold text-sm">{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{card.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ecological-Sonic Justice Mapping ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Five-layer acoustic justice mapping</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The same recording made at the same moment can simultaneously answer five distinct questions.
          This is what makes community acoustic monitoring qualitatively different from individual
          noise documentation.
        </p>
        <div className="nc-surface rounded-xl overflow-hidden">
          {[
            {
              layer: "Layer 1 — Noise burden",
              metric: "dB(A) Leq / L10 / L90",
              question: "Is this environment acoustically harmful to human health?",
              tool: "Noisecatcher meter — any session",
            },
            {
              layer: "Layer 2 — Ecosystem health",
              metric: "NDSI · ACI",
              question: "Is human noise overwhelming biological sound? Is wildlife acoustic space compressed?",
              tool: "Live in Noisecatcher meter — ecological metrics panels",
            },
            {
              layer: "Layer 3 — Spatial justice",
              metric: "GPS + category",
              question: "Which communities bear the burden? Where is industrial noise routed?",
              tool: "Every Noisecatcher pin includes GPS + timestamp + category",
            },
            {
              layer: "Layer 4 — Temporal pattern",
              metric: "Timestamp + repeat sessions",
              question: "When does it happen? Is it chronic or episodic? Day vs. night?",
              tool: "Noisecatcher session history; GeoJSON export for time-series analysis",
            },
            {
              layer: "Layer 5 — Human testimony",
              metric: "Voice note + description",
              question: "What does this mean to the people who live here? What is the felt impact?",
              tool: "Noisecatcher voice notes and pin description field",
            },
          ].map((row) => (
            <div key={row.layer} className="px-4 py-3 nc-divider-t first:border-t-0 flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold nc-text">{row.layer}</p>
                <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--nc-text-3)" }}>{row.metric}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{row.question}</p>
              <p className="text-[10px] italic" style={{ color: "var(--nc-text-3)" }}>{row.tool}</p>
            </div>
          ))}
        </div>
        <div
          className="rounded-xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }}
        >
          Sources: Pijanowski et al. (BioScience, 2011); LaBelle, <em>Sonic Agency</em> (Goldsmiths, 2018);
          Gieysztor et al., &apos;Sonic Injustice: A Systematic Review&apos; (2023);
          Brambilla &amp; Pedrielli (Sustainability, 2020).
        </div>
      </section>

      {/* ── Key sources ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Key sources</h2>
        <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          The claims and thresholds in this app are grounded in the following primary literature. Where evidence is contested or evolving, this is noted.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              citation: "WHO/Europe, Environmental Noise Guidelines for the European Region (2018)",
              note: "Primary source for Lden/Lnight thresholds. European regional scope only.",
            },
            {
              citation: "WHO/Europe, Burden of Disease from Environmental Noise (Fritschi et al., 2011)",
              note: "1 million DALYs/year, western Europe — still the primary citation; updated by EEA 2025.",
            },
            {
              citation: "EEA, Environmental Noise in Europe 2025",
              note: "73,000 premature deaths, 1.3 M DALYs, 22,000 new T2D cases, €95.6B economic cost — European scope.",
            },
            {
              citation: "Basner et al., 'Auditory and Non-auditory Effects of Noise on Health' (Lancet, 2014)",
              note: "Most comprehensive systematic review of noise health effects across domains.",
            },
            {
              citation: "Münzel et al., 'Environmental Noise and the Cardiovascular System' (JACC, 2018)",
              note: "Mechanistic cardiovascular pathway: cortisol/adrenaline → NOX2 → ROS → endothelial dysfunction.",
            },
            {
              citation: "Danish nationwide cohort — noise and type 2 diabetes (EHP, 2021; PMC8638828)",
              note: "Foundational study linking traffic noise to T2D incidence, independent of air pollution.",
            },
            {
              citation: "Kardous & Shaw, 'Evaluation of Smartphone Sound Measurement Applications' (JASA, 2014/2016)",
              note: "192 apps tested; 4 iOS within ±2 dB; zero Android met criterion. External mics substantially improve accuracy.",
            },
            {
              citation: "NIOSH, Criteria for a Recommended Standard — Occupational Noise Exposure (1998)",
              note: "REL 85 dB(A)/8h; 3 dB exchange rate. Basis for 100 dB = 15 min safe exposure.",
            },
            {
              citation: "Farina, 'Ecoacoustics: The Temporal Dimensions of Sound in the Ecology of Landscape' (Landscape Ecology, 2014)",
              note: "ACI index; see also Farina (Oikos, 2025) — author revisiting urban ACI limitations.",
            },
            {
              citation: "Jurdak et al. / JASA, 'Rethinking Ecoacoustic Indices' (2024)",
              note: "NDSI frequency-band assignments (1–2 kHz / 2–8 kHz) critiqued as arbitrary. Review of index validity.",
            },
            {
              citation: "Schafer, R.M., The Tuning of the World / The Soundscape (Knopf, 1977; Destiny Books, 1994)",
              note: "Foundational soundscape framework: keynote sounds, soundmarks, hi-fi/lo-fi. ISO 12913 built on this.",
            },
            {
              citation: "ISO 12913-1:2014 / ISO 12913-2:2018 — Acoustics: Soundscape",
              note: "International standard for soundscape assessment; 8-attribute circumplex model used by EU urban planners.",
            },
            {
              citation: "Casey et al., 'Race/Ethnicity, SES, Residential Segregation, and Noise' (EHP, 2017)",
              note: "Foundational US environmental justice noise study — racial disparities in noise exposure, continental scale.",
            },
            {
              citation: "Watkins, A.D., 'Sonic Apartheid' (UCT, 2020) — open.uct.ac.za/handle/11427/32488",
              note: "Noise as postcolonial racial violence; Blikkiesdorp case study, Cape Town.",
            },
          ].map((src) => (
            <div key={src.citation} className="nc-surface rounded-xl px-4 py-3 flex flex-col gap-0.5">
              <p className="text-xs font-semibold nc-text">{src.citation}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>{src.note}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="te-label" style={{ color: "var(--nc-text-3)" }}>
        Methodology updated July 2026. Standards referenced: IEC 61672-1:2013, ISO 1996-1:2016,
        ISO 532-1:2017, ANSI S3.5-1997, ISO/IEC 27037:2012.
      </p>
    </div>
  );
}
