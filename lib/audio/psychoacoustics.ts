// Psychoacoustic metrics — Zwicker & Fastl "Psychoacoustics: Facts and Models" (3rd ed.)
// These are scientifically grounded approximations; not ISO 532-1 certified instruments.
// Suitable for indicative environmental noise analysis.

export interface PsychoacousticMetrics {
  loudness: number;   // N, sone  — perceived loudness
  sharpness: number;  // S, acum  — perceived sharpness / brightness
  roughness: number;  // R, asper — perceived roughness / harshness
  annoyance: number;  // PA       — psychoacoustic annoyance (dimensionless)
}

/** Loudness in sone from broadband dB(A). Zwicker approximation (eq. 8.1). */
export function soneFromDB(dBA: number): number {
  if (dBA < 2) return 0;
  return Math.pow(2, (dBA - 40) / 10);
}

/** Frequency (Hz) to Bark critical-band rate. Traunmüller (1990) formula. */
function freqToBark(f: number): number {
  return 26.81 * f / (1960 + f) - 0.53;
}

/** Sharpness weighting g(z) — Aures (1985) model. */
function sharpnessWeight(bark: number): number {
  if (bark <= 15.8) return 1;
  return 0.066 * Math.exp(0.171 * bark);
}

/**
 * Sharpness in acum from FFT frequency magnitudes.
 * freqData: Uint8Array (0–255) from AnalyserNode.getByteFrequencyData
 * Higher sharpness = more high-frequency energy = sounds "brighter" / more irritating
 */
export function computeSharpness(freqData: Uint8Array, sampleRate: number): number {
  const N = freqData.length;
  const binHz = sampleRate / (2 * N);
  let weightedSum = 0;
  let totalEnergy = 0;

  for (let i = 1; i < N; i++) {
    const f = i * binHz;
    const bark = freqToBark(f);
    const mag = freqData[i] / 255;
    const energy = mag * mag;
    weightedSum += energy * sharpnessWeight(bark) * bark;
    totalEnergy += energy;
  }

  if (totalEnergy < 1e-10) return 0;
  // Aures calibration constant 0.11; result typically 0.5–4.0 acum
  return Math.min(10, 0.11 * weightedSum / totalEnergy);
}

/**
 * Roughness in asper (simplified AM-based model).
 * Roughness is maximal when amplitude modulation occurs at ~70 Hz (Fastl & Zwicker).
 * We detect this via autocorrelation at lag = sampleRate / 70.
 * timeDomainData: Float32Array from AnalyserNode.getFloatTimeDomainData
 */
export function computeRoughness(timeDomainData: Float32Array, sampleRate: number): number {
  const targetHz = 70; // Hz — peak roughness modulation rate
  const lag = Math.round(sampleRate / targetHz);
  const N = timeDomainData.length;
  if (lag >= N) return 0;

  // Compute squared envelope autocorrelation at the target lag
  let crossSum = 0, selfSum = 0;
  for (let i = 0; i < N - lag; i++) {
    const a = timeDomainData[i] * timeDomainData[i];
    const b = timeDomainData[i + lag] * timeDomainData[i + lag];
    crossSum += a * b;
    selfSum += a * a;
  }
  if (selfSum < 1e-20) return 0;
  // Normalize; typical range 0–1 asper for everyday environmental sounds
  return Math.min(1, Math.sqrt(Math.max(0, crossSum / selfSum)));
}

/**
 * Psychoacoustic Annoyance — Zwicker & Fastl eq. 15.1 (simplified).
 * PA = N · (1 + √(w_s² + w_r²))
 * w_s: sharpness contribution, w_r: roughness contribution
 */
export function computeAnnoyance(loudness: number, sharpness: number, roughness: number): number {
  if (loudness < 0.01) return 0;
  const ws = Math.max(0, 0.25 * (sharpness - 1.75)) * Math.log10(loudness + 10);
  const wr = roughness * 0.3;
  return loudness * (1 + Math.sqrt(ws * ws + wr * wr));
}

/** Compute all four metrics in one call. */
export function computeAll(
  dBA: number,
  freqData: Uint8Array,
  timeDomainData: Float32Array,
  sampleRate: number
): PsychoacousticMetrics {
  const loudness   = soneFromDB(dBA);
  const sharpness  = computeSharpness(freqData, sampleRate);
  const roughness  = computeRoughness(timeDomainData, sampleRate);
  const annoyance  = computeAnnoyance(loudness, sharpness, roughness);
  return {
    loudness:  Math.round(loudness  * 10) / 10,
    sharpness: Math.round(sharpness * 100) / 100,
    roughness: Math.round(roughness * 100) / 100,
    annoyance: Math.round(annoyance * 10) / 10,
  };
}
