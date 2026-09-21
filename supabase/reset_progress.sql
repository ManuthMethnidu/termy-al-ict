-- ==========================================================
-- Termy A/L ICT — Database Reset & Zero-Start Migration
-- ==========================================================
-- This migration script resets all candidate progress (lessons,
-- gems, XP, streaks) back to 0 and updates default schema constraints
-- so every existing and new student begins cleanly from scratch.
-- ==========================================================

-- 1. Update column defaults on public.profiles to 0
ALTER TABLE public.profiles
  ALTER COLUMN streak_days SET DEFAULT 0,
  ALTER COLUMN xp SET DEFAULT 0,
  ALTER COLUMN weekly_xp SET DEFAULT 0,
  ALTER COLUMN gems SET DEFAULT 0,
  ALTER COLUMN hearts SET DEFAULT 5,
  ALTER COLUMN quest_points SET DEFAULT 0;

-- 2. Update public.handle_new_user() trigger for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  candidate_name text;
  candidate_username text;
  raw_meta jsonb;
BEGIN
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

  INSERT INTO public.profiles (
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
  VALUES (
    new.id,
    new.email,
    candidate_name,
    candidate_username,
    raw_meta->>'avatar_url',
    'Physical Science & ICT Stream',
    '2025 A/L Batch',
    0, -- Streak starts at 0
    0, -- XP starts at 0
    0, -- Gems start at 0
    5, -- Full 5 hearts
    false,
    2025
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  RETURN new;
END;
$$;

-- 3. Reset all existing candidate accounts in public.profiles to 0
UPDATE public.profiles
SET
  xp = 0,
  weekly_xp = 0,
  gems = 0,
  streak_days = 0,
  quest_points = 0,
  tournament_stage = 'none',
  league_id = 1,
  league_group_number = 1,
  stored_boosts = 0,
  boost_active_until = null,
  hearts = CASE WHEN is_pro THEN 999 ELSE 5 END,
  updated_at = timezone('utc'::text, now());

-- 4. Purge all prior quiz attempts, spaced-repetition queues, and league records
DELETE FROM public.quiz_attempts;
DELETE FROM public.study_queue;
DELETE FROM public.user_quests;
DELETE FROM public.user_inventory;
DELETE FROM public.league_participants;

-- 5. Stored function: admin_reset_all_candidates_progress
CREATE OR REPLACE FUNCTION public.admin_reset_all_candidates_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_email text;
  candidate_count integer;
BEGIN
  -- Authenticated callers must be the root administrator
  SELECT email INTO caller_email
  FROM auth.users
  WHERE id = auth.uid();

  IF auth.uid() IS NOT NULL AND (caller_email IS NULL OR lower(trim(caller_email)) != 'methnidumanuth@gmail.com') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized: Root administration is strictly restricted to methnidumanuth@gmail.com.'
    );
  END IF;

  -- Reset all profiles
  UPDATE public.profiles
  SET
    xp = 0,
    weekly_xp = 0,
    gems = 0,
    streak_days = 0,
    quest_points = 0,
    tournament_stage = 'none',
    league_id = 1,
    league_group_number = 1,
    stored_boosts = 0,
    boost_active_until = null,
    hearts = CASE WHEN is_pro THEN 999 ELSE 5 END,
    updated_at = timezone('utc'::text, now());

  GET DIAGNOSTICS candidate_count = ROW_COUNT;

  -- Clear study logs
  DELETE FROM public.quiz_attempts;
  DELETE FROM public.study_queue;
  DELETE FROM public.user_quests;
  DELETE FROM public.user_inventory;
  DELETE FROM public.league_participants;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully reset all ' || candidate_count || ' candidate progress records to 0.',
    'candidates_reset', candidate_count
  );
END;
$$;
