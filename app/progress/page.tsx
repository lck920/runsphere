"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleCheck, FaceNeutral, FaceSlightlyFrowning, FaceSlightlySmiling, Flame, Lock, MapPin } from "lucide-react";
import Icon from "@/components/Icon";
import Heatmap from "@/components/Heatmap";
import ProgressBar from "@/components/ProgressBar";
import WeeklyChart from "@/components/WeeklyChart";
import { inlineIcon, inputCls, primaryBtn } from "@/components/styles";
import { CHALLENGES } from "@/data/challenges";
import { getSavedNickname } from "@/lib/local";
import { formatPace, type ProgressSummary } from "@/lib/stats";

type Data = ProgressSummary & { nickname: string };

export default function ProgressPage() {
  const nickRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(nickname: string) {
    if (!nickname.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/progress?nickname=${encodeURIComponent(nickname)}`);
      const body = await res.json();
      if (!res.ok) {
        setData(null);
        return setError(body.error ?? "Something went wrong.");
      }
      setData(body);
    } catch {
      setError("No connection. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  // Returning visitors: fill in and load their saved nickname straight away.
  useEffect(() => {
    const saved = getSavedNickname();
    if (saved && nickRef.current) {
      nickRef.current.value = saved;
      load(saved);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl uppercase">My progress</h1>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); load(nickRef.current!.value); }}>
          <input ref={nickRef} aria-label="Nickname" placeholder="Your nickname" maxLength={20} autoComplete="off" autoCapitalize="none" spellCheck={false} className={`${inputCls} mt-0`} />
          <button disabled={busy} className={`px-5 ${primaryBtn}`}>{busy ? "…" : "Show"}</button>
        </form>
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {error} <Link href="/log" className="underline">Log a run</Link>
          </p>
        )}
      </div>

      {!data && !error && !busy && (
        <p className="rounded-2xl border border-line bg-card shadow-card p-6 text-center text-muted">Enter your nickname to see your stats, streaks and awards.</p>
      )}
      {busy && !data && <div className="h-96 animate-pulse rounded-3xl bg-card" />}
      {data && <Dashboard d={data} />}
    </div>
  );
}

function Dashboard({ d }: { d: Data }) {
  const mood = d.avgMoodChange;
  const c = d.challenge;
  const tiles = [
    { label: "Runs", value: d.runs },
    { label: "Avg pace /km", value: d.avgPace ? formatPace(d.avgPace) : "–" },
    { label: "Runs per week", value: d.runsPerWeek },
    { label: "Mood after runs", value: mood === null ? "–" : <>{mood > 0 ? "+" : ""}{mood} <MoodIcon mood={mood} /></> },
    { label: "Current streak", value: <>{d.streak.current} wk <Flame aria-hidden className="inline size-5 align-[-3px] text-accent-ink" /></> },
    { label: "Longest streak", value: `${d.streak.longest} wk` },
  ];

  return (
    <>
      {/* Hero: the big number, Bolt-style ("46,00 Kilometer"). */}
      <section className="hero surface-dark rounded-3xl p-6 ring-1 ring-line">
        <p className="text-sm text-muted">Hey {d.nickname}</p>
        <p className="display swoosh mt-2 inline-block text-6xl leading-none">{d.totalKm.toFixed(1)}</p>
        <p className="mt-2 text-sm uppercase tracking-widest text-muted">Kilometres total</p>
        <p className="mt-4 font-semibold leading-snug">
          {d.localFact ? <>That&apos;s further than <span className="text-accent-ink">{d.localFact.route}</span>! <MapPin aria-hidden className={`${inlineIcon} text-accent`} /></> : <>Every run counts. Your first fun fact unlocks soon!</>}
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-card p-3 shadow-card">
            <p className="display text-xl leading-tight">{t.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-muted">{t.label}</p>
          </div>
        ))}
      </section>
      {mood !== null && mood > 0 && (
        <p className="-mt-3 text-xs text-muted">On average you feel {mood} points better after a run (mood scale 1–5).</p>
      )}

      <Card title={<>This week: {CHALLENGES[c.level].label} challenge {c.complete && <CircleCheck aria-hidden className={`${inlineIcon} text-accent-ink`} />}</>}>
        <p className="mb-2 text-sm text-muted">
          {c.runs}/{c.targetRuns} runs{c.targetKm ? ` · ${c.km}/${c.targetKm} km` : ""}
        </p>
        <ProgressBar pct={c.pct} label="Weekly challenge progress" />
      </Card>

      <Card title="Distance per week">
        <WeeklyChart data={d.weekly} />
      </Card>

      <Card title="Running habit">
        <Heatmap days={d.heatmap} />
      </Card>

      <Card title="Milestones">
        {d.milestones.reached.length === 0 && <p className="text-sm text-muted">Your first milestone is 5 km total.</p>}
        <ul className="space-y-2">
          {d.milestones.reached.map((m) => (
            <li key={m.km} className="flex gap-3 text-sm">
              <span className="text-xl">{m.icon}</span>
              <span><strong>{m.title}</strong> · <span className="text-muted">{m.fact}</span></span>
            </li>
          ))}
        </ul>
        {d.milestones.next && (
          <div className="mt-4">
            <p className="mb-1 text-sm text-muted">
              Next: {d.milestones.next.title}, {Math.round((d.milestones.next.km - d.totalKm) * 10) / 10} km to go
            </p>
            <ProgressBar pct={Math.round((100 * d.totalKm) / d.milestones.next.km)} label="Progress to next milestone" />
          </div>
        )}
      </Card>

      <Card title={`Awards · ${d.awards.filter((a) => a.earned).length}/${d.awards.length}`}>
        <ul className="grid grid-cols-3 gap-2">
          {d.awards.map((a) => (
            <li key={a.id} className={`rounded-2xl p-3 text-center ${a.earned ? "bg-accent/20 ring-1 ring-accent/50" : "bg-ink text-muted ring-1 ring-line"}`}>
              {a.earned ? <Icon name={a.icon} className="mx-auto size-7" /> : <Lock aria-hidden className="mx-auto size-7" />}
              <p className="mt-1 text-xs font-semibold">{a.name}</p>
              <p className="text-[11px] leading-tight text-muted">{a.earned ? "Earned" : a.how}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-card shadow-card p-5">
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
    </section>
  );
}

function MoodIcon({ mood }: { mood: number }) {
  const C = mood > 0 ? FaceSlightlySmiling : mood < 0 ? FaceSlightlyFrowning : FaceNeutral;
  return <C aria-hidden className="inline size-5 align-[-3px] text-accent-ink" />;
}
