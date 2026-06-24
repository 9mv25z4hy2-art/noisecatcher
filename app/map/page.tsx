"use client";

import ErrorBoundary from "@/components/ui/ErrorBoundary";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Clock, HeartPulse, FileText, BarChart2, TrendingUp } from "lucide-react";
import type { NoiseCategory, NoisePin } from "@/lib/pins";
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
    <div className="relative flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>

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

      <div style={{ height: "calc(100vh - 180px)", minHeight: 400 }}>
        <LeafletMap
          filterCategory={filterCategory}
          filterDb={filterDb}
          onAddPin={(lat, lng) => setPendingPin({ lat, lng })}
          onPinDeleted={refresh}
          refreshKey={refreshKey}
          densityMode={densityMode}
          showNoisePlanet={showNoisePlanet}
          communityPins={communityCategory === "all" ? communityPins : communityPins.filter((p) => p.category === communityCategory)}
        />
      </div>

      {/* Timeline + WHO toggle buttons */}
      {(pinCount > 0 || hasGpsReports) && (
        <div className="absolute bottom-24 right-3 z-[1000] flex flex-col gap-1.5">
          {pinCount > 0 && (
            <>
              <button
                onClick={() => { setShowTrend((v) => !v); setShowEnforcement(false); setShowWHO(false); setShowTimeline(false); }}
                aria-label={showTrend ? "Hide Leq trend" : "Show Leq trend chart"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
                style={{
                  background: showTrend ? "var(--nc-text)" : "var(--nc-map-overlay)",
                  color: showTrend ? "var(--nc-bg)" : "var(--nc-text-2)",
                  border: `1px solid ${showTrend ? "var(--nc-text)" : "var(--nc-border-mid)"}`,
                }}
              >
                <TrendingUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => { setShowEnforcement((v) => !v); setShowWHO(false); setShowTimeline(false); }}
                aria-label={showEnforcement ? "Hide enforcement panel" : "Show enforcement pattern visualizer"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
                style={{
                  background: showEnforcement ? "var(--nc-text)" : "var(--nc-map-overlay)",
                  color: showEnforcement ? "var(--nc-bg)" : "var(--nc-text-2)",
                  border: `1px solid ${showEnforcement ? "var(--nc-text)" : "var(--nc-border-mid)"}`,
                }}
              >
                <BarChart2 className="w-3 h-3" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowComplaint(true)}
            aria-label="Generate complaint letter"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
            style={{ background: "var(--nc-map-overlay)", color: "var(--nc-text-2)", border: "1px solid var(--nc-border-mid)" }}
          >
            <FileText className="w-3 h-3" />
          </button>
          <button
            onClick={() => { setShowWHO((v) => !v); setShowTimeline(false); }}
            aria-label={showWHO ? "Hide WHO dashboard" : "Show WHO health risk dashboard"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
            style={{
              background: showWHO ? "var(--nc-text)" : "var(--nc-map-overlay)",
              color: showWHO ? "var(--nc-bg)" : "var(--nc-text-2)",
              border: `1px solid ${showWHO ? "var(--nc-text)" : "var(--nc-border-mid)"}`,
            }}
          >
            <HeartPulse className="w-3 h-3" />
          </button>
          {pinCount > 0 && (
            <button
              onClick={() => { setShowTimeline((v) => !v); setShowWHO(false); }}
              aria-label={showTimeline ? "Hide timeline" : "Show pin timeline"}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
              style={{
                background: showTimeline ? "var(--nc-text)" : "var(--nc-map-overlay)",
                color: showTimeline ? "var(--nc-bg)" : "var(--nc-text-2)",
                border: `1px solid ${showTimeline ? "var(--nc-text)" : "var(--nc-border-mid)"}`,
              }}
            >
              <Clock className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Leq trend panel — filtered to reports near visible pins when GPS data exists */}
      {showTrend && (() => {
        // Build bbox from currently filtered pins (all have lat/lng)
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
        // Fall back to all reports when no reports have GPS near visible pins
        const trendReports = nearby.length >= 2 ? nearby : allReports;
        const isFiltered = nearby.length >= 2;

        return trendReports.length >= 2 ? (
          <div
            className="absolute bottom-24 left-3 right-3 z-[1000] rounded-xl px-4 py-3"
            style={{ background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)", maxWidth: 420 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="te-label text-white/50 uppercase tracking-wider text-[10px]">
                {isFiltered ? `Leq trend — ${nearby.length} sessions near pins` : "Leq trend — all sessions"}
              </span>
              <button onClick={() => setShowTrend(false)} className="te-label text-white/30 hover:text-white/70 transition-colors">✕</button>
            </div>
            <LeqChart reports={trendReports} title={t.leq_trend} />
          </div>
        ) : (
          <div
            className="absolute bottom-24 left-3 z-[1000] rounded-xl px-4 py-3"
            style={{ background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)" }}
          >
            <span className="te-label text-white/30 text-[10px]">Record at least 2 sessions to see a trend.</span>
            <button onClick={() => setShowTrend(false)} className="te-label text-white/30 hover:text-white/70 ml-3 transition-colors">✕</button>
          </div>
        );
      })()}

      {/* Enforcement Panel */}
      {showEnforcement && pinCount > 0 && (
        <EnforcementPanel pins={filteredPins} onClose={() => setShowEnforcement(false)} />
      )}

      {/* Complaint Letter */}
      {showComplaint && (
        <ComplaintLetter pins={filteredPins} reports={allReports} onClose={() => setShowComplaint(false)} />
      )}

      {/* WHO Dashboard */}
      {showWHO && (pinCount > 0 || hasGpsReports) && (
        <WHODashboard pins={filteredPins} reports={allReports} onClose={() => setShowWHO(false)} />
      )}

      {/* Timeline panel */}
      {showTimeline && pinCount > 0 && (
        <TimelinePanel
          pins={filteredPins}
          onClose={() => setShowTimeline(false)}
        />
      )}

      {/* Export buttons */}
      {pinCount > 0 && (
        <div className="absolute bottom-10 right-3 z-[1000] flex flex-col gap-1.5 items-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
            style={{ background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)" }}
          >
            ↓ Export GeoJSON
          </button>
          {pinCount >= 2 && (
            <button
              onClick={handleTransectExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-colors te-label"
              style={{ background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)" }}
              title="Export pins as a route transect (LineString + Points)"
            >
              {t.export_transect}
            </button>
          )}
        </div>
      )}

      {/* Export error */}
      {exportError && (
        <div
          className="absolute bottom-20 right-3 z-[1001] px-3 py-2 rounded-sm text-xs text-red-400"
          style={{ background: "var(--nc-map-overlay)", border: "1px solid rgba(239,68,68,0.4)" }}
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
    </ErrorBoundary>
  );
}
