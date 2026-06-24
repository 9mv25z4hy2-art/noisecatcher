// Noisecatcher orientation — DeviceOrientationEvent utilities
// alpha: compass bearing 0–360° (north = 0)
// beta:  front-back tilt –180°–180° (flat face-up = 0)
// gamma: left-right tilt –90°–90°

export interface OrientationData {
  bearing: number | null;   // alpha, rounded to integer
  isLevel: boolean;         // beta within ±5° of horizontal
  beta: number | null;
}

// iOS 13+ requires explicit permission from a user gesture.
// Android and desktop do not require this.
export async function requestOrientationPermission(): Promise<boolean> {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DOE = DeviceOrientationEvent as any;
  if (typeof DOE.requestPermission === "function") {
    try {
      const result = await DOE.requestPermission();
      return result === "granted";
    } catch {
      return false;
    }
  }
  // Android / desktop — permission not required
  return true;
}

// Get a one-shot bearing reading (for pin drop)
export function getCurrentBearing(): number | null {
  // Returns null until the first event fires — call after permission is granted
  return lastBearing;
}

let lastBearing: number | null = null;
let lastIsLevel = false;
let lastBeta: number | null = null;

let _handler: ((e: DeviceOrientationEvent) => void) | null = null;

export function startOrientationTracking(
  onUpdate: (data: OrientationData) => void
): () => void {
  _handler = (e: DeviceOrientationEvent) => {
    const bearing = e.alpha !== null ? Math.round(e.alpha) : null;
    const beta = e.beta !== null ? e.beta : null;
    const isLevel = beta !== null && Math.abs(beta) < 5;
    lastBearing = bearing;
    lastIsLevel = isLevel;
    lastBeta = beta;
    onUpdate({ bearing, isLevel, beta });
  };

  window.addEventListener("deviceorientation", _handler, true);

  return () => {
    if (_handler) window.removeEventListener("deviceorientation", _handler, true);
    _handler = null;
  };
}

export function getLastOrientation(): OrientationData {
  return { bearing: lastBearing, isLevel: lastIsLevel, beta: lastBeta };
}

// Format bearing as compass direction abbreviation
export function bearingToLabel(bearing: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  return dirs[Math.round(bearing / 45)];
}
