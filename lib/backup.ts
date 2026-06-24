"use client";

import { db } from "./db";
import { loadPins } from "./pins";
import type { NoisePin } from "./pins";
import type { NoiseReport, VoiceNote, Carnet } from "./db";

const BACKUP_VERSION = 1;
const BACKUP_APP = "noisecatcher";

export interface BackupPayload {
  version: number;
  app: string;
  exportedAt: string;
  pins: NoisePin[];
  reports: NoiseReport[];
  voiceNotes: VoiceNote[];
  carnets: Carnet[];
}

export interface BackupStats {
  pins: number;
  reports: number;
  voiceNotes: number;
  carnets: number;
}

export async function exportAllData(): Promise<BackupStats> {
  const [pins, reports, voiceNotes, carnets] = await Promise.all([
    loadPins(),
    db.reports.toArray(),
    db.voiceNotes.toArray(),
    db.carnets.toArray(),
  ]);

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    app: BACKUP_APP,
    exportedAt: new Date().toISOString(),
    pins,
    reports,
    voiceNotes,
    carnets,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noisecatcher-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return {
    pins: pins.length,
    reports: reports.length,
    voiceNotes: voiceNotes.length,
    carnets: carnets.length,
  };
}

export async function importData(file: File): Promise<BackupStats> {
  const text = await file.text();
  const payload = JSON.parse(text) as BackupPayload;

  if (payload.app !== BACKUP_APP || payload.version !== BACKUP_VERSION) {
    throw new Error("Incompatible backup file");
  }

  const { pins = [], reports = [], voiceNotes = [], carnets = [] } = payload;

  // bulkPut = upsert — items are merged by primary key; existing records not
  // in the file are left untouched (safe merge, not a destructive replace).
  await Promise.all([
    db.pins.bulkPut(pins),
    db.reports.bulkPut(reports),
    db.voiceNotes.bulkPut(voiceNotes),
    db.carnets.bulkPut(carnets),
  ]);

  return {
    pins: pins.length,
    reports: reports.length,
    voiceNotes: voiceNotes.length,
    carnets: carnets.length,
  };
}
