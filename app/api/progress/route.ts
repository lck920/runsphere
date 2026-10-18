// GET /api/progress?nickname=aisyah_runs: everything for the "My progress" page.
import type { NextRequest } from "next/server";
import { db, failMessage } from "@/lib/supabase";
import { nicknameError } from "@/lib/validate";
import { progressSummary, type RunRow } from "@/lib/stats";
import { todayKL } from "@/lib/week";

export async function GET(req: NextRequest) {
  const nickname = (req.nextUrl.searchParams.get("nickname") ?? "").trim();
  const bad = nicknameError(nickname);
  if (bad) return Response.json({ error: bad }, { status: 400 });

  try {
    const supa = db();
    const { data: runner } = await supa.from("runners").select("id, nickname").eq("nickname_key", nickname.toLowerCase()).maybeSingle();
    if (!runner) return Response.json({ error: `No runs found for “${nickname}”. Check the spelling or log your first run.` }, { status: 404 });

    // ponytail: Supabase returns max 1000 rows; fine until one runner logs 1000+ runs, then paginate with .range().
    const { data: runs, error } = await supa
      .from("runs")
      .select("run_date, distance_km, duration_min, level, mood_before, mood_after")
      .eq("runner_id", runner.id)
      .order("run_date");
    if (error) throw error;

    return Response.json({ nickname: runner.nickname, ...progressSummary(runs as RunRow[], todayKL()) });
  } catch (e) {
    return Response.json({ error: failMessage(e, "Couldn't load your progress. Please try again.") }, { status: 500 });
  }
}
