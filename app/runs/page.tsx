import { Suspense } from "react";
import type { Metadata } from "next";
import Community from "./Community";

export const metadata: Metadata = { title: "Group runs · RunSphere" };

export default function RunsPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-card" />}>
      <Community />
    </Suspense>
  );
}
