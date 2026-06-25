"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCarnetContents, loadCarnets, type Carnet, type NoiseReport, type VoiceNote } from "@/lib/db";
import type { NoisePin } from "@/lib/pins";
import { exportCarnetGeoJSON } from "@/lib/pins";
import { useI18n } from "@/lib/i18n/context";
import { MapPin, FileText, Mic, Play, Square, Download } from "lucide-react";
import VoiceNoteRecorder from "@/components/ui/VoiceNoteRecorder";
import LeqChart from "@/components/ui/LeqChart";

function fmtDuration(s: number) {
  const m = Math.floor(s / 60); const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function CarnetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const router = useRouter();
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [pins, setPins] = useState<NoisePin[]>([]);
  const [reports, setReports] = useState<NoiseReport[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadCarnets().then((cs) => {
      const c = cs.find((x) => x.id === id);
      if (c) setCarnet(c);
    });
    loadCarnetContents(id).then(({ pins, reports, voiceNotes }) => {
      setPins(pins);
      setReports(reports);
      setVoiceNotes(voiceNotes);
    });
  }, [id]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  const playVoice = (note: VoiceNote) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingId(null); }
    if (playingId === note.id) return;
    // Convert data URL → blob URL: iOS Safari rejects large audio data URLs
    const mimeMatch = note.audioDataUrl.match(/data:([^;]+)/);
    const mime = mimeMatch?.[1] ?? "audio/mp4";
    const b64 = note.audioDataUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const audio = new Audio(blobUrl);
    audio.onended = () => { URL.revokeObjectURL(blobUrl); audioRef.current = null; setPlayingId(null); };
    audio.play().catch((err) => { URL.revokeObjectURL(blobUrl); console.error("[voice]", err); audioRef.current = null; setPlayingId(null); });
    audioRef.current = audio;
    setPlayingId(note.id);
  };

  if (!carnet) return <div className="flex items-center justify-center min-h-screen"><span className="te-label text-white/30">Loading…</span></div>;

  const isEmpty = pins.length === 0 && reports.length === 0 && voiceNotes.length === 0;

  return (
    <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: carnet.color }} />
        <h1 className="text-xl font-semibold text-white flex-1">{carnet.name}</h1>
        {(pins.length > 0 || reports.length > 0 || voiceNotes.length > 0) && (
          <button
            onClick={() => exportCarnetGeoJSON(pins, reports, voiceNotes)}
            className="no-print flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/10 te-label text-white/40 hover:text-white/70 hover:border-white/25 transition-colors shrink-0"
            title="Export pins and session reports as GeoJSON"
          >
            <Download className="w-3 h-3" />
            GeoJSON
          </button>
        )}
      </div>
      {carnet.notes && <p className="te-label text-white/40">{carnet.notes}</p>}

      {/* ── Add voice note ── */}
      <section>
        <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.carnet_add_note}</h2>
        <VoiceNoteRecorder
          carnetId={id}
          onSaved={(note) => setVoiceNotes((prev) => [...prev, note])}
        />
      </section>

      {isEmpty && <p className="te-label text-white/30 text-center py-4">{t.carnet_empty_contents}</p>}

      {pins.length > 0 && (
        <section>
          <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.carnet_pins} ({pins.length})</h2>
          <div className="flex flex-col gap-2">
            {pins.map((p) => (
              <div key={p.id} className="te-panel rounded-md px-4 py-3 flex items-center gap-3">
                <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="te-label text-white/60 truncate">{p.description || p.category}</p>
                  <p className="te-label text-white/25 text-[10px]">{p.db} dB · {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {reports.length > 0 && (
        <section>
          <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.carnet_reports} ({reports.length})</h2>

          <LeqChart reports={reports} title={t.leq_trend} />

          <div className="flex flex-col gap-2">
            {reports.map((r) => (
              <div
                key={r.id}
                className="te-panel rounded-md px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/3 transition-colors"
                onClick={() => router.push(`/report/${r.id}`)}
              >
                <FileText className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="te-label text-white/60">{r.leq.toFixed(1)} dB Leq · {fmtDuration(r.durationS)}</p>
                  <p className="te-label text-white/25 text-[10px]">{new Date(r.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {voiceNotes.length > 0 && (
        <section>
          <h2 className="te-label text-white/40 uppercase tracking-wider text-[10px] mb-2">{t.carnet_voice_notes} ({voiceNotes.length})</h2>
          <div className="flex flex-col gap-2">
            {voiceNotes.map((v) => (
              <div key={v.id} className="te-panel rounded-md px-4 py-3 flex items-start gap-3">
                <Mic className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="te-label text-white/50">{v.durationS}s · {new Date(v.createdAt).toLocaleDateString()}</span>
                  {v.transcript && <p className="te-label text-white/40 text-[10px] mt-0.5 leading-relaxed break-words">{v.transcript}</p>}
                </div>
                <button
                  onClick={() => playVoice(v)}
                  className="p-1.5 rounded text-white/40 hover:text-white/80 transition-colors"
                  aria-label={t.voice_play}
                >
                  {playingId === v.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <button onClick={() => router.push("/carnets")} className="te-label text-white/30 hover:text-white/60 transition-colors self-start">
        ← {t.carnet_title}
      </button>
    </main>
  );
}
