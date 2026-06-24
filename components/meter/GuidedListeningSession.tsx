"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, RotateCcw } from "lucide-react";

interface Props {
  onClose: () => void;
}

// Voegelin-framework structured listening prompts
// Drawn from: Salomé Voegelin, "Listening to Noise and Silence" (2010) &
// "The Political Possibility of Sound" (2018)
const PHASES = [
  {
    title: "Inventory",
    duration: 60,
    prompt: "List every sound you can identify — don't evaluate, just enumerate. What is the sonic inventory of this space right now?",
    field: "What sounds are present?",
  },
  {
    title: "Quality",
    duration: 90,
    prompt: "Choose one sound. Describe its texture, weight, colour, temperature — not its source. How does it feel rather than what it is?",
    field: "Describe its material quality",
  },
  {
    title: "Relation",
    duration: 90,
    prompt: "How do the sounds relate to each other? Which dominates, which recedes? Is there rhythm, conflict, silence between them?",
    field: "How do sounds relate?",
  },
  {
    title: "Body",
    duration: 60,
    prompt: "Where in your body do you feel the sounds? What physical sensation do they produce — vibration, pressure, fatigue, alertness?",
    field: "Physical / bodily response",
  },
  {
    title: "Territory",
    duration: 90,
    prompt: "Who or what claims this sonic space? Is the sound permitted, tolerated, or imposed? Does it belong here?",
    field: "Who owns this sound?",
  },
  {
    title: "Silence",
    duration: 60,
    prompt: "What is absent? What would silence mean here — relief, erasure, loss? Is silence possible or even desirable?",
    field: "What does silence mean here?",
  },
];

export default function GuidedListeningSession({ onClose }: Props) {
  const [phase, setPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState<string[]>(PHASES.map(() => ""));
  const [done, setDone] = useState(false);

  // Decrement timer — pure tick, no phase logic here
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  // Phase auto-advance — triggered when timeLeft reaches 0 while running.
  // Multiple setState calls are intentional: advancing phase resets the timer atomically.
  useEffect(() => {
    if (!running || timeLeft > 0) return;
    if (phase < PHASES.length - 1) {
      const next = phase + 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase(next);
      setTimeLeft(PHASES[next].duration);
    } else {
      setDone(true);
      setRunning(false);
    }
  }, [timeLeft, running, phase]);

  function start()  { setRunning(true); }
  function pause()  { setRunning(false); }

  function skipPhase() {
    setRunning(false);
    if (phase < PHASES.length - 1) {
      const next = phase + 1;
      setPhase(next);
      setTimeLeft(PHASES[next].duration);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setPhase(0);
    setTimeLeft(PHASES[0].duration);
    setRunning(false);
    setDone(false);
    setNotes(PHASES.map(() => ""));
  }

  function updateNote(i: number, val: string) {
    setNotes(prev => prev.map((n, idx) => idx === i ? val : n));
  }

  const progress = 1 - timeLeft / PHASES[phase].duration;
  const circumference = 2 * Math.PI * 28;
  const totalFilled = notes.filter(n => n.trim()).length;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="rounded-2xl w-full max-w-sm flex flex-col gap-0 shadow-2xl max-h-[90vh] overflow-hidden"
        style={{ background: "var(--nc-bg-panel)", border: "1px solid var(--nc-border-mid)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--nc-border)" }}>
          <div>
            <p className="font-semibold text-sm nc-text">Critical Listening</p>
            <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>Voegelin framework · 6 phases · ~8 min</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--nc-text-3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {done ? (
            <div className="p-4 flex flex-col gap-4">
              <p className="text-sm font-semibold nc-text">Session complete — {totalFilled}/{PHASES.length} phases documented</p>
              {PHASES.map((ph, i) => notes[i].trim() ? (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>{ph.title}</span>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>{notes[i]}</p>
                </div>
              ) : null)}
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
              >
                <RotateCcw className="w-3.5 h-3.5" />Start again
              </button>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-4">
              {/* Progress row */}
              <div className="flex gap-1.5">
                {PHASES.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full" style={{
                    background: i < phase ? "var(--nc-text)" : i === phase ? "var(--nc-text-2)" : "var(--nc-border)"
                  }} />
                ))}
              </div>

              {/* Timer ring + phase */}
              <div className="flex items-center gap-4">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={running ? "var(--nc-text)" : "rgba(255,255,255,0.3)"}
                    strokeWidth="3"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${circumference * (1 - progress)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                  <text x="32" y="36" textAnchor="middle" fontSize="13" fill="var(--nc-text-2)" fontFamily="var(--font-display)">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                  </text>
                </svg>
                <div>
                  <p className="text-xs font-semibold nc-text">{PHASES[phase].title}</p>
                  <p className="text-[10px]" style={{ color: "var(--nc-text-3)" }}>Phase {phase + 1} of {PHASES.length}</p>
                </div>
              </div>

              {/* Prompt */}
              <p className="text-xs leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
                {PHASES[phase].prompt}
              </p>

              {/* Note field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--nc-text-3)" }}>
                  {PHASES[phase].field}
                </label>
                <textarea
                  value={notes[phase]}
                  onChange={e => updateNote(phase, e.target.value)}
                  placeholder="Type your observations…"
                  rows={3}
                  className="nc-input rounded-lg px-3 py-2 text-xs resize-none"
                />
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                {!running ? (
                  <button
                    onClick={start}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: "var(--nc-text)", color: "var(--nc-bg)" }}
                  >
                    {timeLeft === PHASES[phase].duration ? "Start" : "Resume"}
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-2)" }}
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={skipPhase}
                  aria-label="Skip to next phase"
                  className="px-3 py-2 rounded-lg transition-colors"
                  style={{ border: "1px solid var(--nc-border-mid)", color: "var(--nc-text-3)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
