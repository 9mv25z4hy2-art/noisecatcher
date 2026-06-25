"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Radio, Copy, Check, LogIn, LogOut, Users, Zap, MapPin } from "lucide-react";
import {
  getDeviceId,
  generateSessionCode,
  normalizeCode,
  subscribeToSession,
  broadcastReading,
  leaveSession,
  computeTDOA,
  type SessionPeer,
  type TDOAResult,
} from "@/lib/session";
import { getConnectionState, onConnectionChange, type GunConnectionState } from "@/lib/gun";

interface Props {
  /** Current live dB reading from the meter — null when meter is off */
  currentDba: number | null;
  /** Current GPS position if available */
  gps: { lat: number; lng: number } | null;
  /** Peak dB seen this session */
  peakDb: number | null;
  /** When the peak was detected (ms since epoch) — null if no peak this session */
  peakAt: number | null;
}

function shortId(id: string) {
  return id.slice(0, 4);
}

function dbColor(dba: number) {
  if (dba >= 85) return "#f87171";
  if (dba >= 70) return "#fb923c";
  if (dba >= 55) return "#facc15";
  return "#4ade80";
}

export default function MultiDevicePanel({ currentDba, gps, peakDb, peakAt }: Props) {
  const [mode, setMode] = useState<"idle" | "hosting" | "joined">("idle");
  const [code, setCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [peers, setPeers] = useState<Map<string, SessionPeer>>(new Map());
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState("");
  const unsubRef = useRef<(() => void) | null>(null);
  const codeRef = useRef(code);
  // Stable device ID — set once, never changes
  const [myId] = useState(() => getDeviceId());

  const [relayState, setRelayState] = useState<GunConnectionState>(() => getConnectionState());
  useEffect(() => { const unsub = onConnectionChange(setRelayState); return () => { unsub(); }; }, []);

  // Broadcast current reading when in a session
  useEffect(() => {
    if (mode === "idle" || !code) return;
    broadcastReading(code, {
      dba: currentDba,
      lat: gps?.lat,
      lng: gps?.lng,
      peakDb: peakDb ?? undefined,
      peakAt: peakAt ?? undefined,
    });
  }, [mode, code, currentDba, gps, peakDb, peakAt]);

  const tdoa = useMemo<TDOAResult | null>(() => {
    if (mode === "idle") return null;
    return computeTDOA(Array.from(peers.values()));
  }, [peers, mode]);

  const startSession = useCallback(() => {
    const newCode = generateSessionCode();
    setCode(newCode);
    setMode("hosting");
    unsubRef.current = subscribeToSession(newCode, setPeers);
  }, []);

  const joinSession = useCallback(() => {
    const normalized = normalizeCode(joinInput);
    if (normalized.length !== 6) {
      setJoinError("Enter a valid 6-character code.");
      return;
    }
    setJoinError("");
    setCode(normalized);
    setMode("joined");
    unsubRef.current = subscribeToSession(normalized, setPeers);
    setJoinInput("");
  }, [joinInput]);

  const leave = useCallback(async () => {
    if (code) await leaveSession(code);
    unsubRef.current?.();
    unsubRef.current = null;
    setMode("idle");
    setCode("");
    setPeers(new Map());
    setJoinInput("");
    setJoinError("");
  }, [code]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Keep codeRef current so the unmount cleanup sees the latest session code
  useEffect(() => { codeRef.current = code; }, [code]);

  // Cleanup on unmount — use ref to avoid stale closure over initial empty code
  useEffect(() => {
    return () => {
      if (codeRef.current) leaveSession(codeRef.current).catch(() => {});
      unsubRef.current?.();
    };
  }, []);

  const activePeers = Array.from(peers.values()).filter((p) => p.active && p.id !== myId);
  const allActive = Array.from(peers.values()).filter((p) => p.active);

  return (
    <div className="w-full nc-surface rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 nc-divider-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5" style={{ color: mode !== "idle" ? "rgb(52,211,153)" : "var(--nc-text-3)" }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>
            Multi-device session
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* P2P relay status */}
          <div className="flex items-center gap-1.5" title={`Relay: ${relayState}`}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: relayState === "connected" ? "rgb(52,211,153)"
                  : relayState === "connecting" ? "rgb(251,191,36)"
                  : "rgb(156,163,175)",
              }}
            />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              {relayState === "connected" ? "relay" : relayState === "connecting" ? "…" : "offline"}
            </span>
          </div>
          {mode !== "idle" && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3" style={{ color: "var(--nc-text-3)" }} />
              <span className="text-xs tabular-nums" style={{ color: "var(--nc-text-3)" }}>
                {allActive.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">

        {/* ── Idle: start or join ── */}
        {mode === "idle" && (
          <>
            <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
              Measure the same noise event from multiple phones simultaneously. Create a session and share the code with others nearby.
            </p>

            <button
              onClick={startSession}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl nc-btn-ghost text-sm transition-colors"
            >
              <Radio className="w-3.5 h-3.5" />
              Start session
            </button>

            <div className="flex gap-2">
              <input
                value={joinInput}
                onChange={(e) => { setJoinInput(e.target.value.toUpperCase()); setJoinError(""); }}
                onKeyDown={(e) => e.key === "Enter" && joinSession()}
                placeholder="Enter 6-char code"
                maxLength={8}
                className="nc-input rounded-lg px-3 py-2 text-sm font-mono flex-1 uppercase"
                style={{ letterSpacing: "0.12em" }}
              />
              <button
                onClick={joinSession}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg nc-btn-ghost text-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Join
              </button>
            </div>
            {joinError && <p className="text-xs text-red-400">{joinError}</p>}
          </>
        )}

        {/* ── Active session ── */}
        {mode !== "idle" && (
          <>
            {/* Code display */}
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
                  {mode === "hosting" ? "Your session code" : "Joined session"}
                </span>
                <span className="font-mono text-lg tracking-[0.25em]" style={{ color: "var(--nc-text)" }}>
                  {code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md nc-btn-ghost text-xs transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={leave}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md nc-btn-ghost text-xs text-red-400 hover:border-red-900 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Leave
                </button>
              </div>
            </div>

            {/* Peer list */}
            {allActive.length === 0 ? (
              <p className="text-xs text-center py-2" style={{ color: "var(--nc-text-3)" }}>
                Waiting for other devices to join…
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {allActive.map((peer) => {
                  const isMe = peer.id === myId;
                  return (
                    <div
                      key={peer.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2"
                      style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: peer.dba != null ? dbColor(peer.dba) : "var(--nc-text-3)" }}
                      />
                      <span className="font-mono text-xs" style={{ color: "var(--nc-text-2)" }}>
                        {shortId(peer.id)}{isMe ? " (you)" : ""}
                      </span>
                      {peer.dba != null && (
                        <span
                          className="font-mono text-sm font-semibold tabular-nums ml-auto"
                          style={{ color: dbColor(peer.dba) }}
                        >
                          {peer.dba.toFixed(1)} dB
                        </span>
                      )}
                      {peer.lat != null && (
                        <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }} title={`${peer.lat.toFixed(5)}, ${peer.lng?.toFixed(5)}`}>
                          GPS
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TDOA section */}
            {tdoa && tdoa.pairs.length > 0 && (
              <div
                className="rounded-lg px-3 py-2.5 flex flex-col gap-2"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" style={{ color: "rgb(52,211,153)" }} />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgb(52,211,153)", fontFamily: "var(--font-display)" }}>
                    TDOA · source estimation
                  </span>
                </div>

                {tdoa.pairs.map((pair) => (
                  <div key={`${pair.deviceA}-${pair.deviceB}`} className="flex flex-col gap-0.5">
                    <span className="font-mono text-[10px]" style={{ color: "var(--nc-text-3)" }}>
                      {shortId(pair.deviceA)} → {shortId(pair.deviceB)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--nc-text-2)" }}>
                      Δt {pair.deltaMs > 0 ? "+" : ""}{pair.deltaMs} ms · source is{" "}
                      <span className="font-semibold">{pair.distanceDiffM.toFixed(1)} m</span>{" "}
                      closer to {shortId(pair.deltaMs <= 0 ? pair.deviceA : pair.deviceB)}
                    </span>
                  </div>
                ))}

                {tdoa.estimatedLat != null && (
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)", fontFamily: "var(--font-display)" }}>
                      Estimated source position
                    </span>
                    <span className="font-mono text-xs" style={{ color: "var(--nc-text-2)" }}>
                      {tdoa.estimatedLat.toFixed(5)}, {tdoa.estimatedLng?.toFixed(5)}
                    </span>
                    {tdoa.estimatedAccuracyM != null && (
                      <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>
                        ± {tdoa.estimatedAccuracyM} m residual
                      </span>
                    )}
                    <div className="flex gap-2 mt-0.5">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${tdoa.estimatedLat}&mlon=${tdoa.estimatedLng}&zoom=18`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded nc-btn-ghost text-[10px] transition-colors"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        Open in OSM
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${tdoa.estimatedLat!.toFixed(6)}, ${tdoa.estimatedLng!.toFixed(6)}`).catch(() => {});
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded nc-btn-ghost text-[10px] transition-colors"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Copy coords
                      </button>
                    </div>
                  </div>
                )}

                {tdoa.estimatedLat == null && activePeers.length < 2 && (
                  <p className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>
                    GPS + peak detection on 3+ devices enables source position estimate.
                  </p>
                )}
              </div>
            )}

            {/* No TDOA yet — hint */}
            {(!tdoa || tdoa.pairs.length === 0) && allActive.length >= 2 && (
              <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>
                TDOA activates when two or more devices detect a loud peak. Trigger a noise event to compute source distance.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
