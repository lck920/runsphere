# RunSphere

A free, mobile-first web app for **SDG 3 (Good Health and Well-being)** that helps beginner university runners in Malaysia (18–25) build a consistent running habit.

- **Weekly challenges** per level (Beginner / Intermediate / Advanced)
- **Leaderboard** ranked by consistency (runs, then streak), not distance
- **Streaks**: consecutive weeks with at least 2 runs
- **Personalised weekly plan** with fixed safety rules, adapted to your last 4 weeks
- **Guided warm-up and cool-down** with a step timer and voice guide
- **My progress**: stats, mood change, weekly chart, habit heatmap, milestones, awards
- **Education hub** with referenced articles

No login, no sign-up, no download: runners use a nickname only.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Lucide icons · Supabase (Postgres, free tier) · Vercel (Hobby). No paid services or APIs.

---

## 1. Create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) (free) → **New project**. Choose region **Southeast Asia (Singapore)**. The app's server functions also run in Singapore (`vercel.json`), so they sit next to the database.
2. When the project is ready, open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates the tables, indexes, the `runner_weeks` view, Row Level Security and the public `screenshots` storage bucket. It is safe to run again.
3. *(Optional, for demos)* New query → paste [`supabase/seed.sql`](supabase/seed.sql) → **Run**. You should see 15 runners with their run counts. Seed data is dated relative to today, and re-running it only replaces those 15 demo runners.

## 2. Environment variables

1. In Supabase go to **Project Settings → API** (or **API Keys**). Copy:
   - the **Project URL**, e.g. `https://abcd1234.supabase.co`, with **no** `/rest/v1/` at the end
   - the **service_role / secret** key (`sb_secret_…` or a long `eyJ…` JWT)
2. Copy `.env.example` to **`.env.local`** and paste the values in. `.env.local` is git-ignored.

> ⚠️ The service role key bypasses all security rules. It is only read on the server ([`lib/supabase.ts`](lib/supabase.ts) imports `server-only`, so the build fails if browser code ever imports it). **Never** prefix it with `NEXT_PUBLIC_`, never put it in `.env.example`, and never commit `.env.local`. If it leaks, rotate it in Supabase straight away.

## 3. Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
```

- Health check: <http://localhost:3000/api/health> should return `{"ok":true,"runners":15}` (after seeding).
- Test on your phone: connect it to the same Wi-Fi and open `http://<your-computer-ip>:3000`.
- While developing locally, API error messages include the real database error to help you debug. Production shows only the friendly message.

Other commands:

```bash
npm test         # unit tests: streaks, ranking, validation, plan rules, progress (Node's built-in runner)
npm run lint
npm run build    # production build. Run it before pushing.
```

## 4. Deploy to Vercel (from GitHub)

1. **Push to GitHub.** Create an empty repository on GitHub, then:
   ```bash
   git add .
   git commit -m "RunSphere prototype"
   git branch -M main
   git remote add origin https://github.com/<you>/runsphere.git
   git push -u origin main
   ```
   Before committing, run `git status` and check `.env.local` is **not** listed.
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New… → Project** → import the `runsphere` repo. Framework preset: **Next.js** (auto-detected). Leave the build settings as they are.
3. Under **Environment Variables** add both, for all environments:
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your secret key |
4. Click **Deploy**. After a minute or two you get a URL like `https://runsphere-xyz.vercel.app`.
5. Every push to `main` redeploys automatically. If you change environment variables later, redeploy from **Deployments → ⋯ → Redeploy**.

## 5. Launch checklist

Run through this on the live URL before the Instagram campaign:

- [ ] `https://<your-app>.vercel.app/api/health` returns `{"ok":true,…}`
- [ ] Log a run from your **phone** (4G, not Wi-Fi), including a screenshot. It appears on the leaderboard and in Supabase → Table Editor / Storage.
- [ ] Open the link **inside Instagram** (DM it to yourself and tap it). Check logging, leaderboard tabs, plan and the warm-up timer.
- [ ] The warm-up voice works in Safari/Chrome. In Instagram's in-app browser it may be silent; the timer still works.
- [ ] Paste the link into WhatsApp and check the preview image shows.
- [ ] RLS is really on: in Supabase → **Table Editor**, each table shows "RLS enabled", and **Authentication → Policies** lists no policies for `runners` / `runs`.
- [ ] The QR code points at the production URL (not a preview deployment URL).
- [ ] Content: distances marked `// VERIFY` in [`data/milestones.ts`](data/milestones.ts) are checked on Google Maps. Articles and helpline numbers in [`data/articles.ts`](data/articles.ts) are re-checked.
- [ ] Going live with real users? Remove the 15 demo runners (their runs are deleted too) in the SQL Editor:
  ```sql
  delete from public.runners where nickname_key in ('aisyah_runs','weiming','kavin.k','nurul_jog','danish_dash','jiayi_go','haziq_h','priya_paces','farhan.f','meiling_m','arjun_10k','syafiq_strides','chloe_tan','amirul_am','xinyi.runs');
  ```

## Project structure

```
app/
  page.tsx               Home
  log/                   Log a run (form + success screen with streak, challenge, milestone)
  leaderboard/           Level tabs, ranked by consistency (?level=… opens a tab)
  plan/                  Personalised weekly plan
  warmup/                Guided warm-up / cool-down timer
  progress/              Stats, chart, heatmap, milestones, awards
  learn/                 Education hub
  api/                   The ONLY code that talks to Supabase
    runs/ leaderboard/ plan/ progress/ health/
  globals.css            Theme: lime + black colour tokens for light and dark mode (edit colours here)
components/              Nav, ThemeToggle, ProgressBar, Disclaimer, WeeklyChart, Heatmap, shared styles
lib/
  week.ts                Mon–Sun weeks in Asia/Kuala_Lumpur
  validate.ts            Input rules shared by the form and the API
  stats.ts               Streaks, ranking, challenge progress, progress summary
  plan.ts                Rule-based plan generator (swap for an AI coach later)
  supabase.ts            Server-only Supabase client
  local.ts               Remembers the nickname on this device
data/                    Edit content here, no code changes needed:
  challenges.ts          Weekly challenge targets per level
  milestones.ts          Distance milestones + local Malaysian comparisons
  awards.ts              Badge rules
  warmup.ts              Warm-up / cool-down steps
  articles.ts            Education hub articles + references
supabase/                schema.sql, seed.sql
tests/                   Unit tests (npm test)
```

## How the key rules work

- **Weeks** run Monday–Sunday in Malaysia time (UTC+8, no daylight saving).
- **Streak** = consecutive weeks with ≥ 2 runs. This week counts once it reaches 2 runs, and an unfinished week never breaks your streak. See [`lib/stats.ts`](lib/stats.ts).
- **Leaderboard**: each tab counts this week's runs logged at that level. Rank = runs, then current streak; distance this week only breaks ties. Every runner gets a unique position.
- **Plan rules** in [`lib/plan.ts`](lib/plan.ts): beginners start with run/walk; always a rest day between runs; weekly total grows ≤ ~10%; missed runs → repeat; no runs last week → ease back 20%; completed week → progress.

## Security & privacy (PDPA 2010)

- **Data minimisation:** we store only a nickname and run details (date, distance, time, level, mood, optional link/screenshot). No name, email, phone or location. Screenshots and Strava links are public, which the form states before upload.
- **Row Level Security** is enabled on every table with **no** policies, so Supabase's public API can read or write nothing. All access goes through the Next.js API routes using the server-only key.
- Screenshots go to a **public** bucket so they can be shown on the leaderboard (users are told this on the form). Max 4 MB, JPG/PNG/WebP only. The bucket can't be listed or uploaded to directly; only the API uploads. Only **strava.com** links are shown publicly; other links are stored but hidden.
- **Moderation:** to remove an inappropriate screenshot, delete the file in Supabase → Storage → `screenshots` and clear that run's `screenshot_path` in Table Editor → `runs`.
- Inputs are validated in the browser, again in the API, and again by database constraints.
- Security headers (`nosniff`, `X-Frame-Options`, referrer and permissions policy) are set in `next.config.ts`.
- The log form shows a privacy note; the plan and warm-up pages show a "not medical advice" disclaimer.

## Known limitations (prototype)

- **No login:** anyone can log runs under any nickname. This is the deliberate trade-off for "no sign-up". Fine for a campaign prototype; add a simple PIN per nickname if abuse becomes a problem.
- **No rate limiting** beyond 3 runs per nickname per day.
- **Scale:** the leaderboard handles roughly 1000 runs per level per week and 200 runners per tab before it would need a SQL function. Marked with `ponytail:` comments in the code.
- The plan doesn't store past plans. "Missed runs" means fewer runs last week than the days per week you choose now.
