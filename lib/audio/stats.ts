// Acoustic statistical metrics computed from a dB(A) readings array.
// Leq = equivalent continuous sound level (energy average)
// Lmax = peak level observed
// L10/L50/L90 = level exceeded N% of the time (percentile descriptors)

export interface SessionStats {
  leq: number;
  lmax: number;
  l10: number;
  l50: number;
  l90: number;
}

export function leq(values: number[]): number {
  if (!values.length) return 0;
  return 10 * Math.log10(values.reduce((acc, v) => acc + Math.pow(10, v / 10), 0) / values.length);
}

export function computeStats(readings: number[]): SessionStats | null {
  if (readings.length < 2) return null;
  const n = readings.length;
  const sorted = [...readings].sort((a, b) => b - a); // descending
  const energySum = readings.reduce((sum, db) => sum + Math.pow(10, db / 10), 0);
  const leq = 10 * Math.log10(energySum / n);
  return {
    leq:  Math.round(leq * 10) / 10,
    lmax: sorted[0],
    l10:  sorted[Math.floor(n * 0.1)],
    l50:  sorted[Math.floor(n * 0.5)],
    l90:  sorted[Math.floor(n * 0.9)],
  };
}
