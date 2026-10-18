import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import LogForm from "./LogForm";
import { todayKL } from "@/lib/week";

export const metadata: Metadata = { title: "Log a run · RunSphere" };

export default function LogPage() {
  return (
    <div>
      <h1 className="display text-3xl uppercase">Log a run</h1>
      <p className="mt-1 text-sm text-muted">Every run counts, walk breaks included.</p>
      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-card" />}>
        <FormWithToday />
      </Suspense>
    </div>
  );
}

// "Today" must be computed per request in KL time (not at build time).
async function FormWithToday() {
  await connection();
  return <LogForm today={todayKL()} />;
}
