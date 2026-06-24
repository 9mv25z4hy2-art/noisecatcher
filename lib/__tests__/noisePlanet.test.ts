import { describe, it, expect } from "vitest";
import { exportAsNoiseCaptureGeoJSON, buildNoisePlanetRasterSource, NOISE_PLANET_WFS, NOISE_PLANET_WMS } from "../noisePlanet";
import type { NoisePin } from "../pins";

function makePin(overrides: Partial<NoisePin> = {}): NoisePin {
  return {
    id: "pin-1",
    lat: 48.8566,
    lng: 2.3522,
    db: 72,
    category: "traffic",
    description: "Test pin",
    timeOfDay: "14:30:00",
    recurring: false,
    createdAt: "2026-06-16T14:30:00.000Z",
    author: "",
    anonymous: true,
    status: "active",
    pinType: "measured",
    days: [],
    ...overrides,
  };
}

describe("exportAsNoiseCaptureGeoJSON", () => {
  it("returns valid JSON parseable without error", async () => {
    const json = await exportAsNoiseCaptureGeoJSON([makePin()]);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("produces a GeoJSON FeatureCollection", async () => {
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([makePin()]));
    expect(parsed.type).toBe("FeatureCollection");
    expect(Array.isArray(parsed.features)).toBe(true);
  });

  it("creates exactly one Feature per pin", async () => {
    const pins = [makePin({ id: "a" }), makePin({ id: "b" }), makePin({ id: "c" })];
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON(pins));
    expect(parsed.features).toHaveLength(3);
  });

  it("each Feature has Point geometry with [lng, lat] coordinates", async () => {
    const pin = makePin({ lat: 48.8566, lng: 2.3522 });
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([pin]));
    const feat = parsed.features[0];
    expect(feat.geometry.type).toBe("Point");
    expect(feat.geometry.coordinates[0]).toBe(2.3522);  // lng first (GeoJSON spec)
    expect(feat.geometry.coordinates[1]).toBe(48.8566); // lat second
  });

  it("maps pin.db to laeq in properties", async () => {
    const pin = makePin({ db: 85 });
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([pin]));
    expect(parsed.features[0].properties.laeq).toBe(85);
  });

  it("includes _integrity block with sha256 field", async () => {
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([makePin()]));
    expect(parsed._integrity).toBeDefined();
    expect(typeof parsed._integrity.sha256).toBe("string");
    expect(parsed._integrity.sha256.length).toBe(64); // SHA-256 hex = 64 chars
    expect(parsed._integrity.algorithm).toBe("SHA-256");
  });

  it("SHA-256 covers the features array — re-hashing produces the same value", async () => {
    const pin = makePin();
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([pin]));
    const { features, _integrity } = parsed;
    // Re-compute hash of features (compact JSON) using the Web Crypto API
    const canonical = JSON.stringify(features);
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
    const recomputed = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    expect(recomputed).toBe(_integrity.sha256);
  });

  it("produces an empty features array for zero pins", async () => {
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([]));
    expect(parsed.features).toHaveLength(0);
    expect(parsed._integrity).toBeDefined();
  });

  it("includes source: 'noisecatcher' in each feature's properties", async () => {
    const parsed = JSON.parse(await exportAsNoiseCaptureGeoJSON([makePin()]));
    expect(parsed.features[0].properties.source).toBe("noisecatcher");
  });
});

describe("buildNoisePlanetRasterSource", () => {
  it("returns a raster source object", () => {
    const src = buildNoisePlanetRasterSource();
    expect(src.type).toBe("raster");
    expect(src.tileSize).toBe(256);
    expect(Array.isArray(src.tiles)).toBe(true);
    expect(src.tiles.length).toBeGreaterThan(0);
  });

  it("tile URL contains the WMS endpoint and bbox placeholder", () => {
    const src = buildNoisePlanetRasterSource();
    const url = src.tiles[0];
    expect(url).toContain(NOISE_PLANET_WMS);
    expect(url).toContain("{bbox-epsg-3857}");
  });

  it("tile URL requests PNG format (URLSearchParams percent-encodes the slash)", () => {
    const url = buildNoisePlanetRasterSource().tiles[0];
    // URLSearchParams encodes "/" as "%2F", so "image/png" becomes "image%2Fpng"
    expect(url).toContain("image%2Fpng");
  });
});

describe("endpoint constants", () => {
  it("WFS endpoint is the expected URL", () => {
    expect(NOISE_PLANET_WFS).toBe("https://data.noise-planet.org/geoserver/noisecapture/ows");
  });

  it("WMS endpoint is the expected URL", () => {
    expect(NOISE_PLANET_WMS).toBe("https://data.noise-planet.org/geoserver/noisecapture/wms");
  });
});
