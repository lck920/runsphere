"use client";
// Single-series bar chart of km per week. Tap or hover a bar to read its value
// (this week is selected by default); a hidden table covers screen readers.
import { useState } from "react";

const short = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-MY", { day: "numeric", month: "short", timeZone: "UTC" });

export default function WeeklyChart({ data }: { data: { week: string; km: number }[] }) {
  const [sel, setSel] = useState(data.length - 1);
  const max = Math.max(1, ...data.map((d) => d.km));
  return (
    <figure>
      <p className="mb-2 h-5 text-sm" aria-hidden>
        Week of {short(data[sel].week)}: <strong className="text-fg">{data[sel].km} km</strong>
      </p>
      <div className="flex h-36 items-end gap-1.5 border-b border-line" aria-hidden>
        {data.map((d, i) => (
          <button
            key={d.week}
            tabIndex={-1}
            onClick={() => setSel(i)}
            onMouseEnter={() => setSel(i)}
            className="flex h-full flex-1 items-end"
          >
            <span
              className={`w-full rounded-t ${i === sel ? "bg-heat-4" : "bg-heat-3"}`}
              style={{ height: `${(d.km / max) * 100}%`, minHeight: d.km ? 4 : 0 }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5 text-[10px] text-muted" aria-hidden>
        {data.map((d) => <span key={d.week} className="flex-1 text-center">{short(d.week)}</span>)}
      </div>
      <table className="sr-only">
        <caption>Distance per week</caption>
        <tbody>
          {data.map((d) => <tr key={d.week}><th>Week of {short(d.week)}</th><td>{d.km} km</td></tr>)}
        </tbody>
      </table>
    </figure>
  );
}
