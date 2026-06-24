"use client";

// Noisecatcher P2P sync layer — built on Gun.js.
// Two operations only: publish a pin, subscribe to pins in a bounding box.
// Sensitive categories are blocked from publishing at this layer.

import { getGun, NC_GRAPH_KEY } from "./gun";
import type { NoisePin, NoiseCategory } from "./pins";

// These categories require an explicit second user confirmation before sharing,
// and are never shared silently. The check is enforced both in the UI and here.
export const SENSITIVE_CATEGORIES: NoiseCategory[] = [
  "conflict",
  "police_force",
  "fascism",
  "harassment",
];

// Fields published over the network — no carnetId, no photoDataUrl (too large),
// no author when anonymous. The receiving peer reconstructs a display pin from this.
export interface SharedPin {
  id: string;
  lat: number;
  lng: number;
  db: number;
  category: NoiseCategory;
  sourceSub?: string;
  description: string;
  timeOfDay: string;
  recurring: boolean;
  createdAt: string;
  pinType?: "measured" | "earwitness";
  status?: string;
  // No author, no carnetId, no photo
}

export function toSharedPin(pin: NoisePin): SharedPin {
  return {
    id: pin.id,
    lat: pin.lat,
    lng: pin.lng,
    db: pin.db,
    category: pin.category,
    sourceSub: pin.sourceSub,
    description: pin.description,
    timeOfDay: pin.timeOfDay,
    recurring: pin.recurring,
    createdAt: pin.createdAt,
    pinType: pin.pinType,
    status: pin.status,
  };
}

/**
 * Publish a pin to the P2P graph.
 * Returns false if the category is sensitive and `confirmSensitive` is not true.
 */
export async function publishPin(
  pin: NoisePin,
  opts: { confirmSensitive?: boolean } = {}
): Promise<boolean> {
  if (SENSITIVE_CATEGORIES.includes(pin.category) && !opts.confirmSensitive) {
    return false;
  }

  const gun = await getGun();
  const shared = toSharedPin(pin);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gun as any).get(NC_GRAPH_KEY).get(pin.id).put(shared);
  return true;
}

const VALID_CATEGORIES = new Set([
  "traffic","emergency","municipal","construction","industrial",
  "entertainment","neighbourhood","natural","conflict","recreational",
  "police_force","fascism","harassment","phones","other",
  "nightlife","aviation", // legacy
]);

export function isValidSharedPin(data: unknown): data is SharedPin {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === "string" && d.id.length > 0 &&
    typeof d.lat === "number" && d.lat >= -90 && d.lat <= 90 &&
    typeof d.lng === "number" && d.lng >= -180 && d.lng <= 180 &&
    typeof d.db === "number" && d.db >= 0 && d.db <= 200 &&
    typeof d.category === "string" && VALID_CATEGORIES.has(d.category as string) &&
    typeof d.createdAt === "string"
  );
}

export type OnPinCallback = (pin: SharedPin) => void;

/**
 * Subscribe to shared pins inside a bounding box.
 * Gun has no spatial index — we receive all pins and filter client-side.
 * Returns an unsubscribe function.
 */
export function subscribeToArea(
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  onPin: OnPinCallback
): () => void {
  let active = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ref: any = null;

  getGun().then((gun) => {
    if (!active) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref = (gun as any).get(NC_GRAPH_KEY).map().on((data: any) => {
      if (!active || !isValidSharedPin(data)) return;
      if (
        data.lat >= bbox.minLat &&
        data.lat <= bbox.maxLat &&
        data.lng >= bbox.minLng &&
        data.lng <= bbox.maxLng
      ) {
        onPin(data as SharedPin);
      }
    });
  });

  return () => {
    active = false;
    try { ref?.off?.(); } catch { /* already unsubscribed */ }
  };
}
