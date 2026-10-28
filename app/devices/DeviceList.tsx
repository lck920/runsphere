"use client";
// Simulated pairing: Pair → "Searching…" → "Connecting…" → Connected.
// Paired devices are remembered in localStorage (this phone only); nothing is sent anywhere.
import { useState, useSyncExternalStore } from "react";
import { BluetoothConnected, BluetoothSearching, LoaderCircle, Watch } from "lucide-react";
import { DEVICES } from "@/data/devices";

const KEY = "runsphere:paired";
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
function save(ids: string[]) {
  try {
    localStorage.setItem(KEY, ids.join(","));
  } catch {}
  window.dispatchEvent(new StorageEvent("storage")); // re-render this tab too
}

type Step = "searching" | "connecting";

export default function DeviceList() {
  // Server render has no storage, so start empty and fill in on the client (no hydration mismatch).
  const paired = useSyncExternalStore(subscribe, read, () => "").split(",").filter(Boolean);
  const [busy, setBusy] = useState<Record<string, Step>>({});

  function pair(id: string) {
    setBusy((b) => ({ ...b, [id]: "searching" }));
    setTimeout(() => setBusy((b) => ({ ...b, [id]: "connecting" })), 1500);
    setTimeout(() => {
      setBusy((b) => {
        const next = { ...b };
        delete next[id];
        return next;
      });
      save([...new Set([...read().split(",").filter(Boolean), id])]);
    }, 3000);
  }
  const unpair = (id: string) => save(read().split(",").filter((x) => x && x !== id));

  return (
    <ul className="space-y-2">
      {DEVICES.map((d) => {
        const step = busy[d.id];
        const on = paired.includes(d.id);
        return (
          <li key={d.id} className={`flex items-center gap-3 rounded-2xl border border-line bg-card p-4 shadow-card ${on ? "ring-2 ring-accent" : ""}`}>
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${on ? "bg-accent text-on-accent" : "bg-ink"}`}>
              <Watch aria-hidden className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{d.name}</span>
              <span className="block text-xs text-muted" aria-live="polite">
                {step === "searching" ? "Searching for your watch…" : step === "connecting" ? "Connecting…" : on ? `Connected · via ${d.app}` : `Syncs via ${d.app}`}
              </span>
            </span>
            {step ? (
              <span className="grid size-10 place-items-center" aria-label="Pairing">
                {step === "searching" ? (
                  <BluetoothSearching aria-hidden className="size-5 animate-pulse text-accent-ink" />
                ) : (
                  <LoaderCircle aria-hidden className="size-5 animate-spin text-accent-ink" />
                )}
              </span>
            ) : on ? (
              <button onClick={() => unpair(d.id)} className="flex items-center gap-1 rounded-full border border-line px-3 py-2 text-xs font-semibold">
                <BluetoothConnected aria-hidden className="size-4 text-accent-ink" /> Unpair
              </button>
            ) : (
              <button onClick={() => pair(d.id)} className="display rounded-full bg-accent px-4 py-2 text-sm uppercase text-on-accent active:scale-95">
                Pair
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
