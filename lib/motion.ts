// Noisecatcher — IMU motion detection via DeviceMotionEvent
// Detects phone movement that corrupts Leq readings (walking, handling noise).
//
// threshold: 0.8 m/s² on the no-gravity acceleration vector.
// cooldown:  500 ms of stability required before "not moving" fires.
// iOS 13+ requires the same requestPermission gesture as DeviceOrientationEvent.

export interface MotionData {
  isMoving: boolean;
  magnitude: number; // m/s²
}

const MOTION_THRESHOLD = 0.8; // m/s²
const COOLDOWN_MS = 500;

export async function requestMotionPermission(): Promise<boolean> {
  if (typeof DeviceMotionEvent === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DME = DeviceMotionEvent as any;
  if (typeof DME.requestPermission === "function") {
    try {
      const result = await DME.requestPermission();
      return result === "granted";
    } catch {
      return false;
    }
  }
  // Android / desktop — no permission needed
  return typeof window !== "undefined" && "DeviceMotionEvent" in window;
}

export function startMotionTracking(
  onMotion: (data: MotionData) => void
): () => void {
  let handler: ((e: DeviceMotionEvent) => void) | null = null;
  let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
  let currentlyMoving = false;

  handler = (e: DeviceMotionEvent) => {
    let magnitude = 0;

    // Prefer acceleration (gravity subtracted by device gyroscope)
    const acc = e.acceleration;
    if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
      magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    } else {
      // Fallback: deviation of |accG| from standard gravity (9.81 m/s²)
      const accG = e.accelerationIncludingGravity;
      if (accG && accG.x !== null && accG.y !== null && accG.z !== null) {
        magnitude = Math.abs(Math.sqrt(accG.x ** 2 + accG.y ** 2 + accG.z ** 2) - 9.81);
      }
    }

    if (magnitude > MOTION_THRESHOLD) {
      // Reset the cooldown timer on every motion frame
      if (cooldownTimer) clearTimeout(cooldownTimer);
      if (!currentlyMoving) {
        currentlyMoving = true;
        onMotion({ isMoving: true, magnitude });
      }
      // After 500 ms of no motion exceeding threshold, report stable
      cooldownTimer = setTimeout(() => {
        currentlyMoving = false;
        onMotion({ isMoving: false, magnitude: 0 });
      }, COOLDOWN_MS);
    }
  };

  window.addEventListener("devicemotion", handler);

  return () => {
    if (handler) window.removeEventListener("devicemotion", handler);
    if (cooldownTimer) clearTimeout(cooldownTimer);
    handler = null;
    cooldownTimer = null;
    currentlyMoving = false;
  };
}
