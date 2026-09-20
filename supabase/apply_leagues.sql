-- ==========================================================
-- Termy League System & Admin RPC Database Migration
-- ==========================================================

-- 1. Table: 10 Official Leagues in strict order
CREATE TABLE IF NOT EXISTS public.leagues (
  id integer primary key,
  name text not null,
  tier_label text not null,
  color text not null,
  promote_cutoff integer default 7 not null,
  demote_cutoff integer default 5 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Seed all 10 Official Leagues in exact order
INSERT INTO public.leagues (id, name, tier_label, color, promote_cutoff, demote_cutoff)
VALUES
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
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tier_label = EXCLUDED.tier_label,
  color = EXCLUDED.color,
  promote_cutoff = EXCLUDED.promote_cutoff,
  demote_cutoff = EXCLUDED.demote_cutoff;

-- 2. Add League columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS league_id integer default 1 references public.leagues(id),
  ADD COLUMN IF NOT EXISTS weekly_xp integer default 0,
  ADD COLUMN IF NOT EXISTS league_group_number integer default 1,
  ADD COLUMN IF NOT EXISTS last_active_week text,
  ADD COLUMN IF NOT EXISTS tournament_stage text default 'none';

-- 3. Table: Weekly League Cohort Participants (Up to 30 active learners per group)
CREATE TABLE IF NOT EXISTS public.league_participants (
  id uuid primary key default gen_random_uuid(),
  week_id text not null,
  league_id integer not null references public.leagues(id) on delete cascade,
  group_number integer not null default 1,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weekly_xp integer default 0 not null,
  joined_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(week_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_league_participants_cohort
  ON public.league_participants(week_id, league_id, group_number, weekly_xp desc);

-- 4. Enable RLS and add safe policies
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_participants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leagues' AND policyname = 'Allow public read of leagues'
  ) THEN
    CREATE POLICY "Allow public read of leagues" ON public.leagues FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'league_participants' AND policyname = 'Allow public read of league participants'
  ) THEN
    CREATE POLICY "Allow public read of league participants" ON public.league_participants FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'league_participants' AND policyname = 'Allow user insert own league participation'
  ) THEN
    CREATE POLICY "Allow user insert own league participation" ON public.league_participants FOR INSERT
      TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'league_participants' AND policyname = 'Allow user update own league participation'
  ) THEN
    CREATE POLICY "Allow user update own league participation" ON public.league_participants FOR UPDATE
      TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END $$;

-- 5. Stored function: admin_set_user_pro
CREATE OR REPLACE FUNCTION public.admin_set_user_pro(target_username text, enable_pro boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_email text;
  clean_name text;
  updated_row public.profiles%rowtype;
BEGIN
  SELECT email INTO caller_email
  FROM auth.users
  WHERE id = auth.uid();

  IF auth.uid() IS NOT NULL AND (caller_email IS NULL OR lower(trim(caller_email)) != 'methnidumanuth@gmail.com') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: Root administration is strictly restricted to methnidumanuth@gmail.com.'
    );
  END IF;

  clean_name := replace(target_username, '@', '');

  UPDATE public.profiles
  SET
    is_pro = enable_pro,
    hearts = CASE WHEN enable_pro THEN 999 ELSE 5 END,
    updated_at = timezone('utc'::text, now())
  WHERE username = clean_name
     OR username = '@' || clean_name
     OR username = target_username
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Candidate not found with username: ' || target_username
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_pro', updated_row.is_pro,
    'username', updated_row.username,
    'display_name', updated_row.display_name
  );
END;
$$;

-- 6. Stored function: record_weekly_league_xp
CREATE OR REPLACE FUNCTION public.record_weekly_league_xp(
  p_xp_delta integer,
  p_week_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_league_id integer;
  v_group_number integer;
  v_group_count integer;
  v_existing_row public.league_participants%rowtype;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthenticated');
  END IF;

  SELECT coalesce(league_id, 1) INTO v_league_id
  FROM public.profiles
  WHERE id = v_user_id;

  SELECT * INTO v_existing_row
  FROM public.league_participants
  WHERE week_id = p_week_id AND user_id = v_user_id;

  IF FOUND THEN
    UPDATE public.league_participants
    SET
      weekly_xp = weekly_xp + p_xp_delta,
      updated_at = timezone('utc'::text, now())
    WHERE id = v_existing_row.id;

    v_group_number := v_existing_row.group_number;
  ELSE
    SELECT group_number, count(*) INTO v_group_number, v_group_count
    FROM public.league_participants
    WHERE week_id = p_week_id AND league_id = v_league_id
    GROUP BY group_number
    HAVING count(*) < 30
    ORDER BY group_number ASC
    LIMIT 1;

    IF v_group_number IS NULL THEN
      SELECT coalesce(max(group_number), 0) + 1 INTO v_group_number
      FROM public.league_participants
      WHERE week_id = p_week_id AND league_id = v_league_id;
    END IF;

    INSERT INTO public.league_participants (week_id, league_id, group_number, user_id, weekly_xp)
    VALUES (p_week_id, v_league_id, v_group_number, v_user_id, p_xp_delta);
  END IF;

  UPDATE public.profiles
  SET
    xp = xp + p_xp_delta,
    weekly_xp = coalesce(CASE WHEN last_active_week = p_week_id THEN weekly_xp ELSE 0 END, 0) + p_xp_delta,
    league_group_number = v_group_number,
    last_active_week = p_week_id,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'league_id', v_league_id,
    'group_number', v_group_number,
    'week_id', p_week_id
  );
END;
$$;
