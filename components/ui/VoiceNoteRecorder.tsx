"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Trash2, FileText, PenLine, Check } from "lucide-react";
import { saveVoiceNote, deleteVoiceNote, updateVoiceNote, type VoiceNote } from "@/lib/db";
import { useI18n } from "@/lib/i18n/context";

const MAX_S = 60;
// Use device native rate — forcing 16 kHz mismatches iOS mic rate, producing silence
const WAV_SAMPLE_RATE = 0; // placeholder; actual rate read from AudioContext at runtime

// All iOS browsers (Safari, Chrome/CriOS, Firefox/FxiOS) use WebKit and share
// the same MediaRecorder bug: moov atom written at end → blob unplayable.
// Also catches iPads on iOS 13+ which report as MacIntel with touch support.
const isIOS = () =>
  typeof navigator !== "undefined" && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE"); str(12, "fmt "); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, samples.length * 2, true);
  let o = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
  }
  return new Blob([buf], { type: "audio/wav" });
}

// Web Speech API — not available on iOS Safari or Firefox.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any;
const getSpeechRecognition = (): SR | undefined =>
  typeof window !== "undefined"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? undefined)
    : undefined;

interface Props {
  attachedTo?: string;
  attachedType?: "pin" | "report";
  carnetId?: string;
  onSaved?: (note: VoiceNote) => void;
}

export default function VoiceNoteRecorder({ attachedTo, attachedType, carnetId, onSaved }: Props) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "recording" | "saved">("idle");
  const [manualNote, setManualNote] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [savedNote, setSavedNote] = useState<VoiceNote | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // iOS Safari doesn't support data: URLs as audio src — keep a blob URL for playback
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);
  const recognitionRef = useRef<SR | null>(null);
  const transcriptRef = useRef("");
  // Web Audio API path (iOS Safari) — ScriptProcessorNode collects PCM samples
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wavCtxRef = useRef<any>(null);
  const wavSamplesRef = useRef<Float32Array[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wavProcRef = useRef<any>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mediaRef.current?.stop();
      wavProcRef.current?.disconnect();
      wavCtxRef.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
      recognitionRef.current?.stop();
      setPlaybackUrl((url) => { if (url) URL.revokeObjectURL(url); return null; });
    };
  }, []);

  const finishRecording = (blob: Blob, dur: number) => {
    const url = URL.createObjectURL(blob);
    setPlaybackUrl(url);
    const finalTranscript = transcriptRef.current.trim() || undefined;
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (!mountedRef.current) return;
      const note = await saveVoiceNote({
        audioDataUrl: reader.result as string,
        durationS: Math.round(dur),
        attachedTo, attachedType, carnetId,
        transcript: finalTranscript,
      });
      if (!mountedRef.current) return;
      setSavedNote(note);
      setState("saved");
      onSaved?.(note);
    };
    reader.readAsDataURL(blob);
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recognitionRef.current?.stop();
    const dur = (Date.now() - startRef.current) / 1000;

    if (wavProcRef.current) {
      // iOS path — flush WAV samples
      wavProcRef.current.disconnect();
      wavProcRef.current = null;
      const sampleRate = wavCtxRef.current?.sampleRate ?? 44100;
      wavCtxRef.current?.close();
      wavCtxRef.current = null;
      const all = wavSamplesRef.current;
      const total = all.reduce((n, a) => n + a.length, 0);
      const merged = new Float32Array(total);
      let off = 0;
      for (const a of all) { merged.set(a, off); off += a.length; }
      wavSamplesRef.current = [];
      finishRecording(encodeWAV(merged, sampleRate), dur);
    } else {
      mediaRef.current?.stop();
      mediaRef.current = null;
    }
  };

  const startRecording = async () => {
    transcriptRef.current = "";
    setLiveTranscript("");

    // Start Web Speech recognition in parallel if supported
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = typeof navigator !== "undefined" ? navigator.language : "en";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (e: any) => {
          let text = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) text += e.results[i][0].transcript + " ";
          }
          if (text) {
            transcriptRef.current += text;
            if (mountedRef.current) setLiveTranscript(transcriptRef.current.trim());
          }
        };
        recognition.onerror = () => { /* non-fatal — recording continues */ };
        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // SpeechRecognition instantiation can throw on some browsers — ignore
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startRef.current = Date.now();

      if (isIOS()) {
        // iOS Safari MediaRecorder writes moov atom at end — blob is unplayable.
        // Use Web Audio API + ScriptProcessorNode to collect PCM → encode as WAV.
        // No sampleRate override — iOS mic runs at 44100/48000; forcing 16000 produces silence
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        wavCtxRef.current = ctx;
        wavSamplesRef.current = [];
        const src = ctx.createMediaStreamSource(stream);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const proc = ctx.createScriptProcessor(4096, 1, 1);
        proc.onaudioprocess = (e: AudioProcessingEvent) => {
          if (!mountedRef.current) return;
          wavSamplesRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        };
        src.connect(proc);
        proc.connect(ctx.destination);
        wavProcRef.current = proc;
        // Stop stream tracks when WAV path finishes (done in stopRecording)
        stream.getTracks().forEach((t) => { t.addEventListener("ended", () => t.stop()); });
      } else {
        // MediaRecorder path for Chrome/Firefox/Android
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (!mountedRef.current) return;
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
          finishRecording(blob, (Date.now() - startRef.current) / 1000);
        };
        mr.start();
        mediaRef.current = mr;
      }
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        const s = (Date.now() - startRef.current) / 1000;
        setElapsed(s);
        if (s >= MAX_S) stopRecording();
      }, 200);
    } catch {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    }
  };

  const playNote = () => {
    if (!playbackUrl) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); return; }
    const audio = new Audio(playbackUrl);
    audioRef.current = audio;
    audio.onended = () => { audioRef.current = null; if (mountedRef.current) setIsPlaying(false); };
    audio.play().catch((err) => { console.error("[voice]", err); audioRef.current = null; if (mountedRef.current) setIsPlaying(false); });
    setIsPlaying(true);
  };

  const deleteNote = async () => {
    if (!savedNote) return;
    await deleteVoiceNote(savedNote.id);
    setSavedNote(null);
    setState("idle");
    setElapsed(0);
    setLiveTranscript("");
    transcriptRef.current = "";
    setManualNote("");
    setEditingNote(false);
  };

  const saveManualNote = async () => {
    if (!savedNote || !manualNote.trim()) { setEditingNote(false); return; }
    await updateVoiceNote(savedNote.id, { transcript: manualNote.trim() });
    setSavedNote((n) => n ? { ...n, transcript: manualNote.trim() } : n);
    setEditingNote(false);
  };

  if (state === "saved" && savedNote) {
    const transcript = savedNote.transcript;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center gap-2 px-3 py-2 te-panel rounded-md w-full">
          <span className="te-label text-white/50 flex-1">{t.voice_saved} · {savedNote.durationS}s</span>
          {transcript && (
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-white/40 hover:text-white/80 transition-colors"
              aria-label="Toggle transcript"
              title="Transcript"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={playNote} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-white/40 hover:text-white/80 transition-colors" aria-label={t.voice_play}>
            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={deleteNote} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-white/30 hover:text-red-400 transition-colors" aria-label={t.voice_delete}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {transcript && showTranscript && (
          <div
            className="px-3 py-2 rounded-md text-xs leading-relaxed"
            style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)", color: "var(--nc-text-2)" }}
          >
            {transcript}
          </div>
        )}
        {!transcript && getSpeechRecognition() === undefined && (
          editingNote ? (
            <div className="flex gap-1.5 items-center">
              <input
                autoFocus
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveManualNote(); if (e.key === "Escape") setEditingNote(false); }}
                placeholder="Add a text note…"
                className="flex-1 px-2 py-1.5 rounded text-xs bg-transparent outline-none"
                style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text)", caretColor: "var(--nc-text)" }}
              />
              <button onClick={saveManualNote} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-white/40 hover:text-white/80 transition-colors" aria-label="Save note">
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingNote(true)}
              className="flex items-center gap-1.5 px-1 text-[10px] transition-colors"
              style={{ color: "var(--nc-text-3)" }}
            >
              <PenLine className="w-3 h-3" />
              {t.voice_fallback_hint}
            </button>
          )
        )}
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center gap-3 px-3 py-2 te-panel rounded-md w-full">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="te-label text-white/60 flex-1">
            {t.voice_recording} {elapsed.toFixed(1)}s / {MAX_S}s
          </span>
          <button
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded border border-white/10 te-label text-white/50 hover:text-white/80 transition-colors"
          >
            <Square className="w-3 h-3" />
            {t.voice_release_to_stop}
          </button>
        </div>
        {liveTranscript && (
          <div
            className="px-3 py-2 rounded-md text-[10px] leading-relaxed italic"
            style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)", color: "var(--nc-text-3)" }}
          >
            {liveTranscript}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className="flex items-center gap-2 px-3 py-2 te-panel rounded-md w-full te-label text-white/40 hover:text-white/70 transition-colors"
    >
      <Mic className="w-3.5 h-3.5" />
      {t.voice_hold_to_record}
      <span className="ml-auto text-white/20 text-[10px]">{t.voice_max_duration}</span>
    </button>
  );
}
