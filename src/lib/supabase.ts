import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sync user statistics with Supabase if configured, otherwise persist in localStorage
 */
export async function syncUserStatsToSupabase(stats: any) {
  if (!supabase) {
    // Local fallback
    try {
      localStorage.setItem('termy_user_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    return { success: true, localOnly: true };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        username: stats.username,
        display_name: stats.name,
        streak_days: stats.streakDays,
        xp: stats.xp,
        gems: stats.gems,
        hearts: stats.hearts,
        is_pro: stats.isPro,
        target_exam_year: stats.targetExamYear,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'username' });

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
  if (!supabase) {
    return { success: true, localOnly: true };
  }

  try {
    const { data, error } = await supabase.from('quiz_attempts').insert({
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
