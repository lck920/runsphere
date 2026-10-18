import type { Metadata } from "next";
import Disclaimer from "@/components/Disclaimer";
import RoutineTimer from "./RoutineTimer";

export const metadata: Metadata = { title: "Warm-up · RunSphere" };

export default function WarmupPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl uppercase">Guided warm-up</h1>
        <p className="mt-1 text-sm text-muted">
          Press start, put your phone down and follow the voice. A dynamic warm-up gets your muscles ready to run; the
          cool-down helps you recover.
        </p>
      </div>
      <Disclaimer />
      <RoutineTimer />
    </div>
  );
}
