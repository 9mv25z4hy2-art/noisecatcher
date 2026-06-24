import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import Dexie, { type EntityTable } from "dexie";
import type { NoisePin } from "../pins";

// ── Standalone in-memory DB (mirrors NoisecatcherDB schema) ──────────────────
// We can't import the singleton from lib/db.ts because it guards on
// `typeof window !== "undefined"` and returns null in a Node test environment.
// Instead we recreate the schema inline using fake-indexeddb (injected above).

import { type NoiseReport, type VoiceNote, type Carnet } from "../db";

class TestDB extends Dexie {
  pins!:       EntityTable<NoisePin,      "id">;
  reports!:    EntityTable<NoiseReport,   "id">;
  voiceNotes!: EntityTable<VoiceNote,     "id">;
  carnets!:    EntityTable<Carnet,        "id">;

  constructor(name: string) {
    super(name);
    this.version(3).stores({
      pins:       "id, createdAt, category, db, lat, lng, carnetId",
      reports:    "id, timestamp, carnetId, lat, lng",
      voiceNotes: "id, createdAt, attachedTo, carnetId",
      carnets:    "id, createdAt",
    });
  }
}

// Helper factories
function makePin(overrides: Partial<NoisePin> = {}): NoisePin {
  return {
    id:          crypto.randomUUID(),
    lat:         48.8566,
    lng:         2.3522,
    db:          72,
    category:    "traffic",
    description: "Test pin",
    timeOfDay:   "14:00:00",
    recurring:   false,
    createdAt:   new Date().toISOString(),
    author:      "",
    anonymous:   true,
    status:      "active",
    pinType:     "measured",
    days:        [],
    ...overrides,
  };
}

function makeReport(overrides: Partial<NoiseReport> = {}): NoiseReport {
  return {
    id:               crypto.randomUUID(),
    timestamp:        new Date().toISOString(),
    durationS:        30,
    leq:              68,
    peak:             80,
    l10:              75,
    l50:              68,
    l90:              60,
    sampleCount:      30,
    euDose:           null,
    oshaDose:         null,
    thresholdLevel:   "dangerous",
    thresholdLabel:   "Dangerous",
    thresholdColor:   "#f97316",
    loudness:         null,
    sharpness:        null,
    roughness:        null,
    annoyance:        null,
    aci:              null,
    ndsi:             null,
    hfPeakHz:         null,
    calibrationOffset: 0,
    ...overrides,
  };
}

function makeVoiceNote(overrides: Partial<VoiceNote> = {}): VoiceNote {
  return {
    id:           crypto.randomUUID(),
    audioDataUrl: "data:audio/webm;base64,abc",
    durationS:    5,
    createdAt:    new Date().toISOString(),
    ...overrides,
  };
}

function makeCarnet(overrides: Partial<Carnet> = {}): Carnet {
  const now = new Date().toISOString();
  return {
    id:        crypto.randomUUID(),
    name:      "Test carnet",
    notes:     "",
    color:     "#6366f1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// Each test gets a fresh DB instance with a unique name.
let db: TestDB;
beforeEach(() => {
  db = new TestDB(`test-${crypto.randomUUID()}`);
});

// ── Pin CRUD ─────────────────────────────────────────────────────────────────

describe("pins", () => {
  it("saves and retrieves a pin by id", async () => {
    const pin = makePin();
    await db.pins.add(pin);
    const found = await db.pins.get(pin.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(pin.id);
    expect(found!.db).toBe(72);
  });

  it("loadPins returns all saved pins ordered by createdAt desc", async () => {
    const old = makePin({ createdAt: "2026-01-01T00:00:00.000Z" });
    const recent = makePin({ createdAt: "2026-06-01T00:00:00.000Z" });
    await db.pins.bulkAdd([old, recent]);
    const all = await db.pins.orderBy("createdAt").reverse().toArray();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe(recent.id); // most recent first
  });

  it("deletePin removes the pin", async () => {
    const pin = makePin();
    await db.pins.add(pin);
    await db.pins.delete(pin.id);
    const found = await db.pins.get(pin.id);
    expect(found).toBeUndefined();
  });

  it("deleting a non-existent pin does not throw", async () => {
    await expect(db.pins.delete("no-such-id")).resolves.not.toThrow();
  });

  it("carnetId index returns pins belonging to a carnet", async () => {
    const carnetId = "carnet-abc";
    const p1 = makePin({ carnetId });
    const p2 = makePin({ carnetId });
    const p3 = makePin(); // no carnet
    await db.pins.bulkAdd([p1, p2, p3]);
    const inCarnet = await db.pins.where("carnetId").equals(carnetId).toArray();
    expect(inCarnet).toHaveLength(2);
    expect(inCarnet.map((p) => p.id)).toContain(p1.id);
    expect(inCarnet.map((p) => p.id)).toContain(p2.id);
  });
});

// ── Report CRUD ───────────────────────────────────────────────────────────────

describe("reports", () => {
  it("saves and retrieves a report", async () => {
    const r = makeReport();
    await db.reports.add(r);
    const found = await db.reports.get(r.id);
    expect(found).toBeDefined();
    expect(found!.leq).toBe(68);
  });

  it("updateReport patches a field without touching others", async () => {
    const r = makeReport();
    await db.reports.add(r);
    await db.reports.update(r.id, { yamnetTopLabel: "Traffic noise" });
    const updated = await db.reports.get(r.id);
    expect(updated!.yamnetTopLabel).toBe("Traffic noise");
    expect(updated!.leq).toBe(68); // unchanged
  });
});

// ── deleteCarnet cascade ──────────────────────────────────────────────────────

describe("deleteCarnet cascade", () => {
  it("removes the carnet record", async () => {
    const c = makeCarnet();
    await db.carnets.add(c);
    await db.carnets.delete(c.id);
    expect(await db.carnets.get(c.id)).toBeUndefined();
  });

  it("clears carnetId from linked pins (does not delete them)", async () => {
    const c = makeCarnet();
    await db.carnets.add(c);
    const pin = makePin({ carnetId: c.id });
    await db.pins.add(pin);

    // Simulate deleteCarnet cascade
    await Promise.all([
      db.carnets.delete(c.id),
      db.pins.where("carnetId").equals(c.id).modify((p) => { p.carnetId = undefined; }),
    ]);

    const updated = await db.pins.get(pin.id);
    expect(updated).toBeDefined();           // pin still exists
    expect(updated!.carnetId).toBeUndefined(); // carnetId cleared
  });

  it("clears carnetId from linked reports", async () => {
    const c = makeCarnet();
    await db.carnets.add(c);
    const r = makeReport({ carnetId: c.id });
    await db.reports.add(r);

    await Promise.all([
      db.carnets.delete(c.id),
      db.reports.where("carnetId").equals(c.id).modify((rep) => { rep.carnetId = undefined; }),
    ]);

    const updated = await db.reports.get(r.id);
    expect(updated).toBeDefined();
    expect(updated!.carnetId).toBeUndefined();
  });

  it("clears carnetId from linked voice notes", async () => {
    const c = makeCarnet();
    await db.carnets.add(c);
    const vn = makeVoiceNote({ carnetId: c.id });
    await db.voiceNotes.add(vn);

    await Promise.all([
      db.carnets.delete(c.id),
      db.voiceNotes.where("carnetId").equals(c.id).modify((n) => { n.carnetId = undefined; }),
    ]);

    const updated = await db.voiceNotes.get(vn.id);
    expect(updated).toBeDefined();
    expect(updated!.carnetId).toBeUndefined();
  });

  it("cascade affects only the deleted carnet — sibling records intact", async () => {
    const c1 = makeCarnet({ name: "C1" });
    const c2 = makeCarnet({ name: "C2" });
    await db.carnets.bulkAdd([c1, c2]);
    const pin1 = makePin({ carnetId: c1.id });
    const pin2 = makePin({ carnetId: c2.id });
    await db.pins.bulkAdd([pin1, pin2]);

    // Delete only c1
    await Promise.all([
      db.carnets.delete(c1.id),
      db.pins.where("carnetId").equals(c1.id).modify((p) => { p.carnetId = undefined; }),
    ]);

    const p2 = await db.pins.get(pin2.id);
    expect(p2!.carnetId).toBe(c2.id); // c2's pin untouched
  });
});

// ── Voice notes ───────────────────────────────────────────────────────────────

describe("voiceNotes", () => {
  it("saves and retrieves a voice note", async () => {
    const vn = makeVoiceNote({ transcript: "Heavy lorry outside" });
    await db.voiceNotes.add(vn);
    const found = await db.voiceNotes.get(vn.id);
    expect(found!.transcript).toBe("Heavy lorry outside");
  });

  it("filters by attachedTo", async () => {
    const pinId = "pin-ref-1";
    const vn = makeVoiceNote({ attachedTo: pinId, attachedType: "pin" });
    const other = makeVoiceNote();
    await db.voiceNotes.bulkAdd([vn, other]);
    const attached = await db.voiceNotes.where("attachedTo").equals(pinId).toArray();
    expect(attached).toHaveLength(1);
    expect(attached[0].id).toBe(vn.id);
  });
});
