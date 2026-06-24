"use client";
import NoiseMeter from "@/components/meter/NoiseMeter";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useI18n } from "@/lib/i18n/context";

export default function MeterPage() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center px-4 py-8 gap-8">
      <div className="text-center">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--nc-text)", fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
        >
          {t.meter_title}
        </h1>
        <p className="text-sm mt-1 max-w-xs" style={{ color: "var(--nc-text-2)" }}>
          {t.meter_subtitle}
        </p>
      </div>
      <ErrorBoundary>
        <NoiseMeter />
      </ErrorBoundary>
    </div>
  );
}
