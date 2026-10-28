"use client";
// Group runs + chat: STATIC DEMO. Sample events/messages come from data/groupRuns.ts;
// anything the user does (host, join, chat) is kept in localStorage on this phone only.
import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Info, MapPin, MessageCircle, Plus, Send, Users, X } from "lucide-react";
import { chipCls, inlineIcon, inputCls, primaryBtn } from "@/components/styles";
import { CHALLENGES, LEVELS, type Level } from "@/data/challenges";
import { DEMO_MESSAGES, DEMO_RUNS, type ChatMessage, type GroupRun } from "@/data/groupRuns";
import { getSavedNickname, saveNickname } from "@/lib/local";
import { nicknameError } from "@/lib/validate";
import { addDays, todayKL } from "@/lib/week";

// ---- this phone's demo data ------------------------------------------------
type Store = { hosted: GroupRun[]; joined: string[]; messages: Record<string, ChatMessage[]> };
const KEY = "runsphere:community";
const EMPTY: Store = { hosted: [], joined: [], messages: {} };

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const readRaw = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
const parse = (raw: string): Store => {
  try {
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
};
function update(fn: (s: Store) => Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(fn(parse(readRaw()))));
  } catch {}
  window.dispatchEvent(new StorageEvent("storage")); // re-render this tab too
}
const toggleJoin = (id: string) =>
  update((s) => ({ ...s, joined: s.joined.includes(id) ? s.joined.filter((x) => x !== id) : [...s.joined, id] }));

// ---- helpers --------------------------------------------------------------
type Event = GroupRun & { date: string };
const when = (e: Event) => {
  const [h, m] = e.time.split(":").map(Number);
  const day = new Date(e.date + "T00:00:00Z").toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return `${day} · ${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const nowTime = () => new Date().toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" });

export default function Community() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  const store = useMemo(() => parse(raw), [raw]);
  const [hosting, setHosting] = useState(false);

  const today = todayKL();
  const events: Event[] = [...store.hosted, ...DEMO_RUNS]
    .map((e) => ({ ...e, date: e.date ?? addDays(today, e.inDays ?? 0) }))
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const open = events.find((e) => e.id === id);
  if (open) return <EventView e={open} store={store} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-3xl uppercase">Group runs</h1>
        <p className="mt-1 text-sm text-muted">Join a run near you and meet other runners.</p>
      </div>
      <DemoNote />

      {hosting ? (
        <HostForm
          today={today}
          onCancel={() => setHosting(false)}
          onDone={(newId) => {
            setHosting(false);
            router.push(`/runs?id=${newId}`);
          }}
        />
      ) : (
        <button onClick={() => setHosting(true)} className={`flex w-full items-center justify-center gap-2 py-3.5 ${primaryBtn}`}>
          <Plus aria-hidden className="size-5" strokeWidth={3} /> Host a run
        </button>
      )}

      <ul className="space-y-3">
        {events.map((e) => {
          const joined = store.joined.includes(e.id);
          const chats = (DEMO_MESSAGES[e.id]?.length ?? 0) + (store.messages[e.id]?.length ?? 0);
          return (
            <li key={e.id} className={`rounded-2xl border border-line bg-card p-4 shadow-card ${joined ? "ring-2 ring-accent" : ""}`}>
              <Link href={`/runs?id=${e.id}`} className="block">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-ink">{when(e)}</p>
                <p className="display mt-1 text-xl uppercase">{e.title}</p>
                <p className="mt-1 text-sm text-muted">
                  <MapPin aria-hidden className={inlineIcon} /> {e.place} · {e.km} km · {CHALLENGES[e.level].label}
                </p>
                <p className="mt-1 text-xs text-muted">Hosted by {e.host}</p>
              </Link>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-muted">
                  <Users aria-hidden className="size-4" /> {e.going + (joined ? 1 : 0)} going
                </span>
                <Link href={`/runs?id=${e.id}`} className="ml-auto flex items-center gap-1 rounded-full border border-line px-3 py-2 text-xs font-semibold">
                  <MessageCircle aria-hidden className="size-4" /> {chats}
                </Link>
                <JoinButton joined={joined} onClick={() => toggleJoin(e.id)} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DemoNote() {
  return (
    <p role="note" className="flex gap-2 rounded-xl border border-line bg-card p-3 text-xs shadow-card">
      <Info aria-hidden className="size-4 shrink-0 text-accent-ink" />
      <span>
        <strong>Demo:</strong> these group runs, clubs and chats are samples. Anything you host, join or post stays on
        this phone only and isn&apos;t seen by other runners.
      </span>
    </p>
  );
}

function JoinButton({ joined, onClick }: { joined: boolean; onClick: () => void }) {
  return joined ? (
    <button onClick={onClick} className="flex items-center gap-1 rounded-full border-2 border-accent px-4 py-2 text-sm font-semibold">
      <Check aria-hidden className="size-4" strokeWidth={3} /> Going
    </button>
  ) : (
    <button onClick={onClick} className={`px-5 py-2 text-sm ${primaryBtn}`}>Join</button>
  );
}

// ---- host a run -------------------------------------------------------------
function HostForm({ today, onCancel, onDone }: { today: string; onCancel: () => void; onDone: (id: string) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    const km = Number(f.km);
    const e: Record<string, string> = {};
    const nick = nicknameError(f.host ?? "");
    if (nick) e.host = nick;
    if ((f.title ?? "").trim().length < 3) e.title = "Give your run a name (3+ characters).";
    if ((f.place ?? "").trim().length < 3) e.place = "Where should people meet?";
    if (!f.date || f.date < today || f.date > addDays(today, 60)) e.date = "Pick a date within the next 60 days.";
    if (!/^\d{2}:\d{2}$/.test(f.time ?? "")) e.time = "Pick a start time.";
    if (!(km >= 1 && km <= 42)) e.km = "Distance must be 1–42 km.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const id = `my-${Date.now()}`;
    const host = f.host.trim();
    saveNickname(host);
    update((s) => ({
      ...s,
      hosted: [...s.hosted, { id, title: f.title.trim(), date: f.date, time: f.time, place: f.place.trim(), km, level: f.level as Level, host, going: 0 }],
      joined: [...s.joined, id], // the host is going, obviously
    }));
    onDone(id);
  }

  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-danger">{errors[k]}</p>;
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-line bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="display text-xl uppercase">Host a run</h2>
        <button type="button" onClick={onCancel} aria-label="Cancel" className="grid size-9 place-items-center rounded-full border border-line">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Run name</span>
        <input name="title" maxLength={40} placeholder="e.g. Friday sunset 5K" className={inputCls} />
        {err("title")}
      </label>
      <label className="block">
        <span className="text-sm font-medium">Meeting point</span>
        <input name="place" maxLength={60} placeholder="e.g. Bukit Jalil National Stadium, main gate" className={inputCls} />
        {err("place")}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Date</span>
          <input name="date" type="date" min={today} max={addDays(today, 60)} defaultValue={addDays(today, 1)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Start time</span>
          <input name="time" type="time" defaultValue="06:30" className={inputCls} />
        </label>
      </div>
      {err("date")}
      {err("time")}
      <label className="block">
        <span className="text-sm font-medium">Distance (km)</span>
        <input name="km" type="number" inputMode="decimal" min={1} max={42} step="0.5" defaultValue={5} className={inputCls} />
        {err("km")}
      </label>
      <fieldset>
        <legend className="text-sm font-medium">Suitable for</legend>
        <div className="mt-1 flex gap-2">
          {LEVELS.map((l) => (
            <label key={l} className={chipCls}>
              <input type="radio" name="level" value={l} defaultChecked={l === "beginner"} className="sr-only" />
              {CHALLENGES[l].label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-sm font-medium">Your nickname (host)</span>
        <input name="host" maxLength={20} defaultValue={getSavedNickname()} autoComplete="off" autoCapitalize="none" className={inputCls} />
        {err("host")}
      </label>
      <button className={`w-full py-3.5 ${primaryBtn}`}>Create run</button>
    </form>
  );
}

// ---- one event + its chat ------------------------------------------------------
function EventView({ e, store }: { e: Event; store: Store }) {
  const [draft, setDraft] = useState("");
  const joined = store.joined.includes(e.id);
  const messages = [...(DEMO_MESSAGES[e.id] ?? []), ...(store.messages[e.id] ?? [])];

  function send(ev: React.FormEvent) {
    ev.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const me = getSavedNickname() || "You";
    const firstPost = !(store.messages[e.id] ?? []).some((m) => m.author === me);
    const add = (m: ChatMessage) => update((s) => ({ ...s, messages: { ...s.messages, [e.id]: [...(s.messages[e.id] ?? []), m] } }));
    add({ author: me, text, when: nowTime() });
    setDraft("");
    // Demo touch: the host replies to your first message.
    if (firstPost && e.host !== me)
      setTimeout(() => add({ author: e.host, text: `Welcome${me === "You" ? "" : `, ${me}`}! See you there. Bring water, it gets hot.`, when: nowTime() }), 1500);
  }

  return (
    <div className="space-y-4">
      <Link href="/runs" className="inline-flex items-center gap-1 text-sm text-accent-ink">
        <ArrowLeft aria-hidden className="size-4" /> All group runs
      </Link>

      <section className="hero surface-dark rounded-3xl p-5 ring-1 ring-line">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{when(e)}</p>
        <h1 className="display mt-1 text-3xl uppercase leading-tight">{e.title}</h1>
        <p className="mt-2 text-sm text-muted">
          <MapPin aria-hidden className={inlineIcon} /> {e.place}
        </p>
        <p className="text-sm text-muted">
          <CalendarDays aria-hidden className={inlineIcon} /> {e.km} km · {CHALLENGES[e.level].label} · hosted by {e.host}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm">
            <Users aria-hidden className="size-4" /> {e.going + (joined ? 1 : 0)} going
          </span>
          <span className="ml-auto">
            <JoinButton joined={joined} onClick={() => toggleJoin(e.id)} />
          </span>
        </div>
      </section>

      <DemoNote />

      <section className="rounded-2xl border border-line bg-card p-4 shadow-card">
        <h2 className="mb-3 font-bold">Chat</h2>
        {messages.length === 0 && <p className="text-sm text-muted">No messages yet. Say hi!</p>}
        <ul className="space-y-3">
          {messages.map((m, i) => {
            const host = m.author === e.host;
            return (
              <li key={i} className="text-sm">
                <p className="flex items-baseline gap-2">
                  <span className={`font-semibold ${host ? "text-accent-ink" : ""}`}>{m.author}</span>
                  {host && <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-on-accent">HOST</span>}
                  <span className="text-xs text-muted">{m.when}</span>
                </p>
                <p className="mt-0.5 break-words">{m.text}</p>
              </li>
            );
          })}
        </ul>
        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            maxLength={280}
            placeholder="Message the group…"
            aria-label="Message"
            className={`${inputCls} mt-0`}
          />
          <button aria-label="Send" disabled={!draft.trim()} className={`grid size-12 shrink-0 place-items-center ${primaryBtn}`}>
            <Send aria-hidden className="size-5" />
          </button>
        </form>
      </section>
    </div>
  );
}
