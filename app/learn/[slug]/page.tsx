import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Icon from "@/components/Icon";
import { ARTICLES } from "@/data/articles";

const find = (slug: string) => ARTICLES.find((a) => a.slug === slug);

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const a = find((await params).slug);
  return { title: a ? `${a.title} · RunSphere` : "Learn · RunSphere" };
}

// The back link is the same for every article, so it renders instantly; the
// article itself depends on the URL, so it sits behind Suspense (Next 16 instant navigation).
export default function ArticlePage({ params }: PageProps<"/learn/[slug]">) {
  return (
    <>
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-accent-ink"><ArrowLeft aria-hidden className="size-4" /> All articles</Link>
      <Suspense fallback={<div className="mt-4 h-96 animate-pulse rounded-2xl bg-card" />}>
        <ArticleBody params={params} />
      </Suspense>
    </>
  );
}

async function ArticleBody({ params }: Pick<PageProps<"/learn/[slug]">, "params">) {
  const a = find((await params).slug);
  if (!a) notFound();
  return (
    <article>
      <span className="mt-4 grid size-14 place-items-center rounded-2xl bg-accent text-on-accent">
        <Icon name={a.icon} className="size-7" strokeWidth={2.5} />
      </span>
      <h1 className="display mt-2 text-3xl uppercase leading-none">{a.title}</h1>
      <p className="mt-1 text-muted">{a.summary}</p>
      {a.sections.map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="text-lg font-bold">{s.heading}</h2>
          <p className="mt-1 leading-relaxed text-fg/85">{s.body}</p>
        </section>
      ))}
      <section className="mt-8 rounded-2xl border border-line bg-card shadow-card p-4">
        <h2 className="text-sm font-bold">References</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted">
          {a.references.map((r) => (
            <li key={r.url}>
              {r.text}{" "}
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all text-accent-ink underline">
                {r.url.replace("https://", "")}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
