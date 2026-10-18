// Week helpers. RunSphere weeks run Monday → Sunday in Asia/Kuala_Lumpur.
// KL is a fixed UTC+8 with no daylight saving, so after we find "today" in KL
// we can treat every date as a plain "YYYY-MM-DD" string and do maths in UTC.

const TZ = "Asia/Kuala_Lumpur";

/** Today's date in Kuala Lumpur as "YYYY-MM-DD". */
export function todayKL(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The Monday that starts the week containing `date`. */
export function weekStart(date: string): string {
  const dow = new Date(date + "T00:00:00Z").getUTCDay(); // 0 = Sun … 6 = Sat
  return addDays(date, -((dow + 6) % 7));
}

/** e.g. "13 – 19 Oct" */
export function formatWeek(monday: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00Z").toLocaleDateString("en-MY", { day: "numeric", month: "short", timeZone: "UTC" });
  const [start, end] = [fmt(monday), fmt(addDays(monday, 6))];
  // Drop the month on the first date when both dates share it.
  return `${start.split(" ")[1] === end.split(" ")[1] ? start.split(" ")[0] : start} – ${end}`;
}
