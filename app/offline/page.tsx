import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline — Noisecatcher",
};

export default function OfflinePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--nc-text)", fontFamily: "var(--font-display)" }}>
          You are offline
        </h1>
        <p className="te-label text-sm max-w-xs" style={{ color: "var(--nc-text-2)" }}>
          No network connection. Noisecatcher stores all your pins, notebooks, and reports locally —
          they are safe and available.
        </p>
      </div>

      <div
        className="te-panel rounded-md px-5 py-4 flex flex-col gap-1.5 text-left max-w-xs w-full"
      >
        <p className="te-label text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
          Available offline
        </p>
        {[
          ["Meter", "/meter"],
          ["Map", "/map"],
          ["Notebooks", "/carnets"],
          ["Abécédaire", "/abecedaire"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="te-label text-sm transition-colors"
            style={{ color: "var(--nc-text-2)" }}
          >
            → {label}
          </Link>
        ))}
      </div>

      <p className="te-label text-xs" style={{ color: "var(--nc-text-3)" }}>
        Map tiles cached in the last 7 days are available. P2P sharing requires a connection.
      </p>
    </main>
  );
}
