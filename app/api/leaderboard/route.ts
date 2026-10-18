// GET /api/leaderboard?level=beginner: this week's board for one level.
import type { NextRequest } from "next/server";
import { db, failMessage } from "@/lib/supabase";
import { LEVELS, type Level } from "@/data/challenges";
import { rankBoard, streaks, type WeekTotal } from "@/lib/stats";
import { formatWeek, todayKL, weekStart } from "@/lib/week";

export async function GET(req: NextRequest) {
  const level = req.nextUrl.searchParams.get("level") as Level;
  if (!LEVELS.includes(level)) return Response.json({ error: "Unknown level" }, { status: 400 });

  const today = todayKL();
  const monday = weekStart(today);
  try {
    const supa = db();
    // 1. This week's runs at this level → who's on the board, with runs + km.
    // ponytail: up to 1000 runs/level/week and ~200 runners per `.in()` URL;
    // move to a SQL function (rpc) if RunSphere outgrows that.
    const { data: runs, error } = await supa
      .from("runs")
      .select("runner_id, distance_km, runners(nickname)")
      .eq("level", level)
      .gte("run_date", monday)
      .lte("run_date", today);
    if (error) throw error;

    const byRunner = new Map<string, { nickname: string; runs: number; km: number; streak: number }>();
    for (const r of runs) {
      const nickname = (r.runners as unknown as { nickname: string }).nickname;
      const e = byRunner.get(r.runner_id) ?? { nickname, runs: 0, km: 0, streak: 0 };
      e.runs++;
      e.km += Number(r.distance_km);
      byRunner.set(r.runner_id, e);
    }

    // 2. Their weekly history (all levels) → current streak.
    if (byRunner.size) {
      const { data: weeks, error: wErr } = await supa
        .from("runner_weeks")
        .select("runner_id, week_start, runs, km")
        .in("runner_id", [...byRunner.keys()]);
      if (wErr) throw wErr;
      const grouped = Map.groupBy(weeks as (WeekTotal & { runner_id: string })[], (w) => w.runner_id);
      for (const [id, e] of byRunner) e.streak = streaks(grouped.get(id) ?? [], today).current;
    }

    return Response.json({ level, week: formatWeek(monday), entries: rankBoard([...byRunner.values()], level) });
  } catch (e) {
    return Response.json({ error: failMessage(e, "Couldn't load the leaderboard.") }, { status: 500 });
  }
}
