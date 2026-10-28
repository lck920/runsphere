// Weekly challenge as a checklist. Boxes tick themselves from logged runs
// (never by hand, so a challenge can't be claimed without running).
import { Check, Trophy } from "lucide-react";
import type { ChallengeProgress } from "@/lib/stats";

export default function ChallengeChecklist({ c }: { c: ChallengeProgress }) {
  const items = [{ goal: `${c.targetRuns} runs`, have: `${c.runs}/${c.targetRuns}`, done: c.runs >= c.targetRuns }];
  if (c.targetKm) items.push({ goal: `${c.targetKm} km`, have: `${c.km}/${c.targetKm}`, done: c.km >= c.targetKm });

  const runsLeft = Math.max(0, c.targetRuns - c.runs);
  const kmLeft = Math.max(0, Math.round((c.targetKm - c.km) * 10) / 10);
  const todo = [runsLeft && `${runsLeft} more run${runsLeft === 1 ? "" : "s"}`, kmLeft && `${kmLeft} km more`].filter(Boolean);

  return (
    <div className="space-y-2 text-left">
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.goal} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
            {i.done ? (
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                <Check aria-hidden className="size-4" strokeWidth={3} />
              </span>
            ) : (
              <span aria-hidden className="size-6 shrink-0 rounded-full border-2 border-line" />
            )}
            <span className={i.done ? "font-semibold" : ""}>
              {i.goal}
              <span className="sr-only">{i.done ? " (done)" : " (not yet)"}</span>
            </span>
            <span className="ml-auto text-sm tabular-nums text-muted">{i.have}</span>
          </li>
        ))}
      </ul>
      {c.complete ? (
        <p className="display flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 uppercase text-on-accent">
          <Trophy aria-hidden className="size-5" /> Challenge complete!
        </p>
      ) : (
        <p className="text-center text-sm text-muted">{todo.join(" and ")} to complete this week&apos;s challenge</p>
      )}
    </div>
  );
}
