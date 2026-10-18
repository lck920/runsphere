import { test } from "node:test";
import assert from "node:assert/strict";
import { streaks, rankBoard, challengeProgress, formatPace, progressSummary, crossedMilestone, localFact, nextLocalFact } from "../lib/stats.ts";
import { LOCAL_ROUTES } from "../data/milestones.ts";
import { isStravaLink, validateRun } from "../lib/validate.ts";

const TODAY = "2026-10-14"; // Wednesday; week starts 2026-10-12
const wk = (week_start: string, runs: number) => ({ week_start, runs, km: runs * 3 });

test("streak: unfinished week doesn't break it", () => {
  // last 3 full weeks qualify, this week only 1 run so far
  const weeks = [wk("2026-09-21", 2), wk("2026-09-28", 3), wk("2026-10-05", 2), wk("2026-10-12", 1)];
  assert.deepEqual(streaks(weeks, TODAY), { current: 3, longest: 3 });
});

test("streak: this week counts once it qualifies", () => {
  const weeks = [wk("2026-10-05", 2), wk("2026-10-12", 2)];
  assert.equal(streaks(weeks, TODAY).current, 2);
});

test("streak: a missed full week resets current, longest remembers", () => {
  const weeks = [wk("2026-08-31", 2), wk("2026-09-07", 2), wk("2026-09-14", 4), wk("2026-09-21", 1), wk("2026-09-28", 2), wk("2026-10-05", 2)];
  assert.deepEqual(streaks(weeks, TODAY), { current: 2, longest: 3 });
});

test("streak: none", () => {
  assert.deepEqual(streaks([], TODAY), { current: 0, longest: 0 });
  assert.deepEqual(streaks([wk("2026-09-28", 2)], TODAY), { current: 0, longest: 1 }); // gap last week
});

test("rank: runs, then streak, then distance breaks ties; unique positions", () => {
  const board = rankBoard(
    [
      { nickname: "far", runs: 1, km: 30, streak: 9 },
      { nickname: "bea", runs: 3, km: 6, streak: 1 },
      { nickname: "ali", runs: 3, km: 5, streak: 1 },
      { nickname: "cat", runs: 3, km: 4, streak: 4 },
    ],
    "beginner",
  );
  assert.deepEqual(board.map((b) => [b.rank, b.nickname]), [[1, "cat"], [2, "bea"], [3, "ali"], [4, "far"]]); // far ran 30 km but only once
});

test("challenge progress", () => {
  assert.equal(challengeProgress("beginner", 2, 1).complete, true);
  const i = challengeProgress("intermediate", 3, 5); // runs done, km half
  assert.equal(i.complete, false);
  assert.equal(i.pct, 75);
});

test("formatPace", () => {
  assert.equal(formatPace(6.5), "6:30");
  assert.equal(formatPace(5.999), "6:00");
});

const ok = { nickname: " Ali ", date: "2026-10-14", distance: "3", duration: "24", level: "beginner", moodBefore: "2", moodAfter: "4" };

test("validate: good run is trimmed and parsed", () => {
  const { run, errors } = validateRun(ok, TODAY);
  assert.deepEqual(errors, {});
  assert.equal(run?.nickname, "Ali");
  assert.equal(run?.distanceKm, 3);
});

test("validate: rejects bad input", () => {
  const e = (o: object) => Object.keys(validateRun({ ...ok, ...o }, TODAY).errors);
  assert.deepEqual(e({ date: "2026-10-15" }), ["date"]); // future
  assert.deepEqual(e({ date: "2026-02-31" }), ["date"]);
  assert.deepEqual(e({ duration: "5" }), ["duration"]); // 1:40/km
  assert.deepEqual(e({ duration: "90" }), ["duration"]); // 30 min/km
  assert.deepEqual(e({ nickname: "ab" }), ["nickname"]);
  assert.deepEqual(e({ nickname: "<script>" }), ["nickname"]);
  assert.deepEqual(e({ level: "pro" }), ["level"]);
  assert.deepEqual(e({ moodAfter: "6" }), ["moodAfter"]);
  assert.deepEqual(e({ link: "javascript:alert(1)" }), ["link"]);
  assert.deepEqual(e({ link: "https://www.strava.com/activities/1" }), []);
});


const run = (run_date: string, distance_km: number, level = "beginner" as const, mood_before = 2, mood_after = 4) =>
  ({ run_date, distance_km, duration_min: distance_km * 8, level, mood_before, mood_after });

test("progress summary", () => {
  const p = progressSummary(
    [run("2026-09-29", 3), run("2026-10-01", 4), run("2026-10-06", 2), run("2026-10-08", 2), run("2026-10-13", 5, "beginner", 3, 3)],
    TODAY,
  );
  assert.equal(p.totalKm, 16);
  assert.equal(p.runs, 5);
  assert.equal(p.avgPace, 8);
  assert.equal(p.runsPerWeek, 1.7); // 5 runs over 3 weeks
  assert.deepEqual(p.streak, { current: 2, longest: 2 });
  assert.equal(p.avgMoodChange, 1.6); // (2+2+2+2+0)/5
  assert.equal(p.challenge.runs, 1);
  assert.equal(p.weekly.at(-1)?.km, 5);
  assert.equal(p.weekly.length, 8);
  assert.equal(p.heatmap.find((d) => d.date === "2026-10-13")?.km, 5);
  assert.equal(p.heatmap.find((d) => d.date === "2026-10-15")?.km, null); // future
  assert.equal(p.milestones.next?.km, 21.1);
  const earned = p.awards.filter((a) => a.earned).map((a) => a.id);
  assert.deepEqual(earned, ["first", "month10", "challenge"]);
});

test("empty progress doesn't crash", () => {
  const p = progressSummary([], TODAY);
  assert.equal(p.avgPace, null);
  assert.equal(p.runsPerWeek, 0);
});

test("milestones and local facts", () => {
  assert.equal(crossedMilestone(4, 11)?.km, 10); // passed 5 and 10 → show the bigger one
  assert.equal(crossedMilestone(11, 12), null);
  assert.equal(localFact(8.3)?.route, "Bukit Jalil to Sri Petaling");
  assert.equal(localFact(0.1), null);
});


test("only Strava links are shown publicly", () => {
  assert.equal(isStravaLink("https://www.strava.com/activities/123"), true);
  assert.equal(isStravaLink("https://strava.app.link/abc"), true);
  assert.equal(isStravaLink("https://strava.com.evil.example/x"), false);
  assert.equal(isStravaLink("https://evilstrava.com/x"), false);
  assert.equal(isStravaLink(null), false);
});

test("fun facts stay sorted and the next one is ahead", () => {
  const kms = LOCAL_ROUTES.map((r) => r.km);
  assert.deepEqual(kms, [...kms].sort((a, b) => a - b));
  assert.equal(nextLocalFact(13)?.route, "the Penang Bridge");
  assert.equal(nextLocalFact(99999), null);
});
