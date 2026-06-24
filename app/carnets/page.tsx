"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Plus, Trash2, Download } from "lucide-react";
import { loadCarnets, loadReports, loadAllVoiceNotes, saveCarnet, deleteCarnet, type Carnet, type NoiseReport, type VoiceNote } from "@/lib/db";
import { loadPins, exportCarnetGeoJSON, type NoisePin } from "@/lib/pins";
import { useI18n } from "@/lib/i18n/context";
import LeqChart from "@/components/ui/LeqChart";
import DataBackup from "@/components/ui/DataBackup";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export default function CarnetsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [carnets, setCarnets] = useState<Carnet[]>([]);
  const [allReports, setAllReports] = useState<NoiseReport[]>([]);
  const [allPins, setAllPins] = useState<NoisePin[]>([]);
  const [allVoiceNotes, setAllVoiceNotes] = useState<VoiceNote[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    loadCarnets().then(setCarnets);
    loadReports().then(setAllReports);
    loadPins().then(setAllPins);
    loadAllVoiceNotes().then(setAllVoiceNotes);
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    try {
      const c = await saveCarnet({ name: name.trim(), notes, color });
      setCarnets((prev) => [c, ...prev]);
      setName(""); setNotes(""); setColor(COLORS[0]); setShowNew(false);
    } catch (err) {
      console.error("[carnets] saveCarnet failed:", err);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCarnet(id);
      setCarnets((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("[carnets] deleteCarnet failed:", err);
    }
  };

  const refreshAll = () => {
    loadCarnets().then(setCarnets);
    loadReports().then(setAllReports);
    loadPins().then(setAllPins);
    loadAllVoiceNotes().then(setAllVoiceNotes);
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-white">{t.carnet_title}</h1>
        <div className="flex items-center gap-2">
          {(allPins.length > 0 || allReports.length > 0 || allVoiceNotes.length > 0) && (
            <button
              onClick={() => exportCarnetGeoJSON(allPins, allReports, allVoiceNotes)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/10 te-label text-white/40 hover:text-white/70 hover:border-white/25 transition-colors"
              title="Export all pins and session reports as a single GeoJSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export all
            </button>
          )}
          <button
            onClick={() => setShowNew((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 te-label text-white/50 hover:text-white/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.carnet_new}
          </button>
        </div>
      </div>

      {showNew && (
        <div className="te-panel rounded-md p-4 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.carnet_name_placeholder}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/25"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.carnet_notes_placeholder}
            rows={2}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
          />
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full shrink-0 transition-transform"
                style={{ background: c, outline: color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
              />
            ))}
          </div>
          <button
            onClick={create}
            className="self-end px-4 py-2 rounded-md bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            {t.carnet_create_btn}
          </button>
        </div>
      )}

      <LeqChart reports={allReports} title={t.leq_trend} />

      {carnets.length === 0 && !showNew && (
        <p className="te-label text-white/30 text-center py-8">{t.carnet_empty}</p>
      )}

      <div className="flex flex-col gap-3">
        {carnets.map((c) => (
          <div
            key={c.id}
            className="te-panel rounded-md p-4 flex items-start gap-3 cursor-pointer hover:bg-white/3 transition-colors"
            onClick={() => router.push(`/carnets/${c.id}`)}
          >
            <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: c.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-semibold truncate">{c.name}</p>
              {c.notes && <p className="te-label text-white/30 truncate mt-0.5">{c.notes}</p>}
              <p className="te-label text-white/20 text-[10px] mt-1">
                {new Date(c.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); remove(c.id); }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-white/20 hover:text-red-400 transition-colors shrink-0"
              aria-label={t.carnet_delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-6" style={{ borderColor: "var(--nc-border)" }}>
        <DataBackup onImport={refreshAll} />
      </div>

      <div className="flex items-center gap-2 te-label text-white/30">
        <BookMarked className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">NoiseCatcher · {t.carnet_title}</span>
      </div>
    </main>
  );
}
