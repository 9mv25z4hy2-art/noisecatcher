"use client";

import { useEffect, useRef } from "react";
import type { NoiseMeter } from "@/lib/audio/meter";

interface Props {
  meterRef: React.RefObject<NoiseMeter | null>;
  isActive: boolean;
}

// Heat-map color: maps 0–255 frequency magnitude to a color
// 0 = dark blue (silence), 128 = cyan/green, 255 = bright yellow/red
function magnitudeToColor(v: number): [number, number, number] {
  // v: 0–255
  const t = v / 255;
  if (t < 0.25) {
    // dark blue → blue
    const s = t / 0.25;
    return [0, 0, Math.round(80 + 120 * s)];
  } else if (t < 0.5) {
    // blue → cyan
    const s = (t - 0.25) / 0.25;
    return [0, Math.round(255 * s), 200];
  } else if (t < 0.75) {
    // cyan → yellow
    const s = (t - 0.5) / 0.25;
    return [Math.round(255 * s), 255, Math.round(200 * (1 - s))];
  } else {
    // yellow → red
    const s = (t - 0.75) / 0.25;
    return [255, Math.round(255 * (1 - s)), 0];
  }
}

export default function Spectrogram({ meterRef, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freqDataRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      // Clear canvas on stop
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    function draw() {
      const analyser = meterRef.current?.getAnalyser();
      if (!analyser || !ctx) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const binCount = analyser.frequencyBinCount; // fftSize / 2 = 1024
      if (!freqDataRef.current || freqDataRef.current.length !== binCount) {
        freqDataRef.current = new Uint8Array(binCount);
      }
      analyser.getByteFrequencyData(freqDataRef.current);

      // Shift existing content up by 1 row
      const existing = ctx.getImageData(0, 1, W, H - 1);
      ctx.putImageData(existing, 0, 0);

      // Draw new frequency row at the bottom
      // We display bins 0..binCount*0.75 (drop very high freq that are always 0)
      const displayBins = Math.floor(binCount * 0.75);
      const rowData = ctx.createImageData(W, 1);
      for (let x = 0; x < W; x++) {
        const binIdx = Math.floor((x / W) * displayBins);
        const v = freqDataRef.current![binIdx];
        const [r, g, b] = magnitudeToColor(v);
        const i = x * 4;
        rowData.data[i]     = r;
        rowData.data[i + 1] = g;
        rowData.data[i + 2] = b;
        rowData.data[i + 3] = 255;
      }
      ctx.putImageData(rowData, 0, H - 1);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ background: "#000810", border: "1px solid var(--nc-border)" }}>
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--nc-border)" }}>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--nc-text-3)" }}>Spectrogram</span>
        <span className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>20 Hz → 16 kHz</span>
      </div>
      <canvas
        ref={canvasRef}
        width={512}
        height={120}
        role="img"
        aria-label={isActive ? "Live frequency spectrogram — low frequencies left, high frequencies right, intensity shown by colour from dark blue (silent) to red (loud)" : "Spectrogram inactive"}
        className="w-full block"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
