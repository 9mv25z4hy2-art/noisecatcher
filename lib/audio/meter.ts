// Noisecatcher — Audio Meter Engine
// Measures indicative dB(A) from the device microphone via Web Audio API.
// A-weighting is applied in the frequency domain (IEC 61672-1:2013 formula)
// to all FFT bins before summing to a single level. Microphone sensitivity
// and frequency response vary by device; calibrate against a certified SLM.

export interface MeterReading {
  db: number;
  timestamp: number;
}

/** All metrics emitted on every animation-frame tick. */
export interface ExtendedMeterReading {
  /** A-weighted level (indicative dBA). Primary display metric. */
  dba: number;
  /** Unweighted level (dBZ). Captures full spectrum including LF industrial noise. */
  dbz: number;
  /** C-weighted level (dBC). Retains low-frequency energy down to ~16 Hz. */
  dbc: number;
  /**
   * Normalized Difference Soundscape Index. Ratio of biophony (2–8 kHz) to
   * anthrophony (200 Hz–2 kHz) energy: (bio − anthro) / (bio + anthro).
   * Range: −1 (fully anthropogenic) to +1 (fully biological).
   * null when total band energy is below the noise floor.
   */
  ndsi: number | null;
}

export interface MeterSession {
  readings: MeterReading[];
  peak: number;
  average: number;
  startTime: number;
}

/**
 * A-weighting correction in dB for frequency f (Hz), normalised to 0 dB at
 * 1 kHz per IEC 61672-1:2013.  Returns −70 for f ≤ 0 (below audible range).
 *
 * Formula:  RA(f) = (f4² · f⁴) / [(f²+f1²) · √((f²+f2²)(f²+f3²)) · (f²+f4²)]
 *           A(f)  = 20·log10(RA(f)) + 2.00   (+2.00 normalises to 0 dB at 1 kHz)
 *
 * Pole frequencies (Hz): f1=20.598997, f2=107.65265, f3=737.86223, f4=12194.217
 */
function aWeightingDB(f: number): number {
  if (f <= 0) return -70;
  const f2 = f * f;
  const c1 = 12194.217 * 12194.217;
  const c2 = 20.598997 * 20.598997;
  const c3 = 107.65265 * 107.65265;
  const c4 = 737.86223 * 737.86223;
  const num = c1 * f2 * f2;
  const den = (f2 + c2) * Math.sqrt((f2 + c3) * (f2 + c4)) * (f2 + c1);
  return den > 0 ? 20 * Math.log10(num / den) + 2.0 : -70;
}

/**
 * C-weighting correction in dB for frequency f (Hz), normalised to 0 dB at
 * 1 kHz per IEC 61672-1:2013.  Returns −70 for f ≤ 0.
 *
 * Formula:  RC(f) = (f4² · f²) / [(f²+f1²) · (f²+f4²)]
 *           C(f)  = 20·log10(RC(f)) + 0.06   (+0.06 normalises to 0 dB at 1 kHz)
 *
 * C-weighting retains energy down to ~16 Hz — suitable for LF industrial noise
 * documentation where A-weighting would suppress the relevant frequencies.
 */
function cWeightingDB(f: number): number {
  if (f <= 0) return -70;
  const f2 = f * f;
  const c1 = 12194.217 * 12194.217;
  const c2 = 20.598997 * 20.598997;
  const num = c1 * f2;
  const den = (f2 + c2) * (f2 + c1);
  return den > 0 ? 20 * Math.log10(num / den) + 0.06 : -70;
}

export class NoiseMeter {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private gainDb = 0;

  // Frequency-domain buffers — allocated once per start() call.
  private freqData: Float32Array<ArrayBuffer> | null = null;
  // Per-bin linear weighting gains, precomputed from sample rate + fftSize.
  private aWeights: Float32Array | null = null;
  private cWeights: Float32Array | null = null;
  // NDSI band boundaries (bin indices), set in buildAWeights.
  private ndsiAnthroStart = 0;  // 200 Hz
  private ndsiAnthroEnd = 0;    // 2000 Hz
  private ndsiBioStart = 0;     // 2000 Hz
  private ndsiBioEnd = 0;       // 8000 Hz

  private onReading: (reading: ExtendedMeterReading) => void;
  private onError: (error: string) => void;

  constructor(
    onReading: (reading: ExtendedMeterReading) => void,
    onError: (error: string) => void
  ) {
    this.onReading = onReading;
    this.onError = onError;
  }

  /** Precompute per-bin weighting gains and NDSI band indices. */
  private buildAWeights(): void {
    if (!this.analyser || !this.audioContext) return;
    const bins = this.analyser.frequencyBinCount;
    const nyquist = this.audioContext.sampleRate / 2;
    this.freqData = new Float32Array(bins) as Float32Array<ArrayBuffer>;
    this.aWeights = new Float32Array(bins);
    this.cWeights = new Float32Array(bins);
    for (let i = 0; i < bins; i++) {
      const f = (i / bins) * nyquist;
      this.aWeights[i] = Math.pow(10, aWeightingDB(f) / 10);
      this.cWeights[i] = Math.pow(10, cWeightingDB(f) / 10);
    }
    // NDSI band indices: anthrophony 200–2000 Hz, biophony 2000–8000 Hz.
    const hzPerBin = nyquist / bins;
    this.ndsiAnthroStart = Math.max(1, Math.round(200 / hzPerBin));
    this.ndsiAnthroEnd   = Math.round(2000 / hzPerBin);
    this.ndsiBioStart    = this.ndsiAnthroEnd;
    this.ndsiBioEnd      = Math.min(bins - 1, Math.round(8000 / hzPerBin));
  }

  async start(deviceId?: string): Promise<void> {
    try {
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      };
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = Math.pow(10, this.gainDb / 20);

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      this.buildAWeights();
      this.measure();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          this.onError(
            "Microphone access denied. Please allow microphone access in your browser settings to use Noisecatcher."
          );
        } else if (err.name === "NotFoundError") {
          this.onError(
            "No microphone found on this device. Please connect a microphone and try again."
          );
        } else {
          this.onError(`Could not access microphone: ${err.message}`);
        }
      }
      throw err; // re-throw so callers can skip post-start logic
    }
  }

  private measure(): void {
    if (!this.analyser || !this.freqData || !this.aWeights || !this.cWeights) return;

    this.analyser.getFloatFrequencyData(this.freqData);

    const bins = this.freqData.length;
    let aSum = 0, cSum = 0, zSum = 0;
    let anthro = 0, bio = 0;

    for (let i = 1; i < bins; i++) {
      const power = Math.pow(10, this.freqData[i] / 10);
      aSum += power * this.aWeights[i];
      cSum += power * this.cWeights[i];
      zSum += power;
      // NDSI bands (unweighted energy).
      if (i >= this.ndsiAnthroStart && i < this.ndsiAnthroEnd) anthro += power;
      if (i >= this.ndsiBioStart    && i <= this.ndsiBioEnd)   bio    += power;
    }

    // Convert sums to indicative dB with the same +90 full-scale anchor.
    const toDb = (sum: number) =>
      Math.round(Math.max(0, Math.min(140, (sum > 0 ? 10 * Math.log10(sum / (bins - 1)) + 90 : 0))) * 10) / 10;

    const dba = toDb(aSum);
    const dbc = toDb(cSum);
    const dbz = toDb(zSum);

    // NDSI: suppress when total band energy is very low (silence / noise floor).
    const bandTotal = anthro + bio;
    const NDSI_MIN_POWER = 1e-8;
    const ndsi = bandTotal > NDSI_MIN_POWER
      ? Math.round(((bio - anthro) / bandTotal) * 100) / 100
      : null;

    this.onReading({ dba, dbc, dbz, ndsi });
    this.animationFrame = requestAnimationFrame(() => this.measure());
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.analyser = null;
    this.freqData = null;
    this.aWeights = null;
    this.cWeights = null;
  }

  isActive(): boolean {
    return this.audioContext !== null;
  }

  /** Set software gain in dB. Range: −12 to +24. Applied immediately if active. */
  setGain(db: number): void {
    this.gainDb = Math.max(-12, Math.min(24, db));
    if (this.gainNode) {
      this.gainNode.gain.value = Math.pow(10, this.gainDb / 20);
    }
  }

  getGain(): number {
    return this.gainDb;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}

/**
 * Returns the list of available audio input devices (microphones).
 * Requires microphone permission to be granted first — call after the first
 * successful `getUserMedia` so the browser exposes device labels.
 */
export async function listAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => {
      if (d.kind !== "audioinput") return false;
      // Exclude Bluetooth earbuds and headsets — their noise-cancellation and
      // beam-forming processing invalidates environmental noise measurements.
      const label = d.label.toLowerCase();
      return !/airpod|earbud|headphone|headset|buds|bluetooth|bose|sony wf|jabra|beats|galaxy buds|pixel buds/i.test(label);
    });
  } catch {
    return [];
  }
}
