import { describe, it, expect } from "vitest";
import { isValidSharedPin, toSharedPin, SENSITIVE_CATEGORIES } from "../sync";
import type { SharedPin } from "../sync";
import type { NoisePin } from "../pins";

function validPayload(overrides: Partial<SharedPin> = {}): SharedPin {
  return {
    id: "abc-123",
    lat: 48.8566,
    lng: 2.3522,
    db: 72,
    category: "traffic",
    description: "Test noise",
    timeOfDay: "14:00:00",
    recurring: false,
    createdAt: "2026-06-16T14:00:00.000Z",
    pinType: "measured",
    status: "active",
    ...overrides,
  };
}

describe("isValidSharedPin", () => {
  // ── Accepts well-formed pins ──────────────────────────────────────────────

  it("accepts a minimal well-formed pin", () => {
    expect(isValidSharedPin(validPayload())).toBe(true);
  });

  it("accepts all valid categories", () => {
    const cats = [
      "traffic","emergency","municipal","construction","industrial",
      "entertainment","neighbourhood","natural","conflict","recreational",
      "police_force","fascism","harassment","phones","other",
      "nightlife","aviation",
    ];
    for (const category of cats) {
      expect(isValidSharedPin(validPayload({ category: category as SharedPin["category"] }))).toBe(true);
    }
  });

  it("accepts lat at boundary −90", () => {
    expect(isValidSharedPin(validPayload({ lat: -90 }))).toBe(true);
  });

  it("accepts lat at boundary +90", () => {
    expect(isValidSharedPin(validPayload({ lat: 90 }))).toBe(true);
  });

  it("accepts lng at boundary −180", () => {
    expect(isValidSharedPin(validPayload({ lng: -180 }))).toBe(true);
  });

  it("accepts lng at boundary +180", () => {
    expect(isValidSharedPin(validPayload({ lng: 180 }))).toBe(true);
  });

  it("accepts db = 0", () => {
    expect(isValidSharedPin(validPayload({ db: 0 }))).toBe(true);
  });

  it("accepts db = 200", () => {
    expect(isValidSharedPin(validPayload({ db: 200 }))).toBe(true);
  });

  // ── Rejects missing required fields ──────────────────────────────────────

  it("rejects null", () => {
    expect(isValidSharedPin(null)).toBe(false);
  });

  it("rejects a plain string", () => {
    expect(isValidSharedPin("abc")).toBe(false);
  });

  it("rejects an empty object", () => {
    expect(isValidSharedPin({})).toBe(false);
  });

  it("rejects when id is missing", () => {
    const { id: _id, ...rest } = validPayload();
    expect(isValidSharedPin(rest)).toBe(false);
  });

  it("rejects when id is empty string", () => {
    expect(isValidSharedPin(validPayload({ id: "" }))).toBe(false);
  });

  it("rejects when lat is missing", () => {
    const p = { ...validPayload() } as Record<string, unknown>;
    delete p.lat;
    expect(isValidSharedPin(p)).toBe(false);
  });

  it("rejects when lng is missing", () => {
    const p = { ...validPayload() } as Record<string, unknown>;
    delete p.lng;
    expect(isValidSharedPin(p)).toBe(false);
  });

  it("rejects when db is missing", () => {
    const p = { ...validPayload() } as Record<string, unknown>;
    delete p.db;
    expect(isValidSharedPin(p)).toBe(false);
  });

  it("rejects when category is missing", () => {
    const p = { ...validPayload() } as Record<string, unknown>;
    delete p.category;
    expect(isValidSharedPin(p)).toBe(false);
  });

  it("rejects when createdAt is missing", () => {
    const p = { ...validPayload() } as Record<string, unknown>;
    delete p.createdAt;
    expect(isValidSharedPin(p)).toBe(false);
  });

  // ── Rejects out-of-range values ───────────────────────────────────────────

  it("rejects lat > 90", () => {
    expect(isValidSharedPin(validPayload({ lat: 91 }))).toBe(false);
  });

  it("rejects lat < −90", () => {
    expect(isValidSharedPin(validPayload({ lat: -91 }))).toBe(false);
  });

  it("rejects lng > 180", () => {
    expect(isValidSharedPin(validPayload({ lng: 181 }))).toBe(false);
  });

  it("rejects lng < −180", () => {
    expect(isValidSharedPin(validPayload({ lng: -181 }))).toBe(false);
  });

  it("rejects db < 0", () => {
    expect(isValidSharedPin(validPayload({ db: -1 }))).toBe(false);
  });

  it("rejects db > 200", () => {
    expect(isValidSharedPin(validPayload({ db: 201 }))).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(isValidSharedPin(validPayload({ category: "mystery" as SharedPin["category"] }))).toBe(false);
  });

  // ── Rejects wrong types ───────────────────────────────────────────────────

  it("rejects lat as string", () => {
    expect(isValidSharedPin({ ...validPayload(), lat: "48.8" })).toBe(false);
  });

  it("rejects db as string", () => {
    expect(isValidSharedPin({ ...validPayload(), db: "72" })).toBe(false);
  });

  it("rejects id as number", () => {
    expect(isValidSharedPin({ ...validPayload(), id: 123 })).toBe(false);
  });
});

describe("SENSITIVE_CATEGORIES", () => {
  it("includes conflict, police_force, fascism, harassment", () => {
    expect(SENSITIVE_CATEGORIES).toContain("conflict");
    expect(SENSITIVE_CATEGORIES).toContain("police_force");
    expect(SENSITIVE_CATEGORIES).toContain("fascism");
    expect(SENSITIVE_CATEGORIES).toContain("harassment");
  });
});

describe("toSharedPin", () => {
  const fullPin: NoisePin = {
    id: "pin-x",
    lat: 51.5,
    lng: -0.12,
    db: 68,
    category: "traffic",
    description: "A test",
    timeOfDay: "09:00:00",
    recurring: false,
    createdAt: "2026-06-16T09:00:00.000Z",
    author: "Alice",
    anonymous: false,
    status: "active",
    pinType: "measured",
    days: [],
    carnetId: "carnet-1",
    photoDataUrl: "data:image/png;base64,abc",
  };

  it("strips author, carnetId, and photoDataUrl", () => {
    const shared = toSharedPin(fullPin);
    expect(shared).not.toHaveProperty("author");
    expect(shared).not.toHaveProperty("carnetId");
    expect(shared).not.toHaveProperty("photoDataUrl");
  });

  it("preserves id, lat, lng, db, category, description, createdAt", () => {
    const shared = toSharedPin(fullPin);
    expect(shared.id).toBe(fullPin.id);
    expect(shared.lat).toBe(fullPin.lat);
    expect(shared.lng).toBe(fullPin.lng);
    expect(shared.db).toBe(fullPin.db);
    expect(shared.category).toBe(fullPin.category);
    expect(shared.description).toBe(fullPin.description);
    expect(shared.createdAt).toBe(fullPin.createdAt);
  });

  it("result passes isValidSharedPin", () => {
    expect(isValidSharedPin(toSharedPin(fullPin))).toBe(true);
  });
});
