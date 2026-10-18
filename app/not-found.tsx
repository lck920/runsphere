import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-line bg-card shadow-card p-8 text-center">
      <Compass aria-hidden className="mx-auto size-14 text-accent-ink" />
      <h1 className="display mt-3 text-2xl uppercase">Wrong turn</h1>
      <p className="mt-1 text-muted">We couldn&apos;t find that page.</p>
      <Link href="/" className="mt-5 inline-block rounded-full bg-accent px-6 py-3 display uppercase text-on-accent">Back to home</Link>
    </div>
  );
}
