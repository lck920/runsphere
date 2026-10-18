// Rule-based weekly plan generator ("the coach").
//
// Pure function, no database or network access. To swap in an AI coach later, keep
// PlanInput / PlanWeek / Plan the same and replace generatePlan(); nothing
// else in the app needs to change. Keep the RULES as hard guard-rails either way.
//
// Plans are time-based (minutes, walking included) because beginners are
// better served by "run/walk for 20 minutes" than by distance targets.
import { addDays } from "./week.ts";

export const EXPERIENCES = { new: "New to running", "10min": "Can run 10 minutes", "5km": "Can run 5 km" } as const;
export const GOALS = { start: "Start running", "5k": "Run 5 km", consistent: "Run more consistently" } as const;
export type Experience = keyof typeof EXPERIENCES;
export type Goal = keyof typeof GOALS;
export type Days = 2 | 3 | 4;

export type PlanInput = { experience: Experience; days: Days; goal: Goal };
/** One row of the runner_weeks view. */
export type PlanWeek = { week_start: string; runs: number; minutes: number };
export type Session = { date: string; day: string; rest: boolean; minutes: number; detail: string; long?: boolean };
export type Plan = {
  weekStart: string;
  stage: "starter" | "progress" | "repeat" | "ease";
  totalMinutes: number;
  sessions: Session[]; // all 7 days, Mon → Sun
  explanation: string;
};

/** Safety guard-rails, all in one place. */
export const RULES = {
  maxWeeklyIncrease: 0.1, // weekly total never grows more than ~10%
  easeFactor: 0.8,        // after a week with no runs, restart at 80% of usual
  minSession: 15,         // shortest worthwhile session (min)
  maxSession: 60,         // this app is for beginners
  longRunBoost: 1.25,     // "run 5 km" goal: one session ~25% longer than the rest
  starterSession: { new: 20, "10min": 24, "5km": 30 } as Record<Experience, number>,
};

// Which weekdays to run (0 = Mon). Always at least one rest day between runs.
// Note: 4 runs in 7 days can't all have gaps, so with 4 days Sun → next Mon is back-to-back.
const RUN_DAYS: Record<Days, number[]> = { 2: [1, 5], 3: [0, 2, 5], 4: [0, 2, 4, 6] };
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * @param history  runner_weeks rows for this runner (any range; only the 4 full weeks before `monday` are used)
 * @param monday   first day of the week being planned
 */
export function generatePlan(input: PlanInput, history: PlanWeek[], monday: string): Plan {
  const { experience, days, goal } = input;
  const recent = history.filter((w) => w.week_start < monday && w.week_start >= addDays(monday, -28));
  const last = recent.find((w) => w.week_start === addDays(monday, -7));
  const peak = Math.max(0, ...recent.map((w) => w.minutes));
  // Weeks where they ran as often as they now say they can: drives run/walk progression.
  const solidWeeks = recent.filter((w) => w.runs >= days).length;

  // 1. Decide the stage and minutes per session from last week.
  // We don't store past plans, so "missed planned runs" = fewer runs than the
  // days per week the user says they have available.
  let stage: Plan["stage"];
  let perSession: number;
  if (!recent.length) {
    stage = "starter";
    perSession = RULES.starterSession[experience];
  } else if (!last) {
    // Ran before, but nothing last week → ease back in rather than pick up where they left off.
    stage = "ease";
    const avgPerRun = sum(recent.map((w) => w.minutes)) / sum(recent.map((w) => w.runs));
    perSession = avgPerRun * RULES.easeFactor;
  } else if (last.runs < days) {
    // Missed some → repeat the same session length, no progression.
    stage = "repeat";
    perSession = last.minutes / last.runs;
  } else {
    // Completed everything → progress gently.
    stage = "progress";
    perSession = (last.minutes * (1 + RULES.maxWeeklyIncrease)) / days;
  }
  perSession = clamp(Math.round(perSession), RULES.minSession, RULES.maxSession);

  // 2. ~10% rule: total may not exceed the biggest recent week by more than 10%
  // (catches e.g. 2 runs last week but 4 days chosen now). If that would push
  // sessions below the minimum, plan fewer runs instead of uselessly short ones.
  // ponytail: never fewer than 2 runs, so a single 10-min week can still exceed 10%.
  let runCount = days;
  const cap = peak * (1 + RULES.maxWeeklyIncrease);
  if (peak && perSession * days > cap) {
    runCount = clamp(Math.floor(cap / RULES.minSession), 2, days) as Days;
    perSession = Math.max(RULES.minSession, Math.floor(cap / runCount));
  }

  // 3. Lay the week out. "Run 5 km" adds one longer run before the biggest rest gap
  // (Sat for 2–3 runs, Fri for 4 runs), keeping the weekly total the same.
  const runDays = RUN_DAYS[runCount];
  const longIdx = goal === "5k" && runCount >= 3 ? (runCount === 4 ? 2 : runCount - 1) : -1;
  const total = perSession * runCount;
  const longMin = Math.round(perSession * RULES.longRunBoost);
  const otherMin = longIdx < 0 ? perSession : Math.round((total - longMin) / (runCount - 1));

  const sessions: Session[] = DAY_NAMES.map((day, i) => {
    const date = addDays(monday, i);
    const k = runDays.indexOf(i);
    if (k < 0) return { date, day, rest: true, minutes: 0, detail: "Rest, or an easy walk" };
    const s = describe(k === longIdx ? longMin : otherMin, experience, solidWeeks);
    return { date, day, rest: false, ...s, long: k === longIdx || undefined };
  });

  const totalMinutes = sum(sessions.map((s) => s.minutes));
  let explanation = explain(stage, input, last, totalMinutes);
  if (runCount < days)
    explanation += ` We've planned ${runCount} runs instead of ${days} so your weekly total rises by no more than about 10%.`;
  return { weekStart: monday, stage, totalMinutes, sessions, explanation };
}

/**
 * Turns minutes into a concrete session.
 * Beginners ("new") always start with run/walk intervals; the run part grows by
 * 1 minute for every solid week. "10 min" runners do longer intervals until
 * 15-min blocks, then continuous. "5 km" runners do easy continuous runs.
 */
function describe(minutes: number, experience: Experience, solidWeeks: number) {
  let run = Infinity;
  let walk = 0;
  if (experience === "new") {
    run = Math.min(1 + solidWeeks, 5);
    walk = run < 3 ? 2 : 1;
  } else if (experience === "10min" && 5 + 2 * solidWeeks < 15) {
    run = 5 + 2 * solidWeeks;
    walk = 1;
  }
  if (run === Infinity) return { minutes, detail: `Easy run ${minutes} min, at a pace where you can still talk` };
  const reps = Math.max(1, Math.floor(minutes / (run + walk)));
  return {
    minutes: reps * (run + walk),
    detail: `Run ${run} min, walk ${walk} min, × ${reps}`,
  };
}

function explain(stage: Plan["stage"], input: PlanInput, last: PlanWeek | undefined, total: number): string {
  const base = {
    starter: `A starter week for someone who is ${EXPERIENCES[input.experience].toLowerCase()}: ${input.days} short sessions with a rest day between each so your body can adapt.`,
    progress: `You completed all your runs last week, so this week grows by about 10% at most (${Math.round(last?.minutes ?? 0)} → ${total} min).`,
    repeat: `You logged ${last?.runs} of ${input.days} runs last week, so we're repeating the same session length instead of increasing it. Complete this week and the next one steps up.`,
    ease: `You didn't log any runs last week, so we've eased back about 20% to restart safely. Consistency beats catching up.`,
  }[stage];
  const goal = {
    start: input.experience === "new" ? " Walk breaks are part of the plan, not cheating." : "",
    "5k": input.days >= 3 ? " One slightly longer run each week builds you towards 5 km." : "",
    consistent: " Try to keep the same days every week, so it becomes routine.",
  }[input.goal];
  return base + goal;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
