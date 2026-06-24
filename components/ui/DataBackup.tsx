"use client";

import { useRef, useState } from "react";
import { Download, Upload, Radio, CheckCircle, AlertCircle } from "lucide-react";
import { exportAllData, importData, type BackupStats } from "@/lib/backup";
import { useI18n } from "@/lib/i18n/context";

type Status =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "ok"; stats: BackupStats; action: "export" | "import" }
  | { kind: "err"; message: string };

interface Props {
  onImport?: () => void;
}

export default function DataBackup({ onImport }: Props) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setStatus({ kind: "busy" });
    try {
      const stats = await exportAllData();
      setStatus({ kind: "ok", stats, action: "export" });
    } catch (e) {
      setStatus({ kind: "err", message: e instanceof Error ? e.message : String(e) });
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setStatus({ kind: "busy" });
    try {
      const stats = await importData(file);
      setStatus({ kind: "ok", stats, action: "import" });
      onImport?.();
    } catch (err) {
      setStatus({ kind: "err", message: err instanceof Error ? err.message : String(err) });
    }
  };

  const busy = status.kind === "busy";

  return (
    <div className="flex flex-col gap-3">
      <p className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
        {t.backup_section}
      </p>

      {/* Export */}
      <div className="te-panel rounded-md p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="te-label text-white/70">{t.backup_export}</span>
            <span className="te-label text-white/30 text-[10px]">{t.backup_export_hint}</span>
          </div>
          <button
            onClick={doExport}
            disabled={busy}
            aria-label={t.backup_export}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="te-panel rounded-md p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="te-label text-white/70">{t.backup_import}</span>
            <span className="te-label text-white/30 text-[10px]">{t.backup_import_hint}</span>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label={t.backup_import}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md border border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 transition-colors disabled:opacity-40"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={onFile}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </div>

      {/* Status feedback */}
      {status.kind === "ok" && (
        <div className="flex items-start gap-2 rounded-md px-3 py-2.5 text-xs" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border-mid)" }}>
          <CheckCircle className="w-3.5 h-3.5 mt-px shrink-0 text-emerald-400" />
          <span style={{ color: "var(--nc-text-2)" }}>
            {t.backup_success} — {status.action === "export" ? "↓" : "↑"}{" "}
            {status.stats.pins} pins · {status.stats.carnets} notebooks · {status.stats.reports} reports · {status.stats.voiceNotes} voice notes
          </span>
        </div>
      )}
      {status.kind === "err" && (
        <div className="flex items-start gap-2 rounded-md px-3 py-2.5 text-xs" style={{ background: "rgba(127,29,29,0.3)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0 text-red-400" />
          <span className="text-red-300">{t.backup_error}</span>
        </div>
      )}

      {/* Gun P2P relay callout */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-md" style={{ background: "var(--nc-bg-raised)", border: "1px solid var(--nc-border)" }}>
        <Radio className="w-3.5 h-3.5 mt-px shrink-0" style={{ color: "var(--nc-text-3)" }} />
        <p className="te-label text-[10px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          {t.backup_p2p_relay}.{" "}
          <code className="text-[9px] px-1 py-px rounded" style={{ background: "var(--nc-bg)", color: "var(--nc-text-2)" }}>
            NEXT_PUBLIC_GUN_PEERS=https://your-relay/gun
          </code>
        </p>
      </div>
    </div>
  );
}
