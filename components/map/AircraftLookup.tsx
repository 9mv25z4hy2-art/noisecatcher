"use client";

// OpenSky Network — free, no API key for anonymous access.
// Returns aircraft currently in a 0.1° bounding box around the user's GPS.
// Rate limit: ~400 requests/day anonymous. Used only on explicit user action.
// Docs: https://openskynetwork.github.io/opensky-api/rest.html

import { useState } from "react";
import { Plane, Loader, AlertCircle } from "lucide-react";

interface Aircraft {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  altitudeM: number | null;
  velocityMs: number | null;
  heading: number | null;
  onGround: boolean;
}

interface Props {
  lat?: number | null;
  lng?: number | null;
}

const HEADING_LABELS = ["N","NE","E","SE","S","SW","W","NW"];
function headingLabel(deg: number | null) {
  if (deg === null) return "—";
  return HEADING_LABELS[Math.round(deg / 45) % 8];
}

export default function AircraftLookup({ lat, lng }: Props) {
  const [aircraft, setAircraft] = useState<Aircraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [resolvedLat, setResolvedLat] = useState<number | null>(lat ?? null);
  const [resolvedLng, setResolvedLng] = useState<number | null>(lng ?? null);

  async function requestGps() {
    setGpsError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000 })
      );
      setResolvedLat(pos.coords.latitude);
      setResolvedLng(pos.coords.longitude);
    } catch {
      setGpsError("GPS permission denied or unavailable.");
    }
  }

  async function lookup() {
    if (!resolvedLat || !resolvedLng) return;
    // Don't refetch more than once per 60 s
    if (lastFetch && Date.now() - lastFetch < 60_000) return;

    setLoading(true);
    setError(null);
    setAircraft(null);

    const pad = 0.15; // ~16 km bounding box
    const url = `https://opensky-network.org/api/states/all?lamin=${(resolvedLat - pad).toFixed(4)}&lomin=${(resolvedLng - pad).toFixed(4)}&lamax=${(resolvedLat + pad).toFixed(4)}&lomax=${(resolvedLng + pad).toFixed(4)}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`OpenSky returned ${res.status}`);
      const json = await res.json();

      // OpenSky state vector indices (from API docs):
      // 0=icao24, 1=callsign, 2=originCountry, 7=baroAltitude, 9=velocity, 10=heading, 8=onGround
      const states: Aircraft[] = (json.states ?? []).map((s: unknown[]) => ({
        icao24: String(s[0] ?? ""),
        callsign: s[1] ? String(s[1]).trim() || null : null,
        originCountry: String(s[2] ?? ""),
        altitudeM: typeof s[7] === "number" ? Math.round(s[7]) : null,
        velocityMs: typeof s[9] === "number" ? Math.round(s[9]) : null,
        heading: typeof s[10] === "number" ? Math.round(s[10]) : null,
        onGround: !!s[8],
      }));

      // Sort by altitude descending (lowest first — most likely audible)
      states.sort((a, b) => (a.altitudeM ?? 99999) - (b.altitudeM ?? 99999));
      setAircraft(states);
      setLastFetch(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">
          Nearby aircraft · OpenSky
        </span>
        {resolvedLat && resolvedLng ? (
          <button
            onClick={lookup}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded te-label text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader className="w-3 h-3 animate-spin" /> : <Plane className="w-3 h-3" />}
            {loading ? "Querying…" : lastFetch ? "Refresh" : "Look up"}
          </button>
        ) : (
          <button
            onClick={requestGps}
            className="flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded te-label text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
          >
            <Plane className="w-3 h-3" />
            Enable GPS
          </button>
        )}
      </div>
      {!resolvedLat && !resolvedLng && !gpsError && (
        <p className="te-label text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          GPS location required to look up nearby aircraft.
        </p>
      )}
      {gpsError && (
        <div className="flex items-center gap-2 text-[10px] text-red-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {gpsError}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-[10px] text-red-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}

      {aircraft !== null && aircraft.length === 0 && (
        <p className="te-label text-white/30 text-[10px]">No aircraft detected within ~16 km.</p>
      )}

      {aircraft !== null && aircraft.length > 0 && (
        <div className="flex flex-col gap-1">
          {aircraft.slice(0, 6).map((ac) => (
            <div
              key={ac.icao24}
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}
            >
              <Plane className="w-3 h-3 shrink-0" style={{ color: ac.onGround ? "var(--nc-text-3)" : "rgba(167,139,250,0.8)" }} />
              <div className="flex-1 min-w-0">
                <span className="font-mono text-xs" style={{ color: "var(--nc-text-2)" }}>
                  {ac.callsign ?? ac.icao24}
                </span>
                <span className="te-label text-[9px] ml-2" style={{ color: "var(--nc-text-3)" }}>
                  {ac.originCountry}
                </span>
              </div>
              <div className="text-right shrink-0">
                {ac.onGround ? (
                  <span className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>on ground</span>
                ) : (
                  <span className="font-mono text-[10px]" style={{ color: "var(--nc-text-2)" }}>
                    {ac.altitudeM !== null ? `${ac.altitudeM} m` : "—"}
                    {ac.heading !== null ? ` · ${headingLabel(ac.heading)}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
          {aircraft.length > 6 && (
            <p className="te-label text-[9px] text-center" style={{ color: "var(--nc-text-3)" }}>
              +{aircraft.length - 6} more · showing lowest altitude first
            </p>
          )}
          <p className="te-label text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>
            OpenSky Network · data may lag 5–15 s · anonymous rate-limited
          </p>
        </div>
      )}
    </div>
  );
}
