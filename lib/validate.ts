// Shared input rules. The log form runs these for instant feedback and the
// API runs them again because the browser can't be trusted. The database
// (supabase/schema.sql) has matching CHECK constraints as a last line of defence.
import { LEVELS, type Level } from "../data/challenges.ts";
import { addDays } from "./week.ts";

export const LIMITS = {
  km: [0.5, 50],
  minutes: [3, 360],
  pace: [3, 20], // min/km. 3 is elite racing, 20 is a slow walk
  daysBack: 365,
} as const;

export function nicknameError(raw: string): string | null {
  const n = raw.trim();
  if (n.length < 3 || n.length > 20) return "Nickname must be 3–20 characters.";
  // ASCII only, so JS toLowerCase() and Postgres lower() always agree.
  if (!/^[a-zA-Z0-9_. -]+$/.test(n)) return "Use letters, numbers, spaces, _ . or - only.";
  return null;
}

export type ValidRun = {
  nickname: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  level: Level;
  moodBefore: number;
  moodAfter: number;
  link: string | null;
};

const isRealDate = (d: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d)) && addDays(d, 0) === d; // rejects 2026-02-31

const isMood = (v: number) => Number.isInteger(v) && v >= 1 && v <= 5;

/** Validates raw form strings. `today` is the KL date, passed in so tests are deterministic. */
export function validateRun(f: Record<string, string | undefined>, today: string) {
  const errors: Record<string, string> = {};
  const nickname = (f.nickname ?? "").trim();
  const date = f.date ?? "";
  const distanceKm = Number(f.distance);
  const durationMin = Number(f.duration);
  const moodBefore = Number(f.moodBefore);
  const moodAfter = Number(f.moodAfter);
  const level = f.level as Level;
  const link = (f.link ?? "").trim() || null;

  const nick = nicknameError(nickname);
  if (nick) errors.nickname = nick;

  if (!isRealDate(date)) errors.date = "Pick a valid date.";
  else if (date > today) errors.date = "That date is in the future.";
  else if (date < addDays(today, -LIMITS.daysBack)) errors.date = "Runs older than a year can't be logged.";

  if (!(distanceKm >= LIMITS.km[0] && distanceKm <= LIMITS.km[1]))
    errors.distance = `Distance must be ${LIMITS.km[0]}–${LIMITS.km[1]} km.`;
  if (!(durationMin >= LIMITS.minutes[0] && durationMin <= LIMITS.minutes[1]))
    errors.duration = `Duration must be ${LIMITS.minutes[0]}–${LIMITS.minutes[1]} minutes.`;

  if (!errors.distance && !errors.duration) {
    const p = durationMin / distanceKm;
    if (p < LIMITS.pace[0]) errors.duration = "That pace is faster than elite racers. Check your distance and time.";
    if (p > LIMITS.pace[1]) errors.duration = "That's slower than 20 min/km. Check your distance and time.";
  }

  if (!LEVELS.includes(level)) errors.level = "Choose a challenge level.";
  if (!isMood(moodBefore)) errors.moodBefore = "How did you feel before?";
  if (!isMood(moodAfter)) errors.moodAfter = "How did you feel after?";

  if (link) {
    let ok = false;
    try {
      ok = new URL(link).protocol === "https:" && link.length <= 300;
    } catch {}
    if (!ok) errors.link = "Paste a full https:// link (e.g. your Strava activity).";
  }

  const run: ValidRun | null = Object.keys(errors).length
    ? null
    : { nickname, date, distanceKm, durationMin, level, moodBefore, moodAfter, link };
  return { errors, run };
}

/**
 * Only Strava links are shown publicly on the leaderboard, so nobody can use it
 * to spread random (spam/phishing) URLs. Other https links are still saved, just not displayed.
 */
export function isStravaLink(url: string | null): url is string {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host === "strava.com" || host.endsWith(".strava.com") || host === "strava.app.link";
  } catch {
    return false;
  }
}
