"use client";
// Catches unexpected crashes in any page so users see a friendly message, not a blank screen.
import Link from "next/link";
import { CircleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-3xl border border-line bg-card shadow-card p-8 text-center">
      <CircleAlert aria-hidden className="mx-auto size-14 text-danger" />
      <h1 className="display mt-3 text-2xl uppercase">Something went wrong</h1>
      <p className="mt-1 text-muted">Please try again. If it keeps happening, check your connection.</p>
      <div className="mt-5 flex justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-accent px-6 py-3 display uppercase text-on-accent">Try again</button>
        <Link href="/" className="rounded-full border border-line px-6 py-3 font-semibold">Home</Link>
      </div>
    </div>
  );
}
