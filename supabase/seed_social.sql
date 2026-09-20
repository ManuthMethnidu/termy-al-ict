-- ==========================================================
-- TERMY A/L ICT - Social Follow System & Friend Streaks Seed
-- Seeds active Sri Lankan A/L ICT candidates, mutual follows,
-- friend streaks, and live timeline activities
-- ==========================================================

-- 1. Create Peer Candidate Users in auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
  (
    'a1111111-1111-4111-a111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'kavindu.royal@gmail.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Kavindu Senanayake", "name": "Kavindu Senanayake", "user_name": "kavindu_royal"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a2222222-2222-4222-a222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'hansi.visakha@gmail.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Hansi Perera", "name": "Hansi Perera", "user_name": "hansi_visakha"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a3333333-3333-4333-a333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'dineth.ananda@gmail.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Dineth Jayasuriya", "name": "Dineth Jayasuriya", "user_name": "dineth_ananda"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a4444444-4444-4444-a444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'shenaya.mew@gmail.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Shenaya Fernando", "name": "Shenaya Fernando", "user_name": "shenaya_mew"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a5555555-5555-4555-a555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'tharindu.mahinda@gmail.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Tharindu Wickrama", "name": "Tharindu Wickrama", "user_name": "tharindu_mahinda"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'a6666666-6666-4666-a666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'nethmi.devi@gmail.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Nethmi Rathnayake", "name": "Nethmi Rathnayake", "user_name": "nethmi_devi"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Update Profiles Metadata (Avatars, School, Streaks, XP, Leagues)
UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  school = 'Royal College • Colombo 07',
  streak_days = 48,
  xp = 2840,
  weekly_xp = 720,
  league_id = 10,
  quest_points = 24
WHERE id = 'a1111111-1111-4111-a111-111111111111';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  school = 'Visakha Vidyalaya • Colombo 04',
  streak_days = 35,
  xp = 2190,
  weekly_xp = 540,
  league_id = 9,
  quest_points = 18
WHERE id = 'a2222222-2222-4222-a222-222222222222';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  school = 'Ananda College • Colombo 10',
  streak_days = 22,
  xp = 1780,
  weekly_xp = 410,
  league_id = 8,
  quest_points = 14
WHERE id = 'a3333333-3333-4333-a333-333333333333';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  school = 'Musaeus College • Colombo 07',
  streak_days = 19,
  xp = 1450,
  weekly_xp = 380,
  league_id = 7,
  quest_points = 10
WHERE id = 'a4444444-4444-4444-a444-444444444444';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  school = 'Mahinda College • Galle',
  streak_days = 14,
  xp = 1210,
  weekly_xp = 290,
  league_id = 6,
  quest_points = 7
WHERE id = 'a5555555-5555-4555-a555-555555555555';

UPDATE public.profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  school = 'Devi Balika Vidyalaya • Colombo 08',
  streak_days = 11,
  xp = 940,
  weekly_xp = 260,
  league_id = 5,
  quest_points = 5
WHERE id = 'a6666666-6666-4666-a666-666666666666';

-- 3. Seed Mutual & Unilateral Follows for methnidumanuth@gmail.com
INSERT INTO public.user_follows (follower_id, following_id)
VALUES
  -- Methnidu follows Kavindu & Kavindu follows Methnidu (Mutual)
  ('8db7fca2-c7b9-4460-9e89-c3630a637e0d', 'a1111111-1111-4111-a111-111111111111'),
  ('a1111111-1111-4111-a111-111111111111', '8db7fca2-c7b9-4460-9e89-c3630a637e0d'),
  -- Methnidu follows Hansi & Hansi follows Methnidu (Mutual)
  ('8db7fca2-c7b9-4460-9e89-c3630a637e0d', 'a2222222-2222-4222-a222-222222222222'),
  ('a2222222-2222-4222-a222-222222222222', '8db7fca2-c7b9-4460-9e89-c3630a637e0d'),
  -- Methnidu follows Shenaya (Unilateral)
  ('8db7fca2-c7b9-4460-9e89-c3630a637e0d', 'a4444444-4444-4444-a444-444444444444'),
  -- Dineth follows Methnidu (Follower)
  ('a3333333-3333-4333-a333-333333333333', '8db7fca2-c7b9-4460-9e89-c3630a637e0d')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Update follower/following counts
UPDATE public.profiles SET
  following_count = (SELECT count(*) FROM public.user_follows WHERE follower_id = profiles.id),
  followers_count = (SELECT count(*) FROM public.user_follows WHERE following_id = profiles.id);

-- 4. Seed Friend Streaks
INSERT INTO public.friend_streaks (user1_id, user2_id, streak_days, user1_completed_today, user2_completed_today, last_activity_date)
VALUES
  ('8db7fca2-c7b9-4460-9e89-c3630a637e0d', 'a1111111-1111-4111-a111-111111111111', 14, true, true, CURRENT_DATE),
  ('8db7fca2-c7b9-4460-9e89-c3630a637e0d', 'a2222222-2222-4222-a222-222222222222', 7, true, true, CURRENT_DATE)
ON CONFLICT (user1_id, user2_id) DO UPDATE SET
  streak_days = excluded.streak_days,
  last_activity_date = CURRENT_DATE;

-- 5. Seed Social Timeline Activities
INSERT INTO public.social_activities (user_id, activity_type, title, description, reactions)
VALUES
  (
    'a1111111-1111-4111-a111-111111111111',
    'league_promoted',
    'Promoted to Diamond League! 💎',
    'Finished in the top 3 of the national division with 2,840 XP this week.',
    '{"highFive": 6, "congrats": 12, "celebrate": 8, "letsGo": 15}'::jsonb
  ),
  (
    'a2222222-2222-4222-a222-222222222222',
    'streak_milestone',
    'Hit a 35-Day Study Streak! 🔥',
    'Studying A/L ICT past papers every single day without breaking the chain.',
    '{"highFive": 9, "congrats": 14, "celebrate": 5, "letsGo": 11}'::jsonb
  ),
  (
    'a4444444-4444-4444-a444-444444444444',
    'unit_mastered',
    'Mastered Unit 3: Digital Electronics! ⚡',
    'Completed 15 De Morgan & Karnaugh map drills with 100% accuracy.',
    '{"highFive": 4, "congrats": 7, "celebrate": 10, "letsGo": 6}'::jsonb
  ),
  (
    'a3333333-3333-4333-a333-333333333333',
    'drill_perfect',
    'Scored 100% in 2024 Past Paper Drill! 🎯',
    'Flawless 10-question sprint through Python loops & SQL queries.',
    '{"highFive": 5, "congrats": 8, "celebrate": 4, "letsGo": 7}'::jsonb
  );
