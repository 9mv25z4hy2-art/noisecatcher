"use client";

import { useState, useRef, useEffect } from "react";
import { X, LocateFixed, Camera, Mic, Ear } from "lucide-react";
import { savePin, WEEKDAYS, currentTimeString, compressPhoto } from "@/lib/pins";
import { loadCarnets } from "@/lib/db";
import type { Carnet } from "@/lib/db";
import type { NoiseCategory, Weekday, PinStatus } from "@/lib/pins";
import { publishPin, SENSITIVE_CATEGORIES } from "@/lib/sync";
import SourcePicker from "./SourcePicker";
import { getThreshold } from "@/lib/thresholds";
import { Haptics } from "@/lib/haptics";
import { getLastOrientation, bearingToLabel } from "@/lib/orientation";
import { useI18n } from "@/lib/i18n/context";

interface Props {
  lat: number;
  lng: number;
  defaultDb?: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function PinForm({ lat: initLat, lng: initLng, defaultDb, onClose, onSaved }: Props) {
  const { t } = useI18n();
  const [lat, setLat] = useState(initLat);
  const [lng, setLng] = useState(initLng);
  const [db, setDb] = useState(() => {
    if (defaultDb !== undefined) return defaultDb;
    const saved = typeof window !== "undefined" ? localStorage.getItem("noisecatcher_last_db") : null;
    return saved ? Math.min(130, Math.max(20, Number(saved))) : 60;
  });
  const [category, setCategory] = useState<NoiseCategory>("traffic");
  const [sourceSub, setSourceSub] = useState<string>("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [author, setAuthor] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string>(currentTimeString);
  const [recurring, setRecurring] = useState(false);
  const [days, setDays] = useState<Weekday[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<PinStatus>("active");
  const [pinMode, setPinMode] = useState<"measured" | "earwitness">("measured");
  const [qualities, setQualities] = useState<string[]>([]);
  const [durationEstimate, setDurationEstimate] = useState("");
  const [carnets, setCarnets] = useState<Carnet[]>([]);
  const [selectedCarnetId, setSelectedCarnetId] = useState<string>("");
  const [sharePublicly, setSharePublicly] = useState(false);
  const [confirmSensitive, setConfirmSensitive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "pin-form-title";

  // Focus trap + Escape handler
  useEffect(() => {
    const el = dialogRef.current as HTMLDivElement | null;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("button, input, select, textarea, [tabindex]:not([tabindex='-1'])");
    first?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !el) return;
      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex='-1'])")
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const showStatus = category === "construction" || category === "fascism" || category === "conflict" || category === "police_force" || category === "harassment";

  const threshold = getThreshold(db);

  function handleGPS(silent = false) {
    if (!navigator.geolocation) {
      if (!silent) setGpsError(t.pin_gps_unsupported);
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGpsLoading(false);
      },
      () => {
        // Only surface the error when the user explicitly pressed the GPS button.
        // On auto-fetch the map-tap coordinates are already valid — no need to alarm.
        if (!silent) setGpsError(t.pin_gps_error);
        setGpsLoading(false);
      },
      { timeout: 8000, maximumAge: 30000, enableHighAccuracy: true }
    );
  }

  // Auto-fetch GPS silently on open to upgrade map-tap coordinates to GPS precision.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { handleGPS(true); }, []);

  useEffect(() => { loadCarnets().then(setCarnets); }, []);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressPhoto(file);
      setPhotoDataUrl(dataUrl);
    } catch {
      // silently skip if compression fails
    }
  }

  function toggleDay(day: Weekday) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  const isSensitive = SENSITIVE_CATEGORIES.includes(category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { bearing, isLevel } = getLastOrientation();
    Haptics.pinDrop();
    const pin = await savePin({
      lat, lng,
      db: pinMode === "earwitness" ? 0 : db,
      category, description, anonymous,
      author: anonymous ? undefined : author,
      timeOfDay, recurring, days: recurring ? days : undefined,
      photoDataUrl,
      bearing: bearing ?? undefined,
      measuredLevel: pinMode === "measured" ? (isLevel || undefined) : undefined,
      sourceSub: sourceSub || undefined,
      status: showStatus ? status : undefined,
      pinType: pinMode,
      qualities: pinMode === "earwitness" && qualities.length > 0 ? qualities : undefined,
      durationEstimate: pinMode === "earwitness" && durationEstimate ? durationEstimate : undefined,
      carnetId: selectedCarnetId || undefined,
    });
    if (sharePublicly) {
      publishPin(pin, { confirmSensitive: isSensitive ? confirmSensitive : true });
    }
    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        role="dialog"
        className="rounded-2xl w-full max-w-sm flex flex-col gap-4 p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)" }}
      >

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-semibold text-base nc-text">{t.pin_form_title}</h2>
          <button onClick={onClose} aria-label="Close form" style={{ color: "var(--nc-text-3)" }} className="hover:nc-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1.5">
          {(["measured", "earwitness"] as const).map((mode) => (
            <button
              key={mode} type="button" onClick={() => setPinMode(mode)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={pinMode === mode
                ? { background: "var(--nc-text)", color: "var(--nc-bg)" }
                : { background: "transparent", border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }
              }
            >
              {mode === "measured" ? <Mic className="w-3 h-3" /> : <Ear className="w-3 h-3" />}
              {mode === "measured" ? "Measured" : "Earwitness"}
            </button>
          ))}
        </div>

        {/* Relativity notice (measured only) */}
        {pinMode === "measured" && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          {t.pin_relative_warning}
        </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              {t.pin_location_label}
            </label>
            <div className="flex items-center gap-2">
              {/* Lat / Lng with clear labels */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[11px] font-mono truncate" style={{ color: "var(--nc-text-2)" }}>
                  <span className="font-semibold" style={{ color: "var(--nc-text-3)" }}>Lat</span>{" "}
                  {gpsLoading ? "…" : lat.toFixed(5)}°
                </span>
                <span className="text-[11px] font-mono truncate" style={{ color: "var(--nc-text-2)" }}>
                  <span className="font-semibold" style={{ color: "var(--nc-text-3)" }}>Lng</span>{" "}
                  {gpsLoading ? "…" : lng.toFixed(5)}°
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleGPS(false)}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                style={{
                  border: "1px solid var(--nc-border-mid)",
                  color: gpsLoading ? "var(--nc-text-3)" : "var(--nc-text-2)",
                  background: gpsLoading ? "var(--nc-bg-raised)" : "transparent",
                }}
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {gpsLoading ? t.pin_locating : t.pin_use_gps}
              </button>
            </div>
            {gpsError && <p className="text-red-500 text-xs">{gpsError}</p>}
            {(() => {
              const { bearing } = getLastOrientation();
              return bearing !== null ? (
                <p className="text-[10px] font-mono" style={{ color: "var(--nc-text-3)" }}>
                  Bearing {bearing}° {bearingToLabel(bearing)} — {t.pin_bearing_captured}
                </p>
              ) : null;
            })()}
          </div>

          {/* Earwitness fields */}
          {pinMode === "earwitness" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                  Sound qualities
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["harsh","low-frequency","high-pitched","rhythmic","continuous","intermittent","startling","intrusive","mechanical","natural"].map((q) => (
                    <button
                      key={q} type="button"
                      onClick={() => setQualities(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q])}
                      className="px-2 py-0.5 rounded text-[11px] transition-colors"
                      style={qualities.includes(q)
                        ? { background: "var(--nc-text)", color: "var(--nc-bg)" }
                        : { border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }
                      }
                    >{q}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                  Duration estimate
                </label>
                <input
                  type="text" value={durationEstimate}
                  onChange={e => setDurationEstimate(e.target.value)}
                  placeholder="e.g. ~20 min, all night, sporadic"
                  className="nc-input rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          {/* dB slider (measured mode only) */}
          {pinMode === "measured" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                {t.pin_db_label}
              </label>
              <span className="font-bold text-lg" style={{ color: threshold.color }}>{db} dB</span>
            </div>
            <input
              type="range" min={20} max={130} value={db}
              onChange={(e) => setDb(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: threshold.color }}
            />
            <div className="flex justify-between text-xs" style={{ color: "var(--nc-text-3)" }}>
              <span>20 dB</span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ background: threshold.color + "22", color: threshold.color }}
              >
                {threshold.label}
              </span>
              <span>130 dB</span>
            </div>
          </div>
          )}

          {/* Source type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              {t.pin_source_label}
            </label>
            <SourcePicker
              value={category}
              subValue={sourceSub}
              onChange={(cat, sub) => { setCategory(cat); setSourceSub(sub); }}
            />
          </div>

          {/* Status (temporal lifecycle) — shown for time-sensitive categories */}
          {showStatus && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                {t.pin_status_label}
              </label>
              <div className="flex gap-2">
                {(["predicted", "active", "historical"] as PinStatus[]).map((s) => {
                  const meta = { predicted: { label: t.pin_status_predicted, color: "#a78bfa" }, active: { label: t.pin_status_active, color: "#34d399" }, historical: { label: t.pin_status_historical, color: "#9ca3af" } }[s];
                  return (
                    <button
                      key={s} type="button" onClick={() => setStatus(s)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={
                        status === s
                          ? { background: meta.color + "33", color: meta.color, border: `1px solid ${meta.color}` }
                          : { background: "transparent", color: "var(--nc-text-3)", border: "1px solid var(--nc-border-mid)" }
                      }
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time of day — precise to the second */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              {t.pin_time_label}
            </label>
            <input
              type="time"
              step="1"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="nc-input rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>

          {/* Recurring */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setRecurring(!recurring)}
                className="w-9 h-5 rounded-full transition-colors relative"
                style={{ background: recurring ? "var(--nc-text)" : "var(--nc-border-mid)" }}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${recurring ? "translate-x-4" : "translate-x-0.5"}`}
                  style={{ background: "var(--nc-bg)" }}
                />
              </div>
              <span className="text-sm" style={{ color: "var(--nc-text-2)" }}>{t.pin_recurring_label}</span>
            </label>
            {recurring && (
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map(({ value, label }) => (
                  <button
                    key={value} type="button" onClick={() => toggleDay(value)}
                    className="px-2.5 py-1 rounded-lg text-xs transition-colors"
                    style={
                      days.includes(value)
                        ? { background: "var(--nc-text)", color: "var(--nc-bg)", border: "1px solid var(--nc-text)" }
                        : { background: "transparent", color: "var(--nc-text-2)", border: "1px solid var(--nc-border-mid)" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              {t.pin_desc_label}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Truck idling outside window every night"
              rows={2} maxLength={200}
              className="nc-input rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Photo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
              {t.pin_photo_label}
            </label>
            <input
              ref={photoInputRef} type="file" accept="image/*" capture="environment"
              onChange={handlePhoto} className="hidden"
            />
            {photoDataUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoDataUrl} alt="Pin photo" className="w-full h-28 object-cover rounded-lg" style={{ border: "1px solid var(--nc-border)" }} />
                <button
                  type="button" onClick={() => setPhotoDataUrl(undefined)}
                  className="absolute top-1.5 right-1.5 bg-black/70 rounded-full p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button" onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
              >
                <Camera className="w-4 h-4" />
                {t.pin_add_photo}
              </button>
            )}
            <p className="text-xs" style={{ color: "var(--nc-text-3)" }}>{t.pin_photo_hint}</p>
          </div>

          {/* Anonymity */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setAnonymous(!anonymous)}
                className="w-9 h-5 rounded-full transition-colors relative"
                style={{ background: anonymous ? "var(--nc-text)" : "var(--nc-border-mid)" }}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${anonymous ? "translate-x-4" : "translate-x-0.5"}`}
                  style={{ background: "var(--nc-bg)" }}
                />
              </div>
              <span className="text-sm" style={{ color: "var(--nc-text-2)" }}>{t.pin_anon_label}</span>
            </label>
            {!anonymous && (
              <input
                type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                placeholder={t.pin_name_placeholder}
                className="nc-input rounded-lg px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* Notebook */}
          {carnets.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                Notebook
              </label>
              <select
                value={selectedCarnetId}
                onChange={(e) => setSelectedCarnetId(e.target.value)}
                className="nc-input rounded-lg px-3 py-2 text-sm"
              >
                <option value="">— None —</option>
                {carnets.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Share P2P */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-xs" style={{ color: "var(--nc-text-2)" }}>
                {t.p2p_share_toggle}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={sharePublicly}
                onClick={() => setSharePublicly((v) => !v)}
                className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                style={{ background: sharePublicly ? "var(--nc-text)" : "var(--nc-border-mid)" }}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform bg-white`}
                  style={{ left: "2px", transform: sharePublicly ? "translateX(16px)" : "none" }}
                />
              </button>
            </label>
            {sharePublicly && isSensitive && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmSensitive}
                  onChange={(e) => setConfirmSensitive(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-[11px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                  {t.p2p_sensitive_confirm}
                </span>
              </label>
            )}
            {sharePublicly && (
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
                No account. No server. Your pin propagates directly to other peers. Photo and notebook ID are never shared.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={sharePublicly && isSensitive && !confirmSensitive}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40"
            style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
          >
            {t.pin_drop_btn}
          </button>
        </form>
      </div>
    </div>
  );
}
