import { describe, it, expect } from "vitest";
import { computeStats } from "../stats";

describe("computeStats", () => {
  it("returns null for fewer than 2 readings", () => {
    expect(computeStats([])).toBeNull();
    expect(computeStats([80])).toBeNull();
  });

  it("Leq of two identical readings equals that reading", () => {
    const s = computeStats([80, 80])!;
    expect(s.leq).toBeCloseTo(80, 1);
  });

  it("Leq of 80 dB and 70 dB is ~77.4 dB (energy average, not arithmetic)", () => {
    // 10^(80/10) + 10^(70/10) = 1e8 + 1e7 = 1.1e8; /2 = 5.5e7; 10*log10(5.5e7) ≈ 77.4
    const s = computeStats([80, 70])!;
    expect(s.leq).toBeCloseTo(77.4, 0);
  });

  it("Leq is always <= Lmax and >= L90", () => {
    const readings = [55, 60, 65, 70, 75, 80, 85];
    const s = computeStats(readings)!;
    expect(s.leq).toBeLessThanOrEqual(s.lmax);
    expect(s.leq).toBeGreaterThanOrEqual(s.l90);
  });

  it("Lmax equals the highest reading", () => {
    const s = computeStats([55, 72, 68, 90, 61])!;
    expect(s.lmax).toBe(90);
  });

  it("L90 is the level exceeded 90% of time (near the low end)", () => {
    // Sorted descending: [90,80,70,60,50] n=5; index floor(5*0.9)=4 → 50
    const s = computeStats([90, 80, 70, 60, 50])!;
    expect(s.l90).toBe(50);
  });

  it("L10 is the level exceeded 10% of time (near the peak)", () => {
    // Sorted descending: [90,80,70,60,50] n=5; index floor(5*0.1)=0 → 90
    const s = computeStats([90, 80, 70, 60, 50])!;
    expect(s.l10).toBe(90);
  });

  it("Leq is dominated by high-energy readings (non-linear average)", () => {
    // Ten readings at 50 dB + one at 80 dB; Leq should be pulled toward 80
    const readings = Array(10).fill(50).concat([80]);
    const s = computeStats(readings)!;
    // 10^8 >> 10^5*10=10^6; total 1.01e8/11 = 9.18e6; Leq = 10*log10(9.18e6) ≈ 69.6
    // Well above arithmetic mean (52), confirming energy-average dominance
    expect(s.leq).toBeCloseTo(69.6, 0);
  });
});
