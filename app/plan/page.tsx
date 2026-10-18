"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame, Lightbulb, Moon } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import { chipCls, inlineIcon, inputCls, primaryBtn } from "@/components/styles";
import { getSavedNickname } from "@/lib/local";
import { EXPERIENCES, GOALS, type Plan } from "@/lib/plan";

type Result = { plan: Plan; week: string; found: boolean; nickname: string };

export default function PlanPage() {
  const nickRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (nickRef.current && !nickRef.current.value) nickRef.current.value = getSavedNickname();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setErrors({});
    setResult(null); // never show an old plan next to a new error
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setErrors(data.errors ?? { form: "Something went wrong." });
      setResult(data);
      requestAnimationFrame(() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" }));
    } catch {
      setErrors({ form: "No connection. Check your internet and try again." });
    } finally {
      setBusy(false);
    }
  }

  const err = (name: string) => errors[name] && <p role="alert" className="mt-1 text-sm text-danger">{errors[name]}</p>;
  const radios = (name: string, options: Record<string, string>) => (
    <div className="mt-1 flex gap-2">
      {Object.entries(options).map(([value, label]) => (
        <label key={value} className={chipCls}>
          <input type="radio" name={name} value={value} required className="sr-only" />
          {label}
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl uppercase">My weekly plan</h1>
        <p className="mt-1 text-sm text-muted">A safe, simple plan for this week. Enter your nickname to adjust it to your recent runs.</p>
      </div>
      <Disclaimer />

      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium">Nickname <span className="text-muted">(optional)</span></span>
          <input ref={nickRef} name="nickname" maxLength={20} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Leave blank for a starter plan" className={inputCls} />
          {err("nickname")}
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Where are you now?</legend>
          {radios("experience", EXPERIENCES)}
          {err("experience")}
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">Days per week you can run</legend>
          {radios("days", { 2: "2 days", 3: "3 days", 4: "4 days" })}
          {err("days")}
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">Your goal</legend>
          {radios("goal", GOALS)}
          {err("goal")}
        </fieldset>
        {err("form")}
        <button disabled={busy} className={`w-full py-3.5 ${primaryBtn}`}>{busy ? "Building…" : "Build my plan"}</button>
      </form>

      {result && <PlanView r={result} />}
    </div>
  );
}

function PlanView({ r }: { r: Result }) {
  const { plan } = r;
  return (
    <section id="plan" className="scroll-mt-20 space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="display text-3xl uppercase leading-none">This week</h2>
        <p className="text-right">
          <span className="display swoosh text-3xl leading-none">{plan.totalMinutes}</span>
          <span className="block text-[11px] text-muted">min · {r.week}</span>
        </p>
      </div>
      {r.nickname && !r.found && (
        <p className="text-sm">No runs found for “{r.nickname}” yet, so here&apos;s a starter plan.</p>
      )}
      <p className="rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed shadow-card">
        <Lightbulb aria-hidden className={`${inlineIcon} mr-1 text-accent-ink`} />
        {plan.explanation}
      </p>
      {/* Run days are big dark cards ("1 MONDAY"), rest days stay quiet. */}
      <ol className="space-y-2">
        {plan.sessions.map((s, i) =>
          s.rest ? (
            <li key={s.date} className="flex gap-3 px-4 py-2 text-sm text-muted">
              <span className="w-10 font-semibold uppercase">{s.day}</span>
              <Moon aria-hidden className={inlineIcon} /> {s.detail}
            </li>
          ) : (
            <li key={s.date} className="hero surface-dark flex items-center gap-4 rounded-2xl p-4 ring-1 ring-line">
              <span className="display text-5xl leading-none text-accent">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="display block text-lg uppercase">
                  {s.day}
                  {s.long && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle font-sans text-[10px] font-semibold not-italic text-on-accent">LONGER RUN</span>}
                </span>
                <span className="block text-sm text-muted">{s.detail}</span>
              </span>
              <span className="display text-2xl">{s.minutes}′</span>
            </li>
          ),
        )}
      </ol>
      <Link href="/warmup" className={`block py-3.5 text-center ${primaryBtn}`}><Flame aria-hidden className="mr-1 inline size-5 align-[-4px]" /> Warm up before each run</Link>
      <p className="text-xs text-muted">Log each run so next week&apos;s plan can adapt. Feeling pain (not just tiredness)? Rest and skip the session.</p>
    </section>
  );
}
