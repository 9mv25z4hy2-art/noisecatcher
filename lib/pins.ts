import { getThreshold } from "./thresholds";
import { db, type NoiseReport, type VoiceNote } from "./db";

export type NoiseCategory =
  // Current categories (top-level source types)
  | "traffic"
  | "emergency"
  | "municipal"
  | "construction"
  | "industrial"
  | "entertainment"
  | "neighbourhood"
  | "natural"
  | "conflict"
  | "recreational"
  | "police_force"
  | "fascism"
  | "harassment"
  | "phones"
  | "other"
  // Legacy values (kept for backwards compatibility with existing stored pins)
  | "nightlife"
  | "aviation";

// Legacy broad buckets — kept for backwards compatibility with stored pins.
// New pins store a precise "HH:MM:SS" string instead.
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night" | string;
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type PinStatus = "predicted" | "active" | "historical";

export interface NoisePin {
  id: string;
  lat: number;
  lng: number;
  db: number;
  category: NoiseCategory;
  description: string;
  anonymous: boolean;
  author?: string;
  createdAt: string;
  timeOfDay: TimeOfDay;
  recurring: boolean;
  days?: Weekday[];
  photoDataUrl?: string;
  bearing?: number;        // compass bearing (alpha) when pin was dropped, 0–360°
  measuredLevel?: boolean; // phone was held level (beta <5°) during measurement
  sourceSub?: string;      // specific noise subcategory (e.g. "ambulance", "drilling")
  status?: PinStatus;      // temporal lifecycle: predicted, active (default), or historical
  pinType?: "measured" | "earwitness";  // earwitness = unmetered qualitative event report
  qualities?: string[];    // earwitness descriptors e.g. ["harsh","rhythmic","intermittent"]
  durationEstimate?: string; // earwitness: free-text duration e.g. "~20 min"
  carnetId?: string;
}

export async function loadPins(): Promise<NoisePin[]> {
  if (typeof window === "undefined") return [];
  try {
    return await db.pins.orderBy("createdAt").toArray();
  } catch {
    return [];
  }
}

export async function savePin(pin: Omit<NoisePin, "id" | "createdAt">): Promise<NoisePin> {
  const newPin: NoisePin = {
    ...pin,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await db.pins.add(newPin);
  return newPin;
}

export async function deletePin(id: string): Promise<void> {
  await db.pins.delete(id);
}

export function detectTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  return "night";
}

export async function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 480;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export const CATEGORIES: { value: NoiseCategory; label: string; emoji: string }[] = [
  { value: "traffic",       label: "Traffic",       emoji: "🚗" },
  { value: "emergency",     label: "Emergency",     emoji: "🚑" },
  { value: "municipal",     label: "Municipal",     emoji: "🗑️" },
  { value: "construction",  label: "Construction",  emoji: "🏗️" },
  { value: "industrial",    label: "Industrial",    emoji: "🏭" },
  { value: "entertainment", label: "Entertainment", emoji: "🎵" },
  { value: "neighbourhood", label: "Neighbourhood", emoji: "🏘️" },
  { value: "natural",       label: "Natural",             emoji: "🌪️" },
  { value: "conflict",      label: "Conflict ⚠️",        emoji: "⚠️" },
  { value: "recreational",  label: "Recreational vehicles", emoji: "🏍️" },
  { value: "police_force",  label: "Police brutality 🚨",  emoji: "🚨" },
  { value: "fascism",       label: "Political violence ✊",          emoji: "✊" },
  { value: "harassment",    label: "Harassment & gender-based / LGBTQ+ violence", emoji: "🚫" },
  { value: "phones",        label: "Phone noise pollution",            emoji: "📱" },
  { value: "other",         label: "Other",                            emoji: "📍" },
];

export const TIME_OF_DAY_LABELS: Record<string, string> = {
  morning: "Morning (6–12)",
  afternoon: "Afternoon (12–18)",
  evening: "Evening (18–23)",
  night: "Night (23–6)",
};

/** Returns a precise HH:MM:SS string for the current local time. */
export function currentTimeString(): string {
  const now = new Date();
  return [
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join(":");
}

export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

export function getCategoryMeta(value: NoiseCategory) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[5];
}

export function pinColor(db: number): string {
  return getThreshold(db).color;
}

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function exportGeoJSON(pins: NoisePin[]): Promise<void> {
  const features = pins.map((pin) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
    properties: {
      id: pin.id,
      db: pin.db,
      category: pin.category,
      description: pin.description,
      anonymous: pin.anonymous,
      author: pin.anonymous ? null : pin.author,
      createdAt: pin.createdAt,
      timeOfDay: pin.timeOfDay,
      recurring: pin.recurring,
      days: pin.days ?? [],
      threshold: getThreshold(pin.db).label,
      bearing: pin.bearing ?? null,
      measuredLevel: pin.measuredLevel ?? false,
      sourceSub: pin.sourceSub ?? null,
    },
  }));

  // Hash the substantive data (compact JSON, no whitespace) for self-attestation.
  // This lets a verifier detect accidental corruption or deliberate tampering:
  // serialize the 'features' array with JSON.stringify, compute SHA-256, compare.
  const featuresJson = JSON.stringify(features);
  const hash = await sha256hex(featuresJson);

  const geojson = {
    type: "FeatureCollection",
    features,
    _integrity: {
      sha256: hash,
      algorithm: "SHA-256",
      covers: "features array (compact JSON)",
      generated: new Date().toISOString(),
      note: "To verify: JSON.stringify(geojson.features) → SHA-256 → compare to this value.",
    },
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noisecatcher-${new Date().toISOString().slice(0, 10)}.geojson`;
  a.click();
  // Defer revoke so the browser has time to start the download before the
  // object URL is invalidated (immediate revoke can fail in Firefox).
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Export pins as a GeoJSON transect: a LineString connecting pins in
 * chronological order plus individual Point features — for route-based
 * acoustic surveys (Distributed Soundscape Transect Recording).
 * Throws if fewer than 2 pins provided.
 */
export async function exportTransect(pins: NoisePin[]): Promise<void> {
  const sorted = [...pins].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sorted.length < 2) throw new Error("A transect needs at least 2 pins.");

  const pointFeatures = sorted.map((pin, i) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] },
    properties: {
      sequence: i + 1,
      id: pin.id,
      db: pin.db,
      category: pin.category,
      sourceSub: pin.sourceSub ?? null,
      description: pin.description,
      createdAt: pin.createdAt,
      bearing: pin.bearing ?? null,
      threshold: getThreshold(pin.db).label,
    },
  }));

  const lineFeature = {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: sorted.map((p) => [p.lng, p.lat]),
    },
    properties: {
      type: "transect",
      pinCount: sorted.length,
      startTime: sorted[0].createdAt,
      endTime: sorted[sorted.length - 1].createdAt,
      avgDb: parseFloat((sorted.reduce((s, p) => s + p.db, 0) / sorted.length).toFixed(1)),
    },
  };

  const geojson = {
    type: "FeatureCollection",
    features: [lineFeature, ...pointFeatures],
    _meta: {
      type: "acoustic-transect",
      generated: new Date().toISOString(),
      note: "LineString connects pins in chronological order. Import into QGIS or uMap to visualise the acoustic gradient.",
    },
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noisecatcher-transect-${new Date().toISOString().slice(0, 10)}.geojson`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Export a carnet as GeoJSON — pins as Points with full properties, plus
 * session reports that have GPS coordinates as Points with acoustic metrics.
 * Reports without GPS are included as features with null geometry so no data is silently dropped.
 */
export async function exportCarnetGeoJSON(pins: NoisePin[], reports: NoiseReport[], voiceNotes: VoiceNote[] = []): Promise<void> {
  const pinFeatures = pins.map((pin) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] },
    properties: {
      _type: "pin",
      id: pin.id,
      db: pin.db,
      category: pin.category,
      sourceSub: pin.sourceSub ?? null,
      description: pin.description,
      anonymous: pin.anonymous,
      author: pin.anonymous ? null : pin.author,
      createdAt: pin.createdAt,
      timeOfDay: pin.timeOfDay,
      recurring: pin.recurring,
      days: pin.days ?? [],
      threshold: getThreshold(pin.db).label,
      bearing: pin.bearing ?? null,
      measuredLevel: pin.measuredLevel ?? false,
    },
  }));

  const reportFeatures = reports.map((r) => ({
    type: "Feature" as const,
    // null geometry for reports without GPS — valid GeoJSON per RFC 7946 §3.2
    geometry: (r.lat != null && r.lng != null)
      ? { type: "Point" as const, coordinates: [r.lng, r.lat] }
      : null,
    properties: {
      _type: "session_report",
      id: r.id,
      timestamp: r.timestamp,
      durationS: r.durationS,
      leq: r.leq,
      peak: r.peak,
      l10: r.l10,
      l50: r.l50,
      l90: r.l90,
      sampleCount: r.sampleCount,
      threshold: r.thresholdLabel,
      calibrationOffset: r.calibrationOffset,
      aci: r.aci ?? null,
      ndsi: r.ndsi ?? null,
      harmSleep: r.harmSleep ?? false,
      harmConversation: r.harmConversation ?? false,
      harmAnxiety: r.harmAnxiety ?? null,
      harmNotes: r.harmNotes ?? "",
      sessionSha256: r.sessionSha256 ?? null,
    },
  }));

  const voiceNoteFeatures = voiceNotes.map((v) => ({
    type: "Feature" as const,
    geometry: null,
    properties: {
      _type: "voice_note",
      id: v.id,
      createdAt: v.createdAt,
      durationS: v.durationS,
      transcript: v.transcript ?? null,
      attachedTo: v.attachedTo ?? null,
      attachedType: v.attachedType ?? null,
      carnetId: v.carnetId ?? null,
    },
  }));

  const features = [...pinFeatures, ...reportFeatures, ...voiceNoteFeatures];
  const featuresJson = JSON.stringify(features);
  const hash = await sha256hex(featuresJson);

  const geojson = {
    type: "FeatureCollection",
    features,
    _integrity: {
      sha256: hash,
      algorithm: "SHA-256",
      covers: "features array (compact JSON)",
      generated: new Date().toISOString(),
      note: "To verify: JSON.stringify(geojson.features) → SHA-256 → compare to this value.",
    },
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noisecatcher-carnet-${new Date().toISOString().slice(0, 10)}.geojson`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
