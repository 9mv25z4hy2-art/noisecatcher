"use client";

import Link from "next/link";
import { ExternalLink, FileText, Bug, Heart, FlaskConical } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function AboutPage() {
  const { t, locale } = useI18n();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--nc-text)" }}>{t.about_title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--nc-text-3)" }}>A tool for social and sonic justice, public health, research, journalism, and art.</p>
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

      {/* Mission */}
      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">What this is</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Noisecatcher is a free, open web application that gives anyone with a smartphone
          the ability to measure noise pollution in real time, understand its health
          consequences, and contribute to a living global map of acoustic environments.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          It is part of the <em className="text-white">Politics of Noise</em> project —
          an ongoing artistic, academic, and civic research practice conducted by Sylvain Souklaye.
          Its goal is to democratize the kind of acoustic monitoring work that has historically been
          restricted to institutions, and to create the infrastructure for communities
          to document, contest, and act on noise as an environmental and social justice issue.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          The app covers <strong className="text-gray-300">14 noise source categories</strong> —
          traffic, emergency, municipal, construction, industrial, entertainment, neighbourhood,
          recreational vehicles, natural events, conflict zones, police brutality,{" "}
          <strong className="text-gray-300">harassment &amp; gender-based / LGBTQ+ violence</strong>,{" "}
          <strong className="text-gray-300">political violence</strong>, and{" "}
          <strong className="text-gray-300">phone noise pollution</strong> — with 90+ specific
          subcategories for precise documentation.
          The <em className="text-white">Abécédaire</em> now contains{" "}
          <strong className="text-gray-300">107 entries</strong> spanning acoustics, health, law,
          environment, and critical theory, including sonic warfare, acoustic racism, psychoacoustic
          annoyance, machine listening, federated noise sensing, and political violence acoustics.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          New in this version: a real-time{" "}
          <strong className="text-gray-300">spectrogram</strong> and statistical metrics
          (Leq, L10, L50, L90) during measurement sessions; audio file{" "}
          <strong className="text-gray-300">import and analysis</strong> with waveform, spectrogram,
          acoustic statistics, and{" "}
          <strong className="text-gray-300">YAMNet ML sound classification</strong> (521 AudioSet classes);
          live <strong className="text-gray-300">psychoacoustic metrics</strong> (Loudness, Sharpness,
          Roughness, Psychoacoustic Annoyance — Zwicker model); timestamp markers during recording;
          temporal pin status (predicted / active / historical); and{" "}
          <strong className="text-gray-300">Noise-Planet community data federation</strong> — overlay
          crowdsourced measurements on the map and export pins as NoiseCapture-compatible GeoJSON.
        </p>
      </section>

      {/* Social & sonic justice — research — journalism — art */}
      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">Social &amp; sonic justice · Research · Journalism · Art</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Noisecatcher is a tool for{" "}
          <strong className="text-gray-300">social and sonic justice</strong> —
          the position that acoustic environments are shaped by power, and that the right
          to a liveable soundscape is a political right unevenly distributed along the
          axes of class, race, gender, and geography. Measuring noise is not neutral.
          It is an act of naming what the powerful prefer to leave unnamed.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          It is a tool for{" "}
          <strong className="text-gray-300">public health documentation</strong>:
          GPS-timestamped Leq measurements, L10/L50/L90 percentile statistics, EU noise dose,
          psychoacoustic annoyance scores, and printable PDF reports that can support formal
          complaints, medical records, and epidemiological research.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          It is a tool for{" "}
          <strong className="text-gray-300">journalism</strong>: structured noise reports
          with statistical metadata, voice notes, GPS coordinates, and categorical tagging
          constitute raw material for investigative documentation of industrial facilities,
          transport infrastructure, construction projects, police operations, or public space harassment.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          It is a tool for{" "}
          <strong className="text-gray-300">academic research</strong>: open data export
          in GeoJSON (NoiseCapture-compatible), statistical session outputs, and the Field Notebooks
          system for building longitudinal, categorised evidence corpora over time.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          It is a tool for{" "}
          <strong className="text-gray-300">art and sonic practice</strong>: the spectrogram,
          psychoacoustic metrics, voice notes, and deep-listening methodology situate
          Noisecatcher inside a tradition of soundscape art, acoustic ecology, and
          counter-forensic practice — from R. Murray Schafer to Forensic Architecture.
          Attending fully to what an acoustic environment contains is both a discipline
          and an aesthetic act.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          The{" "}
          <strong className="text-gray-300">Harassment &amp; gender-based / LGBTQ+ violence</strong>{" "}
          category was built so that women, LGBTQ+ people, and all targets of targeted harassment can build
          a spatial and temporal record of where and when harassment occurs — translating
          lived experience into documented, mappable, dateable evidence.
          It includes dedicated subcategories for LGBTQ+ hate speech, targeted assault, and intimidation,
          alongside existing subcategories for street harassment, stalking, verbal assault, and domestic violence.
          Silence protects perpetrators. A pin, a voice note, and a timestamped reading do not.
        </p>
        <div
          className="rounded-xl px-4 py-4 flex flex-col gap-2"
          style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)" }}
        >
          <p className="text-white text-xs font-semibold uppercase tracking-wider">On measurement and justice</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            The 2023 systematic review on sonic injustice and Brandon LaBelle&apos;s work on sonic agency both
            converge on a critical limit: <em className="text-white">measurement alone is not a justice practice.</em>{" "}
            A noise map without community interpretation is just another dataset — one that can be absorbed
            by the same planning systems that produced the injustice in the first place.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Recording becomes a justice practice when three conditions are met: community control of the data,
            collective public interpretation of what the data means, and coordinated action that uses it to
            change policy or redistribute power. This is why Noisecatcher gives users full ownership of their
            recordings and pins (stored locally, never transmitted without consent), why the Act page provides
            documentation frameworks rather than just measurement thresholds, and why the Abécédaire names
            the political concepts — sonic injustice, aural counterpublics, acoustic counter-mapping — that
            give measurement its adversarial meaning.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Sources: Gieysztor et al., &apos;Sonic Injustice: A Systematic Review&apos; (2023);
            LaBelle, B., <em>Sonic Agency: Sound and Emergent Forms of Resistance</em> (Goldsmiths Press, 2018).
          </p>
        </div>
      </section>

      {/* Police brutality & Sonic Warfare */}
      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">Police brutality &amp; sonic warfare</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Sound is not only a pollutant — it is a weapon. Police and security forces
          routinely deploy acoustic devices against protesters, journalists, and bystanders:
          LRADs (Long Range Acoustic Devices, maximum specification 162 dB SPL at source — LRAD 2000X manufacturer spec), flash-bang grenades,
          rubber bullet launchers, water cannons, and sustained low-altitude helicopter operations.
          Each causes documented permanent hearing damage, vestibular injury, and psychological trauma.
          Juliette Volcler&apos;s Extremely Loud (The New Press, 2013) documents the global deployment of these
          technologies — and names the political logic that makes them possible: the &quot;non-lethal&quot; classification
          is a terminological sleight of hand that shifts accountability and enables harm without legal consequence.
          The ear has no eyelid. It cannot close.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Noisecatcher has a dedicated{" "}
          <strong className="text-gray-300">Police brutality</strong> category with
          subcategories for each weapon type, alongside the{" "}
          <strong className="text-gray-300">Conflict zone</strong> category for war and
          military contexts. The Abécédaire entries on{" "}
          <strong className="text-gray-300">Police Brutality &amp; Acoustic Violence</strong>,{" "}
          <strong className="text-gray-300">Sonic Warfare</strong>, and{" "}
          <strong className="text-gray-300">LRAD</strong> document the legal frameworks,
          injury records, and global deployment history.
        </p>
        <p className="text-orange-400/90 text-sm leading-relaxed font-medium">
          If you are at a protest or near police acoustic weapons:{" "}
          <span className="text-red-400">protect your hearing first</span> — distance
          yourself, use ear protection if available. Record second. Your GPS-tagged,
          timestamped measurements are civic evidence that can support legal complaints,
          accountability investigations, and press documentation.
        </p>
      </section>

      {/* Why noise */}
      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">Why noise matters</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Noise pollution kills. Chronic exposure to traffic, industrial, and aviation
          noise is linked to cardiovascular disease, stroke, hypertension, impaired
          cognitive development in children, sleep disruption, type 2 diabetes, and psychological trauma.
          In Europe alone — the second largest environmental health risk after air pollution — the
          European Environment Agency (2025) estimates 73,000 premature deaths per year, 1.3 million
          DALYs lost, 22,000 new type 2 diabetes cases, and €95.6 billion in economic costs, all from
          transport noise. These are European figures only: no equivalent global estimate exists.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Noise is also unequally distributed. It follows the geography of poverty, race, and
          dispossession. US federal highway programmes routed infrastructure through low-income
          and minority neighbourhoods at a 90% federal cost-share — institutionalising sonic inequity
          as structural racism (Haskell, 2022; Casey et al., EHP 2017). The same pattern appears
          across post-apartheid Cape Town (Watkins/UCT, 2020), postcolonial Mapuche territories
          (Cárcamo-Huechante, 2022), and cities from Cairo to São Paulo.{" "}
          <em>Mapping noise is mapping power.</em>
        </p>
      </section>

      {/* The Abécédaire */}
      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">The Abécédaire</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          One of Noisecatcher&apos;s core commitments is linguistic: to build a shared
          vocabulary for noise pollution that is both scientifically grounded and
          politically legible. The Abécédaire is a living glossary — expanding over time
          with contributions from researchers, activists, and communities. Its aim is not
          only education but emancipation: to give people the words to name what is
          being done to them.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          It covers the full spectrum: acoustic physics (infrasound, impulse noise, spectrogram, masking,
          psychoacoustic metrics — Loudness, Sharpness, Roughness, PA), health science (hearing loss,
          cardiovascular effects, cognitive development), legal frameworks (WHO guidelines, OSHA,
          environmental law), critical theory (acoustic racism, sonic warfare, police brutality,
          political violence acoustics, Attali&apos;s political economy of noise), civic methodology
          (participatory sensing, federated noise sensing, quiet areas, the right to the city), and
          now ecology — ecoacoustics, open acoustic sensing hardware, and the critique of training data
          bias in AI sound classifiers.
        </p>
      </section>

      {/* Ethos & practice */}
      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold text-base">Ethos &amp; practice</h2>

        <p className="text-gray-400 text-sm leading-relaxed">
          Noisecatcher is not merely a measurement tool. It is an{" "}
          <em className="text-white">electroacoustic instrument</em> — a device that mediates
          between the acoustic world and collective knowledge — and a{" "}
          <em className="text-white">co-presence device</em>: through its peer-to-peer layer,
          listeners who are physically dispersed become acoustically present to one another,
          sharing evidence without a central server. It is also a{" "}
          <em className="text-white">phenomenological instrument</em> — a means of being
          present to sound, to place, and to one another. Its ethos is built on a core
          principle: the human body is the primary sensing device. The smartphone makes
          nothing perceptible that the ear has not already received. The human device is
          the necessary condition for the tech device to exist.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          The smartphone&apos;s greatest technical advantage is not that it contains a microphone.
          It is that it combines a microphone with GPS, compass, accelerometer, and networking —
          making every recording simultaneously an audio file, a location, a direction, and a
          movement trace. Traditional field recording captures sounds. A smartphone captures{" "}
          <em className="text-white">relationships between sounds, places, people, and power.</em>{" "}
          That is the genuinely new methodology that Noisecatcher is built on, and where
          the most promising directions for acoustic justice work are emerging.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          The same recording made at the same moment can answer five distinct questions simultaneously:
          whether the noise level is harmful to human health (dB Leq); whether biological sound is being
          acoustically masked by industrial noise (NDSI — biophony vs. anthrophony ratio); which community
          bears the burden (GPS + category); whether the pattern is chronic or episodic (timestamp + repeat
          sessions); and what it means to the people who live there (voice note + description). No institution
          currently operates a community observatory that combines all five layers. That is what Noisecatcher
          is designed to grow into.
        </p>

        <div className="nc-surface rounded-xl p-4 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">External microphone</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            An external microphone connected to your smartphone is fully supported —
            and often improves measurement accuracy. Lavalier, cardioid, and omnidirectional
            microphones plugged via the headphone jack or USB-C/Lightning adapter are
            detected automatically. When multiple audio input devices are available, a
            device selector appears above the Start button on the Meter screen, letting
            you choose which microphone to use.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Recommended for field recording, documentation at a distance from a sound source,
            or situations where the phone itself cannot be positioned optimally.{" "}
            <Link href="/microphones" className="underline hover:text-gray-300 transition-colors">
              See the Microphones guide →
            </Link>
          </p>
        </div>

        <div className="border border-red-900/50 bg-red-950/20 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-red-400 text-xs font-semibold uppercase tracking-wider">
            Noise-canceling earphones are not allowed
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Earbuds and earphones with active noise cancellation are explicitly
            incompatible with the ethos of Noisecatcher and must not be used during
            a measurement session.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Noise cancellation is a technological solution to a structural problem.
            It addresses noise at the individual, private level — at the cost of
            severing three fundamental connections:
          </p>
          <ul className="flex flex-col gap-2 text-sm text-gray-400 pl-4">
            <li className="leading-relaxed">
              <span className="text-gray-300">People from each other.</span>{" "}
              A listener wearing noise-canceling headphones removes themselves from
              the acoustic commons. They hear less of what others hear. The shared
              sonic condition — the condition that generates solidarity — is dissolved.
            </li>
            <li className="leading-relaxed">
              <span className="text-gray-300">People from their environment.</span>{" "}
              The soundscape carries information: about danger, about place, about
              inequality, about the presence of others. Canceling it cancels the
              evidence. What is not heard cannot be documented, contested, or remembered.
            </li>
            <li className="leading-relaxed">
              <span className="text-gray-300">The self from its own condition.</span>{" "}
              The self is at the center of the listening experience. To cancel ambient
              sound is to remove the self from its own acoustic situation —
              to make oneself less present, not more. Deep listening begins with
              accepting what is there.
            </li>
          </ul>
          <p className="text-gray-500 text-xs leading-relaxed mt-1">
            Noise-canceling technology is a profitable industry built on privatizing
            a response to a public health crisis. Noisecatcher does not participate
            in that privatization. Binaural headsets without active noise cancellation
            are acceptable for listening to recordings and practicing deep listening.
          </p>
        </div>

        <div className="nc-surface rounded-xl p-4 flex flex-col gap-3">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">Deep listening as political act</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            The practice of listening without cancellation — of attending fully to what
            the acoustic environment contains — is both a phenomenological discipline
            and a political stance. It insists that the conditions of noise are real,
            shared, and worth documenting. It refuses the private escape of technological
            mitigation in favour of collective witnessing.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Noisecatcher recordings are acts of testimony. When you measure sound, you
            are naming a condition. When you pin a location, you are making an argument
            about space, power, and the right to a liveable acoustic environment.
            Listening here is social. Listening here is political.
          </p>
        </div>
      </section>

      {/* Methodology link */}
      <Link
        href="/methodology"
        className="nc-surface rounded-xl p-4 flex items-start gap-3 transition-opacity hover:opacity-80"
        style={{ border: "1px solid var(--nc-border-mid)" }}
      >
        <FlaskConical className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--nc-text-3)" }} />
        <div className="flex flex-col gap-0.5">
          <p className="nc-text font-semibold text-sm">Measurement methodology &amp; known limitations</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
            How dBA / dBC / dBZ are computed, NDSI ecological scoring, psychoacoustic metrics,
            forensic chain of custody, AI classification caveats, and all structural limitations
            documented honestly — on the Methodology page.
          </p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1" style={{ color: "var(--nc-text-3)" }} />
      </Link>

      {/* Inspiration & resources */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-white font-semibold text-base">Inspiration &amp; kindred work</h2>
          <p className="text-gray-500 text-xs leading-relaxed mt-1">
            Noise pollution research, advocacy, and community sensing exists on every continent.
            The resources below are organised by theme and geography.
          </p>
        </div>

        {/* Police brutality documentation */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Police brutality &amp; documentation</p>
          {[
            {
              href: "https://www.amnesty.org/en/documents/act30/001/2015/en/",
              label: "Amnesty International — Crowd Control: A Deadly Business (2015) — global review of LRAD, rubber bullets, tear gas",
            },
            {
              href: "https://www.hrw.org/report/2021/01/26/kettling-protesters-bronx/systemic-police-brutality-and-its-costs-united-states",
              label: "Human Rights Watch — Kettling Protesters in the Bronx (2021) — acoustic and physical crowd control documentation",
            },
            {
              href: "https://www.ohchr.org/en/documents/thematic-reports/ahrc4424-situation-human-rights-defenders",
              label: "UN Special Rapporteur — A/HRC/44/24 (2020) — acoustic weapons and protest rights under international law",
            },
            {
              href: "https://desarmons.net",
              label: "Désarmons-les (France) — base de données des blessés par LBD 40, grenades, et armes de maintien de l'ordre",
            },
            {
              href: "https://observatoire-violences-policieres.fr",
              label: "Observatoire des pratiques policières (France) — documentation des violences sonores et physiques",
            },
            {
              href: "https://forensic-architecture.org/investigation/the-use-of-force-in-protests",
              label: "Forensic Architecture — The Use of Force in Protests (acoustic & chemical weapons, spatial audio analysis)",
            },
            {
              href: "https://www.aclu.org/report/politics-dissent",
              label: "ACLU — The Politics of Dissent: Policing Protest in America — sound cannons, LRAD, mass arrests",
            },
            {
              href: "https://theintercept.com/series/standing-rock/",
              label: "The Intercept — Standing Rock investigation — LRAD, water cannon, acoustic harassment of water protectors",
            },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Sonic warfare & protest acoustics */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Sonic warfare &amp; acoustic weapons — theory</p>
          {[
            {
              href: "https://mitpress.mit.edu/9780262515795/sonic-warfare/",
              label: "Steve Goodman — Sonic Warfare: Sound, Affect, and the Ecology of Fear (MIT Press, 2010)",
            },
            {
              href: "https://thenewpress.com/books/extremely-loud",
              label: "Juliette Volcler — Extremely Loud: Sound as a Weapon (The New Press, 2013)",
            },
            {
              href: "https://www.jstor.org/stable/20487960",
              label: "Suzanne Cusick — 'Music as Torture / Music as Weapon' (Transcultural Music Review, 2006)",
            },
            {
              href: "https://www.ohchr.org/en/special-procedures/sr-peaceful-assembly",
              label: "UN Special Rapporteur on Peaceful Assembly — reports on acoustic crowd control devices",
            },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Africa */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Africa</p>
          {[
            { href: "https://nesrea.gov.ng", label: "NESREA Nigeria — National Environmental Noise Standards & enforcement" },
            { href: "https://www.nema.go.ke", label: "NEMA Kenya — Noise & Vibration Pollution Control Regulations (2009)" },
            { href: "https://www.epa.gov.gh", label: "EPA Ghana — community noise regulation" },
            { href: "https://www.dffe.gov.za", label: "DFFE South Africa — NEMA noise provisions" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Asia & Pacific */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Asia &amp; Pacific</p>
          {[
            { href: "https://www.mee.gov.cn/ywgz/dqhj/szhjzl/", label: "中国生态环境部 — 噪声污染防治行动计划 2021–2025 (China MEE National Noise Action Plan)" },
            { href: "https://cpcb.nic.in/noise-polution.php", label: "CPCB India — National Ambient Noise Monitoring Network, 35 cities" },
            { href: "https://www.noiseinfo.or.kr", label: "국가소음정보시스템 — South Korea National Noise Information System" },
            { href: "https://www.env.go.jp/air/noise/", label: "環境省 — 騒音・振動 (Japan Ministry of Environment — Noise & Vibration)" },
            { href: "https://www.nea.gov.sg/our-services/pollution-control/noise-pollution", label: "NEA Singapore — community and construction noise regulation" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Latin America */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Latin America</p>
          {[
            { href: "https://www.mma.gov.br/port/conama/res/res90/res0190.html", label: "CONAMA Brasil — Resolução 001/90, pioneering national noise regulation" },
            { href: "https://www.minambiente.gov.co", label: "MADS Colombia — Resolución 0627/2006, norma nacional de ruido ambiental" },
            { href: "https://www.ibama.gov.br", label: "IBAMA Brasil — poluição sonora e fiscalização ambiental" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Middle East */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Middle East &amp; North Africa</p>
          {[
            { href: "https://www.moccae.gov.ae", label: "وزارة التغيير المناخي والبيئة — UAE noise standards & complaints (800900)" },
            { href: "https://www.mewa.gov.sa", label: "وزارة البيئة والمياه — Saudi Arabia environmental noise regulation" },
            { href: "https://www.environnement.gov.ma", label: "Ministère de la Transition Écologique — Maroc / Morocco noise framework" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Open science & community sensing */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Open science &amp; community sensing</p>
          {[
            { href: "https://noise-planet.org", label: "Noise Planet (Université Gustave Eiffel) — open crowdsourced noise data, global WFS/WMS API — federated inside Noisecatcher" },
            { href: "https://github.com/Ifsttar/NoiseCapture", label: "NoiseCapture — open-source Android noise sensing app (GPL-3.0) — Noisecatcher exports NoiseCapture-compatible GeoJSON" },
            { href: "https://sensor.community", label: "Sensor.Community (formerly Luftdaten) — distributed citizen sensing network, open API and global map" },
            { href: "https://www.earshot.ngo", label: "Earshot NGO — acoustic advocacy network" },
            { href: "https://www.who.int/publications/i/item/9789289053563", label: "WHO Environmental Noise Guidelines for the European Region (2018)" },
            { href: "https://www.eea.europa.eu/themes/human/noise", label: "European Environment Agency — Strategic Noise Maps, open datasets, noise in Europe reports" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Open-source technical ecosystem */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Open-source technical ecosystem</p>
          {[
            { href: "https://github.com/Eomys/MoSQITo", label: "MoSQITo (Eomys, LGPL-3.0) — open-source Python psychoacoustic metrics: Loudness, Sharpness, Roughness, Tonality — reference for Noisecatcher's JS implementation" },
            { href: "https://github.com/ggrecow/SQAT", label: "SQAT — Sound Quality Analysis Toolbox (Julia/Python, MIT) — independent Zwicker model reference implementation for cross-checking" },
            { href: "https://research.google.com/audioset/", label: "AudioSet (Google Research) — 521-class ontology and 2M labelled audio clips — training data behind YAMNet" },
            { href: "https://github.com/microsoft/onnxruntime", label: "ONNX Runtime Web (Microsoft, MIT) — run any ONNX model in the browser — enables stronger classifiers (PANNs) as alternatives to YAMNet" },
            { href: "https://github.com/qiuqiangkong/audioset_tagging_cnn", label: "PANNs — Pretrained Audio Neural Networks (Kong et al., MIT) — stronger AudioSet tagging than YAMNet, exportable to ONNX" },
            { href: "https://dcase.community", label: "DCASE — Detection and Classification of Acoustic Scenes and Events — annual challenge driving ML audio research, including domain generalisation across geographies" },
            { href: "https://essentia.upf.edu", label: "Essentia (MTG Barcelona, AGPL-3.0) — comprehensive C++/Python audio analysis library with 200+ algorithms" },
            { href: "https://meyda.js.org", label: "Meyda (MIT) — real-time audio feature extraction in JavaScript — RMS, spectral centroid, MFCC, chroma directly in the browser" },
            { href: "https://github.com/deezer/spleeter", label: "Spleeter (Deezer, MIT) — source separation library — potential for isolating noise sources in imported recordings" },
            { href: "https://turfjs.org", label: "Turf.js (MIT) — modular geospatial analysis in JavaScript — spatial statistics, cluster detection, buffer zones on noise pins" },
            { href: "https://h3geo.org", label: "H3 (Uber, Apache-2.0) — hexagonal hierarchical spatial indexing — noise density heatmaps at any resolution" },
            { href: "https://github.com/protomaps/PMTiles", label: "PMTiles (Protomaps, BSD) — single-file cloud-optimised map tiles — enables offline-first map layers without a tile server" },
            { href: "https://nominatim.org", label: "OpenStreetMap Nominatim (LGPL) — open reverse geocoding — auto-name pin locations from GPS coordinates for complaint letters" },
            { href: "https://overpass-api.de", label: "Overpass API (AGPL) — query OpenStreetMap features near a location — identify nearby schools, hospitals, parks to contextualise noise pins" },
            { href: "https://dexie.org", label: "Dexie.js (Apache-2.0) — IndexedDB wrapper — robust offline pin storage so measurements persist without a server" },
            { href: "https://developer.chrome.com/docs/workbox/", label: "Workbox (Google, MIT) — service worker toolkit for offline-first PWA caching — full offline capability for the app shell and map tiles" },
            { href: "https://freesound.org", label: "Freesound (Universitat Pompeu Fabra) — open, collaboratively built repository of audio samples and soundscapes" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Forensic Architecture */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Forensic Architecture — methods &amp; tools</p>
          {[
            { href: "https://forensic-architecture.org/investigation/saydnaya", label: "Saydnaya (2016) — ear witnessing: acoustic reconstruction of a torture prison from blindfolded survivors' sound memories + impulse response modelling" },
            { href: "https://forensic-architecture.org/investigation/the-use-of-force-in-protests", label: "Use of Force in Protests — LRAD documentation, acoustic weapons analysis, multi-source video/audio synchronisation at protest sites" },
            { href: "https://forensic-architecture.org/investigation/ceasefire-violations-in-the-nuba-mountains", label: "Nuba Mountains (2014–2017) — aircraft sound identification, cross-referencing audio signatures with weapon type" },
            { href: "https://github.com/forensic-architecture/timemap", label: "Timemap (FA, DoNoHarm licence) — open-source temporal + spatial incident visualisation built on Leaflet + D3 — adaptable for noise event chronologies" },
            { href: "https://github.com/forensic-architecture/mtriage", label: "mtriage (FA, MIT) — open-source media scraping + ML analysis pipeline: audio extraction, speech recognition, object detection — for large-scale acoustic evidence processing" },
            { href: "https://github.com/forensic-architecture/datasheet-server", label: "datasheet-server (FA, MIT) — turn spreadsheet data into a queryable API — lightweight backend for noise documentation campaigns" },
            { href: "https://zone-books.com/book/forensic-architecture/", label: "Weizman, E. — Forensic Architecture: Violence at the Threshold of Detectability (Zone Books, 2017) — theoretical framework for counter-forensics" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Bioacoustics & ecoacoustics */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Bioacoustics &amp; ecoacoustics</p>
          {[
            { href: "https://github.com/kahst/BirdNET-Analyzer", label: "BirdNET (Cornell Lab + TU Chemnitz, MIT) — neural network identifying 6,000+ bird species from recordings — soundscape ecology use case for Noisecatcher's natural category" },
            { href: "https://opensoundscape.org", label: "OpenSoundscape (MIT, Carnegie Mellon Kitzes Lab) — Python toolkit for bioacoustic analysis, passive acoustic monitoring, acoustic index computation" },
            { href: "https://rfcx.org", label: "Rainforest Connection (RFCx) — acoustic guardian technology: solar-powered sensors detecting chainsaw sound and illegal logging in real time" },
            { href: "https://openacousticdevices.info/audiomoth", label: "AudioMoth (Open Acoustic Devices, University of Southampton, MIT) — open-source acoustic sensor hardware: £50, battery-powered, deployable anywhere — fixed-installation citizen monitoring" },
            { href: "https://cran.r-project.org/package=soundecology", label: "soundecology (R, GPL-3.0) — compute acoustic indices (ACI, ADI, BIO, NDSI) from recordings — biodiversity proxies from passive monitoring" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Open noise & audio datasets */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Open noise &amp; audio datasets</p>
          {[
            { href: "https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9", label: "NYC 311 Noise Complaints — 3M+ geolocated complaints since 2010 — geographic and temporal patterns across all boroughs" },
            { href: "https://www.bruitparif.fr/open-data", label: "Bruitparif (Île-de-France) — open noise monitoring data for Paris region, continuous monitoring network" },
            { href: "https://urbansounddataset.weebly.com/urbansound8k.html", label: "UrbanSound8K — 8,732 labelled urban sound clips, 10 classes (air conditioner, car horn, drilling, etc.) — training data reference, New York-biased" },
            { href: "https://github.com/karolpiczak/ESC-50", label: "ESC-50 — 2,000 clips, 50 environmental sound classes (Piczak, CC BY) — benchmark for environmental sound classifiers, European-biased" },
            { href: "https://dcase.community/challenge2022/task1", label: "TAU Urban Acoustic Scenes (DCASE) — 10-second clips from 10 European cities, 10 scene classes — geographic domain shift benchmark" },
            { href: "https://data.noise-planet.org/geoserver/noisecapture/ows", label: "Noise-Planet OGC WFS endpoint — query crowdsourced dB(A) measurements by bounding box — live community data" },
            { href: "https://www.eea.europa.eu/data-and-maps/data/noise-2", label: "EEA strategic noise map data — EU agglomerations, roads, railways, airports — official modelled noise contours" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>

        {/* Critical theory & sound studies */}
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest">Critical theory &amp; sound studies</p>
          {[
            { href: "https://www.upress.umn.edu/book-division/books/noise", label: "Jacques Attali — Noise: The Political Economy of Music (1977/1985, Minnesota UP)" },
            { href: "https://www.editionsladecouverte.fr/le_son_comme_arme-9782707168856", label: "Juliette Volcler — Le son comme arme / Extremely Loud: Sound as a Weapon (La Découverte 2011 / The New Press 2013)" },
            { href: "https://www.editionsladecouverte.fr/controle-9782707194800", label: "Juliette Volcler — Contrôle: comment s'inventa l'art de la manipulation sonore (La Découverte / Philharmonie de Paris, 2017)" },
            { href: "https://www.editionsladecouverte.fr/l_orchestration_du_quotidien-9782348064715", label: "Juliette Volcler — L'orchestration du quotidien: design sonore et écoute au 21e siècle (La Découverte, 2022)" },
            { href: "https://direct.mit.edu/books/monograph/5128/Paris-and-the-ParasiteNoise-Health-and-Politics-in", label: "Macs Smith — Paris and the Parasite: Noise, Health, and Politics in the Media City (MIT Press, 2021)" },
            { href: "https://global.oup.com/academic/product/sound-politics-in-so-paulo-9780190660093", label: "Leonardo Cardoso — Sound-Politics in São Paulo (Oxford University Press, 2019)" },
            { href: "https://research.gold.ac.uk/id/eprint/32526/", label: "Goddard, Halligan & Hegarty (eds.) — Reverberations: The Philosophy, Aesthetics and Politics of Noise (Continuum, 2012)" },
            { href: "https://www.jstor.org/stable/10.3366/j.ctt1g0b3js", label: "Stuart Sim — Manifesto for Silence: Confronting the Politics and Culture of Noise (Edinburgh UP, 2007)" },
            { href: "https://www.abebooks.com/9780857855916/Sound-Sky-Being-Torn-Political-0857855913/plp", label: "Rupert Cox — The Sound of the Sky Being Torn: A Political Ecology of Military Aircraft Noise (Bloomsbury, 2014)" },
            { href: "https://www.salomevoegelin.net/books", label: "Salomé Voegelin — Listening to Noise and Silence: Towards a Philosophy of Sound Art (Continuum, 2010)" },
            { href: "https://www.bloomsbury.com/uk/political-possibility-of-sound-9781501328930/", label: "Salomé Voegelin — The Political Possibility of Sound: Fragments of Listening (Bloomsbury, 2018)" },
            { href: "https://researchprofiles.ku.dk/en/publications/acoustic-territoriality-city-planning-and-the-politics-of-urban-s", label: "Jacob Kreutzfeldt — Acoustic Territoriality: City Planning and the Politics of Urban Sound (University of Copenhagen, 2007/2009)" },
            { href: "http://lawrenceabuhamdan.com/earwitness-inventory", label: "Lawrence Abu Hamdan — Earwitness Inventory (installation, 2018); Rubber Coated Steel (2016); Saydnaya: The Missing 19dB (2017)" },
            { href: "https://www.dukeupress.edu/the-race-of-sound", label: "Nina Sun Eidsheim — The Race of Sound: Listening, Timbre, and Vocality (Duke, 2019)" },
            { href: "https://continuumbooks.com/titles/detail.asp?TitleId=18948", label: "Julian Henriques — Sonic Bodies: Reggae Sound Systems (Continuum, 2011)" },
            { href: "https://press.uchicago.edu/ucp/books/book/chicago/R/bo3683015.html", label: "Emily Thompson — The Soundscape of Modernity (MIT Press, 2002)" },
            { href: "https://www.routledge.com/The-Auditory-Culture-Reader/Bull-Back/p/book/9781859736180", label: "Bull & Back (eds.) — The Auditory Culture Reader (Berg/Routledge, 2003)" },
            { href: "https://monoskop.org/Noise", label: "Monoskop — Noise (open wiki bibliography: Attali, Goodman, Voegelin, Schafer, Abu Hamdan, and the full noise studies canon)" },
            { href: "https://syntone.fr", label: "Syntone — revue critique de l'art radiophonique et de la création sonore (Beau Bruit / SCAM, 2008–)" },
            { href: "https://mitpress.mit.edu/9780262517959/sonic-warfare/", label: "Steve Goodman — Sonic Warfare (MIT Press, 2010) — vibrational ontology, ecology of fear, audio virology" },
            { href: "https://www.dukeupress.edu/acoustic-colonialism", label: "Luis E. Cárcamo-Huechante — Acoustic Colonialism: Acts of Mapuche Interference (Duke UP, 2022) — linguicide, colonial ear, allkütun" },
            { href: "https://www.routledge.com/Sonic-Rebellions-Sound-and-Social-Justice/Canton/p/book/9781032420622", label: "Wanda Canton — Sonic Rebellions: Sound and Social Justice (Routledge, 2024) — gentrification soundscapes, UK Drill, Algerian Hirak" },
            { href: "https://www.bloomsbury.com/uk/senses-of-vibration-9781441188465/", label: "Shelley Trower — Senses of Vibration (Continuum/Bloomsbury, 2012) — railway shock, nervous illness, auditory unconscious" },
            { href: "https://direct.mit.edu/books/book/4203/EnlivenmentToward-a-Poetics-for-the-Anthropocene", label: "Andreas Weber — Enlivenment (MIT Press, 2019) — living commons, biopoetics; soundscape as shared aliveness" },
            { href: "https://jamesbridle.com/books/ways-of-being", label: "James Bridle — Ways of Being (FSG, 2022) — more-than-human democracy; noise silencing animal communication as political suppression" },
            { href: "https://dghaskell.com/sounds-wild-and-broken/", label: "David George Haskell — Sounds Wild and Broken (Viking, 2022) — sensory extinction; sonic inequity as structural racism" },
            { href: "https://fordhampress.com/cultural-techniques-hb-9780823263752.html", label: "Bernhard Siegert — Cultural Techniques (Fordham UP, 2015) — signal/noise as cultural filter; regulatory thresholds as political operations" },
            { href: "https://wesleyan.edu/wespress/booklist/978-0-8195-6028-1.html", label: "John Cage — Silence (Wesleyan UP, 1961) — 4'33''; anechoic chamber; the city as indeterminate score" },
            { href: "https://brandonlabelle.net/publications/background-noise-perspectives-on-sound-art-second-edition/", label: "Brandon LaBelle — Background Noise: Perspectives on Sound Art (Bloomsbury, 2nd ed. 2015) — noise as medium; acoustic space as relational and contested" },
            { href: "https://www.ucpress.edu/book/9780520382084/on-minimalism", label: "O'Brien & Robin — On Minimalism: Documenting a Musical Movement (UC Press, 2023) — documentation as canon-making; who is included in the archive" },
            { href: "https://ced.berkeley.edu/work/local-code-by-nicholas-de-monchaux", label: "Nicholas de Monchaux — Local Code (Princeton Architectural Press, 2016) — urban acupuncture; GIS as justice tool; open data + local knowledge" },
          ].map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{label}
            </a>
          ))}
        </div>
      </section>

      {/* Pamphlet download */}
      <section className="flex flex-col gap-3">
        <div className="border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Field pamphlet</p>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                A printable guide to the ethos, key Abécédaire concepts, and practice
                of Noisecatcher. Save as PDF from your browser&apos;s print dialog.
                Fold into a booklet and carry it.
              </p>
            </div>
          </div>
          <a
            href="/pamphlet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-500 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            Open pamphlet (print / save as PDF)
          </a>
        </div>
      </section>

      {/* Bug Report */}
      <section className="flex flex-col gap-3">
        <div className="border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Report a bug</p>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                Found something broken, inaccurate, or missing? Open an issue on GitHub — include
                your device, browser version, and steps to reproduce.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/9mv25z4hy2-art/noisecatcher/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-500 hover:text-white transition-colors"
          >
            <Bug className="w-4 h-4" />
            Open a GitHub issue
          </a>
        </div>
      </section>

      {/* Donation */}
      <section className="flex flex-col gap-3">
        <div className="border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Support the project</p>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                Noisecatcher is free, open-source, and ad-free. If it has been useful to you or
                your community, a small contribution helps keep it alive.
              </p>
            </div>
          </div>
          <a
            href="https://ko-fi.com/sylvainsouklaye"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-500 hover:text-white transition-colors"
          >
            <Heart className="w-4 h-4" />
            Support on Ko-fi
          </a>
        </div>
      </section>

      {/* Attribution */}
      <div className="nc-surface rounded-xl px-5 py-4 flex flex-col gap-1">
        <p className="text-white text-sm font-semibold">Noisecatcher</p>
        <p className="text-gray-400 text-sm">by Sylvain Souklaye</p>
        <p className="text-gray-600 text-xs mt-1">
          Part of the <em>Politics of Noise</em> research practice.
          v0.5 — Meter · Spectrogram · Audio import · YAMNet · Psychoacoustics · Map · Earwitness pins · Voice notes · Field notebooks · WHO health dashboard · SHA-256 chain of custody · P2P community layer · Complaint letter generator · Noise-Planet federation · Transect export · Abécédaire · Act · PWA.{" "}
          14 noise source categories · 107 Abécédaire entries · 16 languages.
        </p>
      </div>
    </div>
  );
}
