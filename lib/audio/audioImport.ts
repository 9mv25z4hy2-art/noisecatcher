// Audio file import and offline analysis for Noisecatcher.
// Decodes any browser-supported audio format and computes acoustic statistics,
// a waveform preview, and a full spectrogram via a pure-JS FFT.

import { computeStats } from "./stats";
import { soneFromDB, computeSharpness, computeRoughness, computeAnnoyance } from "./psychoacoustics";

export interface ImportedAnalysis {
  filename: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  // Acoustic statistics
  leq: number;
  lmax: number;
  l10: number;
  l50: number;
  l90: number;
  // Psychoacoustics (from overall spectrum)
  loudness: number;
  sharpness: number;
  roughness: number;
  annoyance: number;
  // Visuals
  waveform: Float32Array;   // 512 points, amplitude 0–1
  spectrogramDataUrl: string; // canvas-rendered PNG data URL
  // Raw audio buffer for further analysis (e.g. YAMNet)
  audioBuffer: AudioBuffer;
}

/* ── Radix-2 in-place Cooley-Tukey FFT ─────────────────────────────── */
function fft(re: Float32Array, im: Float32Array): void {
  const N = re.length;
  // Bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  // Butterfly passes
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wCos = Math.cos(ang), wSin = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let curCos = 1, curSin = 0;
      for (let j = 0; j < len >> 1; j++) {
        const uR = re[i + j], uI = im[i + j];
        const vR = re[i + j + (len >> 1)] * curCos - im[i + j + (len >> 1)] * curSin;
        const vI = re[i + j + (len >> 1)] * curSin + im[i + j + (len >> 1)] * curCos;
        re[i + j] = uR + vR; im[i + j] = uI + vI;
        re[i + j + (len >> 1)] = uR - vR; im[i + j + (len >> 1)] = uI - vI;
        const nc = curCos * wCos - curSin * wSin;
        curSin = curCos * wSin + curSin * wCos;
        curCos = nc;
      }
    }
  }
}

/* ── Heat-map colour (matches Spectrogram.tsx) ─────────────────────── */
function heatmap(v: number): [number, number, number] {
  if (v < 0.25) { const s = v / 0.25; return [0, 0, Math.round(80 + 120 * s)]; }
  if (v < 0.5)  { const s = (v - 0.25) / 0.25; return [0, Math.round(255 * s), 200]; }
  if (v < 0.75) { const s = (v - 0.5) / 0.25; return [Math.round(255 * s), 255, Math.round(200 * (1 - s))]; }
  const s = (v - 0.75) / 0.25; return [255, Math.round(255 * (1 - s)), 0];
}

/** Render a spectrogram from raw mono samples and return a canvas data URL. */
function renderSpectrogram(channelData: Float32Array): string {
  const TIME_STEPS = 256;
  const FREQ_BINS  = 128;  // display bins (low → mid range)
  const FFT_SIZE   = 512;  // must be power of 2

  const hopSize = Math.max(1, Math.floor((channelData.length - FFT_SIZE) / TIME_STEPS));
  const re = new Float32Array(FFT_SIZE);
  const im = new Float32Array(FFT_SIZE);

  const canvas = document.createElement("canvas");
  canvas.width  = TIME_STEPS;
  canvas.height = FREQ_BINS;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(TIME_STEPS, FREQ_BINS);

  // Hann window weights
  const window = new Float32Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++)
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)));

  for (let t = 0; t < TIME_STEPS; t++) {
    const offset = t * hopSize;
    re.fill(0); im.fill(0);
    for (let i = 0; i < FFT_SIZE && offset + i < channelData.length; i++)
      re[i] = channelData[offset + i] * window[i];

    fft(re, im);

    for (let f = 0; f < FREQ_BINS; f++) {
      const mag = Math.sqrt(re[f] * re[f] + im[f] * im[f]) / FFT_SIZE;
      const db  = mag > 0 ? 20 * Math.log10(mag) + 90 : 0;
      const v   = Math.max(0, Math.min(1, db / 90));
      const [r, g, b] = heatmap(v);
      // Flip Y: low frequencies at bottom
      const pixIdx = ((FREQ_BINS - 1 - f) * TIME_STEPS + t) * 4;
      img.data[pixIdx]     = r;
      img.data[pixIdx + 1] = g;
      img.data[pixIdx + 2] = b;
      img.data[pixIdx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Compute dB(A) readings at 10ms frames for statistical analysis. */
function computeReadings(channelData: Float32Array, sampleRate: number): number[] {
  const frameSize = Math.round(sampleRate * 0.01);
  const readings: number[] = [];
  for (let offset = 0; offset + frameSize < channelData.length; offset += frameSize) {
    let sumSq = 0;
    for (let i = 0; i < frameSize; i++) sumSq += channelData[offset + i] ** 2;
    const rms = Math.sqrt(sumSq / frameSize);
    const db  = rms > 0 ? 20 * Math.log10(rms) + 90 : 0;
    readings.push(Math.max(0, Math.min(140, db)));
  }
  return readings;
}

/** Compute overall frequency spectrum as a Uint8Array (like AnalyserNode output). */
function computeOverallSpectrum(channelData: Float32Array, bins = 1024): Uint8Array {
  const accum = new Float64Array(bins);
  const fftSize = bins * 2;
  const re = new Float32Array(fftSize);
  const im = new Float32Array(fftSize);
  const win = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++)
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));

  const hop = Math.max(fftSize, Math.floor(channelData.length / 200));
  for (let off = 0; off + fftSize < channelData.length; off += hop) {
    re.fill(0); im.fill(0);
    for (let i = 0; i < fftSize; i++) re[i] = channelData[off + i] * win[i];
    fft(re, im);
    for (let f = 0; f < bins; f++) {
      const mag = Math.sqrt(re[f] * re[f] + im[f] * im[f]) / fftSize;
      accum[f] += mag;
    }
  }

  const result = new Uint8Array(bins);
  // Avoid spread on large typed arrays (RangeError risk); reduce is safe for any size.
  let peak = 0;
  for (let f = 0; f < bins; f++) if (accum[f] > peak) peak = accum[f];
  if (peak === 0) peak = 1;
  // Normalize per-frame average to 0–255. accum[f]/frames is the average magnitude
  // per frame; dividing by peak/frames normalises to [0,1]. The frames cancel:
  // accum[f] / (peak/frames * frames) = accum[f] / peak.
  for (let f = 0; f < bins; f++) result[f] = Math.min(255, Math.round((accum[f] / peak) * 255));
  return result;
}

/** Main entry point — decode a File and return the full analysis. */
export async function analyzeAudioFile(file: File): Promise<ImportedAnalysis> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx   = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  const sampleRate = audioBuffer.sampleRate;
  const channels   = audioBuffer.numberOfChannels;

  // Use mono downmix (average all channels)
  const channelData = new Float32Array(audioBuffer.length);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) channelData[i] += data[i] / channels;
  }

  // Acoustic statistics
  const readings = computeReadings(channelData, sampleRate);
  const stats    = computeStats(readings) ?? { leq: 0, lmax: 0, l10: 0, l50: 0, l90: 0 };

  // Psychoacoustics — use overall spectrum + RMS of entire file
  const spectrum  = computeOverallSpectrum(channelData);
  const loudness  = soneFromDB(stats.leq);
  const sharpness = computeSharpness(spectrum, sampleRate);
  const roughness = computeRoughness(channelData.slice(0, Math.min(channelData.length, sampleRate * 2)), sampleRate);
  const annoyance = computeAnnoyance(loudness, sharpness, roughness);

  // Waveform (512 points, amplitude 0–1)
  const WAVEFORM_POINTS = 512;
  const waveform = new Float32Array(WAVEFORM_POINTS);
  const step     = Math.floor(channelData.length / WAVEFORM_POINTS);
  for (let i = 0; i < WAVEFORM_POINTS; i++) {
    let peak = 0;
    for (let j = 0; j < step; j++) peak = Math.max(peak, Math.abs(channelData[i * step + j] ?? 0));
    waveform[i] = peak;
  }

  // Spectrogram (rendered to canvas data URL)
  const spectrogramDataUrl = renderSpectrogram(channelData);

  return {
    filename: file.name,
    durationSeconds: Math.round(audioBuffer.duration),
    sampleRate, channels,
    ...stats,
    loudness:  Math.round(loudness  * 10) / 10,
    sharpness: Math.round(sharpness * 100) / 100,
    roughness: Math.round(roughness * 100) / 100,
    annoyance: Math.round(annoyance * 10) / 10,
    waveform,
    spectrogramDataUrl,
    audioBuffer,
  };
}

/** Format seconds as MM:SS */
export function formatDuration(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
