// Icon registry (lucide-react line icons). Data files (awards, milestones, articles)
// refer to icons by name so they stay plain data with no React import.
import {
  Award, Bandage, BookOpen, Brain, CalendarCheck, CalendarDays, ChartLine, Flame, Footprints,
  House, Map, Medal, Rocket, Route, Smile, Sparkles, Star, Target, Trophy, Zap,
  type LucideIcon, type LucideProps,
} from "lucide-react";

const ICONS = {
  award: Award,
  bandage: Bandage,
  book: BookOpen,
  brain: Brain,
  calendar: CalendarDays,
  calendarCheck: CalendarCheck,
  chart: ChartLine,
  flame: Flame,
  footprints: Footprints,
  home: House,
  map: Map,
  medal: Medal,
  rocket: Rocket,
  route: Route,
  smile: Smile,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  trophy: Trophy,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = ICONS[name];
  return <C aria-hidden {...props} />;
}
