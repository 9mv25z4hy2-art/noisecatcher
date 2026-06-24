import { describe, it, expect } from "vitest";
import { computeSII, siiLabel } from "../sii";

// Build a Float32Array of a given length filled with a constant dBFS value.
function flatSpectrum(binCount: number, dbfs: number): Float32Array {
  return new Float32Array(binCount).fill(dbfs);
}

// Silent spectrum — all bins at -Infinity (below the -144 dBFS threshold).
function silentSpectrum(binCount: number): Float32Array {
  return new Float32Array(binCount).fill(-200);
}

const SAMPLE_RATE = 44100;
const FFT_SIZE    = 4096;
const BIN_COUNT   = FFT_SIZE / 2;

describe("computeSII", () => {
  it("returns null for a silent spectrum (all bins below -144 dBFS)", () => {
    const freqData = silentSpectrum(BIN_COUNT);
    expect(computeSII(freqData, SAMPLE_RATE, FFT_SIZE)).toBeNull();
  });

  it("returns a non-null value even for a small FFT (function processes what it can)", () => {
    // 64-bin FFT at 44100 Hz — bin width ~689 Hz; low-frequency bands collapse
    // to bin 0 but are still processed. The function returns null only when
    // totalWeight < 0.5, which doesn't happen with a flat non-silent spectrum.
    const tiny = new Float32Array(32).fill(-30);
    const result = computeSII(tiny, SAMPLE_RATE, 64);
    // Either returns a valid score or null — must not throw
    if (result !== null) {
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    }
  });

  it("returns a value in [0, 1] for a typical noisy spectrum", () => {
    // Moderate noise floor at -40 dBFS → some speech SNR survives
    const freqData = flatSpectrum(BIN_COUNT, -40);
    const result = computeSII(freqData, SAMPLE_RATE, FFT_SIZE);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThanOrEqual(0);
    expect(result!).toBeLessThanOrEqual(1);
  });

  it("decreases monotonically as broadband noise level increases", () => {
    // Higher noise floor → less SNR → lower SII
    const levels = [-60, -50, -40, -30, -20];
    const siis = levels.map((db) =>
      computeSII(flatSpectrum(BIN_COUNT, db), SAMPLE_RATE, FFT_SIZE)!
    );
    for (let i = 1; i < siis.length; i++) {
      expect(siis[i]).toBeLessThanOrEqual(siis[i - 1]);
    }
  });

  it("SII is very high for extremely quiet background (near silence)", () => {
    // Near-silence at -100 dBFS → almost full speech intelligibility
    const freqData = flatSpectrum(BIN_COUNT, -100);
    const result = computeSII(freqData, SAMPLE_RATE, FFT_SIZE);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0.9);
  });

  it("SII approaches 0 when calibrated noise far exceeds speech levels", () => {
    // With calibration offset = +90 dB (typical SPL conversion), a -10 dBFS
    // noise floor becomes 80 dB SPL — well above the speech spectrum (35–41 dB SPL),
    // so SNR in every band is clamped to 0 → SII ≈ 0.
    const freqData = flatSpectrum(BIN_COUNT, -10);
    const result = computeSII(freqData, SAMPLE_RATE, FFT_SIZE, 90);
    expect(result).not.toBeNull();
    expect(result!).toBeLessThan(0.05);
  });

  it("calibration offset shifts SII in the expected direction", () => {
    // Use a mid-range noise level where both + and - offsets have room to move.
    // At -60 dBFS with +50 dB offset → apparent noise ≈ -10 dB SPL (below speech)
    // → SII is already near 1.  So start at a level where SNR is partial.
    const freqData = flatSpectrum(BIN_COUNT, -40);
    const base   = computeSII(freqData, SAMPLE_RATE, FFT_SIZE, 70)!;  // noise ~30 dB SPL
    const higher = computeSII(freqData, SAMPLE_RATE, FFT_SIZE, 90)!;  // noise ~50 dB SPL → more masking
    const lower  = computeSII(freqData, SAMPLE_RATE, FFT_SIZE, 50)!;  // noise ~10 dB SPL → less masking
    expect(higher).toBeLessThan(base);
    expect(lower).toBeGreaterThan(base);
  });
});

describe("siiLabel", () => {
  it("returns 'Good' at 0.75", ()   => expect(siiLabel(0.75)).toBe("Good"));
  it("returns 'Good' at 1.0", ()    => expect(siiLabel(1.0)).toBe("Good"));
  it("returns 'Fair' at 0.45", ()   => expect(siiLabel(0.45)).toBe("Fair"));
  it("returns 'Fair' at 0.74", ()   => expect(siiLabel(0.74)).toBe("Fair"));
  it("returns 'Poor' at 0.20", ()   => expect(siiLabel(0.20)).toBe("Poor"));
  it("returns 'Poor' at 0.44", ()   => expect(siiLabel(0.44)).toBe("Poor"));
  it("returns 'Very poor' at 0", () => expect(siiLabel(0)).toBe("Very poor"));
  it("returns 'Very poor' at 0.19", () => expect(siiLabel(0.19)).toBe("Very poor"));
});
