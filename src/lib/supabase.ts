import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry, DailyQuest, UserStats } from '../types';

export interface LocalAttempt {
  id: string;
  questionId: string;
  unit: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  createdAt: string;
}

export function getSupabaseConfig(): {
  url: string;
  key: string;
  source: 'localStorage' | 'env' | 'none';
} {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('termy_supabase_url');
    const customKey = localStorage.getItem('termy_supabase_anon_key');
    if (customUrl && customKey) {
      return { url: customUrl, key: customKey, source: 'localStorage' };
    }
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey && envUrl !== 'https://your-project.supabase.co') {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  return { url: '', key: '', source: 'none' };
}

let clientInstance: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    clientInstance = null;
    currentClientKey = '';
    return null;
  }

  const cacheKey = `${config.url}_${config.key}`;
  if (!clientInstance || currentClientKey !== cacheKey) {
    try {
      clientInstance = createClient(config.url, config.key);
      currentClientKey = cacheKey;
    } catch (e) {
      console.error('Failed to initialize Supabase client', e);
      clientInstance = null;
    }
  }
  return clientInstance;
}

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window === 'undefined') return;
  if (url && key) {
    localStorage.setItem('termy_supabase_url', url.trim());
    localStorage.setItem('termy_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('termy_supabase_url');
    localStorage.removeItem('termy_supabase_anon_key');
  }
  clientInstance = null;
  currentClientKey = '';
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{
  success: boolean;
  message: string;
  version?: string;
}> {
  const targetUrl = url || getSupabaseConfig().url;
  const targetKey = key || getSupabaseConfig().key;

  if (!targetUrl || !targetKey) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please provide both.',
    };
  }

  try {
    const client = createClient(targetUrl, targetKey);
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Remember to run supabase/schema.sql to create tables).',
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message} (${error.code || 'Unauthorized'})`,
      };
    }

    return {
      success: true,
      message: 'Connected successfully to Supabase PostgreSQL database!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to Supabase instance.',
    };
  }
}

/**
 * Sync user statistics with Supabase profiles table
 */
export async function syncUserStatsToSupabase(stats: UserStats) {
  // Always update local cache first
  try {
    localStorage.setItem('termy_user_stats', JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save user stats locally', e);
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, localOnly: true };
  }

  try {
    const userRes = await client.auth.getUser();
    const currentUid = userRes.data.user?.id || stats.id;

    if (!currentUid) {
      return { success: true, localOnly: true };
    }

    const { data, error } = await client
      .from('profiles')
      .upsert(
        {
          id: currentUid,
          email: stats.email || userRes.data.user?.email,
          username: stats.username.replace('@', ''),
          display_name: stats.name,
          avatar_url: stats.avatarUrl,
          school: stats.school,
          batch: stats.batch,
          streak_days: stats.streakDays,
          xp: stats.xp,
          gems: stats.gems,
          hearts: stats.hearts,
          is_pro: stats.isPro,
          target_exam_year: stats.targetExamYear,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase profile sync error:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Supabase profile sync exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Local attempts storage helper
 */
const ATTEMPTS_STORAGE_KEY = 'termy_quiz_attempts_v1';

export function getLocalAttempts(): LocalAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalAttempt(attempt: LocalAttempt) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalAttempts();
    existing.unshift(attempt);
    // Keep last 1,000 attempts in local cache
    const trimmed = existing.slice(0, 1000);
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save local attempt:', e);
  }
}

/**
 * Log MCQ attempt to local state and Supabase
 */
export async function logMcqAttempt(attempt: {
  questionId: string;
  unit: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
}) {
  const localRecord: LocalAttempt = {
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    questionId: attempt.questionId,
    unit: attempt.unit,
    selectedOption: attempt.selectedOption,
    isCorrect: attempt.isCorrect,
    timeSpentSeconds: attempt.timeSpentSeconds,
    createdAt: new Date().toISOString(),
  };

  saveLocalAttempt(localRecord);

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, localOnly: true };
  }

  try {
    const userRes = await client.auth.getUser();
    const userId = userRes.data.user?.id;

    const payload: any = {
      question_id: attempt.questionId,
      unit_number: attempt.unit,
      selected_option: attempt.selectedOption,
      is_correct: attempt.isCorrect,
      time_spent_seconds: attempt.timeSpentSeconds,
      created_at: localRecord.createdAt,
    };

    if (userId) {
      payload.user_id = userId;
    }

    const { data, error } = await client.from('quiz_attempts').insert(payload);
    if (error) {
      console.warn('Supabase quiz_attempts insert notice:', error.message);
      return { success: true, localSaved: true };
    }
    return { success: true, data };
  } catch (err) {
    return { success: true, localSaved: true };
  }
}

/**
 * Compute REAL Unit Mastery Breakdown from candidate's actual attempts
 */
export interface UnitMasteryStat {
  unit: number;
  unitTitle: string;
  attemptCount: number;
  correctCount: number;
  masteryPercent: number;
}

const UNIT_TITLES: Record<number, string> = {
  1: 'Unit 01: Introduction to ICT & Information',
  2: 'Unit 02: Number Systems & Data Representation',
  3: 'Unit 03: Digital Logic Gates & Boolean Algebra',
  4: 'Unit 04: Computer Systems & Architecture',
  5: 'Unit 05: Operating Systems & File Management',
  6: 'Unit 06: Programming Concepts (Python/PHP)',
  7: 'Unit 07: Database Management Systems (DBMS)',
  8: 'Unit 08: Web Development (HTML/CSS/JS)',
  9: 'Unit 09: Data Communication & Networks',
  10: 'Unit 10: Systems Analysis & Design (SAD)',
  11: 'Unit 11: ICT & Society, Security, E-Commerce',
  12: 'Unit 12: General ICT & Past Paper Drills',
};

export function getRealUnitMastery(): UnitMasteryStat[] {
  const attempts = getLocalAttempts();
  const unitStatsMap = new Map<number, { attempts: number; correct: number }>();

  // Initialize for primary syllabus units
  const keyUnits = [3, 6, 7, 9, 2, 4];
  keyUnits.forEach((u) => {
    unitStatsMap.set(u, { attempts: 0, correct: 0 });
  });

  attempts.forEach((att) => {
    const current = unitStatsMap.get(att.unit) || { attempts: 0, correct: 0 };
    current.attempts += 1;
    if (att.isCorrect) current.correct += 1;
    unitStatsMap.set(att.unit, current);
  });

  const result: UnitMasteryStat[] = [];
  unitStatsMap.forEach((val, unit) => {
    const mastery = val.attempts > 0 ? Math.round((val.correct / val.attempts) * 100) : 0;
    result.push({
      unit,
      unitTitle: UNIT_TITLES[unit] || `Unit ${unit}: A/L ICT`,
      attemptCount: val.attempts,
      correctCount: val.correct,
      masteryPercent: mastery,
    });
  });

  return result.sort((a, b) => a.unit - b.unit);
}

/**
 * Compute REAL Daily Quests Progress from candidate's actual attempts today
 */
export function getRealDailyQuests(streakDays: number): DailyQuest[] {
  const attempts = getLocalAttempts();
  const today = new Date().toDateString();

  const todayAttempts = attempts.filter(
    (att) => new Date(att.createdAt).toDateString() === today
  );

  const todayCount = todayAttempts.length;
  const todayCorrect = todayAttempts.filter((a) => a.isCorrect).length;
  const todayAccuracy = todayCount > 0 ? Math.round((todayCorrect / todayCount) * 100) : 0;

  return [
    {
      id: 'quest_drill_15',
      title: 'Solve 15 A/L ICT MCQs',
      description: 'Complete 15 question drills across any syllabus unit today',
      unitTag: 'Daily Target',
      current: Math.min(15, todayCount),
      target: 15,
      xpReward: 30,
      gemReward: 10,
      completed: todayCount >= 15,
      icon: 'terminal',
    },
    {
      id: 'quest_accuracy_80',
      title: 'Maintain 80%+ Accuracy Today',
      description: 'Demonstrate high precision on timed exam drills',
      unitTag: 'Accuracy',
      current: todayCount >= 5 ? todayAccuracy : 0,
      target: 80,
      xpReward: 40,
      gemReward: 15,
      completed: todayCount >= 5 && todayAccuracy >= 80,
      icon: 'verified',
    },
    {
      id: 'quest_sr_review',
      title: 'Spaced Repetition Active Recall',
      description: 'Clear tricky questions resurfaced by the Termy engine',
      unitTag: 'Active Recall',
      current: Math.min(5, todayCount),
      target: 5,
      xpReward: 25,
      gemReward: 10,
      completed: todayCount >= 5,
      icon: 'autorenew',
    },
    {
      id: 'quest_streak_maintain',
      title: 'Maintain Study Streak',
      description: `Submit at least 1 verified drill session before midnight to preserve your ${streakDays}-day streak`,
      unitTag: 'Consistency',
      current: todayCount >= 1 ? streakDays : 0,
      target: Math.max(1, streakDays),
      xpReward: 50,
      gemReward: 20,
      completed: todayCount >= 1,
      icon: 'local_fire_department',
    },
  ];
}

/**
 * Fetch REAL Leaderboard from Supabase profiles / leaderboard_view
 */
export async function fetchRealLeaderboard(currentUserStats: UserStats): Promise<LeaderboardEntry[]> {
  const client = getSupabaseClient();
  if (!client) {
    // Return real current user only (0 fake accounts)
    return [
      {
        rank: 1,
        id: currentUserStats.id || 'local_user',
        name: currentUserStats.name,
        username: currentUserStats.username,
        avatarUrl: currentUserStats.avatarUrl,
        school: currentUserStats.school,
        level: `L${currentUserStats.level || 1}`,
        streak: currentUserStats.streakDays,
        xp: currentUserStats.xp,
        isCurrentUser: true,
      },
    ];
  }

  try {
    // Try querying leaderboard_view
    const { data: viewData, error: viewError } = await client
      .from('leaderboard_view')
      .select('*')
      .limit(50);

    let profiles = viewData;

    if (viewError || !profiles || profiles.length === 0) {
      // Fallback directly to profiles table
      const { data: profData } = await client
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);
      profiles = profData || [];
    }

    if (!profiles || profiles.length === 0) {
      return [
        {
          rank: 1,
          id: currentUserStats.id || 'local_user',
          name: currentUserStats.name,
          username: currentUserStats.username,
          avatarUrl: currentUserStats.avatarUrl,
          school: currentUserStats.school,
          level: `L${currentUserStats.level || 1}`,
          streak: currentUserStats.streakDays,
          xp: currentUserStats.xp,
          isCurrentUser: true,
        },
      ];
    }

    const currentUserId = currentUserStats.id;
    let foundCurrent = false;

    const entries: LeaderboardEntry[] = profiles.map((p: any, index: number) => {
      const isCurrent = (currentUserId && p.id === currentUserId) || p.username === currentUserStats.username;
      if (isCurrent) foundCurrent = true;

      const userLvl = Math.max(1, Math.floor((p.xp || 0) / 400) + 1);

      return {
        rank: p.rank || index + 1,
        id: p.id,
        name: p.display_name || p.username || 'Candidate',
        username: p.username ? (p.username.startsWith('@') ? p.username : `@${p.username}`) : '@candidate',
        avatarUrl: p.avatar_url,
        school: p.school || 'Physical Science & ICT Stream',
        level: `L${userLvl}`,
        streak: p.streak_days || 0,
        xp: p.xp || 0,
        isCurrentUser: isCurrent,
      };
    });

    // If current user is not in top list, add at appropriate position or end
    if (!foundCurrent) {
      entries.push({
        rank: entries.length + 1,
        id: currentUserStats.id || 'local_user',
        name: currentUserStats.name,
        username: currentUserStats.username,
        avatarUrl: currentUserStats.avatarUrl,
        school: currentUserStats.school,
        level: `L${currentUserStats.level || 1}`,
        streak: currentUserStats.streakDays,
        xp: currentUserStats.xp,
        isCurrentUser: true,
      });
    }

    return entries;
  } catch (err) {
    console.warn('Leaderboard fetch fallback to current user:', err);
    return [
      {
        rank: 1,
        id: currentUserStats.id || 'local_user',
        name: currentUserStats.name,
        username: currentUserStats.username,
        avatarUrl: currentUserStats.avatarUrl,
        school: currentUserStats.school,
        level: `L${currentUserStats.level || 1}`,
        streak: currentUserStats.streakDays,
        xp: currentUserStats.xp,
        isCurrentUser: true,
      },
    ];
  }
}
