-- RunSphere schema. Paste into Supabase → SQL Editor → Run.
-- Re-runnable: everything uses "if not exists" / "or replace".

-- ---------------------------------------------------------------
-- runners: one row per nickname. No email, no password, no name.
-- ---------------------------------------------------------------
create table if not exists public.runners (
  id           uuid primary key default gen_random_uuid(),
  nickname     text not null check (char_length(trim(nickname)) between 3 and 20),
  -- Case-insensitive, trimmed identity: "Ali", " ali " and "ALI" are the same runner.
  nickname_key text generated always as (lower(trim(nickname))) stored unique,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- runs: one row per logged run.
-- run_date is a plain date in Asia/Kuala_Lumpur (UTC+8, no DST),
-- so "which week" is just date_trunc('week', run_date) → Monday.
-- ---------------------------------------------------------------
create table if not exists public.runs (
  id              uuid primary key default gen_random_uuid(),
  runner_id       uuid not null references public.runners(id) on delete cascade,
  run_date        date not null,
  distance_km     numeric(5,2) not null check (distance_km between 0.5 and 50),
  duration_min    numeric(5,1) not null check (duration_min between 3 and 360),
  -- Pace is derived, never typed in, so it can't disagree with distance/duration.
  pace_min_per_km numeric(5,2) generated always as (duration_min / distance_km) stored,
  level           text not null check (level in ('beginner', 'intermediate', 'advanced')),
  mood_before     smallint not null check (mood_before between 1 and 5),
  mood_after      smallint not null check (mood_after between 1 and 5),
  activity_link   text check (activity_link is null or activity_link ~ '^https://'),
  screenshot_path text,   -- object path inside the private "screenshots" bucket
  created_at      timestamptz not null default now(),
  -- Same sanity range the app validates with (lib/validate.ts).
  constraint sensible_pace check (duration_min / distance_km between 3 and 20)
);

-- Progress page: all runs for one runner, by date.
create index if not exists runs_runner_date_idx on public.runs (runner_id, run_date);
-- Leaderboard: this week's runs for one level.
create index if not exists runs_date_level_idx on public.runs (run_date, level);

-- ---------------------------------------------------------------
-- Row Level Security
-- RLS is ON and there are deliberately NO policies. That means the
-- public anon key can read/write nothing. Only our Next.js API routes,
-- using the service role key (which bypasses RLS), touch the data.
-- ---------------------------------------------------------------
alter table public.runners enable row level security;
alter table public.runs    enable row level security;
revoke all on public.runners, public.runs from anon, authenticated;

-- ---------------------------------------------------------------
-- Private storage bucket for optional Strava screenshots (max 4 MB).
-- Private = no public URLs; storage.objects already has RLS on.
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('screenshots', 'screenshots', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------
-- runner_weeks: runs + km per runner per Monday-week.
-- Streaks are computed from this (one row per runner-week instead of
-- one per run keeps us well under Supabase's 1000-rows-per-request cap).
-- security_invoker = respect RLS of the caller; anon gets nothing anyway.
-- ---------------------------------------------------------------
create or replace view public.runner_weeks with (security_invoker = true) as
select runner_id,
       run_date - (extract(isodow from run_date)::int - 1) as week_start,  -- Monday
       count(*)::int                                        as runs,
       sum(distance_km)::float8                             as km,
       sum(duration_min)::float8                            as minutes  -- used by the plan generator
from public.runs
group by 1, 2;

revoke all on public.runner_weeks from anon, authenticated;
