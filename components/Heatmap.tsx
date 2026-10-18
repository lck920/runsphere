"use client";
// GitHub-style habit heatmap: one column per week (Mon at top), one lime
// hue getting stronger with more km. Tap a day to see its distance.
import { useState } from "react";

type Day = { date: string; km: number | null }; // null = future

// Sequential scale (theme tokens in globals.css): none → pale lime → dark olive (light theme) / bright lime (dark).
const STEPS = [
  { min: 0, cls: "bg-line" },
  { min: 0.01, cls: "bg-heat-1" },
  { min: 3, cls: "bg-heat-2" },
  { min: 6, cls: "bg-heat-3" },
  { min: 10, cls: "bg-heat-4" },
];
const color = (km: number) => STEPS.findLast((s) => km >= s.min)!.cls;
const long = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export default function Heatmap({ days }: { days: Day[] }) {
  const [sel, setSel] = useState<Day | null>(null);
  const active = days.filter((d) => d.km).length;
  return (
    <figure>
      <div className="flex gap-1.5">
        <div className="grid grid-rows-7 gap-[3px] text-[10px] leading-none text-muted" aria-hidden>
          {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((l, i) => <span key={i} className="flex items-center">{l}</span>)}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]" aria-hidden>
          {days.map((d) =>
            d.km === null ? (
              <span key={d.date} />
            ) : (
              <button
                key={d.date}
                tabIndex={-1}
                onClick={() => setSel(d)}
                onMouseEnter={() => setSel(d)}
                className={`aspect-square rounded-[3px] ${color(d.km)} ${sel?.date === d.date ? "ring-2 ring-fg" : ""}`}
              />
            ),
          )}
        </div>
      </div>
      <figcaption className="mt-2 flex items-center justify-between text-xs text-muted">
        <span aria-live="polite">
          {sel ? <>{long(sel.date)}: <strong className="text-fg">{sel.km ? `${sel.km} km` : "no run"}</strong></> : `${active} run days in the last 16 weeks`}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          Less {STEPS.map((s) => <span key={s.min} className={`size-2.5 rounded-[2px] ${s.cls}`} />)} More
        </span>
      </figcaption>
    </figure>
  );
}
