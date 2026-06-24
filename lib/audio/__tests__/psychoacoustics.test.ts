import { describe, it, expect } from "vitest";
import { soneFromDB, computeSharpness, computeRoughness, computeAnnoyance } from "../psychoacoustics";

describe("soneFromDB", () => {
  it("returns 1 sone at 40 dB (ISO 226 reference point)", () => {
    expect(soneFromDB(40)).toBeCloseTo(1, 5);
  });

  it("returns 2 sone at 50 dB (doubling per 10 dB)", () => {
    expect(soneFromDB(50)).toBeCloseTo(2, 5);
  });

  it("returns 0.5 sone at 30 dB", () => {
    expect(soneFromDB(30)).toBeCloseTo(0.5, 5);
  });

  it("returns 0 for very low levels (< 2 dB)", () => {
    expect(soneFromDB(0)).toBe(0);
    expect(soneFromDB(1)).toBe(0);
  });

  it("loudness doubles for every 10 dB increase", () => {
    const s40 = soneFromDB(40);
    const s50 = soneFromDB(50);
    const s60 = soneFromDB(60);
    expect(s50 / s40).toBeCloseTo(2, 5);
    expect(s60 / s50).toBeCloseTo(2, 5);
  });
});

describe("computeSharpness", () => {
  it("returns 0 for silent input (all zeros)", () => {
    const freqData = new Uint8Array(1024).fill(0);
    expect(computeSharpness(freqData, 48000)).toBe(0);
  });

  it("returns a positive finite number for a non-silent spectrum", () => {
    const freqData = new Uint8Array(1024).fill(128);
    const s = computeSharpness(freqData, 48000);
    expect(s).toBeGreaterThan(0);
    expect(isFinite(s)).toBe(true);
  });

  it("high-frequency emphasis produces higher sharpness than low-frequency emphasis", () => {
    const sampleRate = 48000;
    const bins = 1024;

    // Low-frequency: fill only first quarter of bins
    const lowFreq = new Uint8Array(bins).fill(0);
    for (let i = 0; i < bins / 4; i++) lowFreq[i] = 200;

    // High-frequency: fill only last quarter of bins
    const highFreq = new Uint8Array(bins).fill(0);
    for (let i = (bins * 3) / 4; i < bins; i++) highFreq[i] = 200;

    expect(computeSharpness(highFreq, sampleRate)).toBeGreaterThan(
      computeSharpness(lowFreq, sampleRate)
    );
  });
});

describe("computeRoughness", () => {
  it("returns 0 for silence", () => {
    expect(computeRoughness(new Float32Array(4096).fill(0), 48000)).toBe(0);
  });

  it("returns 0 when signal is shorter than one lag period", () => {
    // lag = round(48000/70) ≈ 686 samples; give only 100 samples
    const short = new Float32Array(100).fill(0.5);
    expect(computeRoughness(short, 48000)).toBe(0);
  });

  it("returns a value in [0, 1] for normal audio", () => {
    const data = new Float32Array(4096);
    for (let i = 0; i < data.length; i++) data[i] = Math.sin(2 * Math.PI * 70 * i / 48000) * 0.5;
    const r = computeRoughness(data, 48000);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1);
  });
});

describe("computeAnnoyance", () => {
  it("returns 0 for zero loudness", () => {
    expect(computeAnnoyance(0, 1, 0.5)).toBe(0);
  });

  it("returns a positive finite number for normal inputs", () => {
    const pa = computeAnnoyance(4, 2, 0.3);
    expect(pa).toBeGreaterThan(0);
    expect(isFinite(pa)).toBe(true);
  });

  it("higher roughness increases annoyance (all else equal)", () => {
    const pa_low  = computeAnnoyance(4, 1.5, 0.1);
    const pa_high = computeAnnoyance(4, 1.5, 0.9);
    expect(pa_high).toBeGreaterThan(pa_low);
  });

  it("higher sharpness above 1.75 acum increases annoyance (all else equal)", () => {
    const pa_low  = computeAnnoyance(4, 1.0, 0);
    const pa_high = computeAnnoyance(4, 3.0, 0);
    expect(pa_high).toBeGreaterThan(pa_low);
  });
});
