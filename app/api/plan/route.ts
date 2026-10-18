// POST /api/plan  { nickname?, experience, days, goal } → this week's plan.
// If the nickname has logged runs, the last 4 full weeks adjust the plan.
import { db, failMessage } from "@/lib/supabase";
import { nicknameError } from "@/lib/validate";
import { EXPERIENCES, GOALS, generatePlan, type PlanInput, type PlanWeek } from "@/lib/plan";
import { addDays, formatWeek, todayKL, weekStart } from "@/lib/week";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const input = { experience: body.experience, days: Number(body.days), goal: body.goal } as PlanInput;

  const errors: Record<string, string> = {};
  if (!(input.experience in EXPERIENCES)) errors.experience = "Pick your running level.";
  if (![2, 3, 4].includes(input.days)) errors.days = "Pick 2, 3 or 4 days.";
  if (!(input.goal in GOALS)) errors.goal = "Pick a goal.";
  if (nickname && nicknameError(nickname)) errors.nickname = nicknameError(nickname)!;
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const monday = weekStart(todayKL());
  let history: PlanWeek[] = [];
  let found = false;
  try {
    if (nickname) {
      const supa = db();
      const { data: runner } = await supa.from("runners").select("id").eq("nickname_key", nickname.toLowerCase()).maybeSingle();
      if (runner) {
        found = true;
        const { data, error } = await supa
          .from("runner_weeks")
          .select("week_start, runs, minutes")
          .eq("runner_id", runner.id)
          .gte("week_start", addDays(monday, -28))
          .lt("week_start", monday);
        if (error) throw error;
        history = data;
      }
    }
  } catch (e) {
    return Response.json({ errors: { form: failMessage(e, "Couldn't read your run history. Please try again.") } }, { status: 500 });
  }

  return Response.json({ plan: generatePlan(input, history, monday), week: formatWeek(monday), found, nickname });
}
