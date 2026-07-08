"use client";

import { useState, useEffect, useRef } from "react";
import { Circle, Download, Share2, Trash2, Mic, Flag, Play, Square } from "lucide-react";
import {
  AudioRecorder as Recorder,
  downloadRecording,
  downloadChannelWav,
  shareRecording,
  getSupportedMimeType,
  mimeToLabel,
  type Recording,
  type RecordingMarker,
} from "@/lib/audio/recorder";
import { Haptics } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n/context";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function defaultFilename(): string {
  const now = new Date();
  return `noisecatcher-${now.toISOString().slice(0, 10)}-${now.getHours().toString().padStart(2, "0")}h${now.getMinutes().toString().padStart(2, "0")}`;
}

export default function AudioRecorderPanel() {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<RecordingMarker[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  // Blob URL for in-app playback. iOS Safari can't play data: URLs as audio src,
  // so a blob URL is required (same approach as VoiceNoteRecorder).
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  // Client-only capability detection must not run during the first render: on the
  // server MediaRecorder/navigator are absent, so the initial client render would
  // diverge from the SSR HTML → hydration mismatch. Gate detection on `mounted`,
  // which is false during SSR and the first client render, then true after mount.
  const [mounted, setMounted] = useState(false);
  const mimeType = mounted ? getSupportedMimeType() : "";
  const canShare = mounted && typeof navigator !== "undefined" && "canShare" in navigator;
  const recorderRef = useRef<Recorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);

  function addMarker() {
    const label = `${formatDuration(elapsed)}`;
    recorderRef.current?.addMarker(label);
    setMarkers((prev) => [...prev, { timeMs: elapsed * 1000, label }]);
  }

  function startRecording() {
    setError(null);
    setElapsed(0);
    setRecording(null);
    setMarkers([]);

    const rec = new Recorder(
      (r) => {
        setRecording(r);
        setFilename(defaultFilename());
        setPlaybackUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(r.blob); });
        setState("done");
        if (timerRef.current) clearInterval(timerRef.current);
      },
      (msg) => {
        setError(msg);
        setState("idle");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    );

    rec.start().then(() => {
      recorderRef.current = rec;
      setState("recording");
      Haptics.recordStart();
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }).catch(() => {
      // onError callback already updated UI state; suppress unhandled rejection
    });
  }

  function stopRecording() {
    Haptics.recordStop();
    recorderRef.current?.stop();
    recorderRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function playRecording() {
    if (!playbackUrl) return;
    // Toggle: if already playing, stop.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(playbackUrl);
    audioRef.current = audio;
    audio.onended = () => { audioRef.current = null; if (mountedRef.current) setIsPlaying(false); };
    audio.play().catch(() => { audioRef.current = null; if (mountedRef.current) setIsPlaying(false); });
    setIsPlaying(true);
  }

  function discard() {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setPlaybackUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    setRecording(null);
    setFilename("");
    setState("idle");
  }

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => {
      mountedRef.current = false;
      recorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
      setPlaybackUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    };
  }, []);

  if (mounted && !mimeType && typeof MediaRecorder === "undefined") {
    return (
      <p className="text-xs text-center" style={{ color: "var(--nc-text-3)" }}>
        {t.audio_unsupported}
      </p>
    );
  }

  return (
    <div className="w-full nc-surface rounded-xl overflow-hidden">
      <div className="px-4 py-2 nc-divider-b flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>{t.audio_title}</span>
        {mimeType && (
          <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>{mimeToLabel(mimeType)}</span>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">

        {state === "idle" && (
          <>
            <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
              {t.audio_description}
            </p>
            <button
              onClick={startRecording}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl nc-btn-ghost text-sm transition-colors"
            >
              <Circle className="w-3.5 h-3.5 fill-red-600 text-red-600" />
              {t.audio_start}
            </button>
          </>
        )}

        {state === "recording" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                <span className="nc-text font-mono text-sm tabular-nums">
                  {formatDuration(elapsed)}
                </span>
                <span className="text-xs" style={{ color: "var(--nc-text-3)" }}>{t.audio_recording_indicator}</span>
              </div>
              <button
                onClick={addMarker}
                className="flex items-center gap-1 px-3 py-2 rounded-lg nc-btn-ghost text-xs transition-colors"
                title="Add timestamp marker"
              >
                <Flag className="w-3 h-3" />
                {t.audio_marker_btn}
              </button>
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg nc-btn-ghost text-sm transition-colors"
              >
                {t.meter_stop}
              </button>
            </div>
            {markers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {markers.map((m, i) => (
                  <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--nc-bg-raised)", color: "var(--nc-text-3)" }}>
                    🚩 {m.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {state === "done" && recording && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--nc-text-2)" }}>
              <Mic className="w-3.5 h-3.5" />
              <span>{formatDuration(recording.durationSeconds)} · {mimeToLabel(recording.mimeType)} · {(recording.blob.size / 1024).toFixed(0)} KB</span>
            </div>
            {recording.blobSha256 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>SHA-256</span>
                <span
                  className="font-mono text-[9px] break-all select-all"
                  style={{ color: "var(--nc-text-3)" }}
                  title="SHA-256 of the recording blob, computed at capture. Keep this with your evidence file."
                >
                  {recording.blobSha256}
                </span>
              </div>
            )}
            {recording.markers && recording.markers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recording.markers.map((m, i) => (
                  <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--nc-bg-raised)", color: "var(--nc-text-3)" }}>
                    🚩 {m.label}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: "var(--nc-text-3)" }}>{t.audio_filename_label}</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="nc-input rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="recording-name"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={playRecording}
                aria-label={isPlaying ? "Stop playback" : "Play recording"}
                className="flex items-center justify-center px-3 py-2 rounded-lg nc-btn-ghost text-sm transition-colors"
              >
                {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => downloadRecording(recording, filename)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
              >
                <Download className="w-3.5 h-3.5" />
                {t.audio_save}
              </button>
              {canShare && (
                <button
                  onClick={() => shareRecording(recording, filename)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg nc-btn-ghost text-sm transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {t.audio_share}
                </button>
              )}
              <button
                onClick={discard}
                title="Discard"
                className="px-3 py-2 rounded-lg nc-btn-ghost hover:text-red-400 hover:border-red-900 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Per-channel WAV exports — shown when mic delivers 2+ channels */}
            {recording.channels && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
                  {recording.channelCount && recording.channelCount >= 4 ? "Ambisonic B-format" : "Binaural channels"} · WAV
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(recording.channels) as [string, Blob][]).map(([ch, blob]) => (
                    <button
                      key={ch}
                      onClick={() => downloadChannelWav(blob, filename, ch)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg nc-btn-ghost text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      {ch} · {(blob.size / 1024).toFixed(0)} KB
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>
              {t.audio_discard_hint}
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}
      </div>
    </div>
  );
}
