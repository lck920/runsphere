"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck, ExternalLink, Flag, Flame, Target } from "lucide-react";
import { inlineIcon } from "@/components/styles";
import ProgressBar from "@/components/ProgressBar";
import { CHALLENGES, LEVELS, type Level } from "@/data/challenges";
import { getSavedNickname } from "@/lib/local";
import type { BoardEntry, Proof } from "@/lib/stats";

type Entry = BoardEntry<{ nickname: string; runs: number; km: number; streak: number; proofs: Proof[] }>;

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; week: string; entries: Entry[]; me: string };

export default function Board() {
  // ?level=intermediate opens that tab (used by the "Leaderboard" button after logging a run).
  const param = useSearchParams().get("level") as Level;
  const [level, setLevel] = useState<Level>(LEVELS.includes(param) ? param : "beginner");
  const [state, setState] = useState<State>({ status: "loading" });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let stale = false;
    fetch(`/api/leaderboard?level=${level}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !stale && setState({ status: "ok", week: d.week, entries: d.entries, me: getSavedNickname().toLowerCase() }))
      .catch(() => !stale && setState({ status: "error" }));
    return () => {
      stale = true; // ignore slow responses after switching tabs
    };
  }, [level, retry]);

  const pick = (l: Level) => {
    setLevel(l);
    setState({ status: "loading" });
  };
  const c = CHALLENGES[level];

  return (
    <div>
      <h1 className="display text-3xl uppercase">Leaderboard</h1>
      <p className="mt-1 text-sm text-muted">
        Ranked by <strong className="text-fg">consistency</strong>: runs this week, then streak. Distance only breaks ties.
      </p>
      {state.status === "ok" && <p className="mt-1 text-sm font-semibold">Week of {state.week}</p>}

      <div role="tablist" className="mt-5 grid grid-cols-3 rounded-full border border-line bg-card p-1 shadow-card">
        {LEVELS.map((l) => (
          <button key={l} role="tab" aria-selected={l === level} onClick={() => pick(l)}
            className={`rounded-full py-2 text-sm display uppercase ${l === level ? "bg-accent text-on-accent" : "text-muted"}`}>
            {CHALLENGES[l].label}
          </button>
        ))}
      </div>

      <div className="hero surface-dark mt-4 rounded-3xl p-5 ring-1 ring-line">
        <p className="text-xs uppercase tracking-widest text-muted"><Target aria-hidden className={inlineIcon} /> This week&apos;s {c.label} challenge</p>
        <p className="display mt-1 text-4xl uppercase">
          {c.runs} runs{c.km ? <span className="text-accent"> · {c.km} km</span> : ""}
        </p>
      </div>

      {state.status === "loading" && (
        <ul className="mt-3 space-y-2">{[0, 1, 2, 3].map((i) => <li key={i} className="h-20 animate-pulse rounded-2xl bg-card" />)}</ul>
      )}

      {state.status === "error" && (
        <div className="mt-4 rounded-2xl border border-line bg-card shadow-card p-6 text-center">
          <p>Couldn&apos;t load the leaderboard.</p>
          <button onClick={() => { setState({ status: "loading" }); setRetry((n) => n + 1); }} className="mt-3 rounded-full bg-accent px-5 py-2 display uppercase text-on-accent">
            Try again
          </button>
        </div>
      )}

      {state.status === "ok" && state.entries.length === 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-card shadow-card p-6 text-center">
          <Flag aria-hidden className="mx-auto size-10 text-accent-ink" />
          <p className="mt-2">No {c.label} runs logged this week yet.</p>
          <Link href="/log" className="mt-3 inline-block rounded-full bg-accent px-5 py-2 display uppercase text-on-accent">Be the first</Link>
        </div>
      )}

      {state.status === "ok" && state.entries.length > 0 && (
        <ol className="mt-3 space-y-2">
          {state.entries.map((e) => {
            const mine = e.nickname.toLowerCase() === state.me;
            return (
              <li key={e.nickname} className={`rounded-2xl border border-line bg-card p-4 shadow-card ${mine ? "ring-2 ring-accent" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`display grid size-9 shrink-0 place-items-center rounded-full text-lg ${e.rank <= 3 ? "bg-accent text-on-accent" : "text-muted"}`}>
                    {e.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {e.nickname} {mine && <span className="text-xs text-accent-ink">(you)</span>}
                    </p>
                    <p className="text-xs text-muted">
                      {e.km} km · <Flame aria-hidden className={inlineIcon} /> {e.streak} wk streak
                      {e.challenge.complete && <> · <CircleCheck aria-hidden className={`${inlineIcon} text-accent-ink`} /> done</>}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="display swoosh text-3xl leading-none">{e.runs}</span>
                    <span className="block text-[11px] text-muted">run{e.runs === 1 ? "" : "s"}</span>
                  </p>
                </div>
                <div className="mt-3">
                  <ProgressBar pct={e.challenge.pct} label={`${e.nickname}'s challenge progress`} />
                </div>
                {/* This week's proof: tap a screenshot to open it full size. */}
                {e.proofs.length > 0 && (
                  <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label={`${e.nickname}'s run proof`}>
                    {e.proofs.map((p, i) => (
                      <li key={i} className="flex shrink-0 gap-2">
                        {p.image && (
                          <a href={p.image} target="_blank" rel="noopener noreferrer" aria-label={`Screenshot of run on ${p.date}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element -- user uploads; plain <img> avoids Vercel image-optimisation quota */}
                            <img src={p.image} alt="" loading="lazy" className="size-14 rounded-lg object-cover object-top ring-1 ring-line" />
                          </a>
                        )}
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer nofollow ugc"
                            className="flex h-14 items-center gap-1 rounded-lg border border-line px-3 text-xs font-semibold">
                            Strava <ExternalLink aria-hidden className="size-3.5" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
