"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { subscribeToArea, type SharedPin } from "@/lib/sync";
import { ArrowRight, Radio, Mic, MapPin, FileText } from "lucide-react";

const LandingMap = dynamic(() => import("@/components/landing/LandingMap"), { ssr: false });

const PILLARS = [
  {
    icon: Mic,
    title: "Measure",
    body: "A-weighted SPL, Leq, psychoacoustics, and speech intelligibility — live, on your device, no account needed.",
  },
  {
    icon: MapPin,
    title: "Map",
    body: "GPS-tagged pins document noise sources at the location and moment they occur. Your data stays local.",
  },
  {
    icon: FileText,
    title: "Act",
    body: "Generate formal complaint letters, WHO health-risk assessments, and GeoJSON exports for legal advocacy.",
  },
];

export default function LandingPage() {
  const [communityPins, setCommunityPins] = useState<SharedPin[]>([]);

  useEffect(() => {
    const unsub = subscribeToArea(
      { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 },
      (pin) => {
        setCommunityPins((prev) => {
          if (prev.some((p) => p.id === pin.id)) return prev;
          return [...prev, pin];
        });
      }
    );
    return unsub;
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--nc-bg)" }}>

      {/* ── Hero ── */}
      <section className="flex flex-col items-start justify-end px-6 pt-24 pb-12 min-h-[60vh] gap-6 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-3">
          <p className="te-label" style={{ color: "var(--nc-text-3)" }}>
            An electroacoustic instrument for acoustic justice
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--nc-text)", fontFamily: "var(--font-display)" }}
          >
            NOISECATCHER
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--nc-text-2)" }}>
            Measure noise pollution. Understand its health consequences.
            Map it. Build evidence. Fight it — collectively, without a central server.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/meter"
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium transition-colors"
            style={{
              background: "var(--nc-text)",
              color: "var(--nc-bg)",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Open meter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium transition-colors border"
            style={{
              background: "transparent",
              color: "var(--nc-text-2)",
              borderColor: "var(--nc-border-mid)",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Explore map
          </Link>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="px-6 py-10 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ border: "1px solid var(--nc-border)", borderRadius: "4px", overflow: "hidden" }}>
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-5"
              style={{ background: "var(--nc-bg-raised)" }}
            >
              <Icon className="w-4 h-4" style={{ color: "var(--nc-text-3)" }} />
              <p className="te-label" style={{ color: "var(--nc-text)" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live community map ── */}
      <section className="px-6 py-4 max-w-2xl mx-auto w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="te-label" style={{ color: "var(--nc-text-3)" }}>
            Live community pins — P2P network
          </p>
          {communityPins.length > 0 && (
            <div className="flex items-center gap-1.5 te-label" style={{ color: "rgb(52,211,153)" }}>
              <Radio className="w-3 h-3 animate-pulse" />
              {communityPins.length} pin{communityPins.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div
          className="w-full rounded-sm overflow-hidden"
          style={{ height: 320, border: "1px solid var(--nc-border-mid)" }}
        >
          <LandingMap communityPins={communityPins} />
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--nc-text-3)" }}>
          Pins shared via Gun.js peer-to-peer — no central server, no account required.
          Sensitive category pins are never shared without explicit confirmation.
        </p>
      </section>

      {/* ── Ethos quote ── */}
      <section className="px-6 py-10 max-w-2xl mx-auto w-full">
        <blockquote
          className="border-l-2 pl-5 flex flex-col gap-2"
          style={{ borderColor: "var(--nc-border-mid)" }}
        >
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--nc-text-2)" }}>
            &ldquo;You are not a user of this tool. You are its performer, its operator, its witness.
            When you measure sound, you name a condition. When you pin a location, you make an
            argument about space, power, and the right to a liveable acoustic environment.&rdquo;
          </p>
          <cite className="te-label not-italic" style={{ color: "var(--nc-text-3)" }}>
            — Field Pamphlet, Politics of Noise research practice
          </cite>
        </blockquote>
      </section>

      {/* ── Footer links ── */}
      <footer
        className="px-6 py-8 max-w-2xl mx-auto w-full flex flex-wrap gap-x-6 gap-y-2 border-t"
        style={{ borderColor: "var(--nc-border)" }}
      >
        {[
          ["Field Pamphlet", "/pamphlet"],
          ["Abécédaire", "/abecedaire"],
          ["Act", "/act"],
          ["About", "/about"],
          ["Help", "/help"],
          ["Field Notebooks", "/carnets"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="te-label transition-colors hover:text-white/80 min-h-[44px] inline-flex items-center"
            style={{ color: "var(--nc-text-2)" }}
          >
            {label}
          </Link>
        ))}
        <span className="te-label ml-auto" style={{ color: "var(--nc-text-3)" }}>
          Sylvain Souklaye · Politics of Noise
        </span>
      </footer>
    </div>
  );
}
