"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, MicOff, AlertTriangle, Info, MapPin, SlidersHorizontal, Headphones, FileText, BellRing, BellOff, Wand2, Lock, Unlock, Share2, Check } from "lucide-react";
import { WAKE_MP4, WAKE_WEBM } from "@/lib/wakeVideo";
import { NoiseMeter as NoiseMeterEngine, listAudioInputDevices, type ExtendedMeterReading } from "@/lib/audio/meter";
import { getThreshold, THRESHOLDS } from "@/lib/thresholds";
import { ABECEDAIRE } from "@/lib/abecedaire";
import AlertModal from "./AlertModal";
import CalibrationModal from "./CalibrationModal";
import AudioRecorderPanel from "./AudioRecorder";
import MultiDevicePanel from "./MultiDevicePanel";
import AircraftLookup from "@/components/map/AircraftLookup";
import MeterGauge from "./MeterGauge";
import Spectrogram from "./Spectrogram";
import AudioImporter from "./AudioImporter";
import GuidedListeningSession from "./GuidedListeningSession";
import SignatureLibrary from "./SignatureLibrary";
import { computeStats } from "@/lib/audio/stats";
import { computeAll as computePsycho, type PsychoacousticMetrics } from "@/lib/audio/psychoacoustics";
import { Haptics } from "@/lib/haptics";
import { startOrientationTracking, requestOrientationPermission, bearingToLabel } from "@/lib/orientation";
import { startMotionTracking, requestMotionPermission } from "@/lib/motion";
import type { ThresholdLevel } from "@/lib/thresholds";
import { useI18n } from "@/lib/i18n/context";
import { saveReport, saveVoiceNote, loadCarnets, type Carnet } from "@/lib/db";
import { startBarometer, type BarometerReading } from "@/lib/audio/barometer";
import { computeSII, siiLabel } from "@/lib/audio/sii";

// Acoustic Complexity Index: ACI = Σ|FFT_i − FFT_{i-1}| / Σ FFT_i per time step
// Higher = more complex/natural soundscape; lower = tonal/monotone (Farina 2010)
function computeACI(freq: Uint8Array): number {
  if (freq.length < 2) return 0;
  let delta = 0; let total = 0;
  for (let i = 1; i < freq.length; i++) { delta += Math.abs(freq[i] - freq[i - 1]); total += freq[i]; }
  return total > 0 ? delta / total : 0;
}

// EU Directive 2003/10/EC (80 dB(A) base, 3 dB exchange rate, 8 h reference)
// OSHA PEL (90 dB(A) base, 5 dB exchange rate, 8 h reference)
function calcDose(leqDb: number, durationS: number, baseDb: number, xr: number): number {
  return (durationS / ((8 * 3600) / Math.pow(2, (leqDb - baseDb) / xr))) * 100;
}

// HF band energy in the 15–20 kHz range (Mosquito / LRAD deterrent detection)
function computeHFBand(freq: Uint8Array, sampleRate: number): { rms: number; peakHz: number | null } {
  const nyquist = sampleRate / 2;
  const bins = freq.length;
  const loIdx = Math.round((15000 / nyquist) * bins);
  const hiIdx = Math.round((20000 / nyquist) * bins);
  if (loIdx >= hiIdx || loIdx >= bins) return { rms: 0, peakHz: null };
  let sum = 0; let peakVal = 0; let peakIdx = loIdx;
  for (let i = loIdx; i < Math.min(hiIdx, bins); i++) {
    sum += freq[i] * freq[i]; if (freq[i] > peakVal) { peakVal = freq[i]; peakIdx = i; }
  }
  const rms = Math.sqrt(sum / (hiIdx - loIdx)) / 255;
  const peakHz = peakVal > 20 ? Math.round((peakIdx / bins) * nyquist) : null;
  return { rms, peakHz };
}

export default function NoiseMeter() {
  const { t } = useI18n();
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [db, setDb] = useState<number | null>(null);
  const [peak, setPeak] = useState<number>(0);
  const [peakAt, setPeakAt] = useState<number | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [sessionReadings, setSessionReadings] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertDismissedAt, setAlertDismissedAt] = useState<number | null>(null);
  // Calibration offset stays in localStorage (single scalar, device-specific).
  // Pins live in IndexedDB via lib/db.ts — two different storage tiers by design.
  const [calibrationOffset, setCalibrationOffset] = useState(() => {
    if (typeof localStorage === "undefined") return 0;
    const stored = localStorage.getItem("noisecatcher_calibration_offset");
    return stored ? Number(stored) : 0;
  });
  const [showCalibration, setShowCalibration] = useState(false);
  const [isLevel, setIsLevel] = useState(false);
  const [bearing, setBearing] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [discardedCount, setDiscardedCount] = useState(0);
  const [gainDb, setGainDb] = useState(0);
  const isMovingRef = useRef(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [psychoMetrics, setPsychoMetrics] = useState<PsychoacousticMetrics | null>(null);
  const [aciValue, setAciValue] = useState<number | null>(null);
  const [hfBand, setHfBand] = useState<{ rms: number; peakHz: number | null } | null>(null);
  const [dbz, setDbz] = useState<number | null>(null);
  const [dbc, setDbc] = useState<number | null>(null);
  const [ndsi, setNdsi] = useState<number | null>(null);
  const [showGuidedListening, setShowGuidedListening] = useState(false);
  const [showSignatureLibrary, setShowSignatureLibrary] = useState(false);
  const [baroReading, setBaroReading] = useState<BarometerReading | null>(null);
  const [baroSupported, setBaroSupported] = useState<boolean | null>(null);
  const [carnets, setCarnets] = useState<Carnet[]>([]);
  const [selectedCarnetId, setSelectedCarnetId] = useState<string>("");
  const [sii, setSii] = useState<number | null>(null);
  const [sessionDurationS, setSessionDurationS] = useState(0);
  const meterRef = useRef<NoiseMeterEngine | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const prevLevelRef = useRef<ThresholdLevel | null>(null);
  const orientationCleanupRef = useRef<(() => void) | null>(null);
  const motionCleanupRef = useRef<(() => void) | null>(null);
  const gpsWatchRef = useRef<number | null>(null);

  // ── Wake Lock ────────────────────────────────────────────────────────────────
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const wakeVideoRef = useRef<HTMLVideoElement | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // ── Expert mode ──────────────────────────────────────────────────────────────
  const [expertMode, setExpertMode] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem("nc_expert_mode") === "1";
  });

  // ── Continuous threshold alert ───────────────────────────────────────────────
  const [continuousAlertEnabled, setContinuousAlertEnabled] = useState(false);
  const [alertThresholdDb, setAlertThresholdDb] = useState(55);
  const [alertDurationMin, setAlertDurationMin] = useState(5);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const thresholdExceedStartRef = useRef<number | null>(null);
  const continuousAlertFiredRef = useRef(false);
  const [continuousAlertStatus, setContinuousAlertStatus] = useState<"idle" | "counting" | "fired">("idle");
  const [continuousElapsedMin, setContinuousElapsedMin] = useState(0);

  // ── Audio clip at peak ───────────────────────────────────────────────────────
  const [captureAudioAtPeak, setCaptureAudioAtPeak] = useState(false);
  const peakMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const peakAudioChunksRef = useRef<Blob[]>([]);
  const peakClipBlobRef = useRef<Blob | null>(null);
  const peakClipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [peakClipCaptured, setPeakClipCaptured] = useState(false);

  // Notification permission probe
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof Notification === "undefined") { setNotifPermission("unsupported"); return; }
    setNotifPermission(Notification.permission);
  }, []);

  // Re-acquire Wake Lock when page becomes visible again (e.g. user returns from another app)
  useEffect(() => {
    async function onVisibility() {
      if (document.visibilityState === "visible" && isActive) {
        try {
          wakeVideoRef.current?.play();
          setWakeLockActive(true);
        } catch { /* non-fatal */ }
        if ("wakeLock" in navigator) {
          try {
            wakeLockRef.current = await navigator.wakeLock.request("screen");
          } catch { /* non-fatal */ }
        }
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isActive]);

  // Enumerate audio input devices after mount. Labels are only available after
  // the user has granted microphone permission (first measurement start).
  // We refresh after each successful getUserMedia by listening to devicechange.
  useEffect(() => {
    async function refresh() {
      const devs = await listAudioInputDevices();
      if (devs.length > 0) setAudioDevices(devs);
    }
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
  }, []);

  useEffect(() => {
    loadCarnets().then(setCarnets);
  }, []);

  useEffect(() => {
    let stop = () => {};
    startBarometer((r) => setBaroReading(r)).then((handle) => {
      setBaroSupported(handle.state === "active");
      stop = handle.stop;
    });
    return () => stop();
  }, []);

  const threshold = db !== null ? getThreshold(db) : null;

  const handleReading = useCallback(
    ({ dba: rawDb, dbz: rawDbz, dbc: rawDbc, ndsi: rawNdsi }: ExtendedMeterReading) => {
      const newDb = Math.max(0, Math.min(140, rawDb + calibrationOffset));
      setDb(newDb);
      setDbz(Math.max(0, Math.min(140, rawDbz + calibrationOffset)));
      setDbc(Math.max(0, Math.min(140, rawDbc + calibrationOffset)));
      setNdsi(rawNdsi);
      // SII: computed from live FFT data when analyser is available
      const analyser = meterRef.current?.getAnalyser();
      if (analyser) {
        const freqData = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(freqData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sr = (analyser as any).context?.sampleRate ?? 44100;
        setSii(computeSII(freqData, sr, analyser.fftSize, calibrationOffset));
      }
      // Discard reading if phone is moving — handling noise corrupts Leq
      if (isMovingRef.current) {
        setDiscardedCount((c) => c + 1);
        return;
      }
      setPeak((prev) => {
        if (newDb > prev) {
          setPeakAt(Date.now());
          // Trigger audio clip capture on new peak (runs outside callback — uses ref)
          if (captureAudioAtPeak) {
            const stream = meterRef.current?.getStream();
            if (stream && typeof MediaRecorder !== "undefined") {
              // Cancel any ongoing peak capture
              if (peakClipTimeoutRef.current) clearTimeout(peakClipTimeoutRef.current);
              peakMediaRecorderRef.current?.stop();
              peakAudioChunksRef.current = [];
              peakClipBlobRef.current = null;
              // Determine best mime type
              const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : "audio/ogg";
              try {
                const mr = new MediaRecorder(stream, { mimeType: mime });
                mr.ondataavailable = (e) => { if (e.data.size > 0) peakAudioChunksRef.current.push(e.data); };
                mr.onstop = () => {
                  peakClipBlobRef.current = new Blob(peakAudioChunksRef.current, { type: mime });
                  setPeakClipCaptured(true);
                };
                mr.start(1000); // collect in 1-second chunks
                peakMediaRecorderRef.current = mr;
                peakClipTimeoutRef.current = setTimeout(() => mr.state === "recording" && mr.stop(), 15000);
              } catch { /* non-fatal — MediaRecorder may not support the stream */ }
            }
          }
          return newDb;
        }
        return prev;
      });
      setSessionReadings((prev) => {
        const next = [...prev, newDb];
        return next.length > 300 ? next.slice(-300) : next;
      });
      // Threshold crossing haptics
      const level = getThreshold(newDb).level;
      if (prevLevelRef.current !== null && prevLevelRef.current !== level) {
        if (level === "safe")      Haptics.toSafe();
        if (level === "caution")   Haptics.toCaution();
        if (level === "dangerous") Haptics.toDangerous();
        if (level === "critical")  Haptics.toCritical();
        if (level === "extreme")   Haptics.toCritical(); // reuse critical haptic — most intense available
      }
      prevLevelRef.current = level;

      if (level === "dangerous" || level === "critical" || level === "extreme") {
        const now = Date.now();
        if (!alertDismissedAt || now - alertDismissedAt > 60000) setShowAlert(true);
      }

      // ── Continuous threshold alert ──────────────────────────────────────────
      if (continuousAlertEnabled) {
        const now = Date.now();
        if (newDb >= alertThresholdDb) {
          if (!thresholdExceedStartRef.current) thresholdExceedStartRef.current = now;
          const elapsed = (now - thresholdExceedStartRef.current) / 60000;
          setContinuousElapsedMin(Math.floor(elapsed));
          if (!continuousAlertFiredRef.current) {
            setContinuousAlertStatus("counting");
            if (elapsed >= alertDurationMin) {
              continuousAlertFiredRef.current = true;
              setContinuousAlertStatus("fired");
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification("Noisecatcher — threshold sustained", {
                  body: `${alertThresholdDb} dB(A) exceeded for over ${alertDurationMin} min`,
                  tag: "nc-threshold-alert",
                  silent: false,
                });
              }
              navigator.vibrate?.([300, 100, 300, 100, 600]);
            }
          }
        } else {
          thresholdExceedStartRef.current = null;
          continuousAlertFiredRef.current = false;
          setContinuousAlertStatus("idle");
          setContinuousElapsedMin(0);
        }
      }

      // ── Audio clip at peak ──────────────────────────────────────────────────
      if (captureAudioAtPeak) {
        // Trigger is handled in the setPeak callback below — we just need newDb available
      }
    },
    [alertDismissedAt, calibrationOffset, continuousAlertEnabled, alertThresholdDb, alertDurationMin, captureAudioAtPeak]
  );

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setIsActive(false);
  }, []);

  const startMeter = async () => {
    // Play a silent looping video to suppress iOS screen auto-lock.
    // Must run synchronously inside the user-gesture handler — iOS Safari
    // expires the gesture context after the first await, blocking video.play().
    // NoSleep.js ships this same video but bypasses it on iOS 16.4+ (where
    // navigator.wakeLock exists), falling back to the Wake Lock API that is
    // unreliable in PWA standalone mode. We drive the video directly instead.
    try {
      if (!wakeVideoRef.current) {
        const v = document.createElement("video");
        v.setAttribute("playsinline", "");
        v.muted = true;
        v.loop = true;
        const webmSrc = document.createElement("source");
        webmSrc.src = WAKE_WEBM;
        webmSrc.type = "video/webm";
        const mp4Src = document.createElement("source");
        mp4Src.src = WAKE_MP4;
        mp4Src.type = "video/mp4";
        v.appendChild(webmSrc);
        v.appendChild(mp4Src);
        wakeVideoRef.current = v;
      }
      wakeVideoRef.current.play();
      setWakeLockActive(true);
    } catch { /* non-fatal */ }

    setError(null);
    setPeak(0);
    setPeakAt(null);
    setSessionReadings([]);
    setDiscardedCount(0);
    setBearing(null);
    prevLevelRef.current = null;
    sessionStartRef.current = Date.now();
    setSessionDurationS(0);
    peakClipBlobRef.current = null;
    peakAudioChunksRef.current = [];
    setPeakClipCaptured(false);
    thresholdExceedStartRef.current = null;
    continuousAlertFiredRef.current = false;
    setContinuousAlertStatus("idle");
    setContinuousElapsedMin(0);

    // Start orientation + motion tracking (iOS 13+ needs permission from user gesture)
    const [hasOrientation, hasMotion] = await Promise.all([
      requestOrientationPermission(),
      requestMotionPermission(),
    ]);
    if (hasOrientation) {
      orientationCleanupRef.current = startOrientationTracking(({ isLevel: lvl, bearing: brg }) => {
        setIsLevel(lvl);
        setBearing(brg);
      });
    }
    if (hasMotion) {
      motionCleanupRef.current = startMotionTracking(({ isMoving: moving }) => {
        isMovingRef.current = moving;
        setIsMoving(moving);
      });
    }

    const meter = new NoiseMeterEngine(handleReading, handleError);
    meterRef.current = meter;
    try {
      await meter.start(selectedDeviceId);
    } catch {
      // handleError already called by the engine; clean up orientation/motion then bail
      orientationCleanupRef.current?.(); orientationCleanupRef.current = null;
      motionCleanupRef.current?.(); motionCleanupRef.current = null;
      return;
    }
    // After first getUserMedia, re-enumerate so labels become available
    const devs = await listAudioInputDevices();
    if (devs.length > 0) setAudioDevices(devs);
    setIsActive(true);

    // Wake Lock API as secondary reinforcement (Chrome Android, Firefox).
    if ("wakeLock" in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch { /* non-fatal */ }
    }

    // Passive GPS watch for multi-device TDOA — low accuracy, minimal battery impact
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      gpsWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, maximumAge: 10000, timeout: 15000 }
      );
    }
  };

  const stopMeter = () => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
    try { wakeVideoRef.current?.pause(); } catch { /* non-fatal */ }
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    setWakeLockActive(false);
    // Stop any ongoing peak audio capture
    if (peakClipTimeoutRef.current) clearTimeout(peakClipTimeoutRef.current);
    if (peakMediaRecorderRef.current?.state === "recording") peakMediaRecorderRef.current.stop();
    thresholdExceedStartRef.current = null;
    continuousAlertFiredRef.current = false;
    setContinuousAlertStatus("idle");
    setContinuousElapsedMin(0);
    meterRef.current?.stop();
    meterRef.current = null;
    orientationCleanupRef.current?.();
    orientationCleanupRef.current = null;
    motionCleanupRef.current?.();
    motionCleanupRef.current = null;
    isMovingRef.current = false;
    setIsActive(false);
    setIsLevel(false);
    setIsMoving(false);
    setBearing(null);
    setDiscardedCount(0);
    setDb(null);
    sessionStartRef.current = null;
    setSessionDurationS(0);
  };

  const stopAndReport = async () => {
    if (average === null || sessionReadings.length === 0) { stopMeter(); return; }
    const stats = computeStats(sessionReadings);
    const thr = getThreshold(average);

    // SHA-256 of the objective session data — computed before saving so the hash
    // covers exactly what gets stored, giving a verifiable capture-time fingerprint.
    const captureTimestamp = new Date().toISOString();
    let sessionSha256: string | undefined;
    try {
      const canonical = JSON.stringify({
        timestamp: captureTimestamp,
        durationS: sessionDurationS,
        leq: average,
        peak,
        l10: stats?.l10 ?? average,
        l50: stats?.l50 ?? average,
        l90: stats?.l90 ?? average,
        sampleCount: sessionReadings.length,
        calibrationOffset,
        lat: gps?.lat ?? null,
        lng: gps?.lng ?? null,
      });
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      sessionSha256 = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch { /* non-fatal */ }

    const report = await saveReport({
      durationS: sessionDurationS,
      leq: average,
      peak,
      l10: stats?.l10 ?? average,
      l50: stats?.l50 ?? average,
      l90: stats?.l90 ?? average,
      sampleCount: sessionReadings.length,
      euDose: euDose ?? null,
      oshaDose: oshaDose ?? null,
      thresholdLevel: thr.level,
      thresholdLabel: thr.label,
      thresholdColor: thr.color,
      loudness: psychoMetrics?.loudness ?? null,
      sharpness: psychoMetrics?.sharpness ?? null,
      roughness: psychoMetrics?.roughness ?? null,
      annoyance: psychoMetrics?.annoyance ?? null,
      aci: aciValue,
      ndsi: ndsi,
      hfPeakHz: hfBand?.peakHz ?? null,
      calibrationOffset,
      carnetId: selectedCarnetId || undefined,
      lat: gps?.lat ?? null,
      lng: gps?.lng ?? null,
      bearing: bearing ?? null,
      sessionSha256,
    });
    // Attach peak audio clip as a VoiceNote if one was captured
    if (captureAudioAtPeak && peakClipBlobRef.current) {
      try {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(peakClipBlobRef.current!);
        });
        await saveVoiceNote({
          audioDataUrl: dataUrl,
          durationS: 15,
          attachedTo: report.id,
          attachedType: "report",
          carnetId: selectedCarnetId || undefined,
          transcript: `Peak audio clip — ${peak.toFixed(1)} dB(A) — captured automatically at peak reading`,
        });
      } catch { /* non-fatal */ }
    }

    stopMeter();
    router.push(`/report/${report.id}`);
  };

  useEffect(() => {
    return () => {
      meterRef.current?.stop();
      orientationCleanupRef.current?.();
      motionCleanupRef.current?.();
    };
  }, []);

  // Tick session duration every second while active — avoids Date.now() in render
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      if (sessionStartRef.current !== null) {
        setSessionDurationS((Date.now() - sessionStartRef.current) / 1000);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isActive]);

  // Psychoacoustic metrics — sampled every 150 ms from the live analyser
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isActive) { setPsychoMetrics(null); setAciValue(null); setHfBand(null); setDbz(null); setDbc(null); setNdsi(null); return; }
    const INTERVAL = 150;
    let last = 0;
    let raf: number;
    function poll(time: number) {
      if (time - last >= INTERVAL) {
        last = time;
        const analyser = meterRef.current?.getAnalyser();
        if (analyser && db !== null) {
          const freq = new Uint8Array(analyser.frequencyBinCount);
          const time_ = new Float32Array(analyser.fftSize);
          analyser.getByteFrequencyData(freq);
          analyser.getFloatTimeDomainData(time_);
          setPsychoMetrics(computePsycho(db, freq, time_, analyser.context.sampleRate));
          setAciValue(computeACI(freq));
          setHfBand(computeHFBand(freq, analyser.context.sampleRate));
        }
      }
      raf = requestAnimationFrame(poll);
    }
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [isActive, db]);

  const average =
    sessionReadings.length > 0
      ? Math.round(10 * Math.log10(sessionReadings.reduce((acc, v) => acc + Math.pow(10, v / 10), 0) / sessionReadings.length) * 10) / 10
      : null;

  const [corrobCopied, setCorrobCopied] = useState(false);

  function copyCorroboration() {
    if (average === null || sessionReadings.length === 0) return;
    const stats = computeStats(sessionReadings);
    const payload = JSON.stringify({
      type: "noisecatcher-corroboration-v1",
      leq: average,
      peak,
      l10: stats?.l10 ?? average,
      l50: stats?.l50 ?? average,
      l90: stats?.l90 ?? average,
      sampleCount: sessionReadings.length,
      timestamp: sessionStartRef.current ? new Date(sessionStartRef.current).toISOString() : new Date().toISOString(),
      durationS: Math.round(sessionDurationS),
      calibrationOffset,
      ...(gps ? { location: { lat: gps.lat, lng: gps.lng } } : {}),
    });
    navigator.clipboard.writeText(payload).then(() => {
      setCorrobCopied(true);
      setTimeout(() => setCorrobCopied(false), 3000);
    }).catch(() => {});
  }

  const euDose   = average !== null && sessionDurationS > 0 ? calcDose(average, sessionDurationS, 80, 3) : null;
  const oshaDose = average !== null && sessionDurationS > 0 ? calcDose(average, sessionDurationS, 90, 5) : null;

  // Throttled screen-reader announcement: update every 3 s so the readout
  // doesn't overwhelm assistive technology during continuous measurement.
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const lastAnnounceRef = useRef(0);
  useEffect(() => {
    if (db === null || !isActive) return;
    const now = Date.now();
    if (now - lastAnnounceRef.current < 3000) return;
    lastAnnounceRef.current = now;
    const thr = getThreshold(db);
    setLiveAnnouncement(`${Math.round(db)} decibels, ${thr.label}`);
  }, [db, isActive]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      {/* Screen-reader live region — announces dB level every ~3 s */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* ── Calibration notice ── */}
      {calibrationOffset !== 0 && (
        <div className="w-full flex items-center justify-between px-3 py-2 te-panel rounded-md">
          <span className="te-label">
            {t.meter_offset_label} {calibrationOffset > 0 ? "+" : ""}{calibrationOffset} dB
          </span>
          <button
            onClick={() => setShowCalibration(true)}
            className="te-label text-white/40 hover:text-white/80 transition-colors underline underline-offset-2"
          >
            {t.meter_adjust}
          </button>
        </div>
      )}

      {/* ── Relativity warning ── */}
      <div className="w-full px-3 py-2 te-panel rounded-md flex items-start gap-2">
        <span className="text-white/20 text-[10px] mt-px shrink-0">⚠</span>
        <p className="te-label leading-relaxed text-white/30">
          {t.meter_relative_warning}{" "}
          <button
            onClick={() => setShowCalibration(true)}
            className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
          >
            {t.meter_calibrate}
          </button>
        </p>
      </div>

      {/* ── SVG instrument gauge ── */}
      <div className="w-full flex justify-center">
        <MeterGauge
          db={db}
          isActive={isActive}
          isLevel={isLevel}
          labelSafe={t.threshold_safe}
          labelCaution={t.threshold_caution}
          labelDangerous={t.threshold_dangerous}
          labelCritical={t.threshold_critical}
          labelExtreme={t.threshold_extreme}
          labelInactive={t.meter_inactive}
          labelLevel={t.meter_level_indicator}
        />
      </div>

      {/* ── Spectrogram (active only) ── */}
      {isActive && <Spectrogram meterRef={meterRef} isActive={isActive} />}

      {/* ── Compass & motion status (active only) ── */}
      {isActive && (bearing !== null || isMoving || discardedCount > 0) && (
        <div className="w-full flex items-center gap-2 te-panel rounded-md px-3 py-2">
          {bearing !== null && (
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-white/25 text-[10px] uppercase tracking-wider">{t.meter_bearing}</span>
              <span className="font-mono text-xs font-semibold text-white/60 tabular-nums">
                {bearing}°
              </span>
              <span className="text-[10px] font-bold text-white/40">
                {bearingToLabel(bearing)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            {isMoving ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {t.meter_motion_moving}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                {t.meter_motion_stable}
              </span>
            )}
            {discardedCount > 0 && (
              <span className="text-[10px] text-white/20 ml-2" title="Readings discarded due to movement">
                {discardedCount} {t.meter_motion_skipped}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Stats row (active only) ── */}
      {isActive && (() => {
        const stats = computeStats(sessionReadings);
        return (
          <>
            <div className="w-full grid grid-cols-3 divide-x divide-white/5 te-panel rounded-md">
              {[
                { label: t.meter_peak, value: `${peak}`, unit: "dB" },
                { label: t.meter_leq, value: average !== null ? `${average}` : "—", unit: average !== null ? "dB" : "" },
                { label: t.meter_samples, value: `${sessionReadings.length}`, unit: "" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="flex flex-col items-center py-3 gap-0.5">
                  <span className="te-label">{label}</span>
                  <span className="te-readout text-white font-semibold text-sm">
                    {value}<span className="text-white/30 text-xs ml-0.5">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
            {stats && (
              <div className="w-full te-panel rounded-md overflow-hidden">
                <div className="px-3 py-1.5 te-rule">
                  <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">{t.meter_stats_title}</span>
                </div>
                <div className="grid grid-cols-4 divide-x divide-white/5">
                  {[
                    { label: t.meter_leq, value: stats.leq, title: "Equivalent continuous level" },
                    { label: t.meter_l10,  value: stats.l10,  title: "Exceeded 10% of the time" },
                    { label: "L50",        value: stats.l50,  title: "Exceeded 50% of the time (median)" },
                    { label: t.meter_l90,  value: stats.l90,  title: "Exceeded 90% of the time (background)" },
                  ].map(({ label, value, title }) => (
                    <div key={label} className="flex flex-col items-center py-2.5 gap-0.5" aria-label={title} title={title}>
                      <span className="te-label text-white/30 text-[10px]">{label}</span>
                      <span className="text-white/70 font-mono text-xs font-semibold tabular-nums">{value}<span className="text-white/25 text-[9px] ml-0.5">dB</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ── Spectral weighting: dBC / dBZ (active only) ── */}
      {isActive && expertMode && dbc !== null && dbz !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule flex items-center gap-2">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">Spectral weighting</span>
            <span className="te-label text-white/20 text-[9px] ml-auto">dBA suppresses LF — dBC and dBZ reveal it</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {[
              { label: "dBA", value: db ?? 0, title: "A-weighted — standard environmental measurement (IEC 61672)" },
              { label: "dBC", value: dbc,      title: "C-weighted — retains low-frequency energy to ~16 Hz (ISO 1996)" },
              { label: "dBZ", value: dbz,      title: "Unweighted — full spectrum, no frequency preference" },
            ].map(({ label, value, title }) => (
              <div key={label} className="flex flex-col items-center py-2.5 gap-0.5" title={title} aria-label={title}>
                <span className="te-label text-white/30 text-[10px]">{label}</span>
                <span className="text-white/70 font-mono text-xs font-semibold tabular-nums">
                  {Math.round(value)}<span className="text-white/25 text-[9px] ml-0.5">dB</span>
                </span>
              </div>
            ))}
          </div>
          {dbc !== null && db !== null && (dbc - db) > 6 && (
            <div className="px-3 py-1.5 te-rule">
              <p className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>
                ⚠ dBC − dBA = {Math.round(dbc - db)} dB — significant low-frequency content. Consider documenting as LFN (data center, HVAC, shipping, wind turbine).
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Expert mode toggle ── */}
      {isActive && (
        <div className="w-full flex items-center justify-between">
          <span className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>Expert panels</span>
          <button
            onClick={() => {
              const next = !expertMode;
              setExpertMode(next);
              localStorage.setItem("nc_expert_mode", next ? "1" : "0");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded te-label text-[10px] transition-colors"
            style={{
              background: expertMode ? "var(--nc-bg-raised)" : "transparent",
              border: "1px solid var(--nc-border-mid)",
              color: expertMode ? "var(--nc-text)" : "var(--nc-text-3)",
            }}
            title="Show psychoacoustics, ACI, NDSI, SII, HF scanner, barometer"
          >
            <Wand2 className="w-3 h-3" />
            {expertMode ? "Expert on" : "Expert off"}
          </button>
        </div>
      )}

      {/* ── Psychoacoustic metrics (active only) ── */}
      {isActive && expertMode && psychoMetrics && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">{t.psycho_title}</span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-white/5">
            {[
              { label: t.psycho_loudness, value: psychoMetrics.loudness, unit: "sone", title: "Perceived loudness (Zwicker)" },
              { label: t.psycho_sharpness, value: psychoMetrics.sharpness, unit: "acum", title: "Spectral brightness (Aures)" },
              { label: t.psycho_roughness, value: psychoMetrics.roughness, unit: "asper", title: "AM-based roughness at 70 Hz" },
              { label: t.psycho_annoyance, value: psychoMetrics.annoyance, unit: "PA", title: "Psychoacoustic annoyance (Zwicker-Fastl)" },
            ].map(({ label, value, unit, title }) => (
              <div key={label} className="flex flex-col items-center py-2.5 gap-0.5" aria-label={title} title={title}>
                <span className="te-label text-white/30 text-[10px]">{label}</span>
                <span className="text-white/70 font-mono text-xs font-semibold tabular-nums">
                  {value}<span className="text-white/25 text-[9px] ml-0.5">{unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Acoustic Complexity Index ── */}
      {isActive && expertMode && aciValue !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule flex items-center justify-between">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">Acoustic Complexity Index</span>
            <span className="font-mono text-xs font-semibold tabular-nums text-white/60">
              {aciValue.toFixed(3)}
            </span>
          </div>
          <div className="px-3 py-2">
            <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(aciValue * 200, 100)}%`, background: aciValue > 0.3 ? "#4ade80" : aciValue > 0.1 ? "#fb923c" : "#f87171" }}
              />
            </div>
            <p className="text-white/25 text-[9px] mt-1">
              {aciValue > 0.3 ? "Complex / natural soundscape" : aciValue > 0.1 ? "Mixed soundscape" : "Monotone / tonal — possible deterrent or machinery"}
              {" "}· ACI (Farina 2010)
            </p>
          </div>
        </div>
      )}

      {/* ── NDSI — Normalized Difference Soundscape Index ── */}
      {isActive && expertMode && ndsi !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule flex items-center justify-between">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">Soundscape Index (NDSI)</span>
            <span
              className="font-mono text-xs font-semibold tabular-nums"
              style={{ color: ndsi > 0.2 ? "#4ade80" : ndsi > -0.2 ? "#fb923c" : "#f87171" }}
            >
              {ndsi > 0 ? "+" : ""}{ndsi.toFixed(2)}
            </span>
          </div>
          <div className="px-3 py-2 flex flex-col gap-1.5">
            {/* Bipolar bar: centre = 0, left = anthrophony, right = biophony */}
            <div className="relative h-1.5 rounded-full overflow-hidden bg-white/5 flex">
              <div className="w-1/2 flex justify-end">
                {ndsi < 0 && (
                  <div
                    className="h-full rounded-l-full"
                    style={{ width: `${Math.min(Math.abs(ndsi) * 100, 100)}%`, background: "#f87171" }}
                  />
                )}
              </div>
              <div className="w-px bg-white/20 shrink-0" />
              <div className="w-1/2">
                {ndsi > 0 && (
                  <div
                    className="h-full rounded-r-full"
                    style={{ width: `${Math.min(ndsi * 100, 100)}%`, background: "#4ade80" }}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px]" style={{ color: "#f87171" }}>← Anthropophony</span>
              <span className="text-[9px]" style={{ color: "#4ade80" }}>Biophony →</span>
            </div>
            <p className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>
              {ndsi > 0.4
                ? "Biologically-dominated soundscape — ecological refuge"
                : ndsi > 0.1
                ? "Mixed soundscape — moderate biological activity"
                : ndsi > -0.2
                ? "Anthropophony beginning to dominate"
                : "Strongly anthropogenic — biological sound suppressed"}
              {" "}· NDSI (Pijanowski 2011) · 200 Hz–2 kHz vs 2–8 kHz
            </p>
          </div>
        </div>
      )}

      {/* ── Speech Intelligibility Index (SII) — indicative ── */}
      {isActive && expertMode && sii !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule flex items-center justify-between">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">{t.sii_label}</span>
            <span className="te-label text-[10px]" style={{ color: sii >= 0.75 ? "#4ade80" : sii >= 0.45 ? "#fb923c" : "#f87171" }}>
              {siiLabel(sii)} · {(sii * 100).toFixed(0)}%
            </span>
          </div>
          <div className="px-3 py-2 flex flex-col gap-1">
            <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(sii * 100).toFixed(0)}%`,
                  background: sii >= 0.75 ? "#4ade80" : sii >= 0.45 ? "#fb923c" : "#f87171",
                }}
              />
            </div>
            <p className="text-white/25 text-[9px]">
              {t.sii_indicative} · fraction of normal speech surviving noise floor · not a certified instrument
            </p>
          </div>
        </div>
      )}

      {/* ── HF Deterrent Scanner ── */}
      {isActive && expertMode && hfBand !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule flex items-center justify-between">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">HF Deterrent Scanner</span>
            <span className="te-label text-[10px]" style={{ color: hfBand.peakHz ? "#f87171" : "#4ade80" }}>
              {hfBand.peakHz ? `⚠ ${(hfBand.peakHz / 1000).toFixed(1)} kHz detected` : "Clear"}
            </span>
          </div>
          <div className="px-3 py-2 flex flex-col gap-1">
            <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{ width: `${Math.min(hfBand.rms * 300, 100)}%`, background: hfBand.rms > 0.15 ? "#f87171" : hfBand.rms > 0.05 ? "#fb923c" : "#4ade80" }}
              />
            </div>
            <p className="text-white/25 text-[9px]">
              15–20 kHz band energy · Mosquito / LRAD range
              {hfBand.peakHz ? ` · Peak: ${(hfBand.peakHz / 1000).toFixed(2)} kHz` : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── Barometer ── only shown when Generic Sensor API is active (Chrome + device) ── */}
      {isActive && expertMode && baroSupported && baroReading !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule flex items-center justify-between">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">Atmospheric Pressure</span>
            <span className="te-label text-[10px] text-white/60">{baroReading.hPa.toFixed(1)} hPa</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-white/25 text-[9px]">
              MEMS barometer · affects sound propagation · standard sea-level: 1013.25 hPa
            </p>
          </div>
        </div>
      )}

      {/* ── Noise Dose Calculator ── */}
      {isActive && euDose !== null && oshaDose !== null && (
        <div className="w-full te-panel rounded-md overflow-hidden">
          <div className="px-3 py-1.5 te-rule">
            <span className="te-label text-white/40 uppercase tracking-wider text-[10px]">Noise Dose</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/5">
            {[
              { label: "EU 80 dB(A)/8h", dose: euDose, warn: 100, alert: 50, title: "EU Directive 2003/10/EC — lower action level" },
              { label: "OSHA 90 dB(A)/8h", dose: oshaDose, warn: 100, alert: 50, title: "OSHA PEL — permissible exposure limit" },
            ].map(({ label, dose, warn, alert, title }) => {
              const pct = Math.min(dose, 999);
              const color = dose >= warn ? "#f87171" : dose >= alert ? "#fb923c" : "#4ade80";
              return (
                <div key={label} className="flex flex-col items-center py-2.5 gap-0.5" title={title}>
                  <span className="te-label text-white/30 text-[10px]">{label}</span>
                  <span className="font-mono text-xs font-semibold tabular-nums" style={{ color }}>
                    {pct < 10 ? pct.toFixed(2) : pct < 100 ? pct.toFixed(1) : Math.round(pct)}
                    <span className="text-white/25 text-[9px] ml-0.5">%</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-3 py-1 te-rule">
            <span className="text-white/20 text-[9px]">Based on session Leq · resets on each start</span>
          </div>
        </div>
      )}

      {/* ── Pin this reading ── */}
      {isActive && db !== null && (
        <Link
          href="/map"
          className="flex items-center gap-2 px-5 py-2 rounded-md border border-white/10 te-label text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          {t.meter_pin_reading}
        </Link>
      )}

      {/* ── External microphone selector (shown only when >1 device is available) ── */}
      {audioDevices.length > 1 && !isActive && (
        <div className="w-full flex flex-col gap-1.5">
          <label className="te-label text-white/40 uppercase tracking-wider text-[10px]">
            {t.meter_mic_source}
          </label>
          <select
            value={selectedDeviceId ?? ""}
            onChange={(e) => setSelectedDeviceId(e.target.value || undefined)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-white/25 transition-colors"
          >
            <option value="">{t.meter_mic_default}</option>
            {audioDevices.map((dev) => (
              <option key={dev.deviceId} value={dev.deviceId}>
                {dev.label || `Microphone ${dev.deviceId.slice(0, 6)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Soft gain control ── */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="te-label text-white/40 uppercase tracking-wider text-[10px]">
            Gain
          </label>
          <span className="te-label text-white/40 font-mono text-[10px] tabular-nums">
            {gainDb > 0 ? "+" : ""}{gainDb} dB
          </span>
        </div>
        <input
          type="range"
          min={-12}
          max={24}
          step={1}
          value={gainDb}
          onChange={(e) => {
            const v = Number(e.target.value);
            setGainDb(v);
            meterRef.current?.setGain(v);
          }}
          className="w-full accent-white/60 h-1.5 rounded-full"
          aria-label={`Gain ${gainDb} dB`}
        />
        <div className="flex justify-between text-[9px] text-white/20 font-mono">
          <span>−12</span>
          <span>0</span>
          <span>+24</span>
        </div>
      </div>

      {/* ── Start / Stop + Stop & Report + Calibrate ── */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={isActive ? stopMeter : startMeter}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm tracking-wide transition-all ${
            isActive
              ? "bg-white/8 hover:bg-white/12 text-white border border-white/10"
              : "bg-white text-gray-900 hover:bg-gray-100"
          }`}
        >
          {isActive
            ? <><MicOff className="w-4 h-4" />{t.meter_stop}</>
            : <><Mic className="w-4 h-4" />{t.meter_start}</>}
        </button>
        {isActive && sessionReadings.length >= 5 && (
          <button
            onClick={stopAndReport}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-sm tracking-wide transition-all bg-white/8 hover:bg-white/12 text-white border border-white/10"
          >
            <FileText className="w-4 h-4" />
            {t.meter_stop_report}
          </button>
        )}
        <button
          onClick={() => setShowCalibration(true)}
          aria-label="Calibrate microphone"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border border-white/8 text-white/30 hover:text-white/70 hover:border-white/20 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* ── Notebook assignment (shown before starting) ── */}
      {!isActive && carnets.length > 0 && (
        <div className="w-full flex flex-col gap-1">
          <label className="te-label text-white/40 uppercase tracking-wider text-[10px]">{t.report_save_carnet}</label>
          <select
            value={selectedCarnetId}
            onChange={(e) => setSelectedCarnetId(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-white/25"
          >
            <option value="">— No notebook —</option>
            {carnets.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Wake Lock status ── */}
      {wakeLockActive && (
        <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded te-label text-[10px]" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
          <Lock className="w-3 h-3 text-green-500 shrink-0" />
          <span style={{ color: "var(--nc-text-2)" }}>Screen lock suppressed — screen will stay on during measurement.</span>
        </div>
      )}
      {!wakeLockActive && !isActive && (
        <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded te-label text-[10px]" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
          <Unlock className="w-3 h-3 shrink-0" style={{ color: "var(--nc-text-3)" }} />
          <span style={{ color: "var(--nc-text-3)" }}>Screen lock will be suppressed when measurement starts.</span>
        </div>
      )}

      {/* ── Audio recorder ── */}
      <AudioRecorderPanel />

      {/* ── Continuous threshold alert ── */}
      <div className="w-full te-panel rounded-md overflow-hidden">
        <div className="px-3 py-2 te-rule flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {continuousAlertEnabled ? <BellRing className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <BellOff className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--nc-text-3)" }} />}
            <span className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>Threshold monitor</span>
          </div>
          <button
            onClick={() => {
              if (!continuousAlertEnabled && notifPermission === "default" && typeof Notification !== "undefined") {
                Notification.requestPermission().then(p => setNotifPermission(p));
              }
              setContinuousAlertEnabled(v => !v);
            }}
            className="px-2 py-0.5 rounded te-label text-[10px] transition-colors"
            style={{
              background: continuousAlertEnabled ? "rgba(251,146,60,0.15)" : "transparent",
              border: `1px solid ${continuousAlertEnabled ? "rgba(251,146,60,0.4)" : "var(--nc-border-mid)"}`,
              color: continuousAlertEnabled ? "#fb923c" : "var(--nc-text-3)",
            }}
          >
            {continuousAlertEnabled ? "On" : "Off"}
          </button>
        </div>
        <div className="px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-0.5">
              <label className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Alert above</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min={30} max={130} step={1}
                  value={alertThresholdDb}
                  onChange={e => setAlertThresholdDb(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded text-xs font-mono te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
                <span className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>dB(A)</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <label className="te-label text-[9px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>For at least</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min={1} max={120} step={1}
                  value={alertDurationMin}
                  onChange={e => setAlertDurationMin(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded text-xs font-mono te-label border focus:outline-none"
                  style={{ background: "var(--nc-bg-raised)", borderColor: "var(--nc-border-mid)", color: "var(--nc-text)" }}
                />
                <span className="te-label text-[10px]" style={{ color: "var(--nc-text-3)" }}>min</span>
              </div>
            </div>
          </div>
          {continuousAlertEnabled && isActive && (
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: continuousAlertStatus === "fired" ? "#f87171" : continuousAlertStatus === "counting" ? "#fb923c" : "#4ade80",
                  animation: continuousAlertStatus === "counting" ? "pulse 1s infinite" : undefined,
                }}
              />
              <span className="te-label text-[10px]" style={{ color: continuousAlertStatus === "fired" ? "#f87171" : "var(--nc-text-3)" }}>
                {continuousAlertStatus === "fired"
                  ? `⚠ Alert fired — ${alertThresholdDb} dB(A) sustained ≥${alertDurationMin} min`
                  : continuousAlertStatus === "counting"
                  ? `Above ${alertThresholdDb} dB(A) for ${continuousElapsedMin} min — alert at ${alertDurationMin} min`
                  : `Monitoring — alert if above ${alertThresholdDb} dB(A) for ${alertDurationMin} min`}
              </span>
            </div>
          )}
          {notifPermission === "denied" && continuousAlertEnabled && (
            <p className="te-label text-[9px]" style={{ color: "#f87171" }}>Notification permission denied — visual + vibration alert only. Allow notifications in browser settings for background alerts.</p>
          )}
          {notifPermission === "unsupported" && continuousAlertEnabled && (
            <p className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>Notification API not supported in this browser — visual + vibration alert only.</p>
          )}
          <p className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>
            55 dB(A) = EU END major annoyance threshold · 45 dB(A) = WHO Lnight residential
          </p>
        </div>
      </div>

      {/* ── Audio clip at peak ── */}
      <div className="w-full te-panel rounded-md overflow-hidden">
        <div className="px-3 py-2 te-rule flex items-center justify-between gap-2">
          <span className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-2)" }}>Audio clip at peak</span>
          <button
            onClick={() => setCaptureAudioAtPeak(v => !v)}
            className="px-2 py-0.5 rounded te-label text-[10px] transition-colors"
            style={{
              background: captureAudioAtPeak ? "rgba(74,222,128,0.1)" : "transparent",
              border: `1px solid ${captureAudioAtPeak ? "rgba(74,222,128,0.4)" : "var(--nc-border-mid)"}`,
              color: captureAudioAtPeak ? "#4ade80" : "var(--nc-text-3)",
            }}
          >
            {captureAudioAtPeak ? "On" : "Off"}
          </button>
        </div>
        <div className="px-3 py-2 flex flex-col gap-1">
          {peakClipCaptured && (
            <div className="flex items-center gap-2 text-[10px] te-label" style={{ color: "#4ade80" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              15 s clip captured at last peak — will attach to report as a voice note
            </div>
          )}
          {!peakClipCaptured && captureAudioAtPeak && isActive && (
            <div className="flex items-center gap-2 text-[10px] te-label" style={{ color: "var(--nc-text-3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
              Waiting for new peak…
            </div>
          )}
          <p className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>
            When a new peak reading is set, a 15-second audio clip is recorded and attached to your session report. Audio is stored locally only — never transmitted. Opt-in only. For ECHR Art. 8 filings, a clip at the moment of exceedance significantly strengthens evidentiary value.
          </p>
        </div>
      </div>

      {/* ── Corroboration export ── */}
      {average !== null && sessionReadings.length >= 5 && (
        <div className="w-full rounded-xl px-4 py-3 flex flex-col gap-2" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--nc-text-3)" }} />
              <span className="te-label text-xs font-semibold" style={{ color: "var(--nc-text-2)" }}>Copy session to share</span>
            </div>
            <button
              onClick={copyCorroboration}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md te-label text-[11px] transition-colors"
              style={corrobCopied
                ? { background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }
                : { background: "var(--nc-bg)", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }
              }
            >
              {corrobCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Share2 className="w-3 h-3" /> Copy JSON</>}
            </button>
          </div>
          <p className="te-label text-[9px]" style={{ color: "var(--nc-text-3)" }}>
            Copies your session as a corroboration JSON. A co-witness can paste this into the Dossier builder (Step 1) to provide independent verification of the same noise event. Two independent measurements of the same event significantly strengthen evidentiary value.
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-2 bg-red-950/60 border border-red-800/50 rounded-md p-4 text-sm text-red-300 w-full">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Health context ── */}
      {threshold && db !== null && isActive && (
        <div className={`w-full rounded-md border p-4 text-sm ${threshold.borderColor} bg-black/40`}>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: threshold.color }} />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-sm" style={{ color: threshold.color }}>
                {threshold.shortDescription}
              </span>
              <span className="text-white/40 text-xs leading-relaxed">{threshold.exposure}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Abécédaire: surface relevant terms for current reading ── */}
      {db !== null && isActive && db >= 40 && (() => {
        const relevant = ABECEDAIRE
          .filter(e => e.relatedDbThreshold !== undefined && e.relatedDbThreshold <= db)
          .sort((a, b) => (b.relatedDbThreshold ?? 0) - (a.relatedDbThreshold ?? 0))
          .slice(0, 3);
        if (!relevant.length) return null;
        return (
          <div className="w-full rounded-md border p-3 flex flex-col gap-2" style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-raised)" }}>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>Relevant terms · Abécédaire</span>
            {relevant.map(entry => (
              <Link key={entry.id} href={`/abecedaire#${entry.id}`} className="flex flex-col gap-0.5 group">
                <span className="text-xs font-semibold group-hover:underline" style={{ color: "var(--nc-text)" }}>{entry.term}</span>
                <span className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--nc-text-3)" }}>{entry.definition}</span>
              </Link>
            ))}
          </div>
        );
      })()}

      {/* ── Multi-device shared session ── */}
      <MultiDevicePanel
        currentDba={db}
        gps={gps}
        peakDb={peak > 0 ? peak : null}
        peakAt={peakAt}
      />

      {/* ── Aircraft source identification (shown when GPS is available) ── */}
      {gps && (
        <div
          className="w-full rounded-xl px-4 py-3"
          style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}
        >
          <AircraftLookup lat={gps.lat} lng={gps.lng} />
        </div>
      )}

      {/* ── Audio import & analysis ── */}
      <AudioImporter />

      {/* ── Guided Critical Listening + Signature Library ── */}
      <div className="w-full flex gap-2">
        <button
          onClick={() => setShowGuidedListening(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border border-white/8 te-label text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
        >
          <Headphones className="w-3.5 h-3.5" />
          Critical Listening
        </button>
        <button
          onClick={() => setShowSignatureLibrary(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md border border-white/8 te-label text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
        >
          Signature Library
        </button>
      </div>

      {/* ── Threshold reference ── */}
      <div className="w-full te-panel rounded-md overflow-hidden">
        <div className="px-4 py-2 te-rule">
          <span className="te-label">{t.meter_who_thresholds}</span>
        </div>
        {THRESHOLDS.map((thr) => (
          <div
            key={thr.level}
            className={`flex items-center gap-3 px-4 py-2.5 te-rule last:border-0 transition-colors ${
              threshold?.level === thr.level ? "bg-white/4" : ""
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: thr.color }} />
            <span className="te-label flex-1 text-white/50">{thr.label}</span>
            <span className="te-readout text-white/30 text-[11px]">
              {thr.min}–{thr.max === 200 ? "∞" : thr.max} dB
            </span>
          </div>
        ))}
      </div>

      {/* ── Modals ── */}
      {showAlert && threshold && (
        <AlertModal
          threshold={threshold}
          db={db ?? 0}
          onDismiss={() => { setShowAlert(false); setAlertDismissedAt(Date.now()); }}
        />
      )}
      {showGuidedListening && (
        <GuidedListeningSession onClose={() => setShowGuidedListening(false)} />
      )}
      {showSignatureLibrary && (
        <SignatureLibrary onClose={() => setShowSignatureLibrary(false)} />
      )}
      {showCalibration && (
        <CalibrationModal
          currentDb={db}
          onCalibrate={(offset) => setCalibrationOffset(offset)}
          onClose={() => setShowCalibration(false)}
        />
      )}
    </div>
  );
}
