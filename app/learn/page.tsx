import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { ARTICLES } from "@/data/articles";

export const metadata: Metadata = { title: "Learn · RunSphere" };

export default function LearnPage() {
  return (
    <div>
      <h1 className="display text-3xl uppercase">Learn</h1>
      <p className="mt-1 text-sm text-muted">Short, evidence-based reads to help you run safely and keep at it.</p>
      <ul className="mt-5 space-y-3">
        {ARTICLES.map((a) => (
          <li key={a.slug}>
            <Link href={`/learn/${a.slug}`} className="flex gap-4 rounded-2xl border border-line bg-card shadow-card p-4 active:border-accent">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-on-accent">
                <Icon name={a.icon} className="size-6" strokeWidth={2.5} />
              </span>
              <span>
                <span className="block font-semibold">{a.title}</span>
                <span className="block text-sm text-muted">{a.summary}</span>
                <span className="mt-1 block text-xs text-accent-ink">{a.minutes} min read</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
