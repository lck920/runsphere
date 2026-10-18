// Pure stats logic: streaks, challenge progress, leaderboard ranking and the progress page.
// No database access here; the API routes fetch rows and pass them in.
import { CHALLENGES, type Level } from "../data/challenges.ts";
import { addDays, weekStart } from "./week.ts";
import { MILESTONES, LOCAL_ROUTES } from "../data/milestones.ts";
import { AWARDS } from "../data/awards.ts";

/** One row of the runner_weeks view. */
export type WeekTotal = { week_start: string; runs: number; km: number };

/** A week counts towards a streak when it has at least this many runs. */
export const STREAK_MIN_RUNS = 2;

/**
 * Streaks = consecutive Monday-to-Sunday weeks with ≥ STREAK_MIN_RUNS runs.
 *
 * current: counted backwards from this week. This week is still in progress,
 *   so if it hasn't qualified *yet* we start counting from last week instead.
 *   Your streak only breaks once a whole week has passed without 2 runs.
 * longest: the best unbroken run of qualifying weeks ever.
 */
export function streaks(weeks: WeekTotal[], today: string) {
  const good = new Set(weeks.filter((w) => w.runs >= STREAK_MIN_RUNS).map((w) => w.week_start));

  let cursor = weekStart(today);
  if (!good.has(cursor)) cursor = addDays(cursor, -7);
  let current = 0;
  while (good.has(cursor)) {
    current++;
    cursor = addDays(cursor, -7);
  }

  let longest = 0;
  let run = 0;
  let prev = "";
  for (const w of [...good].sort()) {
    run = prev && addDays(prev, 7) === w ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = w;
  }
  return { current, longest };
}

export type ChallengeProgress = {
  runs: number;
  km: number;
  targetRuns: number;
  targetKm: number;
  pct: number; // 0–100, average of the run and km parts (each capped at 100%)
  complete: boolean;
};

export function challengeProgress(level: Level, runs: number, km: number): ChallengeProgress {
  const c = CHALLENGES[level];
  const parts = [Math.min(1, runs / c.runs)];
  if (c.km) parts.push(Math.min(1, km / c.km));
  return {
    runs,
    km: round1(km),
    targetRuns: c.runs,
    targetKm: c.km,
    pct: Math.round((100 * parts.reduce((a, b) => a + b)) / parts.length),
    complete: parts.every((p) => p >= 1),
  };
}

/** Proof of one run shown on the leaderboard: a public screenshot URL and/or a Strava link. */
export type Proof = { date: string; image: string | null; link: string | null };

type BoardRow = { nickname: string; runs: number; km: number; streak: number };
export type BoardEntry<T extends BoardRow = BoardRow> = T & { rank: number; challenge: ChallengeProgress };

/**
 * Leaderboard = consistency first.
 * Sort by runs this week, then current streak. Only if both are equal does
 * distance this week break the tie (then nickname), so every runner gets a
 * unique position 1, 2, 3… A beginner doing 2 short runs still beats 1 long run.
 */
export function rankBoard<T extends BoardRow>(rows: T[], level: Level): BoardEntry<T>[] {
  return [...rows]
    .sort((a, b) => b.runs - a.runs || b.streak - a.streak || b.km - a.km || a.nickname.localeCompare(b.nickname))
    .map((r, i) => ({ ...r, km: round1(r.km), rank: i + 1, challenge: challengeProgress(level, r.runs, r.km) }));
}

/** 6.5 min/km → "6:30" */
export function formatPace(minPerKm: number): string {
  const s = Math.round(minPerKm * 60);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export const round1 = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------
// My progress: everything the progress page shows, from one runner's runs.
// ---------------------------------------------------------------

export type RunRow = {
  run_date: string;
  distance_km: number;
  duration_min: number;
  level: Level;
  mood_before: number;
  mood_after: number;
};

const CHART_WEEKS = 8;
const HEATMAP_WEEKS = 16;

/** The biggest milestone a run just carried the total past, if any. */
export function crossedMilestone(beforeKm: number, afterKm: number) {
  return MILESTONES.filter((m) => beforeKm < m.km && afterKm >= m.km).at(-1) ?? null;
}

/** Biggest local route that fits inside the total ("that's like KL to Melaka!"). */
export function localFact(totalKm: number) {
  return LOCAL_ROUTES.filter((r) => r.km <= totalKm).at(-1) ?? null;
}

/** The next comparison still ahead ("2.3 km more to beat the Penang Bridge"). */
export function nextLocalFact(totalKm: number) {
  return LOCAL_ROUTES.find((r) => r.km > totalKm) ?? null;
}

export function progressSummary(runs: RunRow[], today: string) {
  const thisMonday = weekStart(today);
  const byWeek = new Map<string, WeekTotal>();
  const byDay = new Map<string, number>();
  const byMonth = new Map<string, number>();
  const byWeekLevel = new Map<string, { level: Level; runs: number; km: number }>();
  let km = 0;
  let minutes = 0;
  let moodDelta = 0;
  let moodBoosts = 0;
  let first = today;
  let latest: RunRow | undefined;

  for (const r of runs) {
    const d = Number(r.distance_km);
    const w = weekStart(r.run_date);
    km += d;
    minutes += Number(r.duration_min);
    moodDelta += r.mood_after - r.mood_before;
    if (r.mood_after > r.mood_before) moodBoosts++;
    if (r.run_date < first) first = r.run_date;
    if (!latest || r.run_date >= latest.run_date) latest = r;

    const wk = byWeek.get(w) ?? { week_start: w, runs: 0, km: 0 };
    wk.runs++;
    wk.km += d;
    byWeek.set(w, wk);
    byDay.set(r.run_date, (byDay.get(r.run_date) ?? 0) + d);
    byMonth.set(r.run_date.slice(0, 7), (byMonth.get(r.run_date.slice(0, 7)) ?? 0) + d);
    const key = `${w}|${r.level}`;
    const wl = byWeekLevel.get(key) ?? { level: r.level, runs: 0, km: 0 };
    wl.runs++;
    wl.km += d;
    byWeekLevel.set(key, wl);
  }

  const streak = streaks([...byWeek.values()], today);
  // Runs per week, averaged from the week of the first run up to this week.
  const weeksSpan = (Date.parse(thisMonday) - Date.parse(weekStart(first))) / (7 * 864e5) + 1;
  // This week's challenge is shown for the level of their most recent run.
  const level = latest?.level ?? "beginner";
  const tw = byWeekLevel.get(`${thisMonday}|${level}`);

  const ctx = {
    runs: runs.length,
    longestStreak: streak.longest,
    bestMonthKm: Math.max(0, ...byMonth.values()),
    challengesDone: [...byWeekLevel.values()].filter((x) => challengeProgress(x.level, x.runs, x.km).complete).length,
    moodBoosts,
  };

  return {
    totalKm: round1(km),
    runs: runs.length,
    avgPace: km ? minutes / km : null,
    runsPerWeek: round1(runs.length / weeksSpan),
    streak,
    avgMoodChange: runs.length ? round1(moodDelta / runs.length) : null,
    challenge: { level, ...challengeProgress(level, tw?.runs ?? 0, tw?.km ?? 0) },
    // Oldest → newest, ending with this week.
    weekly: Array.from({ length: CHART_WEEKS }, (_, i) => {
      const week = addDays(thisMonday, (i - CHART_WEEKS + 1) * 7);
      return { week, km: round1(byWeek.get(week)?.km ?? 0) };
    }),
    // Day by day, Monday-first, HEATMAP_WEEKS full weeks; future days are null.
    heatmap: Array.from({ length: HEATMAP_WEEKS * 7 }, (_, i) => {
      const date = addDays(thisMonday, -(HEATMAP_WEEKS - 1) * 7 + i);
      return { date, km: date > today ? null : round1(byDay.get(date) ?? 0) };
    }),
    milestones: { reached: MILESTONES.filter((m) => km >= m.km), next: MILESTONES.find((m) => km < m.km) ?? null },
    localFact: localFact(km),
    nextLocalFact: nextLocalFact(km),
    awards: AWARDS.map(({ earned, ...a }) => ({ ...a, earned: earned(ctx) })),
  };
}

export type ProgressSummary = ReturnType<typeof progressSummary>;
