import { test } from "node:test";
import assert from "node:assert/strict";
import { todayKL, weekStart, addDays } from "../lib/week.ts";

test("weekStart returns Monday", () => {
  assert.equal(weekStart("2026-10-12"), "2026-10-12"); // Monday
  assert.equal(weekStart("2026-10-18"), "2026-10-12"); // Sunday belongs to the week before
  assert.equal(weekStart("2026-10-19"), "2026-10-19");
  assert.equal(weekStart("2027-01-01"), "2026-12-28"); // across year end
});

test("todayKL uses UTC+8", () => {
  // 17:30 UTC Sunday = 01:30 Monday in KL → new week already
  assert.equal(todayKL(new Date("2026-10-18T17:30:00Z")), "2026-10-19");
  assert.equal(todayKL(new Date("2026-10-18T15:59:00Z")), "2026-10-18");
});

test("addDays crosses months", () => {
  assert.equal(addDays("2026-02-27", 2), "2026-03-01");
});
