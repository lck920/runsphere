"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheck, FaceAngry, FaceGrinning, FaceNeutral, FaceSlightlyFrowning, FaceSlightlySmiling, Flame, Lock, PartyPopper } from "lucide-react";
import Icon, { type IconName } from "@/components/Icon";
import ProgressBar from "@/components/ProgressBar";
import { CHALLENGES, LEVELS } from "@/data/challenges";
import { formatPace, type ChallengeProgress } from "@/lib/stats";
import { getSavedNickname, saveNickname } from "@/lib/local";
import { LIMITS, validateRun } from "@/lib/validate";
import { addDays } from "@/lib/week";
import { chipCls as chip, inlineIcon, inputCls as input } from "@/components/styles";

const MOODS = [
  { Icon: FaceAngry, label: "Awful" },
  { Icon: FaceSlightlyFrowning, label: "Low" },
  { Icon: FaceNeutral, label: "Okay" },
  { Icon: FaceSlightlySmiling, label: "Good" },
  { Icon: FaceGrinning, label: "Great" },
];

type Result = {
  nickname: string;
  level: keyof typeof CHALLENGES;
  streak: { current: number; longest: number };
  challenge: ChallengeProgress;
  milestone: { icon: IconName; title: string; fact: string } | null;
};
export default function LogForm({ today }: { today: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const nickRef = useRef<HTMLInputElement>(null);
  const [pace, setPace] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Pre-fill the nickname remembered on this device (uncontrolled input, so no re-render needed).
  useEffect(() => {
    if (nickRef.current && !nickRef.current.value) nickRef.current.value = getSavedNickname();
  }, [result]);

  function onInput() {
    const f = new FormData(formRef.current!);
    const km = Number(f.get("distance"));
    const min = Number(f.get("duration"));
    setPace(km > 0 && min > 0 ? formatPace(min / km) : null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fields = Object.fromEntries([...fd].filter(([, v]) => typeof v === "string")) as Record<string, string>;
    const shot = fd.get("screenshot");
    const clientErrors = validateRun(fields, today).errors;
    if (shot instanceof File && shot.size > 4 * 1024 * 1024) clientErrors.screenshot = "Screenshot must be under 4 MB.";
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/runs", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) return setErrors(body.errors ?? { form: "Something went wrong." });
      saveNickname(body.nickname);
      setResult(body);
      window.scrollTo({ top: 0 });
    } catch {
      setErrors({ form: "No connection. Check your internet and try again." });
    } finally {
      setBusy(false);
    }
  }

  if (result) return <Success r={result} onAgain={() => { setResult(null); setPace(null); }} />;

  const err = (name: string) =>
    errors[name] ? <p role="alert" className="mt-1 text-sm text-danger">{errors[name]}</p> : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} onInput={onInput} noValidate className="mt-6 space-y-5">
      <label className="block">
        <span className="text-sm font-medium">Nickname</span>
        <input ref={nickRef} name="nickname" className={input} placeholder="e.g. aisyah_runs" maxLength={20}
          autoComplete="off" autoCapitalize="none" spellCheck={false} />
        {err("nickname")}
      </label>

      <label className="block">
        <span className="text-sm font-medium">Date</span>
        <input name="date" type="date" defaultValue={today} max={today} min={addDays(today, -LIMITS.daysBack)} className={input} />
        {err("date")}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Distance (km)</span>
          <input name="distance" type="number" inputMode="decimal" step="0.01" min={LIMITS.km[0]} max={LIMITS.km[1]} placeholder="3.0" className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Time (minutes)</span>
          <input name="duration" type="number" inputMode="decimal" step="0.1" min={LIMITS.minutes[0]} max={LIMITS.minutes[1]} placeholder="25" className={input} />
        </label>
      </div>
      <div className="-mt-3">
        {err("distance")}
        {err("duration")}
        <p className="mt-2 flex items-baseline gap-2 text-sm text-muted" aria-live="polite">
          <span className="display text-4xl text-fg">{pace ? `${pace.replace(":", "'")}"` : `0'00"`}</span> avg pace /km
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Challenge level</legend>
        <div className="mt-1 flex gap-2">
          {LEVELS.map((l) => (
            <label key={l} className={chip}>
              <input type="radio" name="level" value={l} className="sr-only" />
              {CHALLENGES[l].label}
            </label>
          ))}
        </div>
        {err("level")}
      </fieldset>

      {(["moodBefore", "moodAfter"] as const).map((name) => (
        <fieldset key={name}>
          <legend className="text-sm font-medium">Mood {name === "moodBefore" ? "before" : "after"} the run</legend>
          <div className="mt-1 flex gap-2">
            {MOODS.map((m, i) => (
              <label key={m.label} className={`${chip} flex flex-col items-center gap-0.5`}>
                <input type="radio" name={name} value={i + 1} className="sr-only" aria-label={`${m.label} (${i + 1} of 5)`} />
                <m.Icon aria-hidden className="size-6" />
                <span className="text-[10px] leading-none">{m.label}</span>
              </label>
            ))}
          </div>
          {err(name)}
        </fieldset>
      ))}

      <details className="rounded-xl border border-line bg-card p-3 shadow-card">
        <summary className="cursor-pointer text-sm font-medium">Add proof (optional): Strava link or screenshot</summary>
        <label className="mt-3 block">
          <span className="text-sm text-muted">Activity link</span>
          <input name="link" type="url" inputMode="url" placeholder="https://www.strava.com/activities/…" className={input} />
          {err("link")}
        </label>
        <label className="mt-3 block">
          <span className="text-sm text-muted">Screenshot (JPG/PNG/WebP, max 4 MB)</span>
          <input name="screenshot" type="file" accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-on-accent" />
          {err("screenshot")}
        </label>
      </details>

      <p className="rounded-xl border border-line p-3 text-xs text-muted">
        <Lock aria-hidden className={inlineIcon} /> <strong>Privacy:</strong> we only store your nickname and run details. No real name, email or phone number.
        Your nickname, run count, distance and streak appear on the public leaderboard. Screenshots are private, but
        crop out maps or anything showing where you live. Don&apos;t use your real name as a nickname. (PDPA 2010)
      </p>

      {err("form")}
      <button disabled={busy} className="w-full rounded-full bg-accent py-3.5 display uppercase text-on-accent disabled:opacity-60 active:scale-[.98]">
        {busy ? "Saving…" : "Save run"}
      </button>
    </form>
  );
}

function Success({ r, onAgain }: { r: Result; onAgain: () => void }) {
  const c = r.challenge;
  return (
    <div className="hero surface-dark mt-6 space-y-4 rounded-3xl p-6 text-center ring-1 ring-line">
      <PartyPopper aria-hidden className="mx-auto size-12 text-accent" />
      <h2 className="display text-3xl uppercase">Nice one, {r.nickname}!</h2>
      {r.milestone && (
        <div className="rounded-2xl bg-accent p-4 text-on-accent">
          <p className="display uppercase"><Icon name={r.milestone.icon} className="mr-1 inline size-5 align-[-4px]" /> Milestone: {r.milestone.title}!</p>
          <p className="mt-1 text-sm">{r.milestone.fact}</p>
        </div>
      )}
      <p className="text-muted">
        Streak: <span className="font-semibold text-fg">{r.streak.current} week{r.streak.current === 1 ? "" : "s"} <Flame aria-hidden className={`${inlineIcon} text-accent`} /></span>
        {" · "}Best: {r.streak.longest}
      </p>
      <div className="text-left">
        <p className="mb-1 text-sm">
          {CHALLENGES[r.level].label} challenge: {c.runs}/{c.targetRuns} runs
          {c.targetKm ? ` · ${c.km}/${c.targetKm} km` : ""} {c.complete && <CircleCheck aria-hidden className={`${inlineIcon} text-accent`} />}
        </p>
        <ProgressBar pct={c.pct} label="Weekly challenge progress" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onAgain} className="display flex-1 rounded-full border-2 border-accent py-3 uppercase">Log another</button>
        <Link href={`/leaderboard?level=${r.level}`} className="flex-1 rounded-full bg-accent py-3 display uppercase text-on-accent">Leaderboard</Link>
      </div>
    </div>
  );
}
