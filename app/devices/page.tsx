import type { Metadata } from "next";
import { Info } from "lucide-react";
import DeviceList from "./DeviceList";

export const metadata: Metadata = { title: "Devices · RunSphere" };

export default function DevicesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl uppercase">Devices</h1>
        <p className="mt-1 text-sm text-muted">Pair your smartwatch to RunSphere.</p>
      </div>
      <p role="note" className="flex gap-2 rounded-xl border border-line bg-card p-3 text-xs shadow-card">
        <Info aria-hidden className="size-4 shrink-0 text-accent-ink" />
        <span>
          <strong>Preview: device sync is coming soon.</strong> Pairing here is a demo and stays on this phone only.
          Your runs won&apos;t sync automatically yet, so keep logging them on the Log page.
        </span>
      </p>
      <DeviceList />
    </div>
  );
}
