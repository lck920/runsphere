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
 * Fun-fact comparisons. The progress page shows the biggest one inside your total
 * ("That's further than ___!") and the next one to aim for ("1.2 km more to beat ___").
 * Write each as a noun phrase that fits both sentences. Keep the list sorted by km.
 *
 * Unmarked entries are well-documented figures. Entries marked VERIFY are rough
 * estimates (road/route distances vary); check them on Google Maps before the demo.
 */
export const LOCAL_ROUTES: { km: number; route: string }[] = [
  { km: 0.4, route: "a lap of the Bukit Jalil National Stadium track" },
  { km: 0.45, route: "the height of the Petronas Twin Towers" },
  { km: 0.68, route: "the height of Merdeka 118" },
  { km: 1.05, route: "the Johor–Singapore Causeway" },
  { km: 1.3, route: "a lap of the KLCC Park jogging track" }, // VERIFY
  { km: 4, route: "the walk from KLCC to KL Sentral" }, // VERIFY
  { km: 4.1, route: "the height of Mount Kinabalu" },
  { km: 8, route: "Bukit Jalil to Sri Petaling" }, // VERIFY
  { km: 8.7, route: "the Mount Kinabalu summit trail" }, // VERIFY
  { km: 8.85, route: "the height of Mount Everest" },
  { km: 13.5, route: "the Penang Bridge" },
  { km: 24, route: "the Second Penang Bridge" },
  { km: 35, route: "the drive from KL to Putrajaya" }, // VERIFY
  { km: 46, route: "the whole LRT Kelana Jaya Line" }, // VERIFY
  { km: 58, route: "KL up to Genting Highlands" }, // VERIFY
  { km: 145, route: "the drive from KL to Melaka" }, // VERIFY
  { km: 205, route: "the drive from KL to Ipoh" }, // VERIFY
  { km: 250, route: "the drive from KL to Kuantan" }, // VERIFY
  { km: 330, route: "the drive from KL to Johor Bahru" }, // VERIFY
  { km: 355, route: "the drive from KL to Penang" }, // VERIFY
  { km: 772, route: "the full North–South Expressway" },
  { km: 1620, route: "the flight from KL to Kota Kinabalu" }, // VERIFY
];
