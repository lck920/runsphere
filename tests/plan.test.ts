import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePlan, RULES, type PlanInput } from "../lib/plan.ts";

const MON = "2026-10-12";
const wk = (week_start: string, runs: number, minutes: number) => ({ week_start, runs, minutes });
const input = (o: Partial<PlanInput> = {}): PlanInput => ({ experience: "new", days: 3, goal: "start", ...o });

test("starter: beginners get run/walk intervals", () => {
  const p = generatePlan(input(), [], MON);
  assert.equal(p.stage, "starter");
  const runs = p.sessions.filter((s) => !s.rest);
  assert.equal(runs.length, 3);
  assert.ok(runs.every((s) => s.detail.startsWith("Run 1 min, walk 2 min")));
});

test("always a rest day between runs within the week", () => {
  for (const days of [2, 3, 4] as const) {
    const s = generatePlan(input({ days }), [], MON).sessions;
    for (let i = 1; i < 7; i++) assert.ok(s[i].rest || s[i - 1].rest, `days=${days}: back-to-back on ${s[i].day}`);
    assert.equal(s.filter((x) => !x.rest).length, days);
  }
});

test("progress: completed week grows by ≤10%", () => {
  const history = [wk("2026-10-05", 3, 60), wk("2026-09-28", 3, 57)];
  const p = generatePlan(input(), history, MON);
  assert.equal(p.stage, "progress");
  assert.ok(p.totalMinutes > 57 && p.totalMinutes <= 66, `total ${p.totalMinutes}`);
});

test("repeat: missed runs → no increase, even with more days chosen", () => {
  const history = [wk("2026-10-05", 2, 50), wk("2026-09-28", 2, 50)];
  const p = generatePlan(input({ days: 4 }), history, MON);
  assert.equal(p.stage, "repeat");
  assert.ok(p.totalMinutes <= 55, `total ${p.totalMinutes}`); // 10% cap vs peak week
  assert.equal(p.sessions.filter((s) => !s.rest).length, 3); // fewer runs rather than tiny ones
  assert.match(p.explanation, /3 runs instead of 4/);
});

test("ease: no runs last week → ~80% of usual session", () => {
  const history = [wk("2026-09-28", 3, 90), wk("2026-09-21", 3, 90)];
  const p = generatePlan(input({ experience: "5km" }), history, MON);
  assert.equal(p.stage, "ease");
  assert.ok(p.sessions.filter((s) => !s.rest).every((s) => s.minutes === 24)); // 30 × 0.8
});

test("history older than 4 weeks is ignored", () => {
  assert.equal(generatePlan(input(), [wk("2026-09-07", 3, 60)], MON).stage, "starter");
});

test("5k goal adds one longer run, never shorter than the minimum", () => {
  const p = generatePlan(input({ experience: "5km", goal: "5k" }), [], MON);
  const runs = p.sessions.filter((s) => !s.rest);
  assert.equal(runs.filter((s) => s.long).length, 1);
  assert.equal(runs.find((s) => s.long)?.day, "Sat");
  assert.ok(runs.every((s) => s.minutes >= RULES.minSession));
});

test("run/walk intervals grow with solid weeks", () => {
  const history = [wk("2026-10-05", 3, 60), wk("2026-09-28", 3, 60), wk("2026-09-21", 3, 60)];
  const p = generatePlan(input(), history, MON);
  assert.match(p.sessions.find((s) => !s.rest)!.detail, /^Run 4 min, walk 1 min/);
});
