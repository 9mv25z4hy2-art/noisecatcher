"use client";

// ── MeterGauge — TE field series-inspired SVG VU meter ──────────────
// Arc geometry: 270° sweep (135° → 45° clockwise through top)
// cx=120, cy=130, r=90 inside a 240×210 viewBox

const CX = 120;
const CY = 130;
const R = 90;
const START_ANGLE = 135;   // 0 dB
const TOTAL_SWEEP = 270;   // degrees
// Arc length: (270/360) × 2π × 90
const ARC_LEN = (TOTAL_SWEEP / 360) * 2 * Math.PI * R; // ≈ 424.1

// Threshold colors
const C = {
  safe:      "#22c55e",
  caution:   "#eab308",
  dangerous: "#f97316",
  critical:  "#ef4444",
  extreme:   "#7c3aed",
};

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function polar(angleDeg: number, r: number = R) {
  return {
    x: CX + r * Math.cos(toRad(angleDeg)),
    y: CY + r * Math.sin(toRad(angleDeg)),
  };
}

function dbToAngle(db: number): number {
  return START_ANGLE + (Math.min(Math.max(db, 0), 120) / 120) * TOTAL_SWEEP;
}

// Full arc path from 0 dB to 120 dB (270° clockwise)
function fullArcD(): string {
  const s = polar(START_ANGLE);
  const e = polar(START_ANGLE + TOTAL_SWEEP); // 405° mod 360 = 45°
  // large-arc=1, sweep=1 (clockwise in SVG)
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 1 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

function dashOffset(db: number): number {
  if (db <= 0) return ARC_LEN;
  return ARC_LEN * (1 - Math.min(db, 120) / 120);
}

function thresholdColor(db: number): string {
  if (db >= 120) return C.extreme;
  if (db >= 85) return C.critical;
  if (db >= 70) return C.dangerous;
  if (db >= 55) return C.caution;
  return C.safe;
}

// Tick marks: major at thresholds, minor every 10 dB
const TICKS: { db: number; major: boolean; color: string }[] = [
  { db: 0,   major: true,  color: C.safe },
  { db: 10,  major: false, color: "" },
  { db: 20,  major: false, color: "" },
  { db: 30,  major: false, color: "" },
  { db: 40,  major: false, color: "" },
  { db: 50,  major: false, color: "" },
  { db: 55,  major: true,  color: C.caution },
  { db: 60,  major: false, color: "" },
  { db: 70,  major: true,  color: C.dangerous },
  { db: 80,  major: false, color: "" },
  { db: 85,  major: true,  color: C.critical },
  { db: 90,  major: false, color: "" },
  { db: 100, major: false, color: "" },
  { db: 110, major: false, color: "" },
  { db: 120, major: true,  color: C.extreme },
];

// Short label at each major threshold
// Only label the threshold boundaries — 0 and 120 are shown at the base
const LABELS: { db: number; text: string }[] = [
  { db: 55,  text: "55" },
  { db: 70,  text: "70" },
  { db: 85,  text: "85" },
];

interface Props {
  db: number | null;
  isActive: boolean;
  isLevel?: boolean;
  labelSafe?: string;
  labelCaution?: string;
  labelDangerous?: string;
  labelCritical?: string;
  labelExtreme?: string;
  labelInactive?: string;
  labelLevel?: string;
}

export default function MeterGauge({
  db, isActive, isLevel = false,
  labelSafe = "Safe",
  labelCaution = "Caution",
  labelDangerous = "Dangerous",
  labelCritical = "Critical",
  labelExtreme = "Extreme",
  labelInactive = "INACTIVE",
  labelLevel = "● LEVEL",
}: Props) {
  const arcD = fullArcD();
  const value = db ?? 0;
  const color = isActive && db !== null ? thresholdColor(value) : "var(--nc-text-3)";
  const offset = isActive && db !== null ? dashOffset(value) : ARC_LEN;

  // Indicator dot position
  const dotAngle = isActive && db !== null ? dbToAngle(value) : START_ANGLE;
  const dot = polar(dotAngle);

  const displayDb = db !== null ? Math.round(db) : null;
  const thresholdLabel = db !== null
    ? (db >= 120 ? labelExtreme : db >= 85 ? labelCritical : db >= 70 ? labelDangerous : db >= 55 ? labelCaution : labelSafe)
    : null;

  return (
    <svg
      viewBox="0 0 240 210"
      width="240"
      height="210"
      role="img"
      aria-label={`Noise level${db !== null ? `: ${Math.round(db)} dB(A)` : ": inactive"}`}
      className="w-full max-w-[280px] meter-gauge"
    >
      {/* ── Background track ── */}
      <path
        d={arcD}
        fill="none"
        style={{ stroke: "var(--nc-border-mid)" }}
        strokeWidth="6"
        strokeLinecap="butt"
        className="meter-track"
      />

      {/* ── Value arc (animated via dashoffset) ── */}
      <path
        d={arcD}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="butt"
        strokeDasharray={`${ARC_LEN} ${ARC_LEN}`}
        strokeDashoffset={offset}
        className="meter-value"
      />

      {/* ── Tick marks ── */}
      {TICKS.map(({ db: tDb, major, color: tc }) => {
        const angle = dbToAngle(tDb);
        const outer = polar(angle, R);
        const inner = polar(angle, major ? R - 13 : R - 7);
        return (
          <line
            key={tDb}
            x1={outer.x.toFixed(2)} y1={outer.y.toFixed(2)}
            x2={inner.x.toFixed(2)} y2={inner.y.toFixed(2)}
            style={{ stroke: major && tc ? tc : "var(--nc-border-mid)" }}
            strokeWidth={major ? 1.5 : 0.75}
          />
        );
      })}

      {/* ── Threshold labels ── */}
      {LABELS.map(({ db: lDb, text }) => {
        const angle = dbToAngle(lDb);
        const pos = polar(angle, R - 24);
        return (
          <text
            key={lDb}
            x={pos.x.toFixed(2)}
            y={pos.y.toFixed(2)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fontFamily="var(--font-display)"
            style={{ fill: "var(--nc-text-3)" }}
            letterSpacing="0"
          >
            {text}
          </text>
        );
      })}

      {/* ── Indicator dot at current value ── */}
      {isActive && db !== null && (
        <circle
          cx={dot.x.toFixed(2)}
          cy={dot.y.toFixed(2)}
          r="5"
          fill={color}
          className="meter-dot"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}

      {/* ── Centre readout ── */}
      {displayDb !== null ? (
        <>
          <text
            x={CX}
            y={CY - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="52"
            fontWeight="700"
            fontFamily="var(--font-display)"
            fill={color}
            letterSpacing="-1"
          >
            {displayDb}
          </text>
          <text
            x={CX}
            y={CY + 22}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontFamily="var(--font-display)"
            style={{ fill: "var(--nc-text-2)" }}
            letterSpacing="2"
          >
            dB(A)
          </text>
          {thresholdLabel && (
            <text
              x={CX}
              y={CY + 38}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9"
              fontWeight="600"
              fontFamily="var(--font-display)"
              fill={color}
              letterSpacing="3"
            >
              {thresholdLabel.toUpperCase()}
            </text>
          )}
        </>
      ) : (
        <>
          <text
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fontFamily="var(--font-display)"
            style={{ fill: "var(--nc-text-3)" }}
            letterSpacing="3"
          >
            {labelInactive.toUpperCase()}
          </text>
          <text
            x={CX}
            y={CY + 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontFamily="var(--font-display)"
            style={{ fill: "var(--nc-text-3)" }}
            letterSpacing="2"
          >
            dB(A)
          </text>
        </>
      )}

      {/* ── Level indicator ── */}
      {isActive && isLevel && (
        <text
          x={CX}
          y="200"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
          fontFamily="var(--font-display)"
          style={{ fill: "#22c55e" }}
          letterSpacing="3"
        >
          {labelLevel}
        </text>
      )}

      {/* ── Scale labels at base ── */}
      <text x="44" y="198" textAnchor="middle" fontSize="8"
        fontFamily="var(--font-display)" style={{ fill: "var(--nc-text-3)" }} letterSpacing="1">0</text>
      <text x="196" y="198" textAnchor="middle" fontSize="8"
        fontFamily="var(--font-display)" style={{ fill: "var(--nc-text-3)" }} letterSpacing="1">120</text>
    </svg>
  );
}
