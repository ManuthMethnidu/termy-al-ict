-- ==========================================================
-- TERMY A/L ICT - Production Supabase PostgreSQL Schema
-- Built for Sri Lankan Advanced Level ICT active recall & spaced repetition
-- ==========================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------
-- 1. PROFILES TABLE (Linked directly to Supabase auth.users)
-- ----------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  username text unique not null,
  avatar_url text,
  school text default 'Physical Science & ICT Stream',
  batch text default '2025 A/L Batch',
  streak_days integer default 0,
  xp integer default 0,
  gems integer default 0,
  hearts integer default 5,
  is_pro boolean default false,
  target_exam_year integer default 2025,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 2. QUESTIONS TABLE (2,636 Real G.C.E. A/L ICT Questions)
-- ----------------------------------------------------------
create table if not exists public.questions (
  id text primary key,
  unit integer not null,
  unit_title text not null,
  question_text text not null,
  options jsonb not null,
  correct_option integer not null, -- 1-indexed (1, 2, 3, 4, 5)
  explanation text not null,
  latex_formula text,
  trap_insight text,
  difficulty text default 'medium',
  topic text,
  past_paper_year integer,
  past_paper_number integer,
  series text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 3. SPACED REPETITION STUDY QUEUE (SM-2 Algorithm)
-- ----------------------------------------------------------
create table if not exists public.study_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text references public.questions(id) on delete cascade not null,
  interval_minutes integer default 1,
  repetition_count integer default 0,
  ease_factor numeric(3,2) default 2.50,
  due_date timestamptz default timezone('utc'::text, now()) not null,
  consecutive_correct integer default 0,
  total_attempts integer default 0,
  incorrect_count integer default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

-- ----------------------------------------------------------
-- 4. QUIZ ATTEMPTS LOG (Real drill telemetry & mastery metrics)
-- ----------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  question_id text references public.questions(id) on delete cascade not null,
  unit_number integer not null,
  selected_option integer not null,
  is_correct boolean not null,
  time_spent_seconds numeric(6,2) default 0.00,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 5. DAILY QUESTS DEFINITIONS
-- ----------------------------------------------------------
create table if not exists public.daily_quests (
  id text primary key,
  title text not null,
  description text not null,
  unit_tag text,
  target_count integer not null,
  xp_reward integer not null,
  gem_reward integer not null,
  quest_type text not null, -- 'mcq_count' | 'accuracy' | 'spaced_repetition' | 'streak'
  icon text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 6. USER QUESTS PROGRESS (Daily tracker per user)
-- ----------------------------------------------------------
create table if not exists public.user_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_id text references public.daily_quests(id) on delete cascade not null,
  quest_date date default current_date not null,
  progress integer default 0 not null,
  completed boolean default false not null,
  claimed boolean default false not null,
  claimed_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, quest_id, quest_date)
);

-- ----------------------------------------------------------
-- 7. POWER-UP SHOP CATALOG
-- ----------------------------------------------------------
create table if not exists public.powerups (
  id text primary key,
  name text not null,
  description text not null,
  cost_gems integer not null,
  icon text not null,
  category text not null, -- 'streak' | 'hearts' | 'boost'
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ----------------------------------------------------------
-- 8. USER INVENTORY (Items purchased from Shop)
-- ----------------------------------------------------------
create table if not exists public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  powerup_id text references public.powerups(id) on delete cascade not null,
  quantity integer default 1 not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, powerup_id)
);

-- ----------------------------------------------------------
-- 9. LEADERBOARD VIEW (Postgres 15+ Security Invoker)
-- ----------------------------------------------------------
create or replace view public.leaderboard_view
with (security_invoker = true) as
select
  row_number() over (order by p.xp desc) as rank,
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.school,
  p.batch,
  p.streak_days,
  p.xp,
  p.is_pro
from public.profiles p
order by p.xp desc;

-- ----------------------------------------------------------
-- 10. AUTH TRIGGER: Auto-create profile on Google / OAuth signup
-- ----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  candidate_name text;
  candidate_username text;
  raw_meta jsonb;
begin
  raw_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  candidate_name := coalesce(
    raw_meta->>'full_name',
    raw_meta->>'name',
    split_part(new.email, '@', 1),
    'Candidate'
  );
  candidate_username := coalesce(
    raw_meta->>'user_name',
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
  );

  insert into public.profiles (
    id,
    email,
    display_name,
    username,
    avatar_url,
    school,
    batch,
    streak_days,
    xp,
    gems,
    hearts,
    is_pro,
    target_exam_year
  )
  values (
    new.id,
    new.email,
    candidate_name,
    candidate_username,
    raw_meta->>'avatar_url',
    'Physical Science & ICT Stream',
    '2025 A/L Batch',
    0,
    0,
    0,
    5,
    false,
    2025
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------
-- 11. INDEXES FOR HIGH-PERFORMANCE DRILLS & SEARCH
-- ----------------------------------------------------------
create index if not exists idx_profiles_xp on public.profiles (xp desc);
create index if not exists idx_questions_unit on public.questions (unit);
create index if not exists idx_questions_difficulty on public.questions (difficulty);
create index if not exists idx_questions_past_paper on public.questions (past_paper_year);
create index if not exists idx_study_queue_user_due on public.study_queue (user_id, due_date);
create index if not exists idx_study_queue_user_question on public.study_queue (user_id, question_id);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts (user_id, created_at desc);
create index if not exists idx_quiz_attempts_unit on public.quiz_attempts (user_id, unit_number);
create index if not exists idx_user_quests_lookup on public.user_quests (user_id, quest_date);

-- ----------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.study_queue enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.daily_quests enable row level security;
alter table public.user_quests enable row level security;
alter table public.powerups enable row level security;
alter table public.user_inventory enable row level security;

-- PROFILES RLS: Public read (for leaderboards), individual update
create policy "Allow public read of profiles"
  on public.profiles for select
  using (true);

create policy "Allow user insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Allow user update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- QUESTIONS RLS: Public read for all students
create policy "Allow public read of questions"
  on public.questions for select
  using (true);

-- STUDY QUEUE RLS: User-specific access
create policy "Allow user select own study queue"
  on public.study_queue for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Allow user insert own study queue"
  on public.study_queue for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Allow user update own study queue"
  on public.study_queue for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Allow user delete own study queue"
  on public.study_queue for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- QUIZ ATTEMPTS RLS: User-specific telemetry logging
create policy "Allow user select own quiz attempts"
  on public.quiz_attempts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Allow user insert own quiz attempts"
  on public.quiz_attempts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- DAILY QUESTS: Public read
create policy "Allow public read of daily quests"
  on public.daily_quests for select
  using (true);

-- USER QUESTS: User-specific tracking
create policy "Allow user select own quests"
  on public.user_quests for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Allow user insert own quests"
  on public.user_quests for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Allow user update own quests"
  on public.user_quests for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- POWERUPS: Public read
create policy "Allow public read of powerups"
  on public.powerups for select
  using (true);

-- USER INVENTORY: User-specific inventory
create policy "Allow user select own inventory"
  on public.user_inventory for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Allow user insert own inventory"
  on public.user_inventory for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Allow user update own inventory"
  on public.user_inventory for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ----------------------------------------------------------
-- 13. SEED DEFAULT DAILY QUESTS & POWERUPS
-- ----------------------------------------------------------
insert into public.daily_quests (id, title, description, unit_tag, target_count, xp_reward, gem_reward, quest_type, icon)
values
  ('quest_drill_15', 'Solve 15 A/L ICT MCQs', 'Complete 15 question drills across any syllabus unit', 'Daily Goal', 15, 30, 10, 'mcq_count', 'terminal'),
  ('quest_accuracy_80', 'Score 80%+ Accuracy Today', 'Demonstrate high precision on timed exam drills', 'Excellence', 80, 40, 15, 'accuracy', 'verified'),
  ('quest_sr_review', 'Clear 5 Spaced Repetition Due Items', 'Lock missed and tricky questions into long-term memory', 'Active Recall', 5, 25, 10, 'spaced_repetition', 'autorenew'),
  ('quest_streak_maintain', 'Maintain Active Study Streak', 'Submit at least 1 verified drill session before midnight', 'Consistency', 1, 50, 20, 'streak', 'local_fire_department')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  target_count = excluded.target_count,
  xp_reward = excluded.xp_reward,
  gem_reward = excluded.gem_reward;

insert into public.powerups (id, name, description, cost_gems, icon, category)
values
  ('streak_freeze', 'Streak Freeze', 'Preserves your study streak if you miss a revision day during school term tests.', 150, 'ac_unit', 'streak'),
  ('double_xp', '2x XP Turbo (15 Min)', 'Double every point earned during rapid past paper review to climb Diamond League.', 100, 'double_arrow', 'boost'),
  ('heart_refill', 'Refill Exam Lives', 'Instantly replenishes hearts to full 5/5 to stay in late-night study flow.', 200, 'favorite', 'hearts')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  cost_gems = excluded.cost_gems,
  icon = excluded.icon;

-- ----------------------------------------------------------
-- 14. ADMIN RPC: Set candidate Pro subscription status by username
-- ----------------------------------------------------------
create or replace function public.admin_set_user_pro(target_username text, enable_pro boolean)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  caller_email text;
  clean_name text;
  updated_row public.profiles%rowtype;
begin
  -- Retrieve email of current authenticated caller
  select email into caller_email
  from auth.users
  where id = auth.uid();

  -- Authorize only root administrator methnidumanuth@gmail.com (or service role where auth.uid() is null)
  if auth.uid() is not null and (caller_email is null or lower(trim(caller_email)) != 'methnidumanuth@gmail.com') then
    return jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: Root administration is strictly restricted to methnidumanuth@gmail.com.'
    );
  end if;

  clean_name := replace(target_username, '@', '');

  update public.profiles
  set
    is_pro = enable_pro,
    hearts = case when enable_pro then 999 else 5 end,
    updated_at = timezone('utc'::text, now())
  where username = clean_name
     or username = '@' || clean_name
     or username = target_username
  returning * into updated_row;

  if not found then
    return jsonb_build_object(
      'success', false,
      'message', 'Candidate not found with username: ' || target_username
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'is_pro', updated_row.is_pro,
    'username', updated_row.username,
    'display_name', updated_row.display_name
  );
end;
$$;

-- ----------------------------------------------------------
-- 15. LEAGUE PROGRESSION SYSTEM (10 LEAGUES, 30-LEARNER COHORTS, WEEKLY RESETS, DIAMOND TOURNAMENT)
-- ----------------------------------------------------------

-- Table: 10 Official Leagues in strict order
create table if not exists public.leagues (
  id integer primary key,
  name text not null,
  tier_label text not null,
  color text not null,
  promote_cutoff integer default 7 not null, -- Top 7 promote (or Top 10 for Diamond Tournament)
  demote_cutoff integer default 5 not null,  -- Bottom 5 demote (0 for Bronze)
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Seed all 10 Official Leagues in exact order
insert into public.leagues (id, name, tier_label, color, promote_cutoff, demote_cutoff)
values
  (1, 'Bronze', 'Tier I', '#CD7F32', 7, 0),
  (2, 'Silver', 'Tier II', '#C0C0C0', 7, 5),
  (3, 'Gold', 'Tier III', '#FFD700', 7, 5),
  (4, 'Sapphire', 'Tier IV', '#2563EB', 7, 5),
  (5, 'Ruby', 'Tier V', '#E11D48', 7, 5),
  (6, 'Emerald', 'Tier VI', '#10B981', 7, 5),
  (7, 'Amethyst', 'Tier VII', '#9333EA', 7, 5),
  (8, 'Pearl', 'Tier VIII', '#F1F5F9', 7, 5),
  (9, 'Obsidian', 'Tier IX', '#818CF8', 7, 5),
  (10, 'Diamond', 'Tier X', '#38BDF8', 10, 5)
on conflict (id) do update set
  name = excluded.name,
  tier_label = excluded.tier_label,
  color = excluded.color,
  promote_cutoff = excluded.promote_cutoff,
  demote_cutoff = excluded.demote_cutoff;

-- Add League columns to profiles table
alter table public.profiles
  add column if not exists league_id integer default 1 references public.leagues(id),
  add column if not exists weekly_xp integer default 0,
  add column if not exists league_group_number integer default 1,
  add column if not exists last_active_week text,
  add column if not exists tournament_stage text default 'none';

-- Table: Weekly League Cohort Participants (Up to 30 active learners per group)
create table if not exists public.league_participants (
  id uuid primary key default gen_random_uuid(),
  week_id text not null, -- e.g. '2026-W38'
  league_id integer not null references public.leagues(id) on delete cascade,
  group_number integer not null default 1,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weekly_xp integer default 0 not null,
  joined_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(week_id, user_id)
);

create index if not exists idx_league_participants_cohort
  on public.league_participants(week_id, league_id, group_number, weekly_xp desc);

-- Enable RLS
alter table public.leagues enable row level security;
alter table public.league_participants enable row level security;

create policy "Allow public read of leagues"
  on public.leagues for select
  using (true);

create policy "Allow public read of league participants"
  on public.league_participants for select
  using (true);

create policy "Allow user insert own league participation"
  on public.league_participants for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Allow user update own league participation"
  on public.league_participants for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- RPC: Record League XP and automatically assign 30-member division
create or replace function public.record_weekly_league_xp(
  p_xp_delta integer,
  p_week_id text
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
  v_league_id integer;
  v_group_number integer;
  v_group_count integer;
  v_existing_row public.league_participants%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'Unauthenticated');
  end if;

  -- Get candidate's current league
  select coalesce(league_id, 1) into v_league_id
  from public.profiles
  where id = v_user_id;

  -- Check if user already joined this week's cohort
  select * into v_existing_row
  from public.league_participants
  where week_id = p_week_id and user_id = v_user_id;

  if found then
    -- Update existing participant row
    update public.league_participants
    set
      weekly_xp = weekly_xp + p_xp_delta,
      updated_at = timezone('utc'::text, now())
    where id = v_existing_row.id;

    v_group_number := v_existing_row.group_number;
  else
    -- Find open group with < 30 members for this league and week
    select group_number, count(*) into v_group_number, v_group_count
    from public.league_participants
    where week_id = p_week_id and league_id = v_league_id
    group by group_number
    having count(*) < 30
    order by group_number asc
    limit 1;

    -- If no open group found, assign next group number
    if v_group_number is null then
      select coalesce(max(group_number), 0) + 1 into v_group_number
      from public.league_participants
      where week_id = p_week_id and league_id = v_league_id;
    end if;

    -- Insert user into cohort division
    insert into public.league_participants (week_id, league_id, group_number, user_id, weekly_xp)
    values (p_week_id, v_league_id, v_group_number, v_user_id, p_xp_delta);
  end if;

  -- Update profiles table
  update public.profiles
  set
    xp = xp + p_xp_delta,
    weekly_xp = coalesce(case when last_active_week = p_week_id then weekly_xp else 0 end, 0) + p_xp_delta,
    league_group_number = v_group_number,
    last_active_week = p_week_id,
    updated_at = timezone('utc'::text, now())
  where id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'league_id', v_league_id,
    'group_number', v_group_number,
    'week_id', p_week_id
  );
end;
$$;

