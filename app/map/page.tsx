"use client";

import ErrorBoundary from "@/components/ui/ErrorBoundary";
import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { Clock, HeartPulse, FileText, BarChart2, TrendingUp, Download, X, Plus, Minus, LocateFixed, MapPinPlus, Mic, Map as MapIcon, BookOpen, Info, Zap, BookMarked } from "lucide-react";
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
  const onAddPin = useCallback((lat: number, lng: number) => setPendingPin({ lat, lng }), []);

  // Window-level touchend capture — fires before MapLibre's non-passive listeners.
  // Detects taps on the map-page nav and navigates via window.location.href,
  // bypassing React routing entirely.
  useEffect(() => {
    function onTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!el) return;
      const link = el.closest('a[data-map-nav]') as HTMLAnchorElement | null;
      if (!link?.href) return;
      window.location.href = link.href;
    }
    window.addEventListener("touchend", onTouchEnd, { capture: true });
    return () => window.removeEventListener("touchend", onTouchEnd, { capture: true });
  }, []);

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
    <>
    <ErrorBoundary>
    <div className="relative">

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

      <div className="nc-map-canvas">
        <LeafletMap
          filterCategory={filterCategory}
          filterDb={filterDb}
          onAddPin={onAddPin}
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
        <div className="fixed z-[1000] flex flex-col gap-2 items-start nc-ctrl-b nc-ctrl-l">

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
            className="fixed left-16 right-16 z-[1000] rounded-xl px-4 py-3"
            style={{ bottom: "calc(var(--nc-nav-bottom) + 68px)", background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)", maxWidth: 380 }}
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
            className="fixed left-16 z-[1000] rounded-xl px-4 py-3"
            style={{ bottom: "calc(var(--nc-nav-bottom) + 68px)", background: "var(--nc-map-overlay)", border: "1px solid var(--nc-border-mid)" }}
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
          className="fixed left-4 z-[1001] px-3 py-2 rounded-lg text-xs text-red-400"
          style={{ bottom: "calc(var(--nc-nav-bottom) + 180px)", background: "var(--nc-map-overlay)", border: "1px solid rgba(239,68,68,0.4)" }}
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
          className="fixed z-[1000] w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 nc-ctrl-b nc-ctrl-r"
          style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
        >
          <MapPinPlus className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <div
          className="fixed z-[1000] flex flex-col rounded-xl overflow-hidden shadow-lg nc-ctrl-bz nc-ctrl-r"
          style={{
            background: "var(--nc-bg)",
            border: "1px solid var(--nc-border-mid)",
          }}
        >
          <button onClick={mapControls.zoomIn} aria-label={t.map_zoom_in} className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50" style={{ color: "var(--nc-text)" }}>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
          <div style={{ height: "1px", background: "var(--nc-border-mid)" }} />
          <button onClick={mapControls.zoomOut} aria-label={t.map_zoom_out} className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50" style={{ color: "var(--nc-text)" }}>
            <Minus className="w-4 h-4" strokeWidth={2} />
          </button>
          <div style={{ height: "1px", background: "var(--nc-border-mid)" }} />
          <button onClick={mapControls.locateMe} aria-label={t.map_locate_me} className="w-10 h-10 flex items-center justify-center transition-colors active:opacity-50" style={{ color: "var(--nc-text)" }}>
            <LocateFixed className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </>
    )}
    </ErrorBoundary>

    {/* ── Map-page mobile nav ─────────────────────────────────────────────────
        Rendered here (not in layout Nav) so it is completely outside MapLibre's
        DOM subtree and React's layout event delegation. Plain <a> tags +
        window.location.href bypass router.push() and any touch capture by MapLibre.
        The layout Nav hides its own mobile nav on /map to avoid duplicates.      */}
    {(() => {
      const navLinks = [
        { href: "/meter",      Icon: Mic,        label: t.nav_meter },
        { href: "/map",        Icon: MapIcon,    label: t.nav_map },
        { href: "/abecedaire", Icon: BookOpen,   label: t.nav_abecedaire },
        { href: "/act",        Icon: Zap,        label: t.nav_act },
        { href: "/carnets",    Icon: BookMarked, label: t.nav_carnets },
        { href: "/about",      Icon: Info,       label: t.nav_about },
      ];
      return (
        <nav
          className="sm:hidden fixed bottom-0 inset-x-0 z-[9999] backdrop-blur border-t flex"
          style={{ background: "var(--nc-nav-bg)", borderColor: "var(--nc-border)", paddingBottom: "env(safe-area-inset-bottom)", touchAction: "manipulation" }}
          aria-label="Mobile navigation"
        >
          {navLinks.map(({ href, Icon, label }) => (
            <a
              key={href}
              href={href}
              data-map-nav="1"
              aria-current={href === "/map" ? "page" : undefined}
              className="flex-1 flex flex-col items-center gap-1 py-3 min-h-[52px] justify-center"
              style={{ color: href === "/map" ? "var(--nc-text)" : "var(--nc-text-3)", textDecoration: "none", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              onClick={(e) => { e.preventDefault(); window.location.href = href; }}
              onTouchEnd={(e) => { e.preventDefault(); window.location.href = href; }}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[9px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)" }}>{label}</span>
            </a>
          ))}
        </nav>
      );
    })()}
    </>
  );
}
