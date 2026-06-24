import { describe, it, expect } from "vitest";
import { getThreshold, THRESHOLDS } from "../thresholds";

describe("getThreshold", () => {
  // ── Boundary values derived directly from THRESHOLDS definitions ──────────

  it("classifies 0 dB as safe", () => {
    expect(getThreshold(0).level).toBe("safe");
  });

  it("classifies 54 dB as safe (max of safe range)", () => {
    expect(getThreshold(54).level).toBe("safe");
  });

  it("classifies 55 dB as caution (WHO daytime threshold)", () => {
    expect(getThreshold(55).level).toBe("caution");
  });

  it("classifies 69 dB as caution (max of caution range)", () => {
    expect(getThreshold(69).level).toBe("caution");
  });

  it("classifies 70 dB as dangerous", () => {
    expect(getThreshold(70).level).toBe("dangerous");
  });

  it("classifies 84 dB as dangerous (max of dangerous range)", () => {
    expect(getThreshold(84).level).toBe("dangerous");
  });

  it("classifies 85 dB as critical (NIOSH/OSHA hearing risk threshold)", () => {
    expect(getThreshold(85).level).toBe("critical");
  });

  it("classifies 119 dB as critical (max of critical range)", () => {
    expect(getThreshold(119).level).toBe("critical");
  });

  it("classifies 120 dB as extreme (threshold of pain)", () => {
    expect(getThreshold(120).level).toBe("extreme");
  });

  it("classifies 140 dB as extreme", () => {
    expect(getThreshold(140).level).toBe("extreme");
  });

  // ── Mid-range sanity checks ───────────────────────────────────────────────

  it("classifies 30 dB as safe", ()  => expect(getThreshold(30).level).toBe("safe"));
  it("classifies 60 dB as caution", () => expect(getThreshold(60).level).toBe("caution"));
  it("classifies 75 dB as dangerous", () => expect(getThreshold(75).level).toBe("dangerous"));
  it("classifies 100 dB as critical", () => expect(getThreshold(100).level).toBe("critical"));
  it("classifies 130 dB as extreme", () => expect(getThreshold(130).level).toBe("extreme"));

  // ── Return shape ──────────────────────────────────────────────────────────

  it("returns a threshold with all required fields", () => {
    const t = getThreshold(60);
    expect(t).toHaveProperty("level");
    expect(t).toHaveProperty("label");
    expect(t).toHaveProperty("min");
    expect(t).toHaveProperty("max");
    expect(t).toHaveProperty("color");
    expect(t).toHaveProperty("shortDescription");
    expect(t).toHaveProperty("exposure");
  });

  it("falls back to THRESHOLDS[0] (safe) for a value with no matching tier", () => {
    // Values above 200 are beyond all ranges — should fall back to safe
    expect(getThreshold(999).level).toBe("safe");
  });

  // ── THRESHOLDS array integrity ────────────────────────────────────────────

  it("THRESHOLDS covers the full range 0–200 with no gaps", () => {
    const sorted = [...THRESHOLDS].sort((a, b) => a.min - b.min);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1);
    }
    expect(sorted[0].min).toBe(0);
    expect(sorted[sorted.length - 1].max).toBe(200);
  });

  it("each threshold has min < max", () => {
    for (const t of THRESHOLDS) {
      expect(t.min).toBeLessThan(t.max);
    }
  });
});
