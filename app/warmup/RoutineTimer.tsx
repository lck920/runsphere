"use client";
// Step-by-step timer with a voice guide. Uses only built-in browser features:
// speechSynthesis (voice), vibrate (buzz on each new step) and wakeLock (keep the screen on).
// All are optional; the timer works fine without them (e.g. in Instagram's in-app browser).
import { useEffect, useState } from "react";
import { CircleCheck, SkipBack, SkipForward, Volume2 } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { primaryBtn } from "@/components/styles";
import { COOLDOWN, WARMUP, type Step } from "@/data/warmup";

const ROUTINES = { warmup: { label: "Warm-up", steps: WARMUP }, cooldown: { label: "Cool-down", steps: COOLDOWN } };
type RoutineKey = keyof typeof ROUTINES;

function speak(text: string) {
  try {
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  } catch {}
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const total = (steps: Step[]) => steps.reduce((a, s) => a + s.seconds, 0);

export default function RoutineTimer() {
  const [routine, setRoutine] = useState<RoutineKey>("warmup");
  const steps = ROUTINES[routine].steps;
  const [pos, setPos] = useState({ idx: 0, left: steps[0].seconds });
  const [running, setRunning] = useState(false);
  const [voice, setVoice] = useState(true);
  const step = steps[pos.idx] as Step | undefined;
  const done = !step;

  // Tick once a second; when a step hits 0, move to the next one.
  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(
      () => setPos((p) => (p.left > 1 ? { ...p, left: p.left - 1 } : { idx: p.idx + 1, left: steps[p.idx + 1]?.seconds ?? 0 })),
      1000,
    );
    return () => clearInterval(t);
  }, [running, done, steps]);

  // Voice guide: announce each step, "switch sides" halfway, and what's next at 3 s left.
  useEffect(() => {
    if (!running) return;
    if (!step) {
      if (voice) speak(`${ROUTINES[routine].label} done. Great work!`);
      return;
    }
    if (pos.left === step.seconds) navigator.vibrate?.(150);
    if (!voice) return;
    const next = steps[pos.idx + 1];
    if (pos.left === step.seconds) speak(`${step.name}. ${step.cue}`);
    else if (/switch/i.test(step.cue) && pos.left === Math.floor(step.seconds / 2)) speak("Switch sides");
    else if (pos.left === 3 && next) speak(`Next: ${next.name}`);
  }, [pos, running, voice, step, steps, routine]);

  // Keep the screen awake while the timer runs.
  useEffect(() => {
    if (!running || done) return;
    let lock: WakeLockSentinel | undefined;
    navigator.wakeLock?.request("screen").then((l) => (lock = l), () => {});
    return () => void lock?.release().catch(() => {});
  }, [running, done]);

  const reset = (key = routine) => {
    setRoutine(key);
    setRunning(false);
    setPos({ idx: 0, left: ROUTINES[key].steps[0].seconds });
    try { speechSynthesis.cancel(); } catch {}
  };
  const jump = (idx: number) => setPos({ idx, left: steps[idx].seconds });
  const toggle = () => {
    if (!running) speak(""); // iOS only allows speech that starts from a tap; this "unlocks" it
    setRunning((r) => !r);
  };

  const remaining = done ? 0 : pos.left + total(steps.slice(pos.idx + 1));

  return (
    <div className="space-y-4">
      <div role="tablist" className="grid grid-cols-2 rounded-full border border-line bg-card p-1 shadow-card">
        {(Object.keys(ROUTINES) as RoutineKey[]).map((k) => (
          <button key={k} role="tab" aria-selected={k === routine} onClick={() => reset(k)}
            className={`rounded-full py-2 text-sm display uppercase ${k === routine ? "bg-accent text-on-accent" : "text-muted"}`}>
            {ROUTINES[k].label} · {Math.round(total(ROUTINES[k].steps) / 60)} min
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-card p-6 text-center shadow-card" aria-live="polite">
        {done ? (
          <>
            <CircleCheck aria-hidden className="mx-auto size-14 text-accent-ink" />
            <p className="display mt-3 text-2xl uppercase">{ROUTINES[routine].label} done!</p>
            <p className="mt-1 text-sm text-muted">{routine === "warmup" ? "Go enjoy your run. Start easy." : "Remember to log your run."}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-muted">Step {pos.idx + 1} of {steps.length}</p>
            <p className="display mt-2 text-2xl uppercase">{step.name}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{step.cue}</p>
            <p className="display mt-4 text-8xl leading-none tabular-nums">{mmss(pos.left)}</p>
            <div className="mt-4">
              <ProgressBar pct={Math.round(100 * (1 - pos.left / step.seconds))} label="Step progress" />
            </div>
            <p className="mt-2 text-xs text-muted">{mmss(remaining)} left in total</p>
          </>
        )}
      </div>

      {/* Run-app style controls: outline circle, big lime circle, black circle. */}
      <div className="flex items-center justify-center gap-5">
        <button onClick={() => jump(Math.max(0, pos.idx - 1))} disabled={done || pos.idx === 0} aria-label="Previous step"
          className="grid size-14 place-items-center rounded-full border border-line bg-card text-lg shadow-card disabled:opacity-40"><SkipBack aria-hidden className="size-5" /></button>
        {done ? (
          <button onClick={() => reset()} className={`size-24 text-lg ${primaryBtn}`}>Restart</button>
        ) : (
          <button onClick={toggle} className={`size-24 text-lg shadow-lg ${primaryBtn}`}>{running ? "Pause" : pos.idx || pos.left < step.seconds ? "Resume" : "Start"}</button>
        )}
        <button onClick={() => jump(pos.idx + 1)} disabled={done || pos.idx === steps.length - 1} aria-label="Next step"
          className="grid size-14 place-items-center rounded-full bg-fg text-lg text-ink disabled:opacity-40"><SkipForward aria-hidden className="size-5" /></button>
      </div>

      <label className="flex items-center justify-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} className="accent-accent" />
        <Volume2 aria-hidden className="size-4" /> Voice guide
      </label>

      <ol className="space-y-1">
        {steps.map((s, i) => (
          <li key={s.name}>
            <button onClick={() => jump(i)}
              className={`flex w-full justify-between rounded-xl px-3 py-2 text-left text-sm ${i === pos.idx ? "bg-accent font-semibold text-on-accent" : i < pos.idx ? "text-muted line-through" : "text-muted"}`}>
              <span>{s.name}</span>
              <span className="tabular-nums">{mmss(s.seconds)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
