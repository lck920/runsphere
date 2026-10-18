// Weekly challenges per level. Edit freely; the whole app reads from here.
export type Level = "beginner" | "intermediate" | "advanced";

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export const CHALLENGES: Record<Level, { label: string; runs: number; km: number; blurb: string }> = {
  beginner:     { label: "Beginner",     runs: 2, km: 0,  blurb: "Get out twice. Walk breaks totally allowed." },
  intermediate: { label: "Intermediate", runs: 3, km: 10, blurb: "Three runs adding up to 10 km." },
  advanced:     { label: "Advanced",     runs: 4, km: 20, blurb: "Four runs, 20 km total. Keep it steady." },
};
