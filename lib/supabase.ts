// Server-only Supabase client. The `server-only` import makes the build fail
// if any client component ever imports this file, so the service role key
// can never end up in the browser bundle.
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example)");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Logs a server error and returns a friendly message. Locally (`npm run dev`) the real cause is appended; never in production. */
export function failMessage(e: unknown, message: string): string {
  console.error(e);
  return process.env.NODE_ENV === "development" ? `${message} (${e instanceof Error ? e.message : String(e)})` : message;
}
