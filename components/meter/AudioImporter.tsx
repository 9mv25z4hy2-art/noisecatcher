"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Cpu, AlertCircle, Link } from "lucide-react";
import { analyzeAudioFile, formatDuration, type ImportedAnalysis } from "@/lib/audio/audioImport";
import { loadYAMNet, classify, type ClassificationResult, type YAMNetStatus } from "@/lib/audio/yamnet";
import { loadReports, updateReport, type NoiseReport } from "@/lib/db";
import { useI18n } from "@/lib/i18n/context";

function WaveformCanvas({ waveform }: { waveform: Float32Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Draw once on mount
  const drawRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < waveform.length; i++) {
      const x = (i / waveform.length) * W;
      const amp = waveform[i] * H * 0.45;
      ctx.moveTo(x, H / 2 - amp);
      ctx.lineTo(x, H / 2 + amp);
    }
    ctx.stroke();
  }, [waveform]);

  return (
    <canvas
      ref={(el) => { canvasRef.current = el; drawRef(el); }}
      width={512}
      height={48}
      className="w-full block rounded"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

const YAMNET_THRESHOLD = 0.10; // show results above this; flag below 0.30 as uncertain

function ClassificationBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-40 truncate" style={{ color: "var(--nc-text-2)" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--nc-border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--nc-text-2)" }}
        />
      </div>
      <span className="w-8 text-right tabular-nums" style={{ color: "var(--nc-text-3)" }}>{pct}%</span>
    </div>
  );
}

const YAMNET_STATUS_LABELS: Record<YAMNetStatus, string> = {
  idle: "Classify sounds (AI)",
  "loading-tf": "Loading TensorFlow.js…",
  "loading-model": "Loading YAMNet model (~10 MB)…",
  ready: "Re-classify",
  error: "AI unavailable — retry",
};

export default function AudioImporter() {
  const { t } = useI18n();
  const [analysis, setAnalysis] = useState<ImportedAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [yamnetStatus, setYamnetStatus] = useState<YAMNetStatus>("idle");
  const [classifications, setClassifications] = useState<ClassificationResult[] | null>(null);
  const [recentReports, setRecentReports] = useState<NoiseReport[]>([]);
  const [linkReportId, setLinkReportId] = useState<string>("");
  const [linked, setLinked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setAnalyzeError(null);
    setAnalysis(null);
    setClassifications(null);
    setAnalyzing(true);
    try {
      const result = await analyzeAudioFile(file);
      setAnalysis(result);
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Could not decode audio file.");
    } finally {
      setAnalyzing(false);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function runYAMNet() {
    if (!analysis?.audioBuffer) return;
    if (yamnetStatus === "loading-tf" || yamnetStatus === "loading-model") return;
    setClassifications(null);
    try {
      await loadYAMNet((s) => setYamnetStatus(s));
      const results = await classify(analysis.audioBuffer);
      // Keep results at or above YAMNET_THRESHOLD; an empty array means
      // no class reached the threshold — shown explicitly rather than silently dropped.
      const filtered = results.filter((r) => r.score >= YAMNET_THRESHOLD);
      setClassifications(filtered);
      setYamnetStatus("ready");
      setLinked(false);
      setLinkReportId("");
      // Load up to 5 recent reports to offer linking
      const recent = await loadReports();
      setRecentReports(recent.slice(0, 5));
      if (recent.length > 0) setLinkReportId(recent[0].id);
    } catch {
      setYamnetStatus("error");
    }
  }

  // Note: imported-file levels use time-domain RMS (not A-weighted), unlike the
  // live meter which applies IEC 61672-1 A-weighting in the frequency domain.
  // Both use a +90 dBFS offset; values are indicative and not directly comparable.
  const statItems = analysis
    ? [
        { label: "Leq", value: `${analysis.leq}`, unit: "dB*" },
        { label: "Lmax", value: `${analysis.lmax}`, unit: "dB*" },
        { label: "L10", value: `${analysis.l10}`, unit: "dB*" },
        { label: "L90", value: `${analysis.l90}`, unit: "dB*" },
      ]
    : [];

  const psychoItems = analysis
    ? [
        { label: t.psycho_loudness, value: `${analysis.loudness}`, unit: "sone" },
        { label: t.psycho_sharpness, value: `${analysis.sharpness}`, unit: "acum" },
        { label: t.psycho_roughness, value: `${analysis.roughness}`, unit: "asper" },
        { label: t.psycho_annoyance, value: `${analysis.annoyance}`, unit: "PA" },
      ]
    : [];

  return (
    <div className="w-full nc-surface rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 nc-divider-b flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>
          {t.import_title}
        </span>
        <Upload className="w-3.5 h-3.5" style={{ color: "var(--nc-text-3)" }} />
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload audio file"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
          className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-colors py-6"
          style={{ border: "1.5px dashed var(--nc-border-mid)", background: "var(--nc-bg-raised)" }}
        >
          <Upload className="w-5 h-5" style={{ color: "var(--nc-text-3)" }} />
          <p className="text-xs text-center" style={{ color: "var(--nc-text-3)" }}>
            {analyzing ? t.import_analyzing : t.import_drop_hint}
          </p>
          {analysis && !analyzing && (
            <p className="text-xs font-medium truncate max-w-full px-4" style={{ color: "var(--nc-text-2)" }}>
              {analysis.filename}
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={onFileInput}
          className="hidden"
        />

        {analyzeError && (
          <div className="flex items-start gap-2 text-red-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{analyzeError}</span>
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <>
            {/* File info */}
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--nc-text-3)" }}>
              <span>{formatDuration(analysis.durationSeconds)}</span>
              <span>·</span>
              <span>{(analysis.sampleRate / 1000).toFixed(1)} kHz</span>
              <span>·</span>
              <span>{analysis.channels === 1 ? "Mono" : "Stereo"}</span>
            </div>

            {/* Waveform */}
            <WaveformCanvas waveform={analysis.waveform} />

            {/* Spectrogram */}
            <div className="rounded overflow-hidden" style={{ border: "1px solid var(--nc-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={analysis.spectrogramDataUrl}
                alt="Spectrogram"
                className="w-full block"
                style={{ imageRendering: "pixelated", height: 80, objectFit: "fill" }}
              />
            </div>

            {/* Acoustic statistics */}
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--nc-text-3)" }}>
                {t.meter_stats_title}
              </p>
              <div className="grid grid-cols-4 divide-x divide-white/5 rounded overflow-hidden" style={{ border: "1px solid var(--nc-border)" }}>
                {statItems.map(({ label, value, unit }) => (
                  <div key={label} className="flex flex-col items-center py-2 gap-0.5">
                    <span className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>{label}</span>
                    <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: "var(--nc-text)" }}>
                      {value}<span className="text-[9px] ml-0.5" style={{ color: "var(--nc-text-3)" }}>{unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>
              * RMS-based, unweighted — not A-weighted. Values not directly comparable to live meter readings.
            </p>

            {/* Psychoacoustic analysis */}
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--nc-text-3)" }}>
                {t.psycho_title}
              </p>
              <div className="grid grid-cols-4 divide-x divide-white/5 rounded overflow-hidden" style={{ border: "1px solid var(--nc-border)" }}>
                {psychoItems.map(({ label, value, unit }) => (
                  <div key={label} className="flex flex-col items-center py-2 gap-0.5">
                    <span className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>{label}</span>
                    <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: "var(--nc-text)" }}>
                      {value}<span className="text-[9px] ml-0.5" style={{ color: "var(--nc-text-3)" }}>{unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* YAMNet sound classification */}
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--nc-text-3)" }}>
                {t.import_classify_label}
              </p>
              <button
                onClick={runYAMNet}
                disabled={yamnetStatus === "loading-tf" || yamnetStatus === "loading-model"}
                className="flex items-center gap-2 w-full py-2 rounded-lg text-xs transition-colors disabled:opacity-60"
                style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)", background: "var(--nc-bg-raised)" }}
              >
                <Cpu className="w-3.5 h-3.5 ml-3" />
                {YAMNET_STATUS_LABELS[yamnetStatus]}
              </button>

              {classifications !== null && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {classifications.length === 0 ? (
                    <p className="text-xs py-1" style={{ color: "var(--nc-text-3)" }}>
                      No sound class reached {Math.round(YAMNET_THRESHOLD * 100)}% confidence — the audio may contain sounds the model was not trained on, or the recording is too quiet or noisy.
                    </p>
                  ) : (
                    <>
                      {classifications[0].score < 0.30 && (
                        <div className="flex items-start gap-1.5 text-[10px] px-2 py-1.5 rounded" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "rgba(234,179,8,0.7)" }}>
                          <AlertCircle className="w-3 h-3 mt-px shrink-0" />
                          <span>Top result is {Math.round(classifications[0].score * 100)}% — high uncertainty. YAMNet is trained mainly on YouTube audio (Western/urban bias); results for non-Western or outdoor contexts are especially unreliable.</span>
                        </div>
                      )}
                      {classifications.slice(0, 8).map((r) => (
                        <ClassificationBar key={r.index} label={r.label} score={r.score} />
                      ))}
                      {/* Link top label to a recent report */}
                      {recentReports.length > 0 && classifications.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1.5 pt-2" style={{ borderTop: "1px solid var(--nc-border)" }}>
                          <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
                            Link top label to report
                          </span>
                          <div className="flex gap-2 items-center">
                            <select
                              value={linkReportId}
                              onChange={(e) => { setLinkReportId(e.target.value); setLinked(false); }}
                              className="flex-1 text-[10px] rounded px-2 py-1"
                              style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
                            >
                              {recentReports.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {new Date(r.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {r.leq.toFixed(1)} dB
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={async () => {
                                if (!linkReportId || classifications.length === 0) return;
                                try {
                                  await updateReport(linkReportId, { yamnetTopLabel: classifications[0].label });
                                  setLinked(true);
                                } catch {
                                  // IDB write failed — leave linked=false so the user can retry
                                }
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
                              style={{ background: linked ? "rgba(52,211,153,0.12)" : "var(--nc-bg-raised)", border: `1px solid ${linked ? "rgba(52,211,153,0.3)" : "var(--nc-border-mid)"}`, color: linked ? "rgb(52,211,153)" : "var(--nc-text-2)" }}
                            >
                              <Link className="w-2.5 h-2.5" />
                              {linked ? "Saved" : "Save"}
                            </button>
                          </div>
                          {linked && (
                            <span className="text-[9px]" style={{ color: "rgba(52,211,153,0.7)" }}>
                              "{classifications[0].label}" saved to report.
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Description when no file */}
        {!analysis && !analyzing && (
          <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
            {t.import_description}
          </p>
        )}

      </div>
    </div>
  );
}
