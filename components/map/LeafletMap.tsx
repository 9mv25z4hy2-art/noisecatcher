"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Plus, Minus, LocateFixed, MapPinPlus } from "lucide-react";
import type { NoisePin, NoiseCategory, PinStatus } from "@/lib/pins";
import { loadPins, deletePin, pinColor, getCategoryMeta, TIME_OF_DAY_LABELS } from "@/lib/pins";
import { getThreshold } from "@/lib/thresholds";
import { useI18n } from "@/lib/i18n/context";
import { buildNoisePlanetRasterSource } from "@/lib/noisePlanet";

// MapLibre GL JS — WebGL-accelerated, no lag, vector tiles.
// Imported dynamically so the ~1 MB bundle doesn't block the initial page load.
// CSS is imported at module level so Next.js can bundle/preload it properly.
import "maplibre-gl/dist/maplibre-gl.css";

// OpenFreeMap Liberty — free, no API key, vector tiles with full language support.
// Labels can be switched per-locale via MapLibre setLayoutProperty.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Build a locale-aware text-field expression for OSM vector tile name properties.
// Prefer the user's language (name:xx), fall back to local name, then English.
function localeTextField(locale: string) {
  if (locale === "en") return ["coalesce", ["get", "name:en"], ["get", "name"]];
  return ["coalesce", ["get", `name:${locale}`], ["get", "name"], ["get", "name:en"]];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyLocaleToStyle(map: any, locale: string) {
  const style = map.getStyle();
  if (!style?.layers) return;
  const textField = localeTextField(locale);
  for (const layer of style.layers) {
    if (layer.type !== "symbol") continue;
    try {
      const current = map.getLayoutProperty(layer.id, "text-field");
      if (current !== undefined && current !== "") {
        map.setLayoutProperty(layer.id, "text-field", textField);
      }
    } catch {
      // non-text layer — skip silently
    }
  }
}

interface Props {
  filterCategory: NoiseCategory | "all";
  filterDb: number;
  onAddPin: (lat: number, lng: number) => void;
  onPinDeleted: () => void;
  refreshKey: number;
  densityMode: boolean;
  showNoisePlanet: boolean;
  communityPins: import("@/lib/sync").SharedPin[];
}

// We store the resolved maplibre-gl module so the pins effect can create
// Marker/Popup instances without re-importing on every render.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ML = any;

export default function NoiseMap({ filterCategory, filterDb, onAddPin, onPinDeleted, refreshKey, densityMode, showNoisePlanet, communityPins }: Props) {
  const { t, locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const mlRef = useRef<ML>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const pinLayerCleanupRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  /* ── Map initialisation ──────────────────────────────── */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let cancelled = false;

    (async () => {
      // Use the CSP variant so Turbopack doesn't bundle the embedded blob worker.
      // The CSP build omits the worker; we serve it ourselves from /public/.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mlModule = await import("maplibre-gl/dist/maplibre-gl-csp.js" as any);
      const ml = mlModule.default ?? mlModule;
      if (cancelled) return;
      // Point to our pre-copied CSP worker (maplibre-gl-csp-worker.js → public/).
      // Must use setWorkerUrl() — the property-based workerUrl setter is not the API.
      ml.setWorkerUrl("/maplibre-worker.js");
      mlRef.current = ml;

      const map = new ml.Map({
        container: containerRef.current!,
        style: MAP_STYLE_URL,
        center: [0, 20],
        zoom: 2,
        attributionControl: false,
      });

      map.on("load", () => {
        if (cancelled) return;

        // Remove attribution/logo controls on idle — "load" fires before logo is injected.
        map.once("idle", () => {
          map.getContainer().querySelectorAll(
            ".maplibregl-ctrl-attrib, .maplibregl-ctrl-logo, .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-bottom-left"
          ).forEach((el: Element) => el.remove());
        });

        // Add Noise-Planet WMS raster layer, hidden by default.
        // Visibility is controlled by the showNoisePlanet prop via a separate effect.
        map.addSource("noise-planet", buildNoisePlanetRasterSource());
        map.addLayer({
          id: "noise-planet",
          type: "raster",
          source: "noise-planet",
          layout: { visibility: "none" },
          paint: { "raster-opacity": 0.6 },
        });

        // Apply locale-aware text labels on initial load
        applyLocaleToStyle(map, locale);

        mapRef.current = map;
        setReady(true);

        // Try GPS first; fall back to fitting existing pins.
        let gpsResolved = false;

        const showPinsFallback = () => {
          loadPins().then((existing) => {
            if (existing.length > 0) {
              const lats = existing.map((p) => p.lat);
              const lngs = existing.map((p) => p.lng);
              map.fitBounds(
                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                { padding: 40, maxZoom: 15, duration: 800 }
              );
            }
          });
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              gpsResolved = true;
              map.flyTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 14,
                duration: 1500,
              });
            },
            () => { gpsResolved = true; showPinsFallback(); },
            { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
          );
          setTimeout(() => { if (!gpsResolved) showPinsFallback(); }, 4000);
        } else {
          showPinsFallback();
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => {
        const hit = map.queryRenderedFeatures(e.point, { layers: ["nc-cluster-circle", "nc-point"] });
        if (hit.length > 0) return;
        onAddPin(e.lngLat.lat, e.lngLat.lng);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Render pins ─────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;

    // Run previous layer-event cleanup
    if (pinLayerCleanupRef.current) { pinLayerCleanupRef.current(); pinLayerCleanupRef.current = null; }

    // Clear DOM markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear all pin layers + sources (order matters: layers before sources)
    for (const id of ["nc-cluster-count", "nc-cluster-circle", "nc-point", "nc-density"]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    for (const id of ["nc-pins", "nc-density"]) {
      if (map.getSource(id)) map.removeSource(id);
    }

    loadPins().then((all) => {
      const pins = all.filter((pin) => {
        const catOk = filterCategory === "all" || pin.category === filterCategory;
        const dbOk = pin.pinType === "earwitness" || pin.db >= filterDb;
        return catOk && dbOk;
      });

      if (densityMode) {
        /* Density heatmap — semi-transparent WebGL circles, no clustering */
        map.addSource("nc-density", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: pins.map((pin) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
              properties: { color: pinColor(pin.db) },
            })),
          },
        });
        map.addLayer({
          id: "nc-density",
          type: "circle",
          source: "nc-density",
          paint: {
            "circle-radius": 38,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.14,
            "circle-stroke-width": 0,
          },
        });
      } else {
        /* Cluster mode — GeoJSON source with MapLibre built-in clustering */
        const pinsById = new Map(pins.map((p) => [p.id, p]));

        map.addSource("nc-pins", {
          type: "geojson",
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
          data: {
            type: "FeatureCollection",
            features: pins.map((pin) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
              // Encode only lightweight fields — full pin looked up via pinsById on click
              properties: { id: pin.id, db: pin.db, color: pinColor(pin.db) },
            })),
          },
        });

        // Cluster bubble
        map.addLayer({
          id: "nc-cluster-circle",
          type: "circle",
          source: "nc-pins",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step", ["get", "point_count"],
              "#ffffff", 10,
              "#e5e5e5", 30,
              "#a3a3a3",
            ],
            "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 30],
            "circle-opacity": 0.18,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 0.35,
          },
        });

        // Cluster count label
        map.addLayer({
          id: "nc-cluster-count",
          type: "symbol",
          source: "nc-pins",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 11,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          },
          paint: { "text-color": "#ffffff" },
        });

        // Individual unclustered pin
        map.addLayer({
          id: "nc-point",
          type: "circle",
          source: "nc-pins",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 10,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.9,
            "circle-stroke-width": 2,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-opacity": 0.4,
          },
        });

        // Cluster click → zoom to expand
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onClusterClick = async (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ["nc-cluster-circle"] });
          if (!features.length) return;
          const clusterId = features[0].properties.cluster_id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const source = map.getSource("nc-pins") as any;
          try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number], zoom });
          } catch { /* source removed */ }
        };

        // Individual pin click → popup
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onPointClick = (e: any) => {
          const feat = e.features?.[0];
          if (!feat) return;
          const pin = pinsById.get(feat.properties.id);
          if (!pin) return;

          const color = pinColor(pin.db);
          const threshold = getThreshold(pin.db);
          const cat = getCategoryMeta(pin.category);
          const popupHtml = buildPopupHtml(pin, cat, threshold, color, {
            removePin: t.pin_remove,
            recurring: t.pin_recurring_str,
            singleObs: t.pin_single_obs,
            anonymous: t.pin_anonymous_label,
          });

          const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
          const popup = new ml.Popup({ maxWidth: "280px", offset: 14 })
            .setLngLat(coords)
            .setHTML(popupHtml)
            .addTo(map);

          popup.on("open", () => {
            const deleteBtn = document.getElementById(`delete-pin-${pin.id}`);
            if (deleteBtn) {
              deleteBtn.addEventListener("click", () => {
                deletePin(pin.id).then(() => onPinDeleted()).catch(() => {});
                popup.remove();
              }, { once: true });
            }
            const shareBtn = document.getElementById(`share-pin-${pin.id}`);
            if (shareBtn) {
              shareBtn.addEventListener("click", () => {
                const timeLabel = TIME_OF_DAY_LABELS[pin.timeOfDay] ?? pin.timeOfDay ?? "";
                const text = [
                  `📍 ${cat.emoji} ${cat.label} — ${pin.db} dB(A)`,
                  pin.description ? pin.description : null,
                  `🕐 ${timeLabel}`,
                  `🌐 ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`,
                  "Documented with Noisecatcher",
                ].filter(Boolean).join("\n");
                if (navigator.share) {
                  navigator.share({ title: "Noisecatcher", text }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(text).catch(() => {});
                }
              }, { once: true });
            }
          });
        };

        const onClusterEnter = () => { map.getCanvas().style.cursor = "pointer"; };
        const onClusterLeave = () => { map.getCanvas().style.cursor = ""; };
        const onPointEnter  = () => { map.getCanvas().style.cursor = "pointer"; };
        const onPointLeave  = () => { map.getCanvas().style.cursor = ""; };

        map.on("click",      "nc-cluster-circle", onClusterClick);
        map.on("mouseenter", "nc-cluster-circle", onClusterEnter);
        map.on("mouseleave", "nc-cluster-circle", onClusterLeave);
        map.on("click",      "nc-point",          onPointClick);
        map.on("mouseenter", "nc-point",          onPointEnter);
        map.on("mouseleave", "nc-point",          onPointLeave);

        pinLayerCleanupRef.current = () => {
          map.off("click",      "nc-cluster-circle", onClusterClick);
          map.off("mouseenter", "nc-cluster-circle", onClusterEnter);
          map.off("mouseleave", "nc-cluster-circle", onClusterLeave);
          map.off("click",      "nc-point",          onPointClick);
          map.off("mouseenter", "nc-point",          onPointEnter);
          map.off("mouseleave", "nc-point",          onPointLeave);
        };
      }
    });
  }, [ready, refreshKey, filterCategory, filterDb, densityMode, t, onPinDeleted]);

  /* ── Community P2P pins layer ───────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !ready) return;

    if (map.getLayer("nc-community")) map.removeLayer("nc-community");
    if (map.getSource("nc-community")) map.removeSource("nc-community");

    if (communityPins.length === 0) return;

    // Store enough data in properties for the popup — no full pin object in GeoJSON
    map.addSource("nc-community", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: communityPins.map((pin) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
          properties: {
            id: pin.id,
            db: pin.db,
            category: pin.category,
            sourceSub: pin.sourceSub ?? "",
            description: pin.description ?? "",
            timeOfDay: pin.timeOfDay ?? "",
            createdAt: pin.createdAt ?? "",
            pinType: pin.pinType ?? "measured",
          },
        })),
      },
    });

    map.addLayer({
      id: "nc-community",
      type: "circle",
      source: "nc-community",
      paint: {
        "circle-radius": 7,
        "circle-color": "rgba(52, 211, 153, 0.15)",
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "rgba(52, 211, 153, 0.75)",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onCommunityClick = (e: any) => {
      const feat = e.features?.[0];
      if (!feat) return;
      const p = feat.properties;
      const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
      const dbLabel = p.pinType === "earwitness" ? "Earwitness" : `${p.db} dB(A)`;
      const html = `
        <div style="font-family:monospace;font-size:11px;line-height:1.6;max-width:220px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="color:rgb(52,211,153);font-size:10px;letter-spacing:.08em;text-transform:uppercase">P2P Community Pin</span>
          </div>
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${dbLabel}</div>
          <div style="opacity:.6;font-size:10px;margin-bottom:4px">${p.category}${p.sourceSub ? " · " + p.sourceSub : ""}</div>
          ${p.description ? `<div style="opacity:.8;margin-bottom:4px">${p.description}</div>` : ""}
          ${date ? `<div style="opacity:.4;font-size:10px">${date}</div>` : ""}
        </div>`;
      new ml.Popup({ maxWidth: "260px", offset: 10 })
        .setLngLat((feat.geometry as GeoJSON.Point).coordinates as [number, number])
        .setHTML(html)
        .addTo(map);
    };
    const onEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const onLeave = () => { map.getCanvas().style.cursor = ""; };

    map.on("click",      "nc-community", onCommunityClick);
    map.on("mouseenter", "nc-community", onEnter);
    map.on("mouseleave", "nc-community", onLeave);

    return () => {
      map.off("click",      "nc-community", onCommunityClick);
      map.off("mouseenter", "nc-community", onEnter);
      map.off("mouseleave", "nc-community", onLeave);
    };
  }, [ready, communityPins]);

  /* ── Noise-Planet overlay toggle ────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (map.getLayer("noise-planet")) {
      map.setLayoutProperty("noise-planet", "visibility", showNoisePlanet ? "visible" : "none");
    }
  }, [ready, showNoisePlanet]);

  /* ── Locale change: update text-field expressions ───── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    // Wait for any ongoing style transition before applying
    if (map.isStyleLoaded()) {
      applyLocaleToStyle(map, locale);
    } else {
      map.once("styledata", () => applyLocaleToStyle(map, locale));
    }
  }, [locale, ready]);

  /* ── Locate me ───────────────────────────────────────── */
  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map || typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          duration: 1200,
        }),
      () => {},
      { timeout: 8000, maximumAge: 30000, enableHighAccuracy: false }
    );
  }, []);

  const gpsPin = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onAddPin(pos.coords.latitude, pos.coords.longitude);
        mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 16, duration: 800 });
      },
      () => {},
      { timeout: 8000, maximumAge: 10000, enableHighAccuracy: true }
    );
  }, [onAddPin]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        role="application"
        aria-label="Interactive noise map — click to drop a pin"
      />

      {/* Navigation controls — zoom + locate (right side, always visible) */}
      {ready && (
        <>
          {/* FAB — primary action: drop pin at GPS location */}
          <button
            onClick={gpsPin}
            aria-label={t.map_gps_me}
            className="fixed right-4 z-[1000] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
            style={{ bottom: "calc(52px + env(safe-area-inset-bottom) + 12px)", background: "var(--nc-text)", color: "var(--nc-bg)" }}
          >
            <MapPinPlus className="w-6 h-6" strokeWidth={1.75} />
          </button>

          {/* Zoom + locate cluster — above FAB */}
          <div
            className="fixed right-4 z-[1000] flex flex-col rounded-2xl overflow-hidden shadow-lg"
            style={{
              bottom: "calc(52px + env(safe-area-inset-bottom) + 12px + 56px + 8px)",
              background: "var(--nc-bg-panel)",
              border: "1px solid var(--nc-border-mid)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              onClick={() => mapRef.current?.zoomIn()}
              aria-label={t.map_zoom_in}
              className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50"
              style={{ color: "var(--nc-text-2)" }}
              onPointerEnter={(e) => (e.currentTarget.style.color = "var(--nc-text)")}
              onPointerLeave={(e) => (e.currentTarget.style.color = "var(--nc-text-2)")}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
            <div style={{ height: "1px", background: "var(--nc-border)" }} />
            <button
              onClick={() => mapRef.current?.zoomOut()}
              aria-label={t.map_zoom_out}
              className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50"
              style={{ color: "var(--nc-text-2)" }}
              onPointerEnter={(e) => (e.currentTarget.style.color = "var(--nc-text)")}
              onPointerLeave={(e) => (e.currentTarget.style.color = "var(--nc-text-2)")}
            >
              <Minus className="w-4 h-4" strokeWidth={2} />
            </button>
            <div style={{ height: "1px", background: "var(--nc-border)" }} />
            <button
              onClick={locateMe}
              aria-label={t.map_locate_me}
              className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50"
              style={{ color: "var(--nc-text-2)" }}
              onPointerEnter={(e) => (e.currentTarget.style.color = "var(--nc-text)")}
              onPointerLeave={(e) => (e.currentTarget.style.color = "var(--nc-text-2)")}
            >
              <LocateFixed className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Popup HTML ──────────────────────────────────────────── */
const STATUS_META: Record<PinStatus, { label: string; color: string }> = {
  predicted: { label: "Predicted", color: "#a78bfa" },
  active:    { label: "Active",    color: "#34d399" },
  historical: { label: "Historical", color: "#9ca3af" },
};

function buildPopupHtml(
  pin: NoisePin,
  cat: ReturnType<typeof getCategoryMeta>,
  threshold: ReturnType<typeof getThreshold>,
  color: string,
  strings: { removePin: string; recurring: string; singleObs: string; anonymous: string }
) {
  // New pins store "HH:MM:SS"; legacy pins store "morning" / "afternoon" etc.
  const timeLabel = TIME_OF_DAY_LABELS[pin.timeOfDay] ?? pin.timeOfDay ?? "";
  const bearingStr =
    pin.bearing !== undefined
      ? `${pin.bearing}° ${["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][Math.round(pin.bearing / 45)]}`
      : null;
  const recurringStr = pin.recurring
    ? `${strings.recurring}${pin.days && pin.days.length > 0 ? ": " + pin.days.map((d) => d[0].toUpperCase() + d.slice(1)).join(", ") : ""}`
    : strings.singleObs;
  const photoHtml = pin.photoDataUrl
    ? `<img src="${pin.photoDataUrl}" alt="Photo" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;"/>`
    : "";

  const statusMeta = STATUS_META[pin.status ?? "active"];
  const statusBadge = `<span style="background:${statusMeta.color}22;border:1px solid ${statusMeta.color};color:${statusMeta.color};border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;margin-left:4px;">${statusMeta.label}</span>`;

  return `
    <div style="font-family:system-ui,sans-serif;min-width:220px;background:#111;color:#e5e5e5;border-radius:8px;padding:12px;font-size:13px;">
      ${photoHtml}
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:18px;">${cat.emoji}</span>
        <div>
          <div style="font-weight:600;color:#fff;">${cat.label}${statusBadge}</div>
          <div style="color:${color};font-weight:700;font-size:16px;">${pin.db} dB(A)</div>
        </div>
        <div style="margin-left:auto;background:${color}22;border:1px solid ${color};color:${color};border-radius:4px;padding:2px 6px;font-size:11px;font-weight:600;">${threshold.label}</div>
      </div>
      ${pin.description ? `<p style="margin:0 0 6px;color:#aaa;font-size:12px;line-height:1.4;">${escapeHtml(pin.description)}</p>` : ""}
      <div style="color:#555;font-size:11px;margin-bottom:6px;">
        🕐 ${escapeHtml(timeLabel)} &nbsp;·&nbsp; ${escapeHtml(recurringStr)}${bearingStr ? ` &nbsp;·&nbsp; ↗ ${escapeHtml(bearingStr)}` : ""}${pin.measuredLevel ? " &nbsp;·&nbsp; ● LEVEL" : ""}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;color:#555;font-size:11px;">
        <span>${pin.anonymous ? strings.anonymous : escapeHtml(pin.author || strings.anonymous)}</span>
        <span>${new Date(pin.createdAt).toLocaleDateString()}</span>
      </div>
      ${pin.carnetId ? `<a href="/carnets/${pin.carnetId}" target="_blank" rel="noopener noreferrer" style="display:block;margin-bottom:6px;color:#8b8;font-size:11px;text-decoration:none;">📓 Open notebook →</a>` : ""}
      <div style="display:flex;gap:6px;margin-top:8px;">
        <button id="share-pin-${pin.id}" style="flex:1;background:#1a1a1a;border:1px solid #333;color:#888;border-radius:4px;padding:4px 8px;font-size:11px;cursor:pointer;">
          ↗ Share
        </button>
        <button id="delete-pin-${pin.id}" style="flex:1;background:#1a1a1a;border:1px solid #333;color:#666;border-radius:4px;padding:4px 8px;font-size:11px;cursor:pointer;">
          ${escapeHtml(strings.removePin)}
        </button>
      </div>
    </div>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
