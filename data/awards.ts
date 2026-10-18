// Awards (badges). Each one is a rule over the runner's history, so nothing is
// stored: add, remove or tweak awards here and every runner updates instantly.
import type { IconName } from "../components/Icon.tsx";

export type AwardContext = {
  runs: number;
  longestStreak: number;
  bestMonthKm: number;     // most km in any single calendar month
  challengesDone: number;  // weekly challenges completed (any level)
  moodBoosts: number;      // runs where mood after > mood before
};

export const AWARDS: { id: string; icon: IconName; name: string; how: string; earned: (c: AwardContext) => boolean }[] = [
  { id: "first", icon: "footprints", name: "First steps", how: "Log your first run", earned: (c) => c.runs >= 1 },
  { id: "ten", icon: "medal", name: "Ten runs", how: "Log 10 runs", earned: (c) => c.runs >= 10 },
  { id: "month10", icon: "calendarCheck", name: "10 km month", how: "Run 10 km in one month", earned: (c) => c.bestMonthKm >= 10 },
  { id: "month50", icon: "rocket", name: "50 km month", how: "Run 50 km in one month", earned: (c) => c.bestMonthKm >= 50 },
  { id: "challenge", icon: "target", name: "Challenger", how: "Complete a weekly challenge", earned: (c) => c.challengesDone >= 1 },
  { id: "challenge5", icon: "trophy", name: "Challenge pro", how: "Complete 5 weekly challenges", earned: (c) => c.challengesDone >= 5 },
  { id: "streak4", icon: "flame", name: "On fire", how: "Reach a 4-week streak", earned: (c) => c.longestStreak >= 4 },
  { id: "streak8", icon: "zap", name: "Unstoppable", how: "Reach an 8-week streak", earned: (c) => c.longestStreak >= 8 },
  { id: "mood", icon: "smile", name: "Mood booster", how: "Feel better after 10 runs", earned: (c) => c.moodBoosts >= 10 },
];
