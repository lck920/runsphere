import { Suspense } from "react";
import type { Metadata } from "next";
import Board from "./Board";

export const metadata: Metadata = { title: "Leaderboard · RunSphere" };

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-card" />}>
      <Board />
    </Suspense>
  );
}
