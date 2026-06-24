"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { SharedPin } from "@/lib/sync";
import { useI18n } from "@/lib/i18n/context";

const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyLocaleToStyle(map: any, locale: string) {
  const style = map.getStyle();
  if (!style?.layers) return;
  const textField = locale === "en"
    ? ["coalesce", ["get", "name:en"], ["get", "name"]]
    : ["coalesce", ["get", `name:${locale}`], ["get", "name"], ["get", "name:en"]];
  for (const layer of style.layers) {
    if (layer.type !== "symbol") continue;
    try {
      const current = map.getLayoutProperty(layer.id, "text-field");
      if (current !== undefined && current !== "") {
        map.setLayoutProperty(layer.id, "text-field", textField);
      }
    } catch { /* non-text layer */ }
  }
}

type MapLike = {
  isStyleLoaded: () => boolean;
  getStyle: () => { layers?: unknown[] } | null;
  getLayoutProperty: (id: string, prop: string) => unknown;
  setLayoutProperty: (id: string, prop: string, val: unknown) => void;
  getSource: (id: string) => unknown;
  addSource: (id: string, src: unknown) => void;
  addLayer: (layer: unknown) => void;
  addControl: (c: unknown, pos: string) => void;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
  once: (event: string, cb: () => void) => void;
  remove: () => void;
};

interface Props {
  communityPins: SharedPin[];
}

export default function LandingMap({ communityPins }: Props) {
  const { locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLike | null>(null);
  const pinsRef = useRef<SharedPin[]>(communityPins);

  useLayoutEffect(() => { pinsRef.current = communityPins; });

  function applyPins(map: MapLike, pins: SharedPin[]) {
    const geojson = {
      type: "FeatureCollection" as const,
      features: pins.map((p) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
        properties: { db: p.db, category: p.category },
      })),
    };
    const src = map.getSource("landing-pins") as { setData?: (d: unknown) => void } | undefined;
    if (src?.setData) {
      src.setData(geojson);
    } else {
      map.addSource("landing-pins", { type: "geojson", data: geojson });
      map.addLayer({
        id: "landing-pins-circle",
        type: "circle",
        source: "landing-pins",
        paint: {
          "circle-radius": 6,
          "circle-color": "rgba(52,211,153,0.8)",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(52,211,153,1)",
        },
      });
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;
    let map: MapLike | null = null;
    let cancelled = false;

    // Defer MapLibre load until after the browser is idle — it's decorative
    // on the landing page and its 1MB parse cost caused 2.5s TBT otherwise.
    const idle = typeof requestIdleCallback !== "undefined"
      ? (cb: () => void) => requestIdleCallback(cb, { timeout: 3000 })
      : (cb: () => void) => setTimeout(cb, 200);

    idle(async () => {
      if (cancelled) return;
      const ml = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");
      ml.setWorkerUrl("/maplibre-worker.js");

      map = new ml.Map({
        container: containerRef.current!,
        style: MAP_STYLE_URL,
        center: [12, 30],
        zoom: 1.4,
        attributionControl: { compact: true },
        interactive: true,
        pitchWithRotate: false,
      }) as unknown as MapLike;

      mapRef.current = map;

      map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");

      const onLoad = () => {
        applyLocaleToStyle(map!, locale);
        if (mapRef.current && pinsRef.current.length > 0) {
          applyPins(mapRef.current, pinsRef.current);
        }
      };
      map.on("load", onLoad);
    });

    return () => {
      cancelled = true;
      if (map) map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pins when communityPins changes — only if map style is already loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyPins(map, communityPins);
  }, [communityPins]);

  // Apply locale when it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) {
      applyLocaleToStyle(map, locale);
    } else {
      map.once("styledata", () => applyLocaleToStyle(map, locale));
    }
  }, [locale]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#0a0a0a" }} />
  );
}
