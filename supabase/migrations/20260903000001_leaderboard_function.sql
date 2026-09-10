-- Sidebar leaderboard: top students by all-time questions attempted.
--
-- Purpose: the dashboard sidebar ranks the top five approved students. Doing
-- that client-side breaks the moment question_attempts exceeds PostgREST's
-- 1000-row fetch cap (the old code silently ranked only the first 1000 rows),
-- and it forced every dashboard render to download the whole attempts table.
-- This function does the aggregation inside Postgres, so the dashboard reads
-- exactly five rows per render.
--
-- Ranking: total attempts desc, then accuracy desc. "Current streak" counts
-- consecutive UTC study days ending today (or yesterday when today has none),
-- matching the analytics module's UTC day-key semantics. Runs as the caller
-- (service role) so RLS is bypassed exactly as the old client queries were.
-- Idempotent: safe on the live project and on a fresh database. Execute only
-- by the service role via lib/leaderboard.ts.
--
-- Founder/owner accounts are excluded so the board shows students, not the
-- people running the site (same list as LEADERBOARD_EXCLUDED_EMAILS in
-- lib/leaderboard.ts — keep the two in sync).

create or replace function public.leaderboard(p_limit integer default 5)
returns table (
  rank      bigint,
  name      text,
  streak    integer,
  accuracy  integer,
  questions bigint
)
language sql
stable
as $$
  with totals as (
    select qa.student_id,
           count(*) as questions,
           round(
             100.0 * count(*) filter (where qa.is_correct) / nullif(count(*), 0)
           )::integer as accuracy
    from public.question_attempts qa
    group by qa.student_id
  ),
  ranked as (
    select t.student_id,
           t.questions,
           t.accuracy,
           row_number() over (
             order by t.questions desc, t.accuracy desc, t.student_id
           ) as rn
    from totals t
    join public.profiles pr on pr.id = t.student_id
    where pr.status = 'approved'
      and lower(coalesce(pr.email, '')) not in (
        'admin@medprep.pk'
      )
  ),
  leaders as (
    select * from ranked where rn <= p_limit
  ),
  days as (
    select distinct qa.student_id,
                    (qa.created_at at time zone 'utc')::date as d
    from public.question_attempts qa
    where qa.student_id in (select student_id from leaders)
  ),
  runs as (
    -- Consecutive study days share one group id (gaps-and-islands on dates).
    select d.student_id,
           d.d,
           d.d - (row_number() over (
             partition by d.student_id order by d.d
           ))::integer as grp
    from days d
  ),
  active as (
    -- The run touching today, or yesterday when today has no activity.
    select r.student_id,
           max(case when r.d = current_date or r.d = current_date - 1 then r.grp end) as grp
    from runs r
    group by r.student_id
  )
  select l.rn::bigint as rank,
         coalesce(pr.full_name, 'Student') as name,
         (select count(*)::integer
          from runs r
          where r.student_id = l.student_id and r.grp = a.grp) as streak,
         l.accuracy,
         l.questions
  from leaders l
  join public.profiles pr on pr.id = l.student_id
  left join active a on a.student_id = l.student_id
  order by l.rn;
$$;

-- Aggregated totals only — still, keep it off the public surface; only the
-- service role (server-side dashboard render) needs to call it.
revoke all on function public.leaderboard(integer) from public, anon, authenticated;
grant execute on function public.leaderboard(integer) to service_role;
