"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Mic, ChevronLeft } from "lucide-react";

interface MicEntry {
  name: string;
  connector: "Lightning" | "USB-C" | "Lightning + USB-C" | "USB" | "3.5mm TRRS";
  format: string;
  pattern: string;
  bitDepth?: string;
  notes: string;
  ethos: "ideal" | "good" | "acceptable" | "limited";
  ethosNote: string;
  price?: string;
}

const MICS: MicEntry[] = [
  // ── Lightning ──────────────────────────────────────────────────────────
  {
    name: "Shure MV88",
    connector: "Lightning",
    format: "Stereo (M-S)",
    pattern: "Cardioid + bidirectional capsules (Mid-Side stereo)",
    bitDepth: "24-bit / 48 kHz",
    notes:
      "MFi-certified. Adjustable capsule angle (0–90°). Companion MOTIV app for DSP. " +
      "Gold standard for journalist and documentary field work on iPhone.",
    ethos: "ideal",
    ethosNote:
      "M-S stereo captures the full spatial acoustic environment as experienced by the " +
      "listener. Documenting not only the level but the spatial origin of a noise source " +
      "is directly aligned with the counter-forensic ambition of Noisecatcher.",
    price: "~$149",
  },
  {
    name: "Rode VideoMic Me-L",
    connector: "Lightning",
    format: "Mono",
    pattern: "Cardioid (directional)",
    bitDepth: "24-bit",
    notes:
      "Compact, bus-powered from iPhone/iPad Lightning port. Runs entirely from device. " +
      "Good for speech, interviews, and targeted source capture.",
    ethos: "acceptable",
    ethosNote:
      "Cardioid pattern rejects rear-hemisphere sound. Useful for directional documentation " +
      "(e.g. recording a specific machine or speaker) but not representative of ambient " +
      "noise exposure as experienced by a body in space. Use omnidirectional for noise monitoring.",
    price: "~$70",
  },
  {
    name: "Apogee ClipMic Digital (Lightning)",
    connector: "Lightning",
    format: "Mono lavalier",
    pattern: "Omnidirectional",
    bitDepth: "24-bit / 44.1 kHz",
    notes:
      "Clip to clothing at chest height. Apogee preamp electronics. Very low self-noise. " +
      "USB-C version also available (same capsule, different connector).",
    ethos: "ideal",
    ethosNote:
      "Omnidirectional lavalier worn at chest height measures noise as a human body " +
      "experiences it — from all directions, at the listener's position. This is the " +
      "most forensically honest capture mode for personal noise exposure documentation.",
    price: "~$119",
  },
  {
    name: "Apogee HypeMiC",
    connector: "Lightning + USB-C",
    format: "Mono",
    pattern: "Cardioid, large-diaphragm condenser",
    bitDepth: "24-bit / 96 kHz",
    notes:
      "Built-in hardware compressor (3 presets). Works with Lightning, USB-C, and standard USB. " +
      "Headphone output with zero-latency monitoring.",
    ethos: "good",
    ethosNote:
      "High-quality cardioid. Avoid using the compressor during noise measurement — " +
      "it modifies signal dynamics and will distort Leq readings. Disable compression " +
      "in the companion app when using with Noisecatcher.",
    price: "~$279",
  },
  {
    name: "IK Multimedia iRig Mic HD 2",
    connector: "Lightning + USB-C",
    format: "Mono",
    pattern: "Cardioid condenser",
    bitDepth: "24-bit / 96 kHz",
    notes:
      "Ships with both Lightning and USB-C cables. Compatible with iPhone, iPad, and Android. " +
      "Multi-function gain knob. Headphone monitoring output.",
    ethos: "good",
    ethosNote:
      "Reliable cardioid for close-source and speech capture. Same cardioid caveat as " +
      "VideoMic Me-L applies for ambient monitoring — front-facing placement required.",
    price: "~$100",
  },
  {
    name: "Sennheiser AMBEO Smart Headset",
    connector: "Lightning",
    format: "Binaural (in-ear)",
    pattern: "Two omnidirectional capsules (one in each ear tip)",
    bitDepth: "24-bit / 48 kHz",
    notes:
      "Records true binaural audio: two microphones positioned at the ears, capturing the " +
      "acoustic environment exactly as the listener hears it — including head-related transfer " +
      "function (HRTF), pinna diffraction, and body occlusion. Originally released ~€200. " +
      "Production status: verify current availability — may be discontinued or limited stock.",
    ethos: "ideal",
    ethosNote:
      "For Noisecatcher, this is the philosophically purest capture device: it records " +
      "acoustic reality as a body experiences it. The human body is the primary sensing " +
      "device; this microphone treats the ear exactly as Noisecatcher's ethos demands. " +
      "Binaural recordings provide irreplaceable evidence of personal exposure — courts " +
      "and medical reviewers can listen to what the claimant heard.",
    price: "~$200 (verify availability)",
  },
  {
    name: "Saramonic SmartMic (Lightning)",
    connector: "Lightning",
    format: "Mono",
    pattern: "Cardioid (directional)",
    bitDepth: "16-bit",
    notes:
      "Budget entry point. No battery required. MFi certified. No companion app needed. " +
      "Also available in 3.5mm TRRS version — make sure you order the Lightning variant.",
    ethos: "acceptable",
    ethosNote:
      "Adequate for speech and interview capture. Directional pattern and lower bit depth " +
      "limit its usefulness for nuanced noise documentation. Best suited to direct-source " +
      "recording rather than ambient monitoring.",
    price: "~$35",
  },

  // ── Ambisonic & spatial ────────────────────────────────────────────────
  {
    name: "Voyage Audio Spatial Mic USB",
    connector: "USB",
    format: "Ambisonic (9-capsule A-format → B-format)",
    pattern: "Full-sphere omnidirectional array (9 MEMS capsules)",
    bitDepth: "24-bit / 48 kHz",
    notes:
      "Nine MEMS microphone capsules arranged in a sphere. Records in A-format, decoded to " +
      "first-order B-format (W, X, Y, Z) ambisonics. USB-A bus-powered; use a USB-C OTG adapter " +
      "for smartphone connectivity. Companion decoder app for binaural or stereo monitoring. " +
      "Designed for immersive audio, VR, and spatial documentation. voyage.audio",
    ethos: "ideal",
    ethosNote:
      "Ambisonic capture is the fullest possible acoustic record of a place: every direction, " +
      "every reflection, the complete acoustic sphere. For Noisecatcher, this means documenting " +
      "not only the decibel level but the spatial topology of a noise environment — " +
      "which direction the source comes from, how it reflects, how it fills a space. " +
      "Uniquely powerful for industrial sites, protests, or any contested acoustic territory.",
    price: "~$399",
  },
  {
    name: "SP15V Binaural Video Microphone",
    connector: "3.5mm TRRS",
    format: "Binaural (360° spatial / in-ear array)",
    pattern: "Binaural omnidirectional capsules — records 360° spatial audio",
    notes:
      "Designed for mounting on DSLR and mirrorless cameras. Records 360° spatial audio " +
      "via binaural capsule placement. Connects via 3.5mm TRRS to camera or smartphone " +
      "(use a Lightning/USB-C to 3.5mm adapter). Suited to documentary and video journalism work.",
    ethos: "ideal",
    ethosNote:
      "Binaural 360° capture at the recording position gives a complete and embodied sonic record. " +
      "For harassment, assault, or environmental noise evidence, this format preserves the " +
      "spatial context — the listener of the recording can hear exactly what the recordist heard " +
      "and from which direction. Via adapter, usable with smartphones.",
    price: "verify with retailer",
  },
  {
    name: "Roland CS-10EM",
    connector: "3.5mm TRRS",
    format: "Binaural (in-ear)",
    pattern: "Two omnidirectional microphone capsules, one per ear",
    bitDepth: "Analog — dependent on recording device ADC",
    notes:
      "Earphone-microphone combination: worn in the ears, capsules sit at the entrance to the ear " +
      "canal and record true binaural audio including HRTF, pinna diffraction, and head shadowing. " +
      "Connects via 3.5mm TRRS to Roland recorders, cameras, or smartphones (Lightning/USB-C adapter required). " +
      "Earphones also serve as monitoring output while recording.",
    ethos: "ideal",
    ethosNote:
      "The most discreet binaural option: indistinguishable from ordinary earphones. " +
      "For documenting harassment, assault, or daily noise exposure, the Roland CS-10EM can be worn " +
      "continuously without drawing attention — capturing exactly what the ears hear at the moment of the event. " +
      "This is the body-as-sensor principle made wearable.",
    price: "~$60–80",
  },

  // ── USB-C ──────────────────────────────────────────────────────────────
  {
    name: "Rode VideoMic Me-C",
    connector: "USB-C",
    format: "Mono",
    pattern: "Cardioid (directional)",
    bitDepth: "24-bit",
    notes:
      "USB-C variant of the VideoMic Me line. Works with Android phones and iPhone 15+. " +
      "Bus-powered. Same capsule and character as the Me-L.",
    ethos: "acceptable",
    ethosNote:
      "Same ethos note as VideoMic Me-L: cardioid pattern is useful for targeted source " +
      "documentation but not for omni ambient monitoring. Turn toward the source.",
    price: "~$70",
  },
  {
    name: "Apogee ClipMic Digital (USB-C)",
    connector: "USB-C",
    format: "Mono lavalier",
    pattern: "Omnidirectional",
    bitDepth: "24-bit / 44.1 kHz",
    notes:
      "USB-C version of the ClipMic Digital. Identical capsule and preamp, USB-C connector " +
      "for Android and iPhone 15+. Clip to clothing at chest or collar height.",
    ethos: "ideal",
    ethosNote:
      "Same recommendation as the Lightning version. Omnidirectional at body level = the " +
      "ideal noise exposure capture position.",
    price: "~$119",
  },
  {
    name: "Zoom Am7",
    connector: "USB-C",
    format: "Stereo (M-S)",
    pattern: "Mid-Side stereo (cardioid + figure-8)",
    bitDepth: "24-bit / 48 kHz",
    notes:
      "Designed specifically for Android smartphones. Bus-powered. M-S matrix mode and " +
      "XY stereo mode. Adjustable stereo width. Compact. The Zoom Am line is one of the " +
      "few USB-C mobile-first stereo microphone families.",
    ethos: "ideal",
    ethosNote:
      "M-S stereo gives the same spatial capture advantage as the Shure MV88 — " +
      "documenting not just level but directionality. Highly recommended for Android users " +
      "doing investigative noise documentation.",
    price: "~$80",
  },
  {
    name: "IK Multimedia iRig Mic HD 2 (USB-C cable)",
    connector: "USB-C",
    format: "Mono",
    pattern: "Cardioid condenser",
    bitDepth: "24-bit / 96 kHz",
    notes:
      "The iRig Mic HD 2 ships with both Lightning and USB-C cables — same body, two connectors. " +
      "USB-C cable gives Android and iPhone 15+ compatibility.",
    ethos: "good",
    ethosNote: "Same note as the Lightning version.",
    price: "~$100",
  },
];

const ETHOS_COLORS: Record<MicEntry["ethos"], string> = {
  ideal:      "#22c55e",
  good:       "#84cc16",
  acceptable: "#eab308",
  limited:    "#f97316",
};

// Labels now come from i18n; this is only used as a fallback type reference.
type EthosKey = MicEntry["ethos"];

export default function MicrophonesPage() {
  const { t, locale } = useI18n();

  const lightningMics = MICS.filter((m) => m.connector.includes("Lightning"));
  const usbcMics = MICS.filter((m) => m.connector === "USB-C");
  const spatialMics = MICS.filter((m) => m.connector === "USB" || m.connector === "3.5mm TRRS");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full flex flex-col gap-10">

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold nc-text"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
        >
          {t.mic_page_title}
        </h1>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          {t.mic_page_subtitle}
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

      {/* Why external mic */}
      <section className="flex flex-col gap-3">
        <h2 className="text-white font-semibold text-base">{t.mic_why_title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Smartphone microphones are designed for voice calls, not acoustic measurement.
          Their frequency response is shaped for speech intelligibility (typically
          boosted around 1–4 kHz, rolled off below 150 Hz and above 12 kHz), their
          preamps apply automatic gain control (AGC) that compresses dynamics, and
          their self-noise floors vary wildly between models. An external microphone
          bypasses the AGC, has a known and flatter frequency response, and can be
          positioned optimally — at body height, at the noise source, or in a fixed mount.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          When a USB-C or Lightning microphone is connected, it appears as a separate audio
          input device. On the Meter screen, a device selector appears above the Start button
          — choose the external microphone. Noisecatcher uses the Web Audio API to route
          from the selected input; no additional driver or app is needed.
        </p>
      </section>

      {/* Pattern guidance */}
      <section className="nc-surface rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider">
          {t.mic_pattern_title}
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          {[
            {
              pattern: "Omnidirectional",
              color: "#22c55e",
              use: "Best for noise monitoring. Captures sound from all directions equally. " +
                "Worn as a lavalier at chest height, it measures personal exposure as the body experiences it.",
            },
            {
              pattern: "Stereo (M-S or XY)",
              color: "#84cc16",
              use: "Best for spatial documentation. Captures direction as well as level — " +
                "you can hear and document where a noise originates. Ideal for complex soundscapes, " +
                "protests, industrial sites.",
            },
            {
              pattern: "Binaural (in-ear)",
              color: "#22c55e",
              use: "Purest personal exposure record. Captures exactly what the wearer's ears hear, " +
                "including HRTF. Irreplaceable for evidence of harassment, assault, or sustained exposure.",
            },
            {
              pattern: "Ambisonic",
              color: "#a78bfa",
              use: "Full-sphere spatial capture — records all directions simultaneously in a format " +
                "that can be decoded to any perspective. Ideal for documenting the complete acoustic " +
                "character of a location: industrial zones, construction sites, contested public space.",
            },
            {
              pattern: "Cardioid (directional)",
              color: "#eab308",
              use: "Useful for targeted source capture — point it at the machine, vehicle, or person. " +
                "Rejects rear sound, so not suitable for ambient monitoring. " +
                "Best used when you know exactly what you are documenting.",
            },
          ].map(({ pattern, color, use }) => (
            <div key={pattern} className="flex gap-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest shrink-0 mt-0.5 w-28"
                style={{ color }}
              >
                {pattern}
              </span>
              <p className="text-gray-400 leading-relaxed">{use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lightning mics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold text-base">
          {t.mic_lightning_title} <span className="text-gray-500 font-normal text-sm">({t.mic_lightning_sub})</span>
        </h2>
        <p className="text-gray-500 text-xs leading-relaxed">{t.mic_lightning_note}</p>
        <div className="flex flex-col gap-4">
          {lightningMics.map((m) => <MicCard key={m.name} mic={m} />)}
        </div>
      </section>

      {/* USB-C mics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold text-base">
          {t.mic_usbc_title} <span className="text-gray-500 font-normal text-sm">({t.mic_usbc_sub})</span>
        </h2>
        <p className="text-gray-500 text-xs leading-relaxed">{t.mic_usbc_note}</p>
        <div className="flex flex-col gap-4">
          {usbcMics.map((m) => <MicCard key={m.name} mic={m} />)}
        </div>
      </section>

      {/* Ambisonic & spatial mics */}
      <section className="flex flex-col gap-4">
        <h2 className="text-white font-semibold text-base">{t.mic_spatial_title}</h2>
        <p className="text-gray-500 text-xs leading-relaxed">{t.mic_spatial_note}</p>
        <div className="flex flex-col gap-4">
          {spatialMics.map((m) => <MicCard key={m.name} mic={m} />)}
        </div>
      </section>

      {/* What is NOT in this guide */}
      <section className="nc-surface rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-white font-semibold text-sm">{t.mic_not_in_title}</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-gray-400">
          <li className="leading-relaxed">
            <span className="text-gray-300">XLR ambisonic microphones (Sennheiser AMBEO VR Mic, Røde NT-SF1, Zoom H3-VR)</span>{" "}
            — these require an audio interface or dedicated recorder and are not directly usable
            with a smartphone. The Voyage Audio Spatial Mic USB is listed above as the mobile-compatible exception.
          </li>
          <li className="leading-relaxed">
            <span className="text-gray-300">Wireless lavalier systems (Rode Wireless GO, DJI Mic, Hollyland Lark)</span>{" "}
            — these are transmitted as analog or compressed digital and reconstructed. The
            signal chain adds processing that may distort Leq readings. Not recommended for
            noise measurement unless using the USB-C receiver output and disabling compression.
          </li>
          <li className="leading-relaxed">
            <span className="text-gray-300">3.5mm TRRS microphones</span>{" "}
            — excluded from this guide as iPhone 7+ removed the headphone jack. A Lightning
            or USB-C to 3.5mm adapter introduces an additional ADC stage; audio quality is
            adapter-dependent and generally inferior to native digital connections.
          </li>
          <li className="leading-relaxed">
            <span className="text-gray-300">Noise-canceling headsets with pass-through</span>{" "}
            — explicitly excluded by Noisecatcher&apos;s ethos. See the About page.
          </li>
        </ul>
      </section>

      {/* Ethos summary */}
      <section className="border border-green-900/40 bg-green-950/10 rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-green-400 font-semibold text-sm uppercase tracking-wider">
          {t.mic_rec_title}
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          For noise monitoring and personal exposure documentation:{" "}
          <strong>omnidirectional lavalier at chest height</strong> (Apogee ClipMic Digital).
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          For spatial documentation of a noise environment:{" "}
          <strong>M-S stereo</strong> (Shure MV88 on iPhone, Zoom Am7 on Android).
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          For harassment, assault, and personal sonic testimony:{" "}
          <strong>binaural in-ear</strong> (Sennheiser AMBEO Smart Headset — verify availability;
          or Roland CS-10EM with 3.5mm adapter). The recording captures exactly what the person
          heard. The CS-10EM is discreet, wearable, and significantly more accessible.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          For complete acoustic documentation of a contested location:{" "}
          <strong>ambisonic</strong> (Voyage Audio Spatial Mic USB via OTG adapter).
          Every direction, every reflection — a full acoustic map that can be decoded and replayed
          from any listening perspective.
        </p>
        <p className="text-gray-500 text-xs leading-relaxed">
          Prices and availability correct to the best of knowledge as of 2024–2025.
          Verify with retailers before purchasing. The microphone market evolves rapidly.
        </p>
      </section>

      <Link href="/about" className="flex items-center gap-1.5 text-sm" style={{ color: "var(--nc-text-2)" }}>
        <ChevronLeft className="w-3.5 h-3.5" />
        {t.mic_back}
      </Link>
    </div>
  );
}

function MicCard({ mic }: { mic: MicEntry }) {
  const { t } = useI18n();
  const color = ETHOS_COLORS[mic.ethos];
  const ethosLabels: Record<EthosKey, string> = {
    ideal:      t.mic_ethos_ideal,
    good:       t.mic_ethos_good,
    acceptable: t.mic_ethos_acceptable,
    limited:    t.mic_ethos_limited,
  };

  return (
    <div className="te-panel rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 shrink-0" style={{ color: "var(--nc-text-3)" }} />
          <span className="text-white font-semibold text-sm">{mic.name}</span>
          {mic.price && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--nc-hover)", color: "var(--nc-text-3)" }}>
              {mic.price}
            </span>
          )}
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest shrink-0 mt-0.5"
          style={{ color }}
        >
          {ethosLabels[mic.ethos]}
        </span>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: "var(--nc-text-3)" }}>
        <span><span className="text-white/40">{t.mic_card_connector}</span> {mic.connector}</span>
        <span><span className="text-white/40">{t.mic_card_format}</span> {mic.format}</span>
        <span className="col-span-2"><span className="text-white/40">{t.mic_card_pattern}</span> {mic.pattern}</span>
        {mic.bitDepth && <span className="col-span-2"><span className="text-white/40">{t.mic_card_quality}</span> {mic.bitDepth}</span>}
      </div>

      {/* Notes */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{mic.notes}</p>

      {/* Ethos */}
      <div
        className="rounded-lg px-3 py-2 text-xs leading-relaxed"
        style={{ background: `${color}11`, border: `1px solid ${color}33`, color: "var(--nc-text-2)" }}
      >
        <span className="font-semibold" style={{ color }}>{t.mic_card_ethos}: </span>
        {mic.ethosNote}
      </div>
    </div>
  );
}
