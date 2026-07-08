/**
 * Noisecatcher — Printable Field Pamphlet
 *
 * Open this page in your browser and use File → Print (or Cmd/Ctrl+P)
 * to save as a PDF. Set margins to "None" or "Minimal" and enable
 * "Background graphics" for best results.
 *
 * The layout is optimised for A4/Letter, portrait.
 * Fold the two-column printed sheet in half for a booklet format.
 */

import type { Metadata } from "next";
import { SITE_DOMAIN } from "@/lib/config";

export const metadata: Metadata = {
  title: "Noisecatcher — Field Pamphlet",
  description: "Printable guide to the ethos, vocabulary, and practice of Noisecatcher.",
};

export default function PamphletPage() {
  return (
    <>
      <style>{`
        /* ── Screen: readable dark layout ── */
        body { background: #0a0a0a; color: #e5e5e5; }
        .pamphlet { max-width: 700px; margin: 0 auto; padding: 2rem 1.5rem 4rem; font-family: Georgia, 'Times New Roman', serif; }
        h1.cover-title { font-size: 2rem; font-weight: 700; letter-spacing: 0.04em; color: #fff; margin: 0 0 0.25rem; font-family: system-ui, sans-serif; }
        .cover-sub { font-size: 0.9rem; color: #888; margin: 0 0 2rem; font-family: system-ui, sans-serif; }
        .section { margin-bottom: 2.5rem; }
        h2 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.18em; color: #555; margin: 0 0 0.75rem; font-family: system-ui, sans-serif; padding-top: 0.5rem; border-top: 1px solid #222; }
        h3 { font-size: 1rem; font-weight: 600; color: #fff; margin: 0 0 0.5rem; font-family: system-ui, sans-serif; }
        p { font-size: 0.85rem; line-height: 1.7; color: #aaa; margin: 0 0 0.75rem; }
        ul { padding-left: 1.2rem; margin: 0 0 0.75rem; }
        li { font-size: 0.85rem; line-height: 1.65; color: #aaa; margin-bottom: 0.4rem; }
        li strong { color: #ccc; }
        .term-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; }
        .term { break-inside: avoid; }
        .term-name { font-size: 0.8rem; font-weight: 700; color: #e5e5e5; font-family: system-ui, sans-serif; margin-bottom: 0.2rem; }
        .term-def { font-size: 0.78rem; line-height: 1.6; color: #888; }
        .rule-box { border: 1px solid #333; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
        .rule-box.forbidden { border-color: #5a1a1a; background: rgba(90,10,10,0.15); }
        .rule-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.16em; font-family: system-ui, sans-serif; color: #666; margin-bottom: 0.5rem; }
        .rule-label.red { color: #a04040; }
        .who-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .who-table th { text-align: left; color: #666; font-weight: 400; padding: 0.3rem 0.5rem; border-bottom: 1px solid #222; font-family: system-ui, sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .who-table td { padding: 0.4rem 0.5rem; color: #999; border-bottom: 1px solid #1a1a1a; }
        .who-table td:first-child { font-weight: 600; }
        .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
        .footer-line { font-size: 0.7rem; color: #444; text-align: center; margin-top: 3rem; font-family: system-ui, sans-serif; border-top: 1px solid #1a1a1a; padding-top: 1rem; }

        /* ── Print styles ── */
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .pamphlet { max-width: 100%; padding: 0; }
          h1.cover-title { color: #000 !important; font-size: 1.6rem; }
          .cover-sub { color: #555 !important; }
          h2 { color: #888 !important; border-top-color: #ddd !important; }
          h3 { color: #000 !important; }
          p, li, .term-def { color: #333 !important; }
          .term-name { color: #000 !important; }
          .rule-box { border-color: #ccc !important; background: transparent !important; }
          .rule-box.forbidden { border-color: #c00 !important; background: rgba(200,0,0,0.04) !important; }
          .rule-label { color: #888 !important; }
          .rule-label.red { color: #c00 !important; }
          .who-table th { color: #888 !important; border-bottom-color: #ddd !important; }
          .who-table td { color: #333 !important; border-bottom-color: #eee !important; }
          .footer-line { color: #aaa !important; border-top-color: #ddd !important; }
          @page { margin: 1.5cm 1.8cm; }
        }
      `}</style>

      <div className="pamphlet">

        {/* Cover */}
        <h1 className="cover-title">Noisecatcher</h1>
        <p className="cover-sub">
          Field guide — ethos, vocabulary &amp; practice<br />
          Part of the <em>Politics of Noise</em> research practice by Sylvain Souklaye
        </p>

        {/* ── What this is ── */}
        <div className="section">
          <h2>What this is</h2>
          <p>
            Noisecatcher is a free, open web application that gives anyone with a smartphone
            the ability to measure noise pollution in real time, understand its health
            consequences, and contribute to a living, peer-to-peer map of acoustic environments.
          </p>
          <p>
            It is an <strong>electroacoustic instrument</strong> — a civic device that mediates
            between the acoustic world and collective knowledge. It is also a <strong>co-presence
            device</strong>: through its peer-to-peer community layer, listeners who are physically
            dispersed become acoustically present to one another, sharing evidence of the sonic
            conditions they inhabit without a central server, without surveillance infrastructure.
          </p>
          <p>
            It is a civic instrument, an activist tool, and a phenomenological device.
            Its aim is to democratize acoustic monitoring — to give communities the means
            to document, contest, and act on noise as an environmental and social justice issue.
          </p>
        </div>

        {/* ── Ethos ── */}
        <div className="section">
          <h2>Ethos &amp; practice</h2>

          <h3>The instrument and its performer</h3>
          <p>
            Like any electroacoustic instrument, Noisecatcher requires a performer. The smartphone
            alone is inert — it becomes an instrument only through the engaged body of a listener.
            The microphone transduces pressure into voltage; the algorithm transduces voltage into
            meaning; but the listener provides the intentionality that makes the act of listening
            political. You are not a user of this tool. You are its performer, its operator, its
            witness.
          </p>

          <h3>The human device</h3>
          <p>
            The human body is the primary sensing device. The smartphone makes nothing
            perceptible that the ear has not already received. The human device is the
            necessary condition for the tech device to exist. You — your presence,
            your attention, your body in a place — are the instrument.
          </p>

          <div className="rule-box">
            <div className="rule-label">Supported</div>
            <p style={{ marginBottom: 0 }}>
              <strong>External microphones</strong> are welcome and improve measurement quality.
              Lavalier, cardioid, or omnidirectional mics connected via the headphone jack,
              USB-C, or Lightning are detected automatically. A device selector appears on
              the Meter screen when multiple inputs are available.
            </p>
          </div>

          <div className="rule-box forbidden">
            <div className="rule-label red">Not compatible with this practice</div>
            <p>
              <strong>Noise-canceling earphones and earbuds are explicitly forbidden</strong>{" "}
              during a Noisecatcher session. This is not a technical constraint — it is an
              ethical one.
            </p>
            <p>
              Active noise cancellation severs three fundamental connections:
            </p>
            <ul>
              <li>
                <strong>People from each other.</strong> A listener wearing noise-canceling
                headphones removes themselves from the acoustic commons. The shared sonic
                condition — the condition that generates solidarity — is dissolved.
              </li>
              <li>
                <strong>People from their environment.</strong> The soundscape carries
                information: about danger, inequality, the presence of others. Canceling it
                cancels the evidence. What is not heard cannot be documented or contested.
              </li>
              <li>
                <strong>The self from its own condition.</strong> The self is at the center
                of the listening experience. To cancel ambient sound is to make oneself less
                present. Deep listening begins with accepting what is there.
              </li>
            </ul>
            <p style={{ marginBottom: 0, fontSize: "0.78rem", color: "#888" }}>
              Noise cancellation is a profitable industry built on privatizing a response to
              a public health crisis. Binaural headsets without active cancellation are
              acceptable for listening to recordings.
            </p>
          </div>

          <h3>Deep listening as political act</h3>
          <p>
            The practice of listening without cancellation — of attending fully to the
            acoustic environment — is both a phenomenological discipline and a political
            stance. It insists that the conditions of noise are real, shared, and worth
            documenting. It refuses private escape in favour of collective witnessing.
          </p>
          <p>
            When you measure sound, you name a condition. When you pin a location, you
            make an argument about space, power, and the right to a liveable acoustic
            environment. Listening here is social. Listening here is political.
          </p>
        </div>

        {/* ── WHO thresholds ── */}
        <div className="section">
          <h2>WHO reference thresholds</h2>
          <table className="who-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Range</th>
                <th>Health context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="dot" style={{ background: "#4ade80" }} />Safe</td>
                <td>0–69 dB(A)</td>
                <td>Below WHO environmental noise concern threshold</td>
              </tr>
              <tr>
                <td><span className="dot" style={{ background: "#facc15" }} />Caution</td>
                <td>70–84 dB(A)</td>
                <td>Prolonged exposure may cause hearing fatigue; sleep disturbance risk</td>
              </tr>
              <tr>
                <td><span className="dot" style={{ background: "#f97316" }} />Dangerous</td>
                <td>85–99 dB(A)</td>
                <td>Permanent hearing damage possible after 8 h/day; cardiovascular risk</td>
              </tr>
              <tr>
                <td><span className="dot" style={{ background: "#ef4444" }} />Critical</td>
                <td>100+ dB(A)</td>
                <td>Rapid hearing damage; acute pain possible above 120 dB; LRAD range</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Abécédaire highlights ── */}
        <div className="section">
          <h2>Key vocabulary — from the Abécédaire</h2>
          <div className="term-grid">
            <div className="term">
              <div className="term-name">dB(A)</div>
              <div className="term-def">
                A-weighted decibels. A logarithmic scale that approximates human hearing
                sensitivity. 3 dB(A) represents a doubling of sound intensity; 10 dB(A)
                feels roughly twice as loud.
              </div>
            </div>
            <div className="term">
              <div className="term-name">Soundscape</div>
              <div className="term-def">
                R. Murray Schafer&apos;s term for the total acoustic environment of a place.
                Geophony (natural sounds), biophony (life sounds), anthrophony (human-made
                sounds). Every soundscape is a social document.
              </div>
            </div>
            <div className="term">
              <div className="term-name">Acoustic Racism</div>
              <div className="term-def">
                The differential distribution of noise burden along racial and class lines.
                Highways, airports, and industrial facilities are systematically located
                in or near communities of colour and low-income neighbourhoods.
              </div>
            </div>
            <div className="term">
              <div className="term-name">Sonic Warfare</div>
              <div className="term-def">
                Steve Goodman&apos;s concept: the use of sound as an instrument of power,
                control, and violence. From LRAD crowd dispersal to music-as-torture
                in detention. The acoustic as a domain of political force.
              </div>
            </div>
            <div className="term">
              <div className="term-name">LRAD</div>
              <div className="term-def">
                Long Range Acoustic Device. Directed-energy sound weapon routinely deployed
                against protesters. Capable of 162 dB at 1m; permanent hearing damage at
                100 m. Documented globally by Amnesty International and HRW.
              </div>
            </div>
            <div className="term">
              <div className="term-name">Infrasound</div>
              <div className="term-def">
                Sound below 20 Hz — below the threshold of human hearing but not of
                human sensation. Industrial wind turbines, compressors, and military
                systems generate infrasound linked to anxiety and nausea.
              </div>
            </div>
            <div className="term">
              <div className="term-name">Participatory sensing</div>
              <div className="term-def">
                Citizen science methodology where distributed individuals collect
                environmental data. Projects like NoiseCapture (IFSTTAR/Gustave Eiffel)
                and NoiseTube pioneered smartphone-based urban noise mapping.
              </div>
            </div>
            <div className="term">
              <div className="term-name">Right to the city</div>
              <div className="term-def">
                Henri Lefebvre&apos;s framework, extended to sound: the right to collectively
                shape the acoustic environment is part of the right to inhabit urban
                space. Noise is a dimension of territorial inequality.
              </div>
            </div>
          </div>
        </div>

        {/* ── Act ── */}
        <div className="section">
          <h2>What to do with a measurement</h2>
          <ul>
            <li>
              <strong>Document precisely.</strong> Note time, location, duration, and source
              category. A GPS-tagged pin with a decibel reading is civic evidence.
            </li>
            <li>
              <strong>File a formal complaint.</strong> Most jurisdictions have environmental
              noise complaint mechanisms — municipal noise offices, environmental agencies,
              planning authorities. Use the Act section of the app for country-specific resources.
            </li>
            <li>
              <strong>Coordinate with neighbours.</strong> Repeated measurements from multiple
              people at multiple times of day constitute a pattern. Patterns have legal weight.
            </li>
            <li>
              <strong>Submit to journalists and researchers.</strong> Tagged, timestamped data
              is usable evidence for investigative reporting, academic research, and
              legal advocacy.
            </li>
            <li>
              <strong>At a protest or near acoustic weapons.</strong>{" "}
              Protect your hearing first — distance yourself, use passive ear protection if
              available. Record second. Your data can support accountability investigations
              and press documentation.
            </li>
          </ul>
        </div>

        {/* ── Footer ── */}
        <div className="footer-line">
          Noisecatcher — {SITE_DOMAIN} &nbsp;·&nbsp; Politics of Noise research practice
          &nbsp;·&nbsp; Sylvain Souklaye &nbsp;·&nbsp; v0.5
        </div>

      </div>
    </>
  );
}
