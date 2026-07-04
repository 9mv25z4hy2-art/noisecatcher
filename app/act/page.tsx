"use client";

import Link from "next/link";
import { ExternalLink, FlaskConical } from "lucide-react";
import AdvocacySearch from "@/components/act/AdvocacySearch";
import { useI18n } from "@/lib/i18n/context";

export default function ActPage() {
  const { t, locale } = useI18n();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-10">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold nc-text">{t.act_title}</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          {t.act_subtitle}
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

      {/* ── Noise & inequality ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">
          Noise is not equally distributed
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Noise pollution is an environmental justice issue. Across cities worldwide, low-income
          neighbourhoods, communities of colour, and renters near highways, airports, and industrial
          zones bear a disproportionate noise burden — while having the least political power to
          challenge it.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: "🏫",
              title: "Children & schools",
              body: "WHO recommends ≤35 dB(A) inside classrooms. Schools near expressways routinely exceed 70 dB. Chronic noise impairs reading, memory, and cognitive development. This is not an individual problem — it is a policy failure.",
            },
            {
              icon: "🌙",
              title: "Night workers & shift workers",
              body: "WHO guidelines set 40 dB(A) Lnight for outdoor residential areas. Freight hubs, distribution centres, and transit depots impose a second noise burden on communities that already work night hours.",
            },
            {
              icon: "🏘️",
              title: "Renters & housing precarity",
              body: "Homeowners can move. Tenants often cannot. Noise ordinance enforcement is weaker in areas with lower property values and higher tenant turnover. Documenting patterns over time — exactly what this app enables — is how tenants build cases.",
            },
            {
              icon: "🌿",
              title: "Right to quiet",
              body: "Access to quiet natural soundscapes is an environmental right. The EU's Environmental Noise Directive mandates the protection of 'quiet areas' in agglomerations. Urban green space is not just aesthetic — it is acoustic refuge.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="nc-surface rounded-xl p-4 flex gap-3"
            >
              <span className="text-xl shrink-0 mt-0.5">{card.icon}</span>
              <div className="flex flex-col gap-1">
                <p className="nc-text font-semibold text-sm">{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>
        <a
          href="https://www.who.int/publications/i/item/9789289053563"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: "var(--nc-text-3)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          WHO Environmental Noise Guidelines for the European Region (2018)
        </a>
      </section>

      {/* ── Know the thresholds ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Know the thresholds</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          The WHO Environmental Noise Guidelines (2018) set the following maximum safe levels
          for the European Region. These are recommendations — not legally binding in most
          countries — but they are the scientific basis for noise law across the EU and beyond.
        </p>
        <div className="nc-surface rounded-xl overflow-hidden">
          {[
            { source: "Road traffic",  day: "53 dB(A) Lden",  night: "45 dB(A) Lnight" },
            { source: "Aviation",      day: "45 dB(A) Lden",  night: "40 dB(A) Lnight" },
            { source: "Railway",       day: "54 dB(A) Lden",  night: "44 dB(A) Lnight" },
            { source: "Wind turbines", day: "45 dB(A) Lden",  night: "—" },
            { source: "Leisure venues",day: "70 dB(A) LAeq",  night: "—" },
            { source: "Schools (indoor)", day: "35 dB(A) LAeq", night: "—" },
          ].map((row) => (
            <div key={row.source} className="flex items-center gap-4 px-4 py-3 nc-divider-t first:border-t-0 text-sm">
              <span className="flex-1" style={{ color: "var(--nc-text-2)" }}>{row.source}</span>
              <span className="font-mono text-xs nc-text">{row.day}</span>
              <span className="font-mono text-xs w-28 text-right" style={{ color: "var(--nc-text-3)" }}>{row.night}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          Lden = day-evening-night weighted average. Lnight = 23:00–07:00.
          Most urban environments exceed several of these thresholds.
        </p>
      </section>

      {/* ── Scale of the crisis ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">The scale of the crisis</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          In Europe, noise pollution is the <strong className="nc-text">second largest environmental health risk</strong> after air pollution. The European Environment Agency&apos;s 2025 report quantifies the damage for the first time at full scale.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { stat: "73,000", label: "premature deaths per year in Europe from transport noise (EEA 2025)" },
            { stat: "1.3 M", label: "DALYs (disability-adjusted life-years) lost annually — up from 1 M in 2011" },
            { stat: "22,000", label: "new type 2 diabetes cases per year in Europe linked to noise exposure" },
            { stat: "€95.6 B", label: "estimated annual economic cost of transport noise in Europe (EEA 2025)" },
          ].map((item) => (
            <div key={item.stat} className="nc-surface rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xl font-bold nc-text font-mono">{item.stat}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          These figures cover Europe only. No equivalent global estimate exists — most cities in Sub-Saharan Africa, South Asia, and Latin America have no peer-reviewed noise monitoring data. Among the cities with documented research: Cairo (85–90 dB average street noise, Egyptian NRC); Ho Chi Minh City (103 dB, UN-cited); São Paulo schools (70.3 dB LAeq weekdays, Nature 2026). The absence of data does not mean the absence of harm.
        </p>
        <a
          href="https://www.eea.europa.eu/publications/environmental-noise-in-europe-2025"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: "var(--nc-text-3)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          EEA — Environmental Noise in Europe 2025
        </a>
      </section>

      {/* ── Legal instruments ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Noise as a human rights issue</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Across jurisdictions, courts and legislatures have established that noise pollution is not merely an inconvenience but a violation of fundamental rights. These instruments give your data legal standing.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              title: "ECHR Article 8 — Hatton v. UK (2003)",
              body: "The European Court of Human Rights (Grand Chamber) held that states have positive obligations to protect residents from severe noise under the right to private and family life. Heathrow night flights violated this right. Foundational for noise-based ECHR complaints in all Council of Europe member states.",
            },
            {
              title: "India Supreme Court — Right to life (2005)",
              body: "Forum for Prevention of Environmental and Sound Pollution v. Union of India (2005) SCC 733 ruled that 'freedom from noise pollution is part of the right to life' under Article 21 of the Indian Constitution — one of the strongest constitutional noise rulings globally, leading to a ban on firecrackers between 10pm and 6am.",
            },
            {
              title: "US Noise Control Act (1972) — defunded 1981",
              body: "The only comprehensive US federal noise law was gutted by the Reagan administration in 1981. The EPA Office of Noise Abatement and Control has been unfunded for 45 years. Noise regulation in the US is now fragmented across thousands of local ordinances, with weakest enforcement in the most exposed communities.",
            },
            {
              title: "Colombia Law 2450/2025",
              body: "Latin America's first dedicated national noise law, passed in 2025. Establishes noise limits, monitoring obligations, and enforcement mechanisms — a model for noise legislation in the Global South.",
            },
            {
              title: "Sonic Apartheid — noise as racial geography",
              body: "Research from the University of Cape Town (Alexandra Downing Watkins) documents how forced relocations in post-apartheid Cape Town (including Blikkiesdorp, cleared before the 2010 World Cup) placed Black and Coloured communities in high-noise industrial zones with no political recourse. US studies (Casey et al. 2017; Collins et al. 2020) document the same pattern nationally. Noise burden follows the lines of racial and economic geography — a structural injustice, not an accident.",
            },
          ].map((card) => (
            <div key={card.title} className="nc-surface rounded-xl p-4 flex flex-col gap-1.5">
              <p className="nc-text font-semibold text-sm">{card.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to use your data ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">How to use your measurements</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Noisecatcher readings are <strong className="nc-text">indicative</strong>, not legally certified.
          A smartphone microphone is not a Class 1 or Class 2 sound level meter (IEC 61672-1:2013). This matters for
          how your data can be used.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              title: "What your data CAN do",
              items: [
                "Establish a documented pattern over time (recurring noise, specific times)",
                "Support a complaint with timestamped, geolocated evidence",
                "Demonstrate which WHO thresholds are routinely exceeded",
                "Strengthen a collective case when combined with other contributors",
                "Accompany a request for official certified measurement",
                "Provide evidence for tenant-landlord disputes",
              ],
              border: "border-green-900",
              dot: "bg-green-600",
              color: "var(--nc-text-2)",
            },
            {
              title: "What your data CANNOT do alone",
              items: [
                "Serve as sole technical evidence in legal proceedings",
                "Replace a certified noise assessment (e.g., for planning disputes)",
                "Prove absolute sound pressure levels with regulatory precision",
              ],
              border: "border-red-900",
              dot: "bg-red-700",
              color: "var(--nc-text-2)",
            },
          ].map((block) => (
            <div key={block.title} className={`nc-surface border ${block.border} rounded-xl p-4 flex flex-col gap-2`}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>
                {block.title}
              </p>
              {block.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${block.dot} shrink-0 mt-1.5`} />
                  <p className="text-sm" style={{ color: block.color }}>{item}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Export your pins as GeoJSON from the{" "}
          <Link href="/map" className="underline underline-offset-2" style={{ color: "var(--nc-text)" }}>map page</Link>.
          The file includes dB readings, timestamps, GPS coordinates, bearing, category, pin status, and description —
          enough to build a documented case. The export is also compatible with{" "}
          <strong className="nc-text">NoiseCapture</strong> (Université Gustave Eiffel),
          the open-source citizen noise sensing platform, so your data can feed directly into community datasets.
        </p>

        {/* ── Dossier + Longitudinal CTA ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2">
          <Link
            href="/dossier"
            className="nc-surface rounded-xl p-4 flex flex-col gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📄</span>
              <span className="nc-text font-semibold text-sm">Evidence Dossier</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              Select pins, compute statistics, add legal context, and generate a print-ready complaint document — ready to file with a council, tribunal, or ECHR submission.
            </p>
          </Link>
          <Link
            href="/longitudinal"
            className="nc-surface rounded-xl p-4 flex flex-col gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📈</span>
              <span className="nc-text font-semibold text-sm">Longitudinal change</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
              See how sound levels at specific locations have changed over time — the tool for documenting sonic displacement in gentrifying neighbourhoods and post-conflict areas.
            </p>
          </Link>
        </div>
      </section>

      {/* ── Methodology link card ── */}
      <Link
        href="/methodology"
        className="nc-surface rounded-xl p-4 flex items-start gap-3 transition-opacity hover:opacity-80"
        style={{ border: "1px solid var(--nc-border-mid)" }}
      >
        <FlaskConical className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--nc-text-3)" }} />
        <div className="flex flex-col gap-0.5">
          <p className="nc-text font-semibold text-sm">Measurement methodology</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            Forensic documentation techniques, acoustic science (dBA / dBC / dBZ / NDSI), AI classification
            caveats, chain-of-custody guidance, advanced smartphone sensing, and known limitations —
            all on the Methodology page.
          </p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1" style={{ color: "var(--nc-text-3)" }} />
      </Link>

      {/* ── Community data & Noise-Planet ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Community data &amp; Noise-Planet federation</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          You are not measuring alone. <strong className="nc-text">Noise-Planet</strong> aggregates millions of dB(A)
          readings contributed by NoiseCapture users worldwide into an open, queryable map.
          In Noisecatcher, you can overlay this community data directly on your map — and export your pins back
          in NoiseCapture-compatible GeoJSON to contribute to the commons.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: "🌍",
              title: "Overlay community data",
              body: "The Noise-Planet community layer shows crowdsourced noise measurements from around the world. Use it to contextualise your own readings, identify chronic hotspots others have documented, and understand your neighbourhood in a global acoustic frame.",
            },
            {
              icon: "📤",
              title: "Export as NoiseCapture GeoJSON",
              body: "Your pins export in a format compatible with NoiseCapture and the OGC standard. Each feature carries laeq, timestamp, GPS coordinates, category, pin status (predicted/active/historical), and description. Attach this file to complaints, submit it to environmental agencies, or share it with researchers.",
            },
            {
              icon: "📊",
              title: "Collective cases are stronger",
              body: "A single measurement establishes a data point. A month of measurements establishes a pattern. A neighbourhood of measurements — yours and your neighbours', overlaid with community data — establishes a crisis. Environmental agencies and courts respond to spatial patterns, not isolated incidents.",
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
          href="https://noise-planet.org"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: "var(--nc-text-3)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Noise-Planet — open crowdsourced noise science (Université Gustave Eiffel)
        </a>
      </section>

      {/* ── Template complaint ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">{t.act_template_title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Adapt this to your situation. Attach your exported GeoJSON or screenshots as supporting evidence.
        </p>
        <div className="nc-surface rounded-xl p-5 text-sm leading-relaxed font-mono whitespace-pre-wrap" style={{ color: "var(--nc-text-2)" }}>
{`Subject: Formal noise complaint — [address / location]

To whom it may concern,

I am writing to report persistent noise pollution at [location],
which I have documented using the Noisecatcher noise monitoring
application.

Measurements taken on [dates] between [times] recorded levels of
[X] dB(A), exceeding the WHO Environmental Noise Guideline of
[relevant threshold] dB(A) for [road traffic / aviation / industrial]
noise.

This noise is [recurring / constant] and has caused [describe
impact: sleep disruption, health effects, inability to work, etc.].

I am requesting:
1. An official noise assessment of [location] by a certified
   acoustic engineer.
2. Enforcement of applicable noise regulations.
3. A written response to this complaint.

Supporting documentation is enclosed.

Yours sincerely,
[Name, address, contact]`}
        </div>
      </section>

      {/* ── Worldwide Advocacy (searchable) ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">
          {t.act_worldwide_title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Official reporting channels, environmental agencies, legal frameworks, and advocacy
          organisations — covering 30+ countries across all world regions.
        </p>
        <AdvocacySearch />
      </section>

      {/* ── General advocacy orgs ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">{t.act_advocacy_title}</h2>
        {[
          { label: "Noise Abatement Society (UK)", href: "https://www.noiseabatementsociety.com" },
          { label: "Noise Free America", href: "https://www.noisefree.org" },
          { label: "Quiet Communities (USA)", href: "https://www.quietcommunities.org" },
          { label: "Right to Quiet Society (international)", href: "https://www.quiet.org" },
          { label: "Bruitparif — observatoire du bruit en Île-de-France", href: "https://www.bruitparif.fr" },
          { label: "Earshot NGO — acoustic advocacy", href: "https://www.earshot.ngo" },
          { label: "Noise Planet — open noise science", href: "https://noise-planet.org" },
          { label: "End Transport Poverty (UK)", href: "https://www.endtransportpoverty.org" },
          { label: "Réseau Action Climat (France)", href: "https://reseauactionclimat.org" },
          { label: "European Environment Agency — noise data", href: "https://www.eea.europa.eu/themes/human/noise" },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "var(--nc-text-2)" }}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {label}
          </a>
        ))}
      </section>

      {/* ── Emergency field protocols ── */}
      <section className="flex flex-col gap-6">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">Field protocols — high-risk situations</h2>
        <p className="text-sm" style={{ color: "var(--nc-text-2)" }}>
          These protocols apply when you are documenting in dangerous conditions. Adapt them to your local legal context.
          In all cases: <strong>your safety first, documentation second.</strong>
        </p>

        {/* Sonic warfare / LRAD */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}>
          <h3 className="font-semibold text-sm nc-text">🔊 Sonic warfare / LRAD / acoustic weapons</h3>
          <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
            <li>• <strong>Move perpendicular, not back.</strong> LRAD beams are narrow (~15–30°). Stepping sideways cuts intensity faster than retreating.</li>
            <li>• <strong>Protect your ears immediately.</strong> Foam earplugs reduce exposure by ~30 dB. Cupping hands over ears is a stopgap. Hearing damage from a single LRAD exposure is permanent.</li>
            <li>• <strong>Start recording before the event.</strong> Capture at minimum: bearing, distance estimate, number of pulses, any warning given. Noisecatcher logs GPS + Leq automatically.</li>
            <li>• <strong>Note the operator</strong> (police unit, vehicle markings, private security) and any crowd size or conditions. This is essential for legal accountability.</li>
            <li>• <strong>Document after:</strong> note any tinnitus, hearing loss, dizziness, or nausea — these are symptoms of acoustic trauma and may support a legal complaint.</li>
            <li>• <strong>Do not aim your phone directly at the LRAD transducer</strong> at close range; the microphone membrane can be damaged.</li>
          </ul>
        </div>

        {/* Protest / civil unrest */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}>
          <h3 className="font-semibold text-sm nc-text">✊ Protest / civil unrest</h3>
          <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
            <li>• <strong>Record continuously from the start,</strong> not only when sound levels spike. Timestamp gaps are exploited in court to dispute the sequence of events.</li>
            <li>• <strong>Log the quiet too.</strong> A pin documenting baseline crowd noise before police deployment establishes reference; a second pin after documents the escalation.</li>
            <li>• <strong>Keep your screen dim and notifications silent.</strong> Bright screens draw attention; notification sounds can trigger alerts from crowd control.</li>
            <li>• <strong>Enable airplane mode + Wi-Fi only</strong> if you suspect IMSI catcher surveillance — GPS still works without mobile data.</li>
            <li>• <strong>Back up continuously.</strong> Use Noisecatcher&apos;s export to send pins to a secure cloud or a trusted contact before any detention risk.</li>
            <li>• <strong>Know your legal rights</strong> to record in public in your jurisdiction before you attend. In most democracies, audio recording in public is lawful; some require all-party consent.</li>
          </ul>
        </div>

        {/* Police arrest / detention */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}>
          <h3 className="font-semibold text-sm nc-text">🚔 Police arrest / detention</h3>
          <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
            <li>• <strong>Export and share your data before arrest becomes likely.</strong> Once your device is seized, recordings may be inaccessible or deleted.</li>
            <li>• <strong>Use a strong PIN, not biometrics.</strong> In many jurisdictions, police can compel biometric unlock; a PIN requires a court order.</li>
            <li>• <strong>Note the time of arrest</strong> and any sounds during detention: commands given, weapons used, ambient noise level. You can reconstruct a log later from memory.</li>
            <li>• <strong>Request a lawyer before any interview.</strong> Do not discuss your recordings or documentation methods without legal counsel.</li>
            <li>• <strong>After release,</strong> write a detailed account immediately including all acoustic events (flash-bangs, sirens, shouting, crowd noise) with approximate times.</li>
          </ul>
        </div>

        {/* Border control / checkpoint */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}>
          <h3 className="font-semibold text-sm nc-text">🚧 Border control / checkpoint</h3>
          <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
            <li>• <strong>Document before you reach the checkpoint</strong> — once officers have visual contact, open recording is difficult. Use a timed session from inside a bag if legally permitted.</li>
            <li>• <strong>Record checkpoint soundscape as evidence:</strong> loudspeaker commands, vehicle noise, alarm systems, and the frequency/volume of orders given can document degrading treatment.</li>
            <li>• <strong>Keep data encrypted and backed up remotely</strong> before crossing. Border agents in many countries may search devices without a warrant.</li>
            <li>• <strong>If a device is seized,</strong> note the time, the officer&apos;s name or badge number, and any receipts given. Report to a digital rights organisation (EFF, Access Now, Reporters Without Borders).</li>
            <li>• <strong>Log GPS coordinates</strong> at the checkpoint. For occupied territories, this georeferenced data is valuable to human rights organisations.</li>
          </ul>
        </div>

        {/* White supremacist attack / far-right violence */}
        <div className="flex flex-col gap-2 p-4 rounded-xl" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}>
          <h3 className="font-semibold text-sm nc-text">⚠️ White supremacist attack / far-right violence</h3>
          <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
            <li>• <strong>Safety first: leave the area</strong> if you can do so safely. Do not stay to document if doing so puts you at direct physical risk.</li>
            <li>• <strong>From a safe distance,</strong> capture audio continuously. Far-right intimidation relies heavily on amplified sound: bullhorns, vehicle horns, coordinated chanting. These are acoustic evidence of targeted harassment.</li>
            <li>• <strong>Record slurs, threats, and commands verbatim</strong> in a text note immediately after. Audio corroboration of specific language strengthens hate crime reporting.</li>
            <li>• <strong>Log the category as &quot;Fascism / far-right violence&quot;</strong> in Noisecatcher with an accurate description. GPS, timestamp, and Leq make the record harder to dismiss.</li>
            <li>• <strong>Report to:</strong> local police (request a hate crime reference number), national extremism monitoring organisations (HOPE not hate, ADL, SOS Racisme, etc.), and anti-fascist legal support networks.</li>
            <li>• <strong>Share your export</strong> with a trusted contact or organisation before any police interaction — recordings of hate crimes have been seized and suppressed.</li>
          </ul>
        </div>
      </section>

      {/* ── From measurement to justice practice ── */}
      <section className="flex flex-col gap-4">
        <h2 className="nc-text font-semibold text-base nc-divider-b pb-2">From measurement to justice practice</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          Measurement alone is not a justice practice. A noise map without community interpretation is just
          another dataset — one that can be absorbed by the same planning systems that produced the injustice.
          The methods below move from recording to power: they build community capacity to interpret, contest,
          and act on acoustic data.
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: "🗺️",
              title: "Participatory soundscape evaluation",
              body: "Rather than delegating interpretation to technical experts, gather community members to collectively score acoustic environments. Walk a route together; record at each stop; then sit together and name what you heard, what it meant, and what it should mean for planning decisions. Technical measurements become evidence when a community has collectively decided what they prove. Export from Noisecatcher and project the pin map as a focus for group interpretation.",
            },
            {
              icon: "🎨",
              title: "Graphic scoring & emotional body mapping",
              body: "Quantitative dB readings cannot capture the felt impact of living inside a noise environment. Graphic scoring — drawing the shape of a sound, its rhythm, its violence — and emotional body mapping — locating where noise is felt in the body — allow non-technical participants to contribute testimony that numbers alone cannot produce. Combine these with Noisecatcher voice notes and pin descriptions to build a multi-register evidence corpus.",
            },
            {
              icon: "📻",
              title: "Live archiving",
              body: "Record and share audio immediately, creating a real-time civic record before the event is reframed by official narrative. Radio With Palestine (RWP) demonstrates this method at scale: broadcasting unedited audio from occupied territories produces what it calls 'flat listening' — an omnidirectional document of the full acoustic context. At a local scale: stream or upload your Noisecatcher recordings in real time to a shared folder, a community radio station, or a Signal group. The distributed archive is harder to suppress than any single recording.",
            },
            {
              icon: "🔍",
              title: "Acoustic counter-mapping",
              body: "Official strategic noise maps are computed from infrastructure data — they model major sources but miss secondary ones, produce annual averages that conceal peak exposures, and tend to be more accurate in wealthier areas where monitoring infrastructure already exists. Counter-mapping fills these gaps: use Noisecatcher to measure where official maps are silent, document temporal patterns the averages erase, and produce an evidence base for community advocacy. Export your pins as GeoJSON and overlay them on official map data to show the gap between what the model predicts and what residents experience.",
            },
            {
              icon: "🏛️",
              title: "Collective evidence-building",
              body: "A single measurement is a data point. A month of measurements is a pattern. A neighbourhood of measurements is a case. Coordinate with neighbours, community organisations, or local journalists to build overlapping, independent records of the same acoustic environment. Noisecatcher's GeoJSON export is compatible with NoiseCapture (Université Gustave Eiffel) — your pins can feed directly into community datasets. Environmental agencies and planning authorities respond to spatial patterns, not isolated incidents.",
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
        <div
          className="rounded-xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }}
        >
          Sources: LaBelle, B., <em>Sonic Agency</em> (Goldsmiths Press, 2018); Gieysztor et al.,
          &apos;Sonic Injustice: A Systematic Review&apos; (2023); Maisonneuve et al., &apos;NoiseTube&apos; (IFIP, 2009);
          Columbia University Libraries / Openwork, &apos;Being Heard&apos; (2024).
        </div>
      </section>

      <p className="te-label" style={{ color: "var(--nc-text-3)" }}>
        Links verified June 2026. Noisecatcher does not endorse or control external sites.
      </p>
    </div>
  );
}
