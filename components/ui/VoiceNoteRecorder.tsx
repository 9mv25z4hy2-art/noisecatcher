"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Trash2, FileText, PenLine, Check } from "lucide-react";
import { saveVoiceNote, deleteVoiceNote, updateVoiceNote, type VoiceNote } from "@/lib/db";
import { useI18n } from "@/lib/i18n/context";

const MAX_S = 60;

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
  const [debugInfo, setDebugInfo] = useState("");
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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mediaRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
      recognitionRef.current?.stop();
    };
  }, []);

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recognitionRef.current?.stop();
    mediaRef.current?.stop();
    mediaRef.current = null;
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
      // Pick first supported MIME type — iOS Safari returns "" from mr.mimeType
      // even though it records valid audio/mp4, causing playback to fail.
      const PREFERRED = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
      const chosenMime = PREFERRED.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const mr = chosenMime ? new MediaRecorder(stream, { mimeType: chosenMime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (!mountedRef.current) return;
        const actualMime = mr.mimeType || chosenMime || "audio/mp4";
        const blob = new Blob(chunksRef.current, { type: actualMime });
        // DEBUG — remove after confirming recording works on iOS
        setDebugInfo(`chunks:${chunksRef.current.length} size:${blob.size} mime:${actualMime} chosen:${chosenMime}`);
        const dur = (Date.now() - startRef.current) / 1000;
        const finalTranscript = transcriptRef.current.trim() || undefined;
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (!mountedRef.current) return;
          const note = await saveVoiceNote({
            audioDataUrl: reader.result as string,
            durationS: Math.round(dur),
            attachedTo,
            attachedType,
            carnetId,
            transcript: finalTranscript,
          });
          if (!mountedRef.current) return;
          setSavedNote(note);
          setState("saved");
          onSaved?.(note);
        };
        reader.readAsDataURL(blob);
      };
      // No timeslice — iOS Safari doesn't reliably fire ondataavailable mid-recording;
      // all data arrives in a single event when stop() is called.
      mr.start();
      mediaRef.current = mr;
      startRef.current = Date.now();
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
    if (!savedNote) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); return; }
    // Convert data URL → blob URL: iOS Safari rejects large audio data URLs
    const mimeMatch = savedNote.audioDataUrl.match(/data:([^;]+)/);
    const mime = mimeMatch?.[1] ?? "audio/mp4";
    const b64 = savedNote.audioDataUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const audio = new Audio(blobUrl);
    audioRef.current = audio;
    audio.onended = () => { URL.revokeObjectURL(blobUrl); audioRef.current = null; if (mountedRef.current) setIsPlaying(false); };
    audio.play().catch((err) => { URL.revokeObjectURL(blobUrl); console.error("[voice]", err); audioRef.current = null; if (mountedRef.current) setIsPlaying(false); });
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
        {/* Temporary native audio element for iOS debug — remove after confirming playback works */}
        <audio controls src={savedNote.audioDataUrl} style={{ width: "100%", height: 40 }} />
        {debugInfo && <p style={{ fontSize: 10, color: "lime", wordBreak: "break-all" }}>{debugInfo}</p>}
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
