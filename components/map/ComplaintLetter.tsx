"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import type { NoisePin } from "@/lib/pins";
import type { NoiseReport } from "@/lib/db";
import { getThreshold } from "@/lib/thresholds";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  pins: NoisePin[];
  reports?: NoiseReport[];
  onClose: () => void;
}

function leq(values: number[]): number {
  if (!values.length) return 0;
  return 10 * Math.log10(values.reduce((acc, v) => acc + Math.pow(10, v / 10), 0) / values.length);
}

function fmt(n: number) { return Math.round(n * 10) / 10; }
function fmt2(n: number) { return n.toFixed(1); }

const AUTHORITY_TEMPLATES = [
  { label: "Local council / municipality", text: "The Environmental Health Department, [Your Local Council]" },
  { label: "National noise regulator",     text: "The National Environmental Agency" },
  { label: "Landlord / property manager",  text: "The Property Management Office" },
  { label: "Custom…",                      text: "" },
];

export default function ComplaintLetter({ pins, reports = [], onClose }: Props) {
  const { locale } = useI18n();
  const measured = useMemo(() => pins.filter(p => p.pinType !== "earwitness" && p.db > 0), [pins]);
  const gpsReports = useMemo(() => reports.filter(r => r.lat != null && r.lng != null), [reports]);
  const [authority, setAuthority] = useState(AUTHORITY_TEMPLATES[0].text);
  const [authorityIdx, setAuthorityIdx] = useState(0);
  const [authorName, setAuthorName] = useState("[Your Name]");
  const [authorAddress, setAuthorAddress] = useState("[Your Address]");
  const [copied, setCopied] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!measured.length && !gpsReports.length) return null;

    if (measured.length > 0) {
      const dbs = measured.map(p => p.db);
      const lqval = fmt(leq(dbs));
      const peak = Math.max(...dbs);
      const thr = getThreshold(peak);
      const earliest = new Date(Math.min(...measured.map(p => new Date(p.createdAt).getTime())));
      const latest   = new Date(Math.max(...measured.map(p => new Date(p.createdAt).getTime())));
      const cats = [...new Set(measured.map(p => p.category))];
      const location = measured[measured.length - 1];
      return { lqval, peak, thr, earliest, latest, cats, location };
    }

    // Fallback: use GPS session reports when no map pins exist
    const dbs = gpsReports.map(r => r.leq);
    const lqval = fmt(leq(dbs));
    const peak = Math.max(...gpsReports.map(r => r.peak));
    const thr = getThreshold(peak);
    const earliest = new Date(Math.min(...gpsReports.map(r => new Date(r.timestamp).getTime())));
    const latest   = new Date(Math.max(...gpsReports.map(r => new Date(r.timestamp).getTime())));
    const last = gpsReports[gpsReports.length - 1];
    return { lqval, peak, thr, earliest, latest, cats: ["session measurement"], location: { lat: last.lat as number, lng: last.lng as number } };
  }, [measured, gpsReports]);

  // Reverse-geocode the pin location via Nominatim (OSM) — no API key required.
  // Falls back silently to coordinate strings if the fetch fails or times out.
  useEffect(() => {
    if (!stats) return;
    const { lat, lng } = stats.location;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocationAddress(null); // reset stale address before new fetch
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}`,
      { signal: controller.signal, headers: { "User-Agent": "Noisecatcher/1.0 noisecatcher.app" } }
    )
      .then((r) => r.ok ? r.json() : null)
      .then((data: { display_name?: string } | null) => {
        if (data?.display_name) setLocationAddress(data.display_name);
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => { controller.abort(); clearTimeout(timer); };
  }, [stats?.location.lat, stats?.location.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const letter = useMemo(() => {
    if (!stats) return "";
    const PHRASES: Record<string, { re: string; salutation: string; intro: string; closing: string }> = {
      fr: { re: "Objet : Plainte formelle — Nuisances sonores excessives", salutation: "Madame, Monsieur,", intro: "Je me permets de vous contacter afin de signaler formellement une nuisance sonore à l'adresse ou aux coordonnées suivantes :", closing: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées," },
      es: { re: "Asunto: Denuncia formal — Contaminación acústica excesiva", salutation: "Estimado/a señor/señora:", intro: "Me dirijo a usted para denunciar formalmente una molestia acústica en o cerca de la siguiente ubicación:", closing: "Atentamente," },
      pt: { re: "Assunto: Reclamação formal — Poluição sonora excessiva", salutation: "Exmo(a). Senhor(a):", intro: "Venho por este meio apresentar formalmente uma queixa relativa a ruído excessivo no local ou nas coordenadas indicadas abaixo:", closing: "Com os melhores cumprimentos," },
      it: { re: "Oggetto: Esposto formale — Inquinamento acustico eccessivo", salutation: "Egregio/a Signore/Signora,", intro: "Mi rivolgo a Lei per segnalare formalmente una molestia da rumore nella seguente posizione:", closing: "Distinti saluti," },
      de: { re: "Betreff: Formelle Beschwerde — Übermäßige Lärmbelästigung", salutation: "Sehr geehrte Damen und Herren,", intro: "hiermit melde ich formell eine Lärmbelästigung an oder in der Nähe des folgenden Standorts:", closing: "Mit freundlichen Grüßen," },
      ar: { re: "الموضوع: شكوى رسمية — تلوث ضوضائي مفرط", salutation: "السيد/السيدة المحترم/ة،", intro: "أتقدم بهذا الخطاب للإبلاغ رسمياً عن إزعاج صوتي في الموقع التالي:", closing: "مع خالص الاحترام والتقدير،" },
      ko: { re: "제목: 공식 민원 — 소음 공해", salutation: "담당자 귀중,", intro: "아래 위치에서 발생하는 소음 피해를 공식적으로 신고하기 위해 이 민원을 제출합니다:", closing: "감사합니다," },
      ja: { re: "件名：正式な苦情申し立て — 過度な騒音公害", salutation: "ご担当者様,", intro: "以下の場所またはその近辺において発生している騒音被害について、正式にご報告いたします：", closing: "敬具," },
      zh: { re: "主题：正式投诉 — 过度噪音污染", salutation: "尊敬的负责人：", intro: "本人就以下位置发生的噪音滋扰问题向贵部门正式投诉：", closing: "此致敬礼，" },
      hi: { re: "विषय: औपचारिक शिकायत — अत्यधिक ध्वनि प्रदूषण", salutation: "महोदय/महोदया,", intro: "मैं निम्नलिखित स्थान पर हो रही ध्वनि बाधा की औपचारिक रूप से सूचना दे रहा/रही हूँ:", closing: "भवदीय," },
    };
    const ph = PHRASES[locale] ?? { re: "Re: Formal Complaint — Excessive Noise Pollution", salutation: "Dear Sir/Madam,", intro: "I am writing to formally report a noise nuisance at or near the following location:", closing: "Yours faithfully," };
    const fmt = { day: "numeric" as const, month: "long" as const, year: "numeric" as const };
    const today = new Date().toLocaleDateString(locale, fmt);
    const from = stats.earliest.toLocaleDateString(locale, fmt);
    const to   = stats.latest.toLocaleDateString(locale, fmt);
    const catList = stats.cats.join(", ");
    const whoExceeded = stats.lqval > 53 ? ` This exceeds the WHO Environmental Noise Guideline for Lden (53 dB(A)).` : "";
    const nightWhoNote = ` For reference, the WHO Lnight guideline for night noise is 40 dB(A).`;

    const latStr = `${Math.abs(stats.location.lat).toFixed(5)}°${stats.location.lat >= 0 ? "N" : "S"}`;
    const lngStr = `${Math.abs(stats.location.lng).toFixed(5)}°${stats.location.lng >= 0 ? "E" : "W"}`;
    const locationLine = locationAddress
      ? `  Location: ${locationAddress}\n  Coordinates: ${latStr}, ${lngStr}`
      : `  Location: ${latStr}, ${lngStr}`;

    const sessionBlock = gpsReports.length > 0
      ? `\n  Full measurement sessions: ${gpsReports.length}` +
        `\n  Session Leq (energy avg): ${fmt2(leq(gpsReports.map(r => r.leq)))} dB(A)` +
        `\n  Session peak: ${fmt2(Math.max(...gpsReports.map(r => r.peak)))} dB(A)\n`
      : "";

    return `${today}

${authorName}
${authorAddress}

To: ${authority}

${ph.re}

${ph.salutation}

${ph.intro}
${locationLine}

MEASUREMENT DATA
Recorded using Noisecatcher (https://noisecatcher.app), a mobile acoustic measurement application.

  Period of observation: ${from} to ${to}
  ${measured.length > 0 ? `Number of map pins: ${measured.length}` : `Number of session records: ${gpsReports.length}`}
  Source type(s): ${catList}
  Leq (energy equivalent level): ${stats.lqval} dB(A)
  Peak recorded level: ${stats.peak} dB(A) — ${stats.thr.label}${sessionBlock}
${whoExceeded}${nightWhoNote}

HEALTH AND LEGAL CONTEXT
Sustained exposure above 55 dB(A) Lden is associated with cardiovascular risk (WHO, 2018). Chronic noise above 40 dB(A) at night disrupts sleep and causes long-term health effects. I request that your authority investigate this matter and take appropriate enforcement or mitigation action.

I am available to provide additional data, recordings, or testimony in support of this complaint.

${ph.closing}

${authorName}

---
Data generated by Noisecatcher · open-source community noise monitoring
https://noisecatcher.app · All readings are relative to device microphone, not calibrated SPL.`;
  }, [stats, authority, authorName, authorAddress, measured, gpsReports, locale, locationAddress]);

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="rounded-2xl w-full max-w-lg flex flex-col gap-0 shadow-2xl max-h-[90vh] overflow-hidden"
        style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)" }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--nc-border)" }}>
          <span className="font-semibold text-sm nc-text">Complaint Letter Generator</span>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--nc-text-3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {!stats ? (
          <div className="p-4 text-sm" style={{ color: "var(--nc-text-3)" }}>
            No measured pins available. Add at least one measured noise pin first.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 p-4" style={{ borderBottom: "1px solid var(--nc-border)" }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Your name</label>
                  <input
                    value={authorName} onChange={e => setAuthorName(e.target.value)}
                    className="nc-input rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="[Your Name]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Your address</label>
                  <input
                    value={authorAddress} onChange={e => setAuthorAddress(e.target.value)}
                    className="nc-input rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="[Your Address]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Send to</label>
                <div className="flex gap-1.5 flex-wrap mb-1">
                  {AUTHORITY_TEMPLATES.map((t, i) => (
                    <button
                      key={i} type="button"
                      onClick={() => { setAuthorityIdx(i); if (t.text) setAuthority(t.text); }}
                      className="text-[10px] px-2 py-0.5 rounded transition-colors"
                      style={authorityIdx === i
                        ? { background: "var(--nc-text)", color: "var(--nc-bg)" }
                        : { background: "transparent", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }
                      }
                    >{t.label}</button>
                  ))}
                </div>
                <input
                  value={authority} onChange={e => setAuthority(e.target.value)}
                  className="nc-input rounded-lg px-2.5 py-1.5 text-xs"
                  placeholder="Recipient name / department"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <pre
                className="text-[10px] leading-relaxed whitespace-pre-wrap font-mono"
                style={{ color: "var(--nc-text-2)" }}
              >{letter}</pre>
            </div>

            <div className="flex gap-2 p-3" style={{ borderTop: "1px solid var(--nc-border)" }}>
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
              >
                {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy to clipboard</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
