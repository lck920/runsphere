// Fun facts about total distance run. Edit freely: everything here is plain data.
import type { IconName } from "../components/Icon.tsx";

/** Big milestones: celebrated once, the moment a run takes your total past them. */
export const MILESTONES: { km: number; icon: IconName; title: string; fact: string }[] = [
  { km: 5, icon: "sparkles", title: "5 km total", fact: "That's a full parkrun's worth of distance." },
  { km: 10, icon: "award", title: "10 km total", fact: "The distance of a classic 10K race, done one run at a time." },
  { km: 21.1, icon: "medal", title: "Half marathon total", fact: "You've covered a half marathon: 21.1 km." },
  { km: 42.2, icon: "trophy", title: "Marathon total", fact: "That's a full marathon distance, like the KL Marathon route." },
  { km: 100, icon: "star", title: "100 km total", fact: "Roughly the drive from KL to Port Dickson." }, // VERIFY
  { km: 350, icon: "route", title: "350 km total", fact: "About the drive from KL to Penang." }, // VERIFY
  { km: 1000, icon: "map", title: "1,000 km total", fact: "Further than the whole North–South Expressway (~772 km) from Johor Bahru to Bukit Kayu Hitam." },
];

/**
 * Local comparisons: we show the biggest one that fits inside your total,
 * e.g. "You've run 8.3 km. That's like Bukit Jalil to Sri Petaling!"
 * Distances marked VERIFY are rough estimates. Check them on Google Maps
 * (walking/road distance) before the demo and fix the numbers here.
 */
export const LOCAL_ROUTES: { km: number; route: string }[] = [
  { km: 0.4, route: "one lap of the Bukit Jalil National Stadium track" },
  { km: 4, route: "KLCC to KL Sentral" }, // VERIFY
  { km: 8, route: "Bukit Jalil to Sri Petaling" }, // VERIFY
  { km: 13.5, route: "across the Penang Bridge" },
  { km: 24, route: "across the Second Penang Bridge" },
  { km: 35, route: "KL to Putrajaya" }, // VERIFY
  { km: 58, route: "KL up to Genting Highlands" }, // VERIFY
  { km: 145, route: "KL to Melaka" }, // VERIFY
  { km: 205, route: "KL to Ipoh" }, // VERIFY
  { km: 355, route: "KL to Penang" }, // VERIFY
  { km: 772, route: "the full North–South Expressway" },
];
