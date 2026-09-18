-- Termy A/L ICT - PostgreSQL / Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  display_name text not null,
  school text default 'Physical Science & ICT Stream',
  batch text default '2025 A/L Batch',
  streak_days integer default 14,
  xp integer default 1720,
  gems integer default 480,
  hearts integer default 5,
  is_pro boolean default false,
  target_exam_year integer default 2025,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. QUESTIONS TABLE
create table if not exists public.questions (
  id text primary key,
  unit integer not null,
  unit_title text not null,
  past_paper_year integer,
  past_paper_number integer,
  question_text text not null,
  options jsonb not null,
  correct_option integer not null,
  explanation text not null,
  latex_formula text,
  trap_insight text,
  difficulty text default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SPACED REPETITION STUDY QUEUE
create table if not exists public.study_queue (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  question_id text not null,
  interval_minutes integer default 1,
  repetition_count integer default 0,
  ease_factor numeric(3,2) default 2.50,
  due_date timestamp with time zone default timezone('utc'::text, now()) not null,
  consecutive_correct integer default 0,
  total_attempts integer default 0,
  incorrect_count integer default 0,
  last_reviewed_at timestamp with time zone,
  unique(user_id, question_id)
);

-- 4. QUIZ ATTEMPTS LOG
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  question_id text not null,
  unit_number integer not null,
  selected_option integer not null,
  is_correct boolean not null,
  time_spent_seconds numeric(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. LEADERBOARD VIEW
create or replace view public.leaderboard_view as
select
  row_number() over (order by xp desc) as rank,
  username,
  display_name,
  school,
  streak_days,
  xp
from public.profiles
order by xp desc;

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.study_queue enable row level security;
alter table public.quiz_attempts enable row level security;

-- Public Read policies for syllabus questions
create policy "Allow public read of questions" on public.questions
  for select using (true);

-- Allow public read for leaderboard
create policy "Allow public read of profiles" on public.profiles
  for select using (true);
create policy "Allow user upsert profiles" on public.profiles
  for all using (true);

-- Allow queue access
create policy "Allow user access study queue" on public.study_queue
  for all using (true);

-- Allow quiz attempts insert
create policy "Allow insert quiz attempts" on public.quiz_attempts
  for insert with check (true);
