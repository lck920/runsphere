-- RunSphere demo data: 15 fake runners, the last 6 weeks + this week of runs.
-- Dates are relative to "today" in Kuala Lumpur, so the demo always looks current.
-- Re-runnable: it deletes ONLY these 15 demo nicknames (and their runs) first.

select setseed(0.42);  -- same "random" data every time

create temp table seed_profiles (
  nickname text,
  level    text,
  per_week int,      -- planned runs per week (1–5)
  km       numeric,  -- typical distance
  pace     numeric,  -- typical min/km
  skip     numeric   -- chance of skipping each planned run (0 = never)
);

insert into seed_profiles values
  -- Beginners: short, slow, some patchy
  ('aisyah_runs',  'beginner',     3, 2.5, 8.5, 0.05),
  ('weiming',      'beginner',     2, 2.0, 9.5, 0.10),
  ('kavin.k',      'beginner',     2, 3.0, 8.0, 0.40),
  ('nurul_jog',    'beginner',     3, 2.2, 9.0, 0.25),
  ('danish_dash',  'beginner',     2, 1.8, 10.0, 0.55),
  -- Intermediates
  ('jiayi_go',     'intermediate', 3, 4.5, 6.8, 0.05),
  ('haziq_h',      'intermediate', 4, 4.0, 6.5, 0.20),
  ('priya_paces',  'intermediate', 3, 5.0, 6.2, 0.15),
  ('farhan.f',     'intermediate', 3, 3.8, 7.0, 0.45),
  ('meiling_m',    'intermediate', 2, 5.5, 6.6, 0.10),
  -- Advanced
  ('arjun_10k',    'advanced',     5, 6.5, 5.3, 0.10),
  ('syafiq_strides','advanced',    4, 7.0, 5.0, 0.05),
  ('chloe_tan',    'advanced',     4, 6.0, 5.5, 0.30),
  ('amirul_am',    'advanced',     5, 5.5, 5.8, 0.20),
  ('xinyi.runs',   'advanced',     4, 8.0, 5.1, 0.15);

-- Cascade removes their runs too.
delete from public.runners where nickname_key in (select lower(nickname) from seed_profiles);

insert into public.runners (nickname) select nickname from seed_profiles;

with t as (
  select (now() at time zone 'Asia/Kuala_Lumpur')::date as today
),
slots as (
  -- One row per planned run: 7 weeks (wk 0 = 6 weeks ago, wk 6 = this week).
  select p.*, r.id as runner_id, wk,
         date_trunc('week', t.today)::date - (6 - wk) * 7
           + (array[0, 2, 4, 5, 6])[slot] as run_date,   -- Mon, Wed, Fri, Sat, Sun
         random() as roll,
         t.today
  from seed_profiles p
  join public.runners r on r.nickname = p.nickname
  cross join t
  cross join generate_series(0, 6) as wk
  cross join lateral generate_series(1, p.per_week) as slot
),
kept as (
  select *,
         -- ±20% day-to-day variation, ~3%/week gentle improvement
         round((km * (0.8 + random() * 0.4) * (1 + wk * 0.03))::numeric, 2) as dist,
         2 + floor(random() * 3)::int as mb
  from slots
  where roll >= skip and run_date <= today
)
insert into public.runs (runner_id, run_date, distance_km, duration_min, level, mood_before, mood_after)
select runner_id,
       run_date,
       dist,
       round((dist * pace * (0.92 + random() * 0.16))::numeric, 1),
       level,
       mb,
       least(5, mb + floor(random() * 3)::int)  -- mood usually improves after a run
from kept;

drop table seed_profiles;

-- Quick check: runs per runner
select r.nickname, count(*) as runs, sum(distance_km) as km
from public.runners r join public.runs x on x.runner_id = r.id
group by r.nickname order by runs desc;
