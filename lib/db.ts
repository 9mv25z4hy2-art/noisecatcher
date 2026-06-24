import Dexie, { type EntityTable } from "dexie";
import type { NoisePin } from "./pins";

export interface NoiseReport {
  id: string;
  timestamp: string;
  durationS: number;
  leq: number;
  peak: number;
  l10: number;
  l50: number;
  l90: number;
  sampleCount: number;
  euDose: number | null;
  oshaDose: number | null;
  thresholdLevel: string;
  thresholdLabel: string;
  thresholdColor: string;
  loudness: number | null;
  sharpness: number | null;
  roughness: number | null;
  annoyance: number | null;
  aci: number | null;
  ndsi: number | null;
  hfPeakHz: number | null;
  calibrationOffset: number;
  carnetId?: string;
  voiceNoteId?: string;
  // Lived-impact harm documentation
  harmSleep?: boolean;
  harmConversation?: boolean;
  harmAnxiety?: number | null;  // 0–5 subjective scale
  harmNotes?: string;
  // GPS coordinates at the time of capture (optional — only present when geolocation was granted)
  lat?: number | null;
  lng?: number | null;
  // Compass bearing (degrees true north) at capture time, when orientation tracking was active
  bearing?: number | null;
  // Top YAMNet label linked to this report after post-hoc audio classification
  yamnetTopLabel?: string;
  // Evidentiary integrity — SHA-256 of the canonical session data, computed at capture
  sessionSha256?: string;
}

export interface VoiceNote {
  id: string;
  audioDataUrl: string;
  durationS: number;
  createdAt: string;
  attachedTo?: string;   // pin id or report id
  attachedType?: "pin" | "report";
  carnetId?: string;
  transcript?: string;
}

export interface Carnet {
  id: string;
  name: string;
  notes: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

class NoisecatcherDB extends Dexie {
  pins!: EntityTable<NoisePin, "id">;
  reports!: EntityTable<NoiseReport, "id">;
  voiceNotes!: EntityTable<VoiceNote, "id">;
  carnets!: EntityTable<Carnet, "id">;

  constructor() {
    super("noisecatcher");
    this.version(1).stores({
      pins: "id, createdAt, category, db, lat, lng",
    });
    this.version(2).stores({
      pins: "id, createdAt, category, db, lat, lng, carnetId",
      reports: "id, timestamp, carnetId",
      voiceNotes: "id, createdAt, attachedTo, carnetId",
      carnets: "id, createdAt",
    });
    this.version(3).stores({
      pins: "id, createdAt, category, db, lat, lng, carnetId",
      reports: "id, timestamp, carnetId, lat, lng",
      voiceNotes: "id, createdAt, attachedTo, carnetId",
      carnets: "id, createdAt",
    });
  }
}

const db: NoisecatcherDB = typeof window !== "undefined"
  ? new NoisecatcherDB()
  : (null as unknown as NoisecatcherDB);

export { db };

const LEGACY_KEY = "noisecatcher_pins";
const MIGRATED_KEY = "nc_idb_migrated";

export async function migrateLegacyPins(): Promise<void> {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const legacy = JSON.parse(raw) as NoisePin[];
      if (legacy.length > 0) await db.pins.bulkPut(legacy);
    }
  } catch { /* proceed without migration */ }
  localStorage.setItem(MIGRATED_KEY, "1");
}

// ── Reports ─────────────────────────────────────────────
export async function saveReport(report: Omit<NoiseReport, "id" | "timestamp">): Promise<NoiseReport> {
  const r: NoiseReport = { ...report, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
  await db.reports.add(r);
  return r;
}

export async function loadReports(): Promise<NoiseReport[]> {
  if (typeof window === "undefined") return [];
  try { return await db.reports.orderBy("timestamp").reverse().toArray(); } catch { return []; }
}

export async function loadReport(id: string): Promise<NoiseReport | undefined> {
  if (typeof window === "undefined") return undefined;
  try { return await db.reports.get(id); } catch { return undefined; }
}

export async function updateReport(id: string, patch: Partial<Omit<NoiseReport, "id" | "timestamp">>): Promise<void> {
  await db.reports.update(id, patch);
}

export async function deleteReport(id: string): Promise<void> {
  await db.reports.delete(id);
}

// ── Voice notes ──────────────────────────────────────────
export async function saveVoiceNote(note: Omit<VoiceNote, "id" | "createdAt">): Promise<VoiceNote> {
  const v: VoiceNote = { ...note, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await db.voiceNotes.add(v);
  return v;
}

export async function loadVoiceNote(id: string): Promise<VoiceNote | undefined> {
  if (typeof window === "undefined") return undefined;
  try { return await db.voiceNotes.get(id); } catch { return undefined; }
}

export async function loadVoiceNotesByAttached(attachedToId: string): Promise<VoiceNote[]> {
  if (typeof window === "undefined") return [];
  try { return await db.voiceNotes.where("attachedTo").equals(attachedToId).toArray(); } catch { return []; }
}

export async function loadAllVoiceNotes(): Promise<VoiceNote[]> {
  if (typeof window === "undefined") return [];
  try { return await db.voiceNotes.orderBy("createdAt").toArray(); } catch { return []; }
}

export async function deleteVoiceNote(id: string): Promise<void> {
  await db.voiceNotes.delete(id);
}

export async function updateVoiceNote(id: string, patch: Partial<Omit<VoiceNote, "id" | "createdAt">>): Promise<void> {
  await db.voiceNotes.update(id, patch);
}

// ── Carnets ──────────────────────────────────────────────
export async function loadCarnets(): Promise<Carnet[]> {
  if (typeof window === "undefined") return [];
  try { return await db.carnets.orderBy("createdAt").reverse().toArray(); } catch { return []; }
}

export async function saveCarnet(carnet: Omit<Carnet, "id" | "createdAt" | "updatedAt">): Promise<Carnet> {
  const now = new Date().toISOString();
  const c: Carnet = { ...carnet, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  await db.carnets.add(c);
  return c;
}

export async function updateCarnet(id: string, patch: Partial<Omit<Carnet, "id" | "createdAt">>): Promise<void> {
  await db.carnets.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function deleteCarnet(id: string): Promise<void> {
  await Promise.all([
    db.carnets.delete(id),
    db.pins.where("carnetId").equals(id).modify((pin) => { pin.carnetId = undefined; }),
    db.reports.where("carnetId").equals(id).modify((report) => { report.carnetId = undefined; }),
    db.voiceNotes.where("carnetId").equals(id).modify((note) => { note.carnetId = undefined; }),
  ]);
}

export async function loadCarnetContents(carnetId: string): Promise<{
  pins: NoisePin[];
  reports: NoiseReport[];
  voiceNotes: VoiceNote[];
}> {
  if (typeof window === "undefined") return { pins: [], reports: [], voiceNotes: [] };
  const [pins, reports, voiceNotes] = await Promise.all([
    db.pins.where("carnetId").equals(carnetId).toArray(),
    db.reports.where("carnetId").equals(carnetId).toArray(),
    db.voiceNotes.where("carnetId").equals(carnetId).toArray(),
  ]);
  return { pins, reports, voiceNotes };
}
