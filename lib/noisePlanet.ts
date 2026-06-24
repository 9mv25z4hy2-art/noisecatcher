// NoiseCapture / Noise-Planet federation
// NoiseCapture is an open-source acoustic crowdsourcing app by Université Gustave Eiffel.
// https://noise-planet.org | https://github.com/Ifsttar/NoiseCapture
//
// Federation strategy:
//   1. Export local pins in NoiseCapture-compatible GeoJSON
//   2. Fetch community noise data from the public Noise-Planet API (OGC WFS)
//   3. Display as an optional map overlay layer

import type { NoisePin } from "./pins";

/** OGC WFS endpoint for public Noise-Planet community measurements */
export const NOISE_PLANET_WFS =
  "https://data.noise-planet.org/geoserver/noisecapture/ows";

/** Public WMS endpoint for the Noise-Planet noise heatmap tiles */
export const NOISE_PLANET_WMS =
  "https://data.noise-planet.org/geoserver/noisecapture/wms";

export interface NoisePlanetPoint {
  lat: number;
  lng: number;
  laeq: number;  // dB(A) equivalent continuous level
  time: string;  // ISO timestamp
  country?: string;
}

/**
 * Fetch nearby community noise measurements from the public Noise-Planet WFS.
 * Returns points within the given bounding box.
 */
export async function fetchNoisePlanetData(bounds: {
  south: number; north: number; west: number; east: number;
}): Promise<NoisePlanetPoint[]> {
  const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeName: "noisecapture:noisecapture_point",
    outputFormat: "application/json",
    bbox,
    count: "200",
  });

  const res = await fetch(`${NOISE_PLANET_WFS}?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Noise-Planet API error ${res.status}`);

  const json = await res.json() as {
    features?: Array<{
      geometry: { coordinates: [number, number] };
      properties: { laeq?: number; time_date?: string; country?: string };
    }>;
  };

  return (json.features ?? []).map((f) => ({
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    laeq: f.properties.laeq ?? 0,
    time: f.properties.time_date ?? "",
    country: f.properties.country,
  }));
}

/**
 * Build a MapLibre-compatible raster source definition for the
 * Noise-Planet WMS noise heatmap layer.
 *
 * Note: bbox={bbox-epsg-3857} must NOT be URL-encoded — MapLibre substitutes
 * the literal placeholder string at tile-fetch time. We append it raw after
 * encoding the rest of the params.
 */
export function buildNoisePlanetRasterSource() {
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.1.1",
    request: "GetMap",
    layers: "noisecapture:noisecapture_area",
    styles: "",
    format: "image/png",
    transparent: "true",
    srs: "EPSG:3857",
    width: "256",
    height: "256",
  });

  // Append bbox raw so MapLibre can substitute its own bounding-box placeholder.
  const tileUrl = `${NOISE_PLANET_WMS}?${params}&bbox={bbox-epsg-3857}`;

  return {
    type: "raster" as const,
    tiles: [tileUrl],
    tileSize: 256,
    attribution: '© <a href="https://noise-planet.org" target="_blank" rel="noopener">Noise-Planet</a>',
  };
}

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Export local Noisecatcher pins as a NoiseCapture-compatible GeoJSON.
 * NoiseCapture uses LAeq per track; we map each pin to a single-measurement track.
 * Includes a SHA-256 integrity hash of the features array for self-attestation.
 */
export async function exportAsNoiseCaptureGeoJSON(pins: NoisePin[]): Promise<string> {
  const features = pins.map((pin) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [pin.lng, pin.lat],
    },
    properties: {
      laeq: pin.db,
      laeq_start: pin.db,
      laeq_end: pin.db,
      time_date: pin.createdAt,
      pleasantness: null,
      category: pin.category,
      source: "noisecatcher",
      nc_status: pin.status ?? "active",
      nc_description: pin.description,
      nc_recurring: pin.recurring,
    },
  }));

  const hash = await sha256hex(JSON.stringify(features));

  return JSON.stringify({
    type: "FeatureCollection",
    features,
    _integrity: {
      sha256: hash,
      algorithm: "SHA-256",
      covers: "features array (compact JSON)",
      generated: new Date().toISOString(),
      note: "To verify: JSON.stringify(geojson.features) → SHA-256 → compare to this value.",
    },
  }, null, 2);
}

/** Trigger browser download of the NoiseCapture-compatible GeoJSON. */
export async function downloadNoiseCaptureExport(pins: NoisePin[]): Promise<void> {
  const json  = await exportAsNoiseCaptureGeoJSON(pins);
  const blob  = new Blob([json], { type: "application/geo+json" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href      = url;
  a.download  = `noisecatcher-noisecapture-${new Date().toISOString().slice(0, 10)}.geojson`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
