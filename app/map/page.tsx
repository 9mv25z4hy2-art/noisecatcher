"use client";

import ErrorBoundary from "@/components/ui/ErrorBoundary";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Clock, HeartPulse, FileText, BarChart2, TrendingUp, Download, X, Plus, Minus, LocateFixed, MapPinPlus } from "lucide-react";
import type { NoiseCategory, NoisePin } from "@/lib/pins";
import type { MapControls } from "@/components/map/LeafletMap";
import { useI18n } from "@/lib/i18n/context";
import { loadPins, exportGeoJSON, exportTransect } from "@/lib/pins";
import { loadReports, type NoiseReport } from "@/lib/db";
import { subscribeToArea, type SharedPin } from "@/lib/sync";
import LeqChart from "@/components/ui/LeqChart";
import FilterBar from "@/components/map/FilterBar";
import PinForm from "@/components/map/PinForm";
import TimelinePanel from "@/components/map/TimelinePanel";
import WHODashboard from "@/components/map/WHODashboard";
import ComplaintLetter from "@/components/map/ComplaintLetter";
import EnforcementPanel from "@/components/map/EnforcementPanel";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export default function MapPage() {
  const [filterCategory, setFilterCategory] = useState<NoiseCategory | "all">("all");
  const [filterDb, setFilterDb] = useState(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [filteredPins, setFilteredPins] = useState<NoisePin[]>([]);
  const [densityMode, setDensityMode] = useState(false);
  const [showNoisePlanet, setShowNoisePlanet] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showWHO, setShowWHO] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [showEnforcement, setShowEnforcement] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [allReports, setAllReports] = useState<NoiseReport[]>([]);
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityPins, setCommunityPins] = useState<SharedPin[]>([]);
  const [communityCategory, setCommunityCategory] = useState<NoiseCategory | "all">("all");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [mapControls, setMapControls] = useState<MapControls | null>(null);

  const { t } = useI18n();
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    loadReports().then(setAllReports);
  }, []);

  useEffect(() => {
    loadPins().then((all) => {
      setFilteredPins(all.filter((p) => {
        const catOk = filterCategory === "all" || p.category === filterCategory;
        // Earwitness pins have no measured dB — bypass the dB threshold filter
        const dbOk = p.pinType === "earwitness" || p.db >= filterDb;
        return catOk && dbOk;
      }));
    });
  }, [filterCategory, filterDb, refreshKey]);

  const pinCount = filteredPins.length;
  const hasGpsReports = allReports.some((r) => r.lat != null && r.lng != null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!showCommunity) { setCommunityPins([]); return; }
    // Subscribe globally — Gun has no spatial index so we filter client-side.
    // bbox covers the whole world; the map component renders what's in view.
    const unsub = subscribeToArea(
      { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 },
      (pin) => setCommunityPins((prev) => {
        if (prev.some((p) => p.id === pin.id)) return prev;
        return [...prev, pin];
      })
    );
    return unsub;
  }, [showCommunity]);

  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    setExportError(null);
    try {
      await exportGeoJSON(filteredPins);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    }
  }

  async function handleTransectExport() {
    setExportError(null);
    try {
      await exportTransect(filteredPins);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    }
  }

  return (
    <ErrorBoundary>
    <div className="relative flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 120px)", ["--nav-safe" as string]: "calc(52px + env(safe-area-inset-bottom))" }}>

      <FilterBar
        category={filterCategory}
        minDb={filterDb}
        pinCount={pinCount}
        densityMode={densityMode}
        showNoisePlanet={showNoisePlanet}
        showCommunity={showCommunity}
        communityCount={communityPins.length}
        communityCategory={communityCategory}
        onCategory={setFilterCategory}
        onMinDb={setFilterDb}
        onDensityToggle={() => setDensityMode((d) => !d)}
        onNoisePlanetToggle={() => setShowNoisePlanet((v) => !v)}
        onCommunityToggle={() => setShowCommunity((v) => !v)}
        onCommunityCategory={setCommunityCategory}
      />

      <div style={{ height: "calc(100dvh - 180px)", minHeight: 400 }}>
        <LeafletMap
          filterCategory={filterCategory}
          filterDb={filterDb}
          onAddPin={(lat, lng) => setPendingPin({ lat, lng })}
          onPinDeleted={refresh}
          refreshKey={refreshKey}
          densityMode={densityMode}
          showNoisePlanet={showNoisePlanet}
          communityPins={communityCategory === "all" ? communityPins : communityPins.filter((p) => p.category === communityCategory)}
          onMapControls={setMapControls}
        />
      </div>

      {/* ── Left cluster: analysis + export (contextual, bottom-left) ── */}
      {(pinCount > 0 || hasGpsReports) && (
        <div className="fixed left-4 z-[1000] flex flex-col gap-2 items-start" style={{ bottom: 100 }}>

          {/* Export icon button + overflow submenu */}
          {pinCount > 0 && (
            <div className="relative">
              {showExportMenu && (
                <div
                  className="absolute bottom-12 left-0 flex flex-col overflow-hidden rounded-2xl shadow-xl mb-1"
                  style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)", minWidth: 140 }}
                >
                  <button
                    onClick={() => { handleExport(); setShowExportMenu(false); }}
                    className="flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/5"
                    style={{ fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.06em", color: "var(--nc-text-2)" }}
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    GeoJSON
                  </button>
                  {pinCount >= 2 && (
                    <>
                      <div style={{ height: "1px", background: "var(--nc-border)" }} />
                      <button
                        onClick={() => { handleTransectExport(); setShowExportMenu(false); }}
                        className="flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/5"
                        style={{ fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.06em", color: "var(--nc-text-2)" }}
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        Transect
                      </button>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                aria-label="Export pins"
                className="w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg transition-colors"
                style={{
                  background: showExportMenu ? "var(--nc-text)" : "var(--nc-bg-panel)",
                  color: showExportMenu ? "var(--nc-bg)" : "var(--nc-text-2)",
                  border: "1px solid var(--nc-border-mid)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Analysis icon button + expandable panel */}
          <div className="relative">
            {showAnalysis && (
              <div
                className="absolute bottom-12 left-0 flex flex-col overflow-hidden rounded-2xl shadow-xl mb-1"
                style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}
              >
                {pinCount > 0 && (
                  <>
                    <button
                      onClick={() => { setShowTrend((v) => !v); setShowEnforcement(false); setShowWHO(false); setShowTimeline(false); setShowAnalysis(false); }}
                      className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5"
                      aria-label="Leq trend"
                      style={{ color: showTrend ? "rgb(52,211,153)" : "var(--nc-text-2)" }}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <div style={{ height: "1px", background: "var(--nc-border)" }} />
                    <button
                      onClick={() => { setShowEnforcement((v) => !v); setShowWHO(false); setShowTimeline(false); setShowAnalysis(false); }}
                      className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5"
                      aria-label="Enforcement pattern"
                      style={{ color: showEnforcement ? "rgb(52,211,153)" : "var(--nc-text-2)" }}
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                    <div style={{ height: "1px", background: "var(--nc-border)" }} />
                  </>
                )}
                <button
                  onClick={() => { setShowComplaint(true); setShowAnalysis(false); }}
                  className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5"
                  aria-label="Complaint letter"
                  style={{ color: "var(--nc-text-2)" }}
                >
                  <FileText className="w-4 h-4" />
                </button>
                <div style={{ height: "1px", background: "var(--nc-border)" }} />
                <button
                  onClick={() => { setShowWHO((v) => !v); setShowTimeline(false); setShowAnalysis(false); }}
                  className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5"
                  aria-label="WHO health dashboard"
                  style={{ color: showWHO ? "rgb(52,211,153)" : "var(--nc-text-2)" }}
                >
                  <HeartPulse className="w-4 h-4" />
                </button>
                {pinCount > 0 && (
                  <>
                    <div style={{ height: "1px", background: "var(--nc-border)" }} />
                    <button
                      onClick={() => { setShowTimeline((v) => !v); setShowWHO(false); setShowAnalysis(false); }}
                      className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/5"
                      aria-label="Pin timeline"
                      style={{ color: showTimeline ? "rgb(52,211,153)" : "var(--nc-text-2)" }}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => setShowAnalysis((v) => !v)}
              aria-label="Analysis tools"
              aria-pressed={showAnalysis}
              className="w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg transition-colors"
              style={{
                background: showAnalysis ? "var(--nc-text)" : "var(--nc-bg-panel)",
                color: showAnalysis ? "var(--nc-bg)" : "var(--nc-text-2)",
                border: "1px solid var(--nc-border-mid)",
                backdropFilter: "blur(8px)",
              }}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Analysis panels ── */}
      {showTrend && (() => {
        const bbox = filteredPins.length > 0 ? {
          minLat: Math.min(...filteredPins.map((p) => p.lat)) - 0.02,
          maxLat: Math.max(...filteredPins.map((p) => p.lat)) + 0.02,
          minLng: Math.min(...filteredPins.map((p) => p.lng)) - 0.02,
          maxLng: Math.max(...filteredPins.map((p) => p.lng)) + 0.02,
        } : null;
        const nearby = bbox
          ? allReports.filter((r) => r.lat != null && r.lng != null &&
              r.lat! >= bbox.minLat && r.lat! <= bbox.maxLat &&
              r.lng! >= bbox.minLng && r.lng! <= bbox.maxLng)
          : [];
        const trendReports = nearby.length >= 2 ? nearby : allReports;
        const isFiltered = nearby.length >= 2;

        return trendReports.length >= 2 ? (
          <div
            className="absolute left-16 right-16 z-[1000] rounded-xl px-4 py-3"
            style={{ bottom: 100, background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)", maxWidth: 380 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="te-label text-white/50 uppercase tracking-wider text-[10px]">
                {isFiltered ? `Leq trend — ${nearby.length} sessions near pins` : "Leq trend — all sessions"}
              </span>
              <button onClick={() => setShowTrend(false)} className="te-label text-white/30 hover:text-white/70 transition-colors"><X className="w-3 h-3" /></button>
            </div>
            <LeqChart reports={trendReports} title={t.leq_trend} />
          </div>
        ) : (
          <div
            className="absolute left-16 z-[1000] rounded-xl px-4 py-3"
            style={{ bottom: 100, background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)" }}
          >
            <span className="te-label text-white/30 text-[10px]">Record at least 2 sessions to see a trend.</span>
            <button onClick={() => setShowTrend(false)} className="te-label text-white/30 hover:text-white/70 ml-3 transition-colors"><X className="w-3 h-3" /></button>
          </div>
        );
      })()}

      {showEnforcement && pinCount > 0 && (
        <EnforcementPanel pins={filteredPins} onClose={() => setShowEnforcement(false)} />
      )}

      {showComplaint && (
        <ComplaintLetter pins={filteredPins} reports={allReports} onClose={() => setShowComplaint(false)} />
      )}

      {showWHO && (pinCount > 0 || hasGpsReports) && (
        <WHODashboard pins={filteredPins} reports={allReports} onClose={() => setShowWHO(false)} />
      )}

      {showTimeline && pinCount > 0 && (
        <TimelinePanel pins={filteredPins} onClose={() => setShowTimeline(false)} />
      )}

      {/* Export error toast */}
      {exportError && (
        <div
          className="absolute left-4 z-[1001] px-3 py-2 rounded-lg text-xs text-red-400"
          style={{ bottom: 212, background: "var(--nc-map-overlay)", border: "1px solid rgba(239,68,68,0.4)" }}
        >
          {exportError}
        </div>
      )}

      {pendingPin && (
        <PinForm
          lat={pendingPin.lat}
          lng={pendingPin.lng}
          onClose={() => setPendingPin(null)}
          onSaved={refresh}
        />
      )}
    </div>

    {/* ── Right controls: FAB + zoom cluster — fixed at viewport level, outside MapLibre DOM ── */}
    {mapControls && (
      <>
        <button
          onClick={mapControls.gpsPin}
          aria-label={t.map_gps_me}
          className="fixed right-4 z-[1000] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
          style={{ bottom: 100, background: "var(--nc-text)", color: "var(--nc-bg)" }}
        >
          <MapPinPlus className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <div
          className="fixed right-4 z-[1000] flex flex-col rounded-2xl overflow-hidden shadow-lg"
          style={{
            bottom: 176,
            background: "var(--nc-bg-panel)",
            border: "1px solid var(--nc-border-mid)",
            backdropFilter: "blur(8px)",
          }}
        >
          <button onClick={mapControls.zoomIn} aria-label={t.map_zoom_in} className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50" style={{ color: "var(--nc-text-2)" }}>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
          <div style={{ height: "1px", background: "var(--nc-border)" }} />
          <button onClick={mapControls.zoomOut} aria-label={t.map_zoom_out} className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50" style={{ color: "var(--nc-text-2)" }}>
            <Minus className="w-4 h-4" strokeWidth={2} />
          </button>
          <div style={{ height: "1px", background: "var(--nc-border)" }} />
          <button onClick={mapControls.locateMe} aria-label={t.map_locate_me} className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50" style={{ color: "var(--nc-text-2)" }}>
            <LocateFixed className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </>
    )}
    </ErrorBoundary>
  );
}
