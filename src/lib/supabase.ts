import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
    // Ping profiles or check schema
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, it's still connected to Supabase!
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
 * Sync user statistics with Supabase if configured, otherwise persist in localStorage
 */
export async function syncUserStatsToSupabase(stats: any) {
  const client = getSupabaseClient();
  if (!client) {
    // Local fallback
    try {
      localStorage.setItem('termy_user_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    return { success: true, localOnly: true };
  }

  try {
    const { data, error } = await client
      .from('profiles')
      .upsert(
        {
          username: stats.username,
          display_name: stats.name,
          streak_days: stats.streakDays,
          xp: stats.xp,
          gems: stats.gems,
          hearts: stats.hearts,
          is_pro: stats.isPro,
          target_exam_year: stats.targetExamYear,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'username' }
      );

    if (error) {
      console.warn('Supabase sync error', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Supabase exception', err);
    return { success: false, error: err };
  }
}

/**
 * Log MCQ attempt to Supabase for spaced repetition analytics
 */
export async function logMcqAttempt(attempt: {
  questionId: string;
  unit: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
}) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, localOnly: true };
  }

  try {
    const { data, error } = await client.from('quiz_attempts').insert({
      question_id: attempt.questionId,
      unit_number: attempt.unit,
      selected_option: attempt.selectedOption,
      is_correct: attempt.isCorrect,
      time_spent_seconds: attempt.timeSpentSeconds,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}
