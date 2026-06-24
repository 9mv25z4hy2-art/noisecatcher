export type ThresholdLevel = "safe" | "caution" | "dangerous" | "critical" | "extreme";

export interface Threshold {
  level: ThresholdLevel;
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  shortDescription: string;
  healthAlert: string;
  exposure: string;
  vulnerable: string;
}

export const THRESHOLDS: Threshold[] = [
  {
    level: "safe",
    label: "Safe",
    min: 0,
    max: 54,
    color: "#22c55e",
    bgColor: "bg-green-500",
    borderColor: "border-green-400",
    textColor: "text-green-400",
    shortDescription: "Ambient noise — no health risk.",
    healthAlert: "Current noise levels are within safe limits. No action needed.",
    exposure: "Equivalent to a quiet library or calm residential area at night.",
    vulnerable: "Safe for all populations including children and the elderly.",
  },
  {
    level: "caution",
    label: "Caution",
    min: 55,
    max: 69,
    color: "#eab308",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-400",
    shortDescription: "Elevated noise — caution with prolonged exposure.",
    healthAlert:
      "Prolonged exposure above 55 dB(A) is associated with sleep disturbance and cardiovascular stress. The WHO recommends keeping average environmental noise below 53 dB(A) during daytime.",
    exposure: "Equivalent to a busy office, conversation at close range, or city traffic at a distance.",
    vulnerable:
      "Children in this range may experience disrupted concentration and learning. Sensitive individuals should limit continuous exposure.",
  },
  {
    level: "dangerous",
    label: "Dangerous",
    min: 70,
    max: 84,
    color: "#f97316",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-400",
    textColor: "text-orange-400",
    shortDescription: "Harmful noise — limit exposure duration.",
    healthAlert:
      "Exposure above 70 dB(A) over time causes measurable cardiovascular harm. Above 75 dB(A) for 8+ hours daily increases the risk of hypertension and ischemic heart disease. Noise at this level activates the body's stress response even during sleep.",
    exposure: "Equivalent to heavy traffic, a busy restaurant, or a vacuum cleaner at close range.",
    vulnerable:
      "Children exposed chronically at this level show impaired reading, memory, and attention. Pregnant individuals face elevated risk of premature birth. The elderly are more susceptible to cardiovascular effects.",
  },
  {
    level: "critical",
    label: "Critical",
    min: 85,
    max: 119,
    color: "#ef4444",
    bgColor: "bg-red-500",
    borderColor: "border-red-400",
    textColor: "text-red-400",
    shortDescription: "Immediate risk — leave or protect your hearing.",
    healthAlert:
      "Above 85 dB(A), hearing damage begins with prolonged exposure (NIOSH REL: 8 h limit). At 100 dB(A), safe exposure drops to ~15 minutes. Chronic exposure causes irreversible sensorineural hearing loss, tinnitus, severe cardiovascular strain, and documented psychological trauma. OSHA mandates hearing protection above 85 dB in workplaces. Many people have no such protection in daily life.",
    exposure:
      "Equivalent to a lawnmower, heavy machinery, nightclub interiors, or proximity to traffic infrastructure.",
    vulnerable:
      "Children face permanent hearing damage faster than adults. Residents near airports, highways, and industrial zones — disproportionately low-income communities — bear the greatest burden of this exposure without recourse.",
  },
  {
    level: "extreme",
    label: "Extreme",
    min: 120,
    max: 200,
    color: "#7c3aed",
    bgColor: "bg-violet-700",
    borderColor: "border-violet-500",
    textColor: "text-violet-400",
    shortDescription: "Acoustic trauma zone — acute hearing damage from a single exposure.",
    healthAlert:
      "120 dB(A) is the threshold of pain. A single brief exposure above 120 dB(A) can cause acute acoustic trauma — immediate, irreversible sensorineural hearing loss and tinnitus. At 130–140 dB(A) (gunshots, jet engines at close range) the risk of permanent hearing loss is near-certain without protection. Above 150 dB(A), eardrum rupture is possible. There is NO safe exposure duration at this level.",
    exposure:
      "Rock concerts near speakers, ambulance sirens at close range, pneumatic drills (< 1 m), gunshots, jet engine runups. Above 130 dB: explosions, airbag deployment, firearms without hearing protection.",
    vulnerable:
      "Everyone is at risk. A single unprotected exposure can cause lifelong hearing loss. Children's auditory systems are more susceptible. Workers in demolition, military, mining, and aviation face disproportionate risk.",
  },
];

export function getThreshold(db: number): Threshold {
  return (
    THRESHOLDS.find((t) => db >= t.min && db <= t.max) ?? THRESHOLDS[0]
  );
}
