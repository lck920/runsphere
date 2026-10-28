// Group runs page: DEMO content. Clubs and runners below are made up, so no real
// club appears to endorse RunSphere. Dates are "days from today" so events always look upcoming
// (so don't put weekday names in titles: the day changes).
import type { Level } from "./challenges.ts";

export type GroupRun = {
  id: string;
  title: string;
  inDays?: number; // demo events: days from today
  date?: string;   // runner-hosted events: YYYY-MM-DD
  time: string;    // 24h "HH:MM"
  place: string;
  km: number;
  level: Level;
  host: string;
  going: number;   // people already joined (before you)
};

export type ChatMessage = { author: string; text: string; when: string };

export const DEMO_RUNS: GroupRun[] = [
  { id: "bj-easy-5k", title: "Stadium Easy 5K", inDays: 2, time: "06:30", place: "Bukit Jalil National Stadium", km: 5, level: "beginner", host: "Bukit Jalil Striders", going: 14 },
  { id: "titiwangsa-walk", title: "Lake loop run/walk", inDays: 3, time: "07:00", place: "Taman Tasik Titiwangsa", km: 3, level: "beginner", host: "Titiwangsa Trotters", going: 8 },
  { id: "campus-night", title: "Campus night run", inDays: 4, time: "20:30", place: "Campus main gate", km: 4, level: "beginner", host: "Campus Run Club", going: 21 },
  { id: "klcc-long", title: "Park long run", inDays: 5, time: "06:00", place: "KLCC Park", km: 10, level: "intermediate", host: "KLCC Park Pacers", going: 11 },
  { id: "kiara-hills", title: "Hill repeats", inDays: 6, time: "06:30", place: "Bukit Kiara", km: 6, level: "advanced", host: "Kiara Hill Crew", going: 6 },
];

export const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
  "bj-easy-5k": [
    { author: "Bukit Jalil Striders", text: "Meet at the main entrance at 6:20. We'll do a 5 min warm-up together first!", when: "2h ago" },
    { author: "aisyah_runs", text: "First group run for me, is 8 min/km okay?", when: "1h ago" },
    { author: "Bukit Jalil Striders", text: "Totally fine! Nobody gets left behind, we regroup every lap.", when: "1h ago" },
    { author: "weiming", text: "I'll bring extra water bottles", when: "20m ago" },
  ],
  "titiwangsa-walk": [
    { author: "Titiwangsa Trotters", text: "Run 2 min, walk 1 min around the lake. Perfect if you're just starting.", when: "5h ago" },
    { author: "nurul_jog", text: "Can I bring a friend who has never run before?", when: "3h ago" },
    { author: "Titiwangsa Trotters", text: "Yes please! The more the merrier.", when: "3h ago" },
  ],
  "campus-night": [
    { author: "Campus Run Club", text: "Cooler at night. Wear something bright, we stay on lit paths.", when: "1d ago" },
    { author: "danish_dash", text: "See you all after class", when: "4h ago" },
  ],
  "klcc-long": [
    { author: "KLCC Park Pacers", text: "Two pace groups: 6:30 and 7:30 min/km. Bring water, it gets hot by 8.", when: "1d ago" },
    { author: "jiayi_go", text: "Joining the 6:30 group!", when: "6h ago" },
  ],
  "kiara-hills": [
    { author: "Kiara Hill Crew", text: "8 × hill repeats, easy jog down. Experienced runners only please.", when: "2d ago" },
  ],
};
