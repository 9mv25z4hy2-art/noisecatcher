/**
 * Device microphone uncertainty estimates by class.
 *
 * Sources:
 * - Kardous & Shaw, J. Acoust. Soc. Am. 135 (2014): Evaluated iOS measurement apps;
 *   best-in-class apps achieved ±2 dB error on iPhone 4S/5.
 * - Murphy & King, Noise & Vibration Worldwide 47 (2016): Smartphone microphone
 *   accuracy survey; flagships within ±3 dB, mid-range Android ±5–15 dB.
 * - Zuckerwar et al. (2006): MEMS microphone frequency response variation.
 * - IEC 61672-1:2013 Class 2 tolerance: ±1.5 dB at 1 kHz (reference context).
 *
 * These are UNCERTAINTY RANGES, not correction offsets. They inform the dossier's
 * measurement uncertainty statement. Actual calibration still requires a reference source.
 */

export interface DeviceProfile {
  label: string;
  typicalUncertaintyDb: string;   // e.g. "±3 dB"
  note: string;
  source: string;
  canMeetClass2: boolean;         // whether calibrated readings can plausibly meet IEC 61672 Class 2 (±1.5 dB at 1 kHz)
}

// Ordered from most-specific match to least. The first rule whose `test` regex
// matches navigator.userAgent (case-insensitive) wins.
const DEVICE_RULES: Array<{ test: RegExp; profile: DeviceProfile }> = [
  {
    test: /iphone os 1[6-9]|iphone os [2-9]\d/i,
    profile: {
      label: "iPhone (iOS 16+)",
      typicalUncertaintyDb: "±2–3 dB",
      note: "Recent iPhones use hardware-compensated MEMS microphones. When calibrated against a known reference, accuracy within ±2 dB is achievable under controlled conditions.",
      source: "Kardous & Shaw (2014); manufacturer specification",
      canMeetClass2: true,
    },
  },
  {
    test: /iphone os 1[2-5]/i,
    profile: {
      label: "iPhone (iOS 12–15)",
      typicalUncertaintyDb: "±2–4 dB",
      note: "iPhones from this era measured within ±2–4 dB in multiple independent studies when using a quality measurement application.",
      source: "Kardous & Shaw (2014); Murphy & King (2016)",
      canMeetClass2: true,
    },
  },
  {
    test: /iphone/i,
    profile: {
      label: "iPhone (iOS < 12)",
      typicalUncertaintyDb: "±3–6 dB",
      note: "Older iPhones show higher variation, particularly at low frequencies and high SPL. Calibration strongly recommended.",
      source: "Kardous & Shaw (2014)",
      canMeetClass2: false,
    },
  },
  {
    test: /pixel [6-9]|pixel [1-9]\d/i,
    profile: {
      label: "Google Pixel 6+",
      typicalUncertaintyDb: "±3–4 dB",
      note: "Pixel 6+ devices use a dual-microphone array; SPL measurement uses the primary microphone. Performance is competitive with iPhone-class devices when calibrated.",
      source: "Murphy & King (2016); community testing (NoiseCapture project)",
      canMeetClass2: true,
    },
  },
  {
    test: /pixel [2-5]/i,
    profile: {
      label: "Google Pixel 2–5",
      typicalUncertaintyDb: "±4–6 dB",
      note: "Moderate uncertainty. Calibration against a reference source reduces error significantly.",
      source: "Murphy & King (2016)",
      canMeetClass2: false,
    },
  },
  {
    test: /sm-s9\d\d|sm-s8\d\d|sm-s7\d\d/i,
    profile: {
      label: "Samsung Galaxy S7–S9x",
      typicalUncertaintyDb: "±4–8 dB",
      note: "Samsung mid-to-high range. Significant variation across submodels. Calibration is essential for evidentiary use.",
      source: "Murphy & King (2016); NoiseCapture community device database",
      canMeetClass2: false,
    },
  },
  {
    test: /sm-s[0-9a-z]+/i,
    profile: {
      label: "Samsung Galaxy S series",
      typicalUncertaintyDb: "±4–10 dB",
      note: "Samsung devices vary considerably by model and firmware. Without calibration, treat readings as indicative only.",
      source: "Murphy & King (2016)",
      canMeetClass2: false,
    },
  },
  {
    test: /android/i,
    profile: {
      label: "Android device (unidentified)",
      typicalUncertaintyDb: "±5–15 dB",
      note: "Android microphone hardware varies widely. Mid-range and budget devices may differ from a calibrated reference by 10–15 dB. Calibration against a known source is strongly recommended before filing any dossier.",
      source: "Murphy & King (2016); Zuckerwar et al. (2006)",
      canMeetClass2: false,
    },
  },
  {
    test: /.*/,
    profile: {
      label: "Unknown device",
      typicalUncertaintyDb: "±10 dB",
      note: "Device class could not be determined. Without calibration, assume ±10 dB uncertainty. Readings support pattern identification but not absolute SPL claims.",
      source: "IEC 61672-1:2013 Class 2 context; general MEMS microphone literature",
      canMeetClass2: false,
    },
  },
];

export function getDeviceProfile(): DeviceProfile {
  if (typeof navigator === "undefined") return DEVICE_RULES[DEVICE_RULES.length - 1].profile;
  const ua = navigator.userAgent;
  for (const { test, profile } of DEVICE_RULES) {
    if (test.test(ua)) return profile;
  }
  return DEVICE_RULES[DEVICE_RULES.length - 1].profile;
}

/**
 * Returns the measurement uncertainty string to embed in legal/evidentiary documents.
 * Uses the calibration offset to determine whether calibration was applied.
 */
export function uncertaintyStatement(calibrationOffset: number, deviceProfile?: DeviceProfile): string {
  const profile = deviceProfile ?? getDeviceProfile();
  if (calibrationOffset !== 0) {
    return `±3 dB (95% confidence) — calibration offset ${calibrationOffset > 0 ? "+" : ""}${calibrationOffset} dB applied. Device class: ${profile.label} (typical uncalibrated uncertainty ${profile.typicalUncertaintyDb}).`;
  }
  return `${profile.typicalUncertaintyDb} — no calibration applied. Device class: ${profile.label}. Readings support pattern identification and threshold-exceedance documentation; for absolute SPL claims, calibration against a certified reference is required (IEC 61672-1:2013).`;
}
