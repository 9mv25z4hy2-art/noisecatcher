"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onClose: () => void;
}

const SIGNATURES = [
  {
    id: "mosquito",
    name: "Mosquito Device",
    category: "hostile-architecture",
    freqRange: "17–19 kHz",
    level: "~75–80 dB at 1 m",
    pattern: "Continuous tonal, strong harmonic at fundamental",
    notes: "Targets under-25s via age-related hearing loss threshold. Single sustained tone; detectable via HF Scanner above.",
    fingerprint: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0.7,0.4,0.2,0,0,0],
  },
  {
    id: "lrad",
    name: "LRAD (Long Range Acoustic Device)",
    category: "crowd-control",
    freqRange: "2–5 kHz (primary)",
    level: "120–162 dB SPL at 1 m",
    pattern: "Focused beam, highly directional; sinusoidal sweep or fixed tone",
    notes: "Used by law enforcement. Causes pain, disorientation, hearing damage at close range. Distinct from other crowd-control tools by extreme directionality.",
    fingerprint: [0,0,0,0,0,0,0,0,0,0,0.3,0.7,1,0.9,0.6,0.3,0.1,0,0,0,0,0,0,0],
  },
  {
    id: "aircraft",
    name: "Low-altitude Aircraft",
    category: "transportation",
    freqRange: "20 Hz – 2 kHz (broadband)",
    level: "70–115 dB",
    pattern: "Broadband noise with Doppler shift on approach/departure; low-frequency rumble dominates",
    notes: "Jet turbofan: dominant at 300–600 Hz. Propeller: strong tonal at blade-pass frequency. Helicopters: distinctive rotor thump below 100 Hz.",
    fingerprint: [0.8,0.9,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: "piledriver",
    name: "Pile Driver / Impact Hammer",
    category: "construction",
    freqRange: "10 Hz – 300 Hz",
    level: "95–115 dB at 50 m",
    pattern: "Impulsive: sharp transient followed by ground-borne decay; clearly rhythmic",
    notes: "Characterised by high peak-to-average ratio and strong low-frequency impulse content. Leq underestimates annoyance; Lmax is the relevant metric.",
    fingerprint: [1,0.9,0.7,0.4,0.2,0.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: "crowd",
    name: "Dense Crowd / Mass Gathering",
    category: "entertainment",
    freqRange: "200 Hz – 4 kHz",
    level: "65–90 dB",
    pattern: "Spectrally diffuse, no dominant frequency; resembles pink noise with vocal formant peaks at 500 Hz and 3 kHz",
    notes: "No sharp tonal components. Useful diagnostic: absence of spectral peaks distinguishes crowd from PA or mechanical source.",
    fingerprint: [0.1,0.2,0.4,0.6,0.8,1,0.9,0.8,0.7,0.6,0.4,0.3,0.2,0.1,0,0,0,0,0,0,0,0,0,0],
  },
];

export default function SignatureLibrary({ onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="rounded-2xl w-full max-w-sm flex flex-col shadow-2xl max-h-[90vh] overflow-hidden"
        style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)" }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--nc-border)" }}>
          <div>
            <p className="font-semibold text-sm nc-text">Acoustic Signature Library</p>
            <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>Reference spectrograms for hostile & environmental sources</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--nc-text-3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--nc-border)" }}>
          {SIGNATURES.map((sig) => (
            <div key={sig.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => setExpanded(expanded === sig.id ? null : sig.id)}
                aria-expanded={expanded === sig.id}
                className="flex items-start justify-between px-4 py-3 text-left gap-3 w-full"
              >
                <div>
                  <p className="text-xs font-semibold nc-text">{sig.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--nc-text-3)" }}>
                    {sig.freqRange} · {sig.level}
                  </p>
                </div>
                {expanded === sig.id
                  ? <ChevronUp className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--nc-text-3)" }} />
                  : <ChevronDown className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--nc-text-3)" }} />
                }
              </button>

              {expanded === sig.id && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {/* Fingerprint bar chart */}
                  <div className="flex items-end gap-0.5 h-10">
                    {sig.fingerprint.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${Math.max(v * 100, 4)}%`,
                          background: v > 0.6 ? "#f87171" : v > 0.3 ? "#fb923c" : "rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>0 Hz</span>
                    <span className="text-[9px]" style={{ color: "var(--nc-text-3)" }}>24 kHz</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Pattern</span>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--nc-text-2)" }}>{sig.pattern}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>Notes</span>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--nc-text-2)" }}>{sig.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
