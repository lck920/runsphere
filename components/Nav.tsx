"use client";
// Floating pill nav (dark in both themes), with "Log a run" as the big lime button in the middle.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartLine, House, Plus, Trophy } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/leaderboard", label: "Board", Icon: Trophy },
  { href: "/log", label: "Log", Icon: Plus },
  { href: "/plan", label: "Plan", Icon: CalendarDays },
  { href: "/progress", label: "Me", Icon: ChartLine },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <ul className="surface-dark mx-auto grid max-w-md grid-cols-5 items-center rounded-full bg-card/95 px-2 py-1.5 shadow-lg ring-1 ring-line backdrop-blur">
        {ITEMS.map((i) => {
          const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
          if (i.href === "/log")
            return (
              <li key={i.href} className="flex justify-center">
                <Link
                  href={i.href}
                  aria-label="Log a run"
                  aria-current={active ? "page" : undefined}
                  className="grid size-14 -translate-y-3 place-items-center rounded-full bg-accent text-on-accent shadow-lg ring-4 ring-ink active:scale-95"
                >
                  <i.Icon aria-hidden className="size-7" strokeWidth={3} />
                </Link>
              </li>
            );
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium ${active ? "text-accent" : "text-muted"}`}
              >
                <i.Icon aria-hidden className="size-5" strokeWidth={active ? 2.5 : 2} />
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
