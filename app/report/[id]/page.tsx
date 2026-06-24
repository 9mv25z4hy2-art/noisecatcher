"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadReport, updateReport, loadVoiceNotesByAttached, type NoiseReport, type VoiceNote } from "@/lib/db";
import { useI18n } from "@/lib/i18n/context";
import VoiceNoteRecorder from "@/components/ui/VoiceNoteRecorder";
import PinForm from "@/components/map/PinForm";
import { Printer, Download, MapPin, Pin, Play, Square } from "lucide-react";
import AircraftLookup from "@/components/map/AircraftLookup";

function fmt(n: number, decimals = 1) { return n.toFixed(decimals); }
const CARDINALS = ["N","NE","E","SE","S","SW","W","NW"];
function bearingToCardinal(deg: number) { return CARDINALS[Math.round(deg / 45) % 8]; }
function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function downloadProof(report: NoiseReport): void {
  const proof = {
    _type: "noisecatcher-evidence-proof-v1",
    reportId: report.id,
    captureTimestamp: report.timestamp,
    sessionSha256: report.sessionSha256 ?? null,
    location: report.lat != null ? { lat: report.lat, lng: report.lng, bearingDeg: report.bearing ?? null } : null,
    yamnetTopLabel: report.yamnetTopLabel ?? null,
    measurements: {
      leq: report.leq,
      peak: report.peak,
      l10: report.l10,
      l50: report.l50,
      l90: report.l90,
      sampleCount: report.sampleCount,
      durationS: report.durationS,
      calibrationOffset: report.calibrationOffset,
    },
    harm: {
      sleep: report.harmSleep ?? false,
      conversation: report.harmConversation ?? false,
      anxiety: report.harmAnxiety ?? null,
      notes: report.harmNotes ?? "",
    },
    note: "sessionSha256 is SHA-256 of the canonical session data computed before saving. To verify: reproduce the JSON string {timestamp,durationS,leq,peak,l10,l50,l90,sampleCount,calibrationOffset} with the values above and compute SHA-256.",
  };
  const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noisecatcher-proof-${report.id.slice(0, 8)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const [report, setReport] = useState<NoiseReport | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);

  useEffect(() => {
    loadReport(id).then((r) => {
      if (r) { setReport(r); loadVoiceNotesByAttached(r.id).then(setVoiceNotes); }
      else setNotFound(true);
    });
  }, [id]);

  function playVoice(note: VoiceNote) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingId(null); }
    if (playingId === note.id) return;
    const audio = new Audio(note.audioDataUrl);
    audio.onended = () => { audioRef.current = null; setPlayingId(null); };
    audio.play();
    audioRef.current = audio;
    setPlayingId(note.id);
  }


  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="te-label text-white/40">Report not found.</p>
        <button onClick={() => router.push("/meter")} className="te-label text-white/50 hover:text-white/80 underline">
          {t.report_back}
        </button>
      </div>
    );
  }

  if (!report) {
    return <div className="flex items-center justify-center min-h-screen"><span className="te-label text-white/30">Loading…</span></div>;
  }

  const date = new Date(report.timestamp).toLocaleString();

  return (
    <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* print-only header */}
      <style>{`@media print { .no-print { display: none !important; } body { background: white; color: black; } }`}</style>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{t.report_title}</h1>
          <p className="te-label text-white/40 mt-0.5">{t.report_generated}: {date}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 te-label text-white/50 hover:text-white/80 transition-colors shrink-0"
        >
          <Printer className="w-4 h-4" />
          {t.report_print}
        </button>
      </div>

      {/* Duration */}
      <div className="te-panel rounded-md px-4 py-3">
        <span className="te-label text-white/40">{t.report_duration}</span>
        <span className="te-label text-white ml-2 font-semibold">{fmtDuration(report.durationS)}</span>
        <span className="te-label text-white/30 ml-2">· {report.sampleCount} samples</span>
        {report.calibrationOffset !== 0 && (
          <span className="te-label text-white/25 ml-2">· cal {report.calibrationOffset > 0 ? "+" : ""}{report.calibrationOffset} dB</span>
        )}
      </div>

      {/* GPS location */}
      {report.lat != null && report.lng != null && (
        <section className="flex flex-col gap-2">
          <div className="te-panel rounded-md px-4 py-3 flex items-center gap-3">
            <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="te-label text-white/60 font-mono text-xs">
                {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
              </span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${report.lat}&mlon=${report.lng}&zoom=16`}
                target="_blank"
                rel="noopener noreferrer"
                className="te-label text-[10px] text-white/30 hover:text-white/60 ml-3 transition-colors"
              >
                OSM ↗
              </a>
            </div>
            <button
              onClick={() => setShowPinForm(true)}
              className="no-print flex items-center gap-1.5 px-2.5 py-1.5 rounded border te-label text-[10px] transition-colors shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
              title="Drop a map pin at this location pre-filled with this session's Leq"
            >
              <Pin className="w-3 h-3" />
              Drop pin
            </button>
          </div>
          <AircraftLookup lat={report.lat} lng={report.lng} />
        </section>
      )}

      {/* Session stats */}
      <section>
        <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.report_session_stats}</h2>
        <div className="te-panel rounded-md grid grid-cols-2 divide-x divide-y divide-white/5">
          {[
            { label: "Leq", value: fmt(report.leq), unit: "dB" },
            { label: "Peak", value: fmt(report.peak), unit: "dB" },
            { label: "L10", value: fmt(report.l10), unit: "dB" },
            { label: "L50", value: fmt(report.l50), unit: "dB" },
            { label: "L90", value: fmt(report.l90), unit: "dB" },
            { label: "Threshold", value: report.thresholdLabel, unit: "" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="flex flex-col items-center py-3 gap-0.5">
              <span className="te-label text-white/30 text-[10px]">{label}</span>
              <span className="text-white/80 font-mono text-sm font-semibold tabular-nums">
                {value}{unit && <span className="text-white/25 text-[9px] ml-0.5">{unit}</span>}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Health context */}
      <section>
        <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.report_health_context}</h2>
        <div className="te-panel rounded-md px-4 py-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: report.thresholdColor }} />
          <span className="te-label text-white/70">{report.thresholdLabel}</span>
        </div>
      </section>

      {/* Psychoacoustics */}
      {(report.loudness !== null || report.sharpness !== null) && (
        <section>
          <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.report_psycho}</h2>
          <div className="te-panel rounded-md grid grid-cols-2 divide-x divide-y divide-white/5">
            {[
              { label: "Loudness", value: report.loudness, unit: "sone" },
              { label: "Sharpness", value: report.sharpness, unit: "acum" },
              { label: "Roughness", value: report.roughness, unit: "asper" },
              { label: "Annoyance", value: report.annoyance, unit: "PA" },
            ].filter(({ value }) => value !== null).map(({ label, value, unit }) => (
              <div key={label} className="flex flex-col items-center py-3 gap-0.5">
                <span className="te-label text-white/30 text-[10px]">{label}</span>
                <span className="text-white/80 font-mono text-sm font-semibold tabular-nums">
                  {fmt(value!)}
                  <span className="text-white/25 text-[9px] ml-0.5">{unit}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Noise dose */}
      {(report.euDose !== null || report.oshaDose !== null) && (
        <section>
          <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.report_dose}</h2>
          <div className="te-panel rounded-md grid grid-cols-2 divide-x divide-white/5">
            {[
              { label: "EU 80 dB/8h", dose: report.euDose },
              { label: "OSHA 90 dB/8h", dose: report.oshaDose },
            ].filter(({ dose }) => dose !== null).map(({ label, dose }) => {
              const color = dose! >= 100 ? "#f87171" : dose! >= 50 ? "#fb923c" : "#4ade80";
              return (
                <div key={label} className="flex flex-col items-center py-3 gap-0.5">
                  <span className="te-label text-white/30 text-[10px]">{label}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums" style={{ color }}>
                    {dose!.toFixed(1)}<span className="text-white/25 text-[9px] ml-0.5">%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ACI / HF / bearing / YAMNet */}
      {(report.aci !== null || report.hfPeakHz !== null || report.bearing != null || report.yamnetTopLabel) && (
        <section className="te-panel rounded-md px-4 py-3 flex flex-col gap-1">
          {report.bearing != null && (
            <div className="flex justify-between">
              <span className="te-label text-white/40 text-[10px]">Bearing</span>
              <span className="font-mono text-xs text-white/60">{report.bearing}° · {bearingToCardinal(report.bearing)}</span>
            </div>
          )}
          {report.yamnetTopLabel && (
            <div className="flex justify-between">
              <span className="te-label text-white/40 text-[10px]">YAMNet classification</span>
              <span className="font-mono text-xs text-white/60">{report.yamnetTopLabel}</span>
            </div>
          )}
          {report.aci !== null && (
            <div className="flex justify-between">
              <span className="te-label text-white/40 text-[10px]">ACI</span>
              <span className="font-mono text-xs text-white/60">{report.aci.toFixed(3)}</span>
            </div>
          )}
          {report.hfPeakHz !== null && (
            <div className="flex justify-between">
              <span className="te-label text-white/40 text-[10px]">HF Peak</span>
              <span className="font-mono text-xs text-red-400">{(report.hfPeakHz / 1000).toFixed(2)} kHz</span>
            </div>
          )}
        </section>
      )}

      {/* ── Harm documentation ── */}
      <section className="flex flex-col gap-3">
        <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px]">{t.harm_title}</h2>
        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
          {t.harm_intro}
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!report.harmSleep}
            onChange={(e) => {
              const v = e.target.checked;
              updateReport(report.id, { harmSleep: v });
              setReport((r) => r ? { ...r, harmSleep: v } : r);
            }}
            className="w-4 h-4 accent-white/60"
          />
          <span className="te-label text-white/60 text-sm">{t.harm_sleep}</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!report.harmConversation}
            onChange={(e) => {
              const v = e.target.checked;
              updateReport(report.id, { harmConversation: v });
              setReport((r) => r ? { ...r, harmConversation: v } : r);
            }}
            className="w-4 h-4 accent-white/60"
          />
          <span className="te-label text-white/60 text-sm">{t.harm_conversation}</span>
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="te-label text-white/50 text-sm">{t.harm_anxiety}</span>
            <span className="te-label text-white/40 text-[11px] tabular-nums">
              {report.harmAnxiety != null ? `${report.harmAnxiety}/5` : "—"}
            </span>
          </div>
          <input
            type="range" min={0} max={5} step={1}
            value={report.harmAnxiety ?? 0}
            onChange={(e) => {
              const v = Number(e.target.value);
              updateReport(report.id, { harmAnxiety: v });
              setReport((r) => r ? { ...r, harmAnxiety: v } : r);
            }}
            className="w-full accent-white/60 h-1.5 rounded-full"
          />
          <div className="flex justify-between te-label text-white/20 text-[9px]">
            <span>None</span><span>Severe</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="te-label text-white/40 text-[10px] uppercase tracking-wider">{t.harm_notes_label}</label>
          <textarea
            rows={2}
            value={report.harmNotes ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              updateReport(report.id, { harmNotes: v });
              setReport((r) => r ? { ...r, harmNotes: v } : r);
            }}
            placeholder={t.harm_notes_placeholder}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
          />
        </div>
      </section>

      {/* Voice notes */}
      <section className="no-print flex flex-col gap-3">
        <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px]">{t.report_add_voice}</h2>
        {voiceNotes.length > 0 && (
          <div className="flex flex-col gap-2">
            {voiceNotes.map((v) => (
              <div key={v.id} className="te-panel rounded-md px-4 py-3 flex items-start gap-3">
                <button
                  onClick={() => playVoice(v)}
                  className="p-1.5 rounded text-white/40 hover:text-white/80 transition-colors shrink-0 mt-0.5"
                  aria-label={t.voice_play}
                >
                  {playingId === v.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="te-label text-white/50 text-[10px]">{v.durationS}s · {new Date(v.createdAt).toLocaleDateString()}</span>
                  {v.transcript && <p className="te-label text-white/60 text-xs mt-1 leading-relaxed break-words">{v.transcript}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        <VoiceNoteRecorder
          attachedTo={report.id}
          attachedType="report"
          carnetId={report.carnetId ?? undefined}
          onSaved={(note) => setVoiceNotes((prev) => [...prev, note])}
        />
      </section>

      {/* Evidentiary integrity */}
      <section className="te-panel rounded-md px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">
            Chain of custody
          </span>
          <button
            onClick={() => downloadProof(report)}
            className="no-print flex items-center gap-1 px-2.5 py-1 rounded te-label text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
          >
            <Download className="w-3 h-3" />
            Proof JSON
          </button>
        </div>
        {report.sessionSha256 ? (
          <>
            <span
              className="font-mono text-[10px] break-all select-all"
              style={{ color: "rgba(255,255,255,0.35)" }}
              title="SHA-256 of the objective session data computed at capture."
            >
              {report.sessionSha256}
            </span>
            <span className="te-label text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              SHA-256 computed at capture · timestamp · Leq · peak · L10/50/90 · samples · calibration
            </span>
          </>
        ) : (
          <span className="te-label text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            No capture-time hash — report predates integrity feature. Download proof JSON for current values.
          </span>
        )}
      </section>

      {/* Back */}
      <button
        onClick={() => router.push("/meter")}
        className="no-print te-label text-white/30 hover:text-white/60 transition-colors self-start"
      >
        {t.report_back}
      </button>

      {showPinForm && report.lat != null && report.lng != null && (
        <PinForm
          lat={report.lat}
          lng={report.lng}
          defaultDb={report.leq}
          onClose={() => setShowPinForm(false)}
          onSaved={() => { setShowPinForm(false); router.push("/map"); }}
        />
      )}
    </main>
  );
}
