// Speech Intelligibility Index — indicative approximation of ANSI S3.5-1997.
// Produces a 0–1 score: fraction of normal speech that survives the noise floor.
// Uses 18 standard 1/3-octave bands from 160 Hz to 8000 Hz.
// NOT a certified measurement — for indicative context only.

// 1/3-octave band centre frequencies (Hz), ANSI S3.5
const BAND_CENTERS = [160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000];

// Band importance weights I_i — ANSI S3.5 Table 3 (normal conversational voice)
const IMPORTANCE = [0.0083, 0.0095, 0.0150, 0.0289, 0.0440, 0.0578, 0.0653, 0.0711, 0.0818, 0.0844, 0.0882, 0.0898, 0.0868, 0.0844, 0.0771, 0.0527, 0.0364, 0.0185];

// Standard male conversational speech spectrum levels (dB SPL, ANSI S3.5 Table B.2)
const SPEECH_LEVELS = [34.8, 34.8, 34.8, 34.8, 34.8, 34.8, 36.8, 39.8, 40.8, 39.8, 38.8, 36.8, 32.8, 25.8, 20.8, 10.8, 6.8, -1.2];

/**
 * Compute indicative SII from FFT float frequency data.
 * @param freqData   Float32Array of dBFS values from AnalyserNode.getFloatFrequencyData()
 * @param sampleRate AudioContext.sampleRate
 * @param fftSize    AnalyserNode.fftSize
 * @param calibOffset calibration offset in dB added to readings
 * @returns 0–1 score, or null if data is silent/unavailable
 */
export function computeSII(
  freqData: Float32Array,
  sampleRate: number,
  fftSize: number,
  calibOffset = 0
): number | null {
  const binCount = freqData.length; // = fftSize / 2
  const binWidth = sampleRate / fftSize;

  // Convert dBFS bins to linear power, then group into 1/3-octave bands
  let sii = 0;
  let totalWeight = 0;

  for (let b = 0; b < BAND_CENTERS.length; b++) {
    const fc = BAND_CENTERS[b];
    // 1/3-octave edges: fc * 2^(±1/6)
    const fLow  = fc * Math.pow(2, -1 / 6);
    const fHigh = fc * Math.pow(2,  1 / 6);

    const iBinLow  = Math.max(0, Math.floor(fLow  / binWidth));
    const iBinHigh = Math.min(binCount - 1, Math.ceil(fHigh / binWidth));

    if (iBinHigh <= iBinLow) continue;

    // Sum linear power across bins in this band
    let linearSum = 0;
    let count = 0;
    for (let i = iBinLow; i <= iBinHigh; i++) {
      const dbfs = freqData[i];
      if (dbfs > -144) { // ignore silent bins
        linearSum += Math.pow(10, dbfs / 10);
        count++;
      }
    }
    if (count === 0) continue;

    // Band noise level in dBFS, shifted by calibration offset (indicative dB SPL)
    const bandNoiseDb = 10 * Math.log10(linearSum / count) + calibOffset;

    // Band transfer function: how much speech SNR survives
    // Clamped to [0, 30] dB headroom per ANSI S3.5
    const speechLevel = SPEECH_LEVELS[b];
    const snr = Math.max(0, Math.min(30, speechLevel - bandNoiseDb));

    sii += IMPORTANCE[b] * (snr / 30);
    totalWeight += IMPORTANCE[b];
  }

  if (totalWeight < 0.5) return null; // too few valid bands
  return Math.max(0, Math.min(1, sii / totalWeight));
}

/** Human-readable SII rating. */
export function siiLabel(sii: number): string {
  if (sii >= 0.75) return "Good";
  if (sii >= 0.45) return "Fair";
  if (sii >= 0.20) return "Poor";
  return "Very poor";
}
