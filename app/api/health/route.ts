// GET /api/health: checks the env vars and database connection. Handy after deploying.
import { connection } from "next/server";
import { db, failMessage } from "@/lib/supabase";

export async function GET() {
  await connection(); // run per request, never at build time
  try {
    const { count, error } = await db().from("runners").select("*", { count: "exact", head: true });
    if (error) throw error;
    return Response.json({ ok: true, runners: count });
  } catch (e) {
    return Response.json({ ok: false, error: failMessage(e, "Database not reachable. Check env vars and schema.") }, { status: 500 });
  }
}
