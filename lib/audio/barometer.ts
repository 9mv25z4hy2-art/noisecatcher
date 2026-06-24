"use client";

// MEMS barometer via Generic Sensor API (AbsolutePressureSensor).
// Chrome-only, requires 'accelerometer' permission group.
// As of 2025, no browser ships this in stable — this is future-ready code
// with a permanent graceful fallback for now.

export interface BarometerReading {
  /** Atmospheric pressure in hPa (hectopascals). */
  hPa: number;
  timestamp: number;
}

type SensorState = "unsupported" | "denied" | "active" | "error";

export interface BarometerHandle {
  state: SensorState;
  stop: () => void;
}

export async function startBarometer(
  onReading: (r: BarometerReading) => void
): Promise<BarometerHandle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  if (typeof win.AbsolutePressureSensor === "undefined") {
    return { state: "unsupported", stop: () => {} };
  }

  try {
    const result = await navigator.permissions.query({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: "accelerometer" as any,
    });
    if (result.state === "denied") {
      return { state: "denied", stop: () => {} };
    }
  } catch {
    // permissions API may not support this name — proceed anyway
  }

  try {
    const sensor = new win.AbsolutePressureSensor({ frequency: 1 });
    sensor.onreading = () => {
      // Sensor returns Pascals; convert to hPa
      onReading({ hPa: sensor.pressure / 100, timestamp: Date.now() });
    };
    sensor.onerror = () => {};
    sensor.start();
    return {
      state: "active",
      stop: () => { try { sensor.stop(); } catch {} },
    };
  } catch {
    return { state: "error", stop: () => {} };
  }
}
