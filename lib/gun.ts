"use client";

// Gun.js P2P singleton — lazy-initialised on first use.
// No central server required. Optional relay peers improve cross-device
// reach; they hold no private keys and store only what users publish.
//
// PRODUCTION: set NEXT_PUBLIC_GUN_PEERS=https://your-relay.tld/gun
// Self-host with: npx gun  (or node gun/examples/http.js)
// Recommended hosting: Flokinet (Iceland), Greenhost (NL), or Njalla

import type GunType from "gun";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gunInstance: any = null;

// Read custom relay from env (set NEXT_PUBLIC_GUN_PEERS=url1,url2 in .env.local)
function buildPeerList(): string[] {
  const envPeers = process.env.NEXT_PUBLIC_GUN_PEERS;
  if (envPeers) return envPeers.split(",").map((p) => p.trim()).filter(Boolean);

  // Fallback community relays — set NEXT_PUBLIC_GUN_PEERS for production.
  // Self-host: npx gun  (recommended: Flokinet, Greenhost, or Njalla).
  // The Heroku-hosted public relays (gun-manhattan, gun-us, gun-eu) were
  // shut down when Heroku ended free tier in November 2022 — removed.
  // peer.wallie.io went down mid-2026 (Cloudflare 530 / origin DNS error) — removed.
  return [
    "https://gun.eco/gun",
    "https://gun.o8.is/gun",
  ];
}

export type GunConnectionState = "connecting" | "connected" | "offline";

let connectionState: GunConnectionState = "connecting";
const stateListeners = new Set<(s: GunConnectionState) => void>();

export function getConnectionState() { return connectionState; }
export function onConnectionChange(fn: (s: GunConnectionState) => void) {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}
function setConnectionState(s: GunConnectionState) {
  if (s === connectionState) return;
  connectionState = s;
  stateListeners.forEach((fn) => fn(s));
}

export async function getGun(): Promise<InstanceType<typeof GunType>> {
  if (gunInstance) return gunInstance;

  const GunCtor = (await import("gun")).default ?? (await import("gun"));
  await import("gun/sea");

  const peers = buildPeerList();
  gunInstance = new (GunCtor as typeof GunType)(peers);

  // Monitor peer connectivity via Gun's internal mesh events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gunInstance as any).on("hi",  () => setConnectionState("connected"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (gunInstance as any).on("bye", () => {
    // Only go offline if no peers remain connected
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mesh = (gunInstance as any).back?.("opt.mesh");
      if (!mesh || Object.keys(mesh).length === 0) setConnectionState("offline");
    }, 3000);
  });

  // Optimistic: assume connected after 5 s if no explicit event
  setTimeout(() => {
    if (connectionState === "connecting") setConnectionState("connected");
  }, 5000);

  return gunInstance;
}

// Namespace root — all shared pins live under this key.
export const NC_GRAPH_KEY = "noisecatcher/v1/pins";
