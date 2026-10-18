// POST /api/runs: log a run (multipart form, optional screenshot).
// Replies with the runner's fresh streak + this week's challenge progress.
import { db, failMessage } from "@/lib/supabase";
import { validateRun } from "@/lib/validate";
import { challengeProgress, crossedMilestone, streaks, type WeekTotal } from "@/lib/stats";
import { todayKL, weekStart } from "@/lib/week";

const MAX_RUNS_PER_DAY = 3; // stops accidental double-submits and silly spam
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB

const bad = (errors: Record<string, string>) => Response.json({ errors }, { status: 400 });

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad({ form: "Couldn't read the form." });
  }

  const fields: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string") fields[k] = v;
  const today = todayKL();
  const { errors, run } = validateRun(fields, today);

  const file = form.get("screenshot");
  const image = file instanceof File && file.size > 0 ? file : null;
  if (image && !IMAGE_TYPES[image.type]) errors.screenshot = "Screenshot must be a JPG, PNG or WebP image.";
  if (image && image.size > MAX_IMAGE_BYTES) errors.screenshot = "Screenshot must be under 4 MB.";
  if (!run || errors.screenshot) return bad(errors);

  let uploaded: string | null = null;
  try {
    const supa = db();
    // Find or create the runner. Nicknames are matched case-insensitively.
    const key = run.nickname.toLowerCase();
    let { data: runner } = await supa.from("runners").select("id, nickname").eq("nickname_key", key).maybeSingle();
    if (!runner) {
      const ins = await supa.from("runners").insert({ nickname: run.nickname }).select("id, nickname").single();
      if (ins.error?.code === "23505") {
        // someone created the same nickname a moment ago, so use theirs
        runner = (await supa.from("runners").select("id, nickname").eq("nickname_key", key).single()).data;
      } else if (ins.error) throw ins.error;
      else runner = ins.data;
    }
    if (!runner) throw new Error("runner lookup failed");

    const { count } = await supa
      .from("runs")
      .select("*", { count: "exact", head: true })
      .eq("runner_id", runner.id)
      .eq("run_date", run.date);
    if ((count ?? 0) >= MAX_RUNS_PER_DAY) return bad({ date: `You've already logged ${MAX_RUNS_PER_DAY} runs on this day.` });

    if (image) {
      uploaded = `${runner.id}/${crypto.randomUUID()}.${IMAGE_TYPES[image.type]}`;
      const up = await supa.storage.from("screenshots").upload(uploaded, image, { contentType: image.type });
      if (up.error) throw up.error;
    }

    const { error } = await supa.from("runs").insert({
      runner_id: runner.id,
      run_date: run.date,
      distance_km: run.distanceKm,
      duration_min: run.durationMin,
      level: run.level,
      mood_before: run.moodBefore,
      mood_after: run.moodAfter,
      activity_link: run.link,
      screenshot_path: uploaded,
    });
    if (error) throw error;

    // Fresh stats for the "nice one!" screen.
    const monday = weekStart(today);
    const [weeks, thisWeek] = await Promise.all([
      supa.from("runner_weeks").select("week_start, runs, km").eq("runner_id", runner.id),
      supa.from("runs").select("distance_km").eq("runner_id", runner.id).eq("level", run.level).gte("run_date", monday),
    ]);
    const levelRuns = thisWeek.data ?? [];
    const allWeeks = (weeks.data ?? []) as WeekTotal[];
    const totalKm = allWeeks.reduce((s, w) => s + w.km, 0);
    return Response.json({
      ok: true,
      nickname: runner.nickname,
      level: run.level,
      milestone: crossedMilestone(totalKm - run.distanceKm, totalKm), // fun fact if this run passed one
      streak: streaks(allWeeks, today),
      challenge: challengeProgress(run.level, levelRuns.length, levelRuns.reduce((s, r) => s + Number(r.distance_km), 0)),
    });
  } catch (e) {
    const form = failMessage(e, "Couldn't save your run. Please try again.");
    if (uploaded) await db().storage.from("screenshots").remove([uploaded]).catch(() => {}); // don't leave orphan files
    return Response.json({ errors: { form } }, { status: 500 });
  }
}
