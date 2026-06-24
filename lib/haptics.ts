// Noisecatcher haptics — unified layer for Android (Vibration API) + iOS 18+ (checkbox trick)
// The Vibration API is unsupported on iOS Safari entirely. The checkbox/switch
// attribute trick triggers UIImpactFeedbackGenerator on iOS 18+ but ONLY inside
// a user-gesture context — it cannot fire from background audio processing loops.
// Result: Android gets full threshold + action haptics; iOS 18+ gets action haptics only.

export type HapticEvent =
  | "toSafe"
  | "toCaution"
  | "toDangerous"
  | "toCritical"
  | "pinDrop"
  | "recordStart"
  | "recordStop"
  | "alertDismiss";

const PATTERNS: Record<HapticEvent, number | number[]> = {
  toSafe:        20,
  toCaution:     40,
  toDangerous:   [40, 30, 40],
  toCritical:    [30, 20, 30, 20, 150],
  pinDrop:       50,
  recordStart:   [40, 30, 40],
  recordStop:    200,
  alertDismiss:  30,
};

function vibrationAPI(pattern: number | number[]): boolean {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return false;
  try { navigator.vibrate(pattern); return true; } catch { return false; }
}

// iOS 18+ hidden checkbox trick — only works inside user gesture handlers
function iosCheckbox(): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById("nc-haptic-ios") as HTMLInputElement | null;
  if (el) el.checked = !el.checked;
}

export function haptic(event: HapticEvent): void {
  const pattern = PATTERNS[event];
  if (!vibrationAPI(pattern)) {
    // Fall back to iOS checkbox — works for action events in gesture context
    iosCheckbox();
  }
}

// Convenience exports
export const Haptics = {
  toSafe:       () => haptic("toSafe"),
  toCaution:    () => haptic("toCaution"),
  toDangerous:  () => haptic("toDangerous"),
  toCritical:   () => haptic("toCritical"),
  pinDrop:      () => haptic("pinDrop"),
  recordStart:  () => haptic("recordStart"),
  recordStop:   () => haptic("recordStop"),
  alertDismiss: () => haptic("alertDismiss"),
};
