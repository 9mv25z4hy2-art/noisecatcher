// AudioRecorder — captures microphone audio to a downloadable file.
// Uses MediaRecorder API with the best codec available on the current browser.
// Chrome/Edge: audio/webm;codecs=opus (.webm)
// Firefox:     audio/ogg;codecs=opus  (.ogg)
// Safari 17+:  audio/mp4              (.m4a)
//
// If the microphone delivers 2+ channels, per-channel WAV files are also
// captured via Web Audio ChannelSplitterNode and exposed on Recording.channels.
// 2-channel → L + R   (binaural / stereo mic)
// 4-channel → W X Y Z (first-order Ambisonic B-format)

export type RecorderState = "idle" | "recording" | "done";

export interface RecordingMarker {
  timeMs: number;
  label: string;
}

export interface ChannelBlobs {
  L?: Blob; R?: Blob;         // binaural / stereo
  W?: Blob; X?: Blob; Y?: Blob; Z?: Blob; // ambisonic B-format
}

export interface Recording {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  markers?: RecordingMarker[];
  channels?: ChannelBlobs;
  channelCount?: number;
  // SHA-256 of the blob, computed immediately at capture — hex string
  blobSha256?: string;
}

const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function mimeToExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

export function mimeToLabel(mimeType: string): string {
  if (mimeType.includes("ogg")) return "Ogg/Opus";
  if (mimeType.includes("mp4")) return "M4A/AAC";
  return "WebM/Opus";
}

// ── WAV encoder ────────────────────────────────────────────────────────
function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

// 32-bit float WAV (IEEE 754) — lossless relative to Web Audio's native Float32
// samples. No dithering, no clipping, full dynamic range. Every DAW handles it.
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const dataLength = samples.length * 4; // 32-bit float = 4 bytes/sample
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  writeString(view, 0,  "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8,  "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);          // fmt chunk size
  view.setUint16(20, 3,  true);          // format: IEEE 754 float (3 = WAVE_FORMAT_IEEE_FLOAT)
  view.setUint16(22, 1,  true);          // mono (one channel per file)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true); // byte rate
  view.setUint16(32, 4,  true);          // block align
  view.setUint16(34, 32, true);          // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);
  // Write samples directly — no conversion, no clipping
  new Float32Array(buffer, 44).set(samples);
  return new Blob([buffer], { type: "audio/wav" });
}

// Channel name maps: 2-ch = binaural L/R, 4-ch = ambisonic W/X/Y/Z
const CH_NAMES_2 = ["L", "R"] as const;
const CH_NAMES_4 = ["W", "X", "Y", "Z"] as const;

// ── AudioRecorder class ─────────────────────────────────────────────────
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private markers: RecordingMarker[] = [];
  private onComplete: (recording: Recording) => void;
  private onError: (msg: string) => void;

  // Per-channel PCM capture (Web Audio)
  private audioCtx: AudioContext | null = null;
  private channelBuffers: Float32Array[][] = [];
  private capturedChannelCount = 0;
  private capturedSampleRate = 48000;

  constructor(
    onComplete: (recording: Recording) => void,
    onError: (msg: string) => void
  ) {
    this.onComplete = onComplete;
    this.onError = onError;
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // ── Web Audio channel capture ─────────────────────────────────────
      this.channelBuffers = [];
      this.capturedChannelCount = 0;
      try {
        const ctx = new AudioContext();
        this.audioCtx = ctx;
        this.capturedSampleRate = ctx.sampleRate;
        const source = ctx.createMediaStreamSource(this.stream);
        const nChannels = source.channelCount;

        if (nChannels >= 2) {
          this.capturedChannelCount = nChannels;
          this.channelBuffers = Array.from({ length: nChannels }, () => []);
          const splitter = ctx.createChannelSplitter(nChannels);
          source.connect(splitter);

          for (let ch = 0; ch < nChannels; ch++) {
            // ScriptProcessorNode is deprecated but universally supported.
            // AudioWorklet requires a worker file — not worth the complexity here.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const proc = ctx.createScriptProcessor(4096, 1, 1);
            const chIdx = ch;
            const bufs = this.channelBuffers;
            proc.onaudioprocess = (e) => {
              bufs[chIdx]?.push(new Float32Array(e.inputBuffer.getChannelData(0)));
            };
            splitter.connect(proc, ch, 0);
            proc.connect(ctx.destination); // must be connected to fire onaudioprocess
          }
        }
      } catch {
        // Non-fatal: proceed without channel capture
        this.audioCtx = null;
        this.capturedChannelCount = 0;
      }

      // ── MediaRecorder (merged stream) ─────────────────────────────────
      const mimeType = getSupportedMimeType();
      this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : {});
      this.chunks = [];
      this.markers = [];
      this.startTime = Date.now();

      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.recorder.onstop = async () => {
        const finalMime = this.recorder?.mimeType ?? mimeType ?? "audio/webm";
        const blob = new Blob(this.chunks, { type: finalMime });
        const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);

        // SHA-256 of the blob computed at capture, before any export or download.
        // Gives the user a verifiable fingerprint of the unmodified recording.
        let blobSha256: string | undefined;
        try {
          const buf = await blob.arrayBuffer();
          const hashBuf = await crypto.subtle.digest("SHA-256", buf);
          blobSha256 = Array.from(new Uint8Array(hashBuf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } catch { /* non-fatal: subtle not available in some contexts */ }

        // Build per-channel WAV blobs
        let channels: ChannelBlobs | undefined;
        const nCh = this.capturedChannelCount;
        if (nCh >= 2 && this.channelBuffers.some((b) => b.length > 0)) {
          channels = {};
          const names = nCh >= 4 ? CH_NAMES_4 : CH_NAMES_2;
          for (let ch = 0; ch < Math.min(nCh, names.length); ch++) {
            const chunks = this.channelBuffers[ch] ?? [];
            const totalLen = chunks.reduce((s, c) => s + c.length, 0);
            const samples = new Float32Array(totalLen);
            let off = 0;
            for (const chunk of chunks) { samples.set(chunk, off); off += chunk.length; }
            (channels as Record<string, Blob>)[names[ch]] = encodeWav(samples, this.capturedSampleRate);
          }
        }

        this.onComplete({
          blob,
          mimeType: finalMime,
          durationSeconds,
          markers: [...this.markers],
          channels,
          channelCount: nCh > 0 ? nCh : undefined,
          blobSha256,
        });
        this.cleanup();
      };

      this.recorder.onerror = () => {
        this.onError("Recording failed unexpectedly.");
        this.cleanup();
      };

      this.recorder.start(500);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          this.onError("Microphone access denied.");
        } else {
          this.onError(`Could not start recording: ${err.message}`);
        }
      }
      throw err;
    }
  }

  stop(): void {
    if (this.recorder?.state === "recording") {
      this.recorder.stop();
    }
  }

  addMarker(label: string): void {
    if (this.recorder?.state === "recording") {
      this.markers.push({ timeMs: Date.now() - this.startTime, label });
    }
  }

  get isRecording(): boolean {
    return this.recorder?.state === "recording";
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.channelBuffers = [];
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

export function downloadRecording(recording: Recording, filename: string): void {
  const ext = mimeToExtension(recording.mimeType);
  const name = filename.trim() || "noisecatcher-recording";
  triggerDownload(recording.blob, `${name}.${ext}`);
}

export function downloadChannelWav(blob: Blob, filename: string, channel: string): void {
  const name = filename.trim() || "noisecatcher-recording";
  triggerDownload(blob, `${name}-${channel}.wav`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function shareRecording(
  recording: Recording,
  filename: string
): Promise<boolean> {
  if (!navigator.canShare) return false;
  const ext = mimeToExtension(recording.mimeType);
  const name = `${filename.trim() || "noisecatcher-recording"}.${ext}`;
  const file = new File([recording.blob], name, { type: recording.mimeType });
  if (!navigator.canShare({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], title: name });
    return true;
  } catch {
    return false;
  }
}
