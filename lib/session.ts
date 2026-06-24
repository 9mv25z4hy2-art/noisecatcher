"use client";

// Multi-device shared session layer — built on the same Gun.js singleton used
// for community pin sharing. A session groups devices under a short code so
// activists can measure the same noise event from multiple positions and see
// each other's live readings.
//
// Namespace: noisecatcher/v1/sessions/{CODE}/peers/{DEVICE_ID}
// Each peer publishes: id, dba, lat, lng, ts, peakDb, peakAt, active
//
// TDOA (Time Difference of Arrival): when 2+ peers detect a loud peak, the
// arrival-time difference × speed of sound gives a distance difference from
// the source to each device — a hyperbolic locus. With 3+ GPS-equipped devices
// the intersection of two hyperbolas estimates the source position.

import { getGun } from "./gun";

export const SESSION_GRAPH_KEY = "noisecatcher/v1/sessions";
const DEVICE_ID_KEY = "nc_device_id";
const BROADCAST_INTERVAL_MS = 2000;
const PEER_TIMEOUT_MS = 12000;
const SPEED_OF_SOUND_MPS = 343;
const PEER_STALE_INACTIVE_MS = 20000;

// ── Device identity ──────────────────────────────────────────────────────────

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ── Session code ─────────────────────────────────────────────────────────────

// Unambiguous characters: no 0/O, no 1/I/L
const CODE_CHARS = "BCDFGHJKMNPQRSTVWXYZ23456789";

export function generateSessionCode(): string {
  return Array.from({ length: 6 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join("");
}

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^BCDFGHJKMNPQRSTVWXYZ23456789]/g, "").slice(0, 6);
}

// ── Peer data ────────────────────────────────────────────────────────────────

export interface SessionPeer {
  id: string;          // device ID
  dba: number | null;  // current A-weighted level
  lat: number | null;
  lng: number | null;
  ts: number;          // last update (ms since epoch)
  peakDb: number | null;  // highest dB seen this session
  peakAt: number | null;  // when peak was detected (ms since epoch)
  active: boolean;
}

// Raw Gun payload — Gun can return partial objects, so all optional
interface RawPeer {
  id?: string;
  dba?: number;
  lat?: number;
  lng?: number;
  ts?: number;
  peakDb?: number;
  peakAt?: number;
  active?: boolean;
}

function isValidPeer(d: unknown): d is RawPeer {
  if (!d || typeof d !== "object") return false;
  const r = d as Record<string, unknown>;
  return typeof r.id === "string" && r.id.length > 0 && typeof r.ts === "number";
}

function rawToPeer(raw: RawPeer): SessionPeer {
  return {
    id:      raw.id!,
    dba:     typeof raw.dba === "number" ? raw.dba : null,
    lat:     typeof raw.lat === "number" ? raw.lat : null,
    lng:     typeof raw.lng === "number" ? raw.lng : null,
    ts:      raw.ts!,
    peakDb:  typeof raw.peakDb === "number" ? raw.peakDb : null,
    peakAt:  typeof raw.peakAt === "number" ? raw.peakAt : null,
    active:  raw.active !== false,
  };
}

// ── Subscribe ────────────────────────────────────────────────────────────────

export type PeersCallback = (peers: Map<string, SessionPeer>) => void;

export function subscribeToSession(
  code: string,
  onChange: PeersCallback
): () => void {
  const peers = new Map<string, SessionPeer>();
  let active = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ref: any = null;

  // Prune stale peers every 5 s
  const pruneInterval = setInterval(() => {
    if (!active) return;
    const now = Date.now();
    let changed = false;
    for (const [id, p] of peers) {
      const stale = now - p.ts > PEER_STALE_INACTIVE_MS;
      if (stale && p.active) {
        peers.set(id, { ...p, active: false });
        changed = true;
      }
    }
    if (changed) onChange(new Map(peers));
  }, 5000);

  getGun().then((gun) => {
    if (!active) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref = (gun as any)
      .get(SESSION_GRAPH_KEY)
      .get(code)
      .get("peers")
      .map()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on((data: any) => {
        if (!active || !isValidPeer(data)) return;
        const peer = rawToPeer(data as RawPeer);
        const now = Date.now();
        const isTimeout = now - peer.ts > PEER_TIMEOUT_MS;
        peers.set(peer.id, { ...peer, active: peer.active && !isTimeout });
        onChange(new Map(peers));
      });
  });

  return () => {
    active = false;
    clearInterval(pruneInterval);
    try { ref?.off?.(); } catch { /* already unsubscribed */ }
  };
}

// ── Broadcast ────────────────────────────────────────────────────────────────

interface BroadcastPayload {
  dba: number | null;
  lat?: number;
  lng?: number;
  peakDb?: number;
  peakAt?: number;
}

let broadcastTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPayload: BroadcastPayload | null = null;
let pendingCode: string | null = null;

export function broadcastReading(code: string, payload: BroadcastPayload): void {
  pendingCode = code;
  pendingPayload = payload;
  if (broadcastTimer) return; // already scheduled
  broadcastTimer = setTimeout(async () => {
    broadcastTimer = null;
    if (!pendingCode || !pendingPayload) return;
    const deviceId = getDeviceId();
    const gun = await getGun();
    const record: RawPeer = {
      id: deviceId,
      ts: Date.now(),
      active: true,
      dba:    pendingPayload.dba ?? undefined,
      lat:    pendingPayload.lat,
      lng:    pendingPayload.lng,
      peakDb: pendingPayload.peakDb,
      peakAt: pendingPayload.peakAt,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gun as any).get(SESSION_GRAPH_KEY).get(pendingCode).get("peers").get(deviceId).put(record);
    pendingPayload = null;
    pendingCode = null;
  }, BROADCAST_INTERVAL_MS);
}

export async function leaveSession(code: string): Promise<void> {
  if (broadcastTimer) { clearTimeout(broadcastTimer); broadcastTimer = null; }
  const deviceId = getDeviceId();
  const gun = await getGun();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gun as any).get(SESSION_GRAPH_KEY).get(code).get("peers").get(deviceId).put({
    id: deviceId,
    ts: Date.now(),
    active: false,
  });
}

// ── TDOA ─────────────────────────────────────────────────────────────────────

export interface TDOAPair {
  deviceA: string;
  deviceB: string;
  deltaMs: number;       // peakAt_B - peakAt_A (positive = A heard it first)
  distanceDiffM: number; // |deltaMs| × SPEED_OF_SOUND_MPS / 1000
}

export interface TDOAResult {
  pairs: TDOAPair[];
  // If 3+ peers have GPS + peakAt, a source position estimate is available
  estimatedLat: number | null;
  estimatedLng: number | null;
  estimatedAccuracyM: number | null; // rough uncertainty radius
}

/** Haversine distance in metres between two GPS points. */
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Offset a lat/lng by dx, dy metres (flat-earth approximation — valid for <10 km). */
function offsetLatLng(lat: number, lng: number, dx: number, dy: number): [number, number] {
  return [lat + dy / 111320, lng + dx / (111320 * Math.cos((lat * Math.PI) / 180))];
}

/**
 * Grid-search source position estimate for 3+ devices.
 * Minimises sum of squared residuals between observed TDOA and expected TDOA
 * from each candidate grid point. Returns best-fit [lat, lng] and residual.
 */
function estimateSourcePosition(
  peers: { id: string; lat: number; lng: number; peakAt: number }[]
): { lat: number; lng: number; residualM: number } | null {
  if (peers.length < 3) return null;

  // Centroid of device positions as search origin
  const clat = peers.reduce((s, p) => s + p.lat, 0) / peers.length;
  const clng = peers.reduce((s, p) => s + p.lng, 0) / peers.length;

  // Multi-resolution grid search: coarse then fine
  let bestLat = clat, bestLng = clng, bestResidual = Infinity;
  const ref = peers[0];

  for (const { radiusM, steps } of [{ radiusM: 2000, steps: 40 }, { radiusM: 200, steps: 40 }]) {
    const stepM = (radiusM * 2) / steps;
    for (let ix = 0; ix <= steps; ix++) {
      for (let iy = 0; iy <= steps; iy++) {
        const dx = -radiusM + ix * stepM;
        const dy = -radiusM + iy * stepM;
        const [candidateLat, candidateLng] = offsetLatLng(bestLat, bestLng, dx, dy);

        let residual = 0;
        const d0 = haversineM(candidateLat, candidateLng, ref.lat, ref.lng);
        for (let i = 1; i < peers.length; i++) {
          const di = haversineM(candidateLat, candidateLng, peers[i].lat, peers[i].lng);
          const observedDeltaM = (peers[i].peakAt - ref.peakAt) * SPEED_OF_SOUND_MPS / 1000;
          const predictedDeltaM = di - d0;
          residual += (predictedDeltaM - observedDeltaM) ** 2;
        }

        if (residual < bestResidual) {
          bestResidual = residual;
          bestLat = candidateLat;
          bestLng = candidateLng;
        }
      }
    }
  }

  return { lat: bestLat, lng: bestLng, residualM: Math.sqrt(bestResidual) };
}

export function computeTDOA(peers: SessionPeer[]): TDOAResult | null {
  const withPeak = peers.filter(
    (p) => p.active && p.peakAt !== null && p.peakDb !== null
  );
  if (withPeak.length < 2) return null;

  // Sort by peakAt ascending (first to detect = index 0)
  const sorted = [...withPeak].sort((a, b) => a.peakAt! - b.peakAt!);

  const pairs: TDOAPair[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i], b = sorted[j];
      const deltaMs = b.peakAt! - a.peakAt!;
      pairs.push({
        deviceA: a.id,
        deviceB: b.id,
        deltaMs,
        distanceDiffM: Math.abs(deltaMs) * SPEED_OF_SOUND_MPS / 1000,
      });
    }
  }

  // Source position: requires 3+ devices with GPS + peak
  const withGPS = sorted.filter((p) => p.lat !== null && p.lng !== null);
  let estimatedLat: number | null = null;
  let estimatedLng: number | null = null;
  let estimatedAccuracyM: number | null = null;

  if (withGPS.length >= 3) {
    const input = withGPS.map((p) => ({
      id: p.id,
      lat: p.lat!,
      lng: p.lng!,
      peakAt: p.peakAt!,
    }));
    const result = estimateSourcePosition(input);
    if (result) {
      estimatedLat = result.lat;
      estimatedLng = result.lng;
      estimatedAccuracyM = Math.round(result.residualM);
    }
  }

  return { pairs, estimatedLat, estimatedLng, estimatedAccuracyM };
}
