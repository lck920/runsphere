import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icon, { type IconName } from "@/components/Icon";
import { connection } from "next/server";
import { CHALLENGES, LEVELS } from "@/data/challenges";
import { formatWeek, todayKL, weekStart } from "@/lib/week";

const FEATURES: { href: string; icon: IconName; title: string; text: string }[] = [
  { href: "/log", icon: "footprints", title: "Log a run", text: "Takes 30 seconds" },
  { href: "/leaderboard", icon: "trophy", title: "Leaderboard", text: "Ranked by consistency" },
  { href: "/plan", icon: "calendar", title: "My weekly plan", text: "Safe, personalised" },
  { href: "/warmup", icon: "flame", title: "Warm-up", text: "Guided, with a timer" },
  { href: "/progress", icon: "chart", title: "My progress", text: "Streaks, awards, stats" },
  { href: "/learn", icon: "book", title: "Learn", text: "Run smarter, stay healthy" },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl hero surface-dark p-6 ring-1 ring-line">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-ink">SDG 3 · Good Health & Well-being</p>
        <h1 className="mt-2 text-3xl display leading-tight">
          Small runs.<br />Every week.<br /><span className="text-accent-ink">Big habit.</span>
        </h1>
        <p className="mt-3 text-muted">
          RunSphere helps uni students in Malaysia start running and keep at it with weekly challenges,
          streaks and a plan that fits your timetable. Free, no sign-up, just a nickname.
        </p>
        <Link href="/log" className="mt-5 inline-block rounded-full bg-accent px-6 py-3 display uppercase text-on-accent active:scale-95">
          Log your first run <ArrowRight aria-hidden className="inline size-5 align-[-4px]" strokeWidth={3} />
        </Link>
      </section>

      <section>
        <Suspense fallback={<h2 className="text-xl font-bold">This week&apos;s challenges</h2>}>
          <WeekHeading />
        </Suspense>
        <ul className="mt-3 space-y-3">
          {LEVELS.map((l) => {
            const c = CHALLENGES[l];
            return (
              <li key={l} className="rounded-2xl border border-line bg-card shadow-card p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-sm text-accent-ink">
                    {c.runs} runs{c.km ? ` · ${c.km} km` : ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{c.blurb}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">Explore</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <li key={f.href}>
              <Link href={f.href} className="block h-full rounded-2xl border border-line bg-card shadow-card p-4 active:border-accent">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-on-accent">
                  <Icon name={f.icon} className="size-5" strokeWidth={2.5} />
                </span>
                <p className="mt-2 font-semibold">{f.title}</p>
                <p className="text-xs text-muted">{f.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-line pt-4 text-xs text-muted">
        No sign-up. We only store your nickname and run details (PDPA 2010). RunSphere gives general guidance, not
        medical advice. Check with a doctor if you have a health condition.
      </footer>
    </div>
  );
}

// The current week depends on today's date, so it renders at request time, not build time.
async function WeekHeading() {
  await connection();
  return (
    <h2 className="text-xl font-bold">
      This week&apos;s challenges <span className="text-sm font-normal text-muted">({formatWeek(weekStart(todayKL()))})</span>
    </h2>
  );
}
