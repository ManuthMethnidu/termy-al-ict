import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import { UserStats } from '../types';
import { getLeagueById } from './leagueSystem';

export interface AuthProfile {
  id: string;
  email?: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

/**
 * Clean OAuth tokens or query codes (?code=..., #access_token=...) from the browser URL cleanly
 */
export function cleanAuthUrl() {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    let changed = false;

    if (url.searchParams.has('code')) {
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      changed = true;
    }

    if (url.searchParams.has('error') || url.searchParams.has('error_description')) {
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      changed = true;
    }

    if (
      url.hash &&
      (url.hash.includes('access_token=') ||
        url.hash.includes('refresh_token=') ||
        url.hash.includes('error='))
    ) {
      url.hash = '';
      changed = true;
    }

    if (changed) {
      const remainingSearch = url.searchParams.toString();
      const cleanPath = url.pathname + (remainingSearch ? `?${remainingSearch}` : '') + (url.hash || '');
      window.history.replaceState(null, '', cleanPath);
    }
  } catch (err) {
    console.warn('Error cleaning auth URL:', err);
  }
}

/**
 * Handle initial PKCE code exchange or hash processing on app mount
 */
export async function handleAuthCallback(): Promise<void> {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');

  if (code) {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.exchangeCodeForSession(code);
      } catch (err) {
        // May already be exchanged by Supabase internal client
        console.debug('Code exchange handled:', err);
      }
    }
    cleanAuthUrl();
  } else if (
    window.location.hash &&
    (window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token='))
  ) {
    cleanAuthUrl();
  }
}

export const PRODUCTION_DOMAIN = 'https://termy.dpdns.org';
export const ADMIN_EMAIL = 'methnidumanuth@gmail.com';

/**
 * Determine if an email address belongs to the root administrator
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
}

/**
 * Compute the correct redirect URL for OAuth authentication
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    // If in local dev on localhost or 127.0.0.1
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    // If on termy.dpdns.org or custom domain
    if (origin.includes('dpdns.org')) {
      return PRODUCTION_DOMAIN;
    }
    return origin;
  }
  return PRODUCTION_DOMAIN;
}

/**
 * Trigger Supabase Google OAuth Sign-in
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: new Error(
        'Supabase is not configured. Please enter your Supabase URL & Anon key in Settings first.'
      ),
    };
  }

  try {
    const redirectUrl = getAuthRedirectUrl();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User | null; session: Session | null; error: Error | null; emailConfirmationRequired: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      session: null,
      error: new Error(
        'Supabase is not configured. Please check your Supabase URL & Anon key in Settings.'
      ),
      emailConfirmationRequired: false,
    };
  }

  try {
    const trimmedEmail = email.trim();
    const candidateName = fullName?.trim() || trimmedEmail.split('@')[0] || 'Candidate';
    const { data, error } = await client.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: candidateName,
          name: candidateName,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error, emailConfirmationRequired: false };
    }

    const emailConfirmationRequired = !data.session && !!data.user;
    return {
      user: data.user,
      session: data.session,
      error: null,
      emailConfirmationRequired,
    };
  } catch (err: any) {
    return { user: null, session: null, error: err, emailConfirmationRequired: false };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      session: null,
      error: new Error(
        'Supabase is not configured. Please check your Supabase URL & Anon key in Settings.'
      ),
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (err: any) {
    return { user: null, session: null, error: err };
  }
}

/**
 * Sign out of Supabase session
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };

  try {
    const { error } = await client.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Retrieve current active Supabase user session
 */
export async function getSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Retrieve current active user
 */
export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data } = await client.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Fetch candidate profile from public.profiles table
 */
export async function fetchUserProfile(userId: string): Promise<Partial<UserStats> | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.display_name,
      username: data.username.startsWith('@') ? data.username : `@${data.username}`,
      avatarUrl: data.avatar_url,
      school: data.school,
      batch: data.batch,
      streakDays: data.streak_days || 0,
      xp: data.xp || 0,
      weeklyXp: data.weekly_xp ?? data.xp ?? 0,
      leagueId: data.league_id || 1,
      league: `${getLeagueById(data.league_id || 1).name} League`,
      leagueGroupNumber: data.league_group_number || 1,
      lastActiveWeek: data.last_active_week,
      tournamentStage: data.tournament_stage || 'none',
      gems: data.gems ?? 0,
      hearts: data.hearts ?? 5,
      isPro: data.is_pro || false,
      targetExamYear: data.target_exam_year || 2025,
      questPoints: data.quest_points ?? 0,
      boostActiveUntil: data.boost_active_until ? Number(data.boost_active_until) : undefined,
      storedBoosts: data.stored_boosts ?? 0,
      friendsQuestsEnabled: data.friends_quests_enabled ?? true,
      followingCount: data.following_count ?? 0,
      followersCount: data.followers_count ?? 0,
      authProvider: data.avatar_url?.includes('google') ? 'google' : 'email',
    };
  } catch (err) {
    console.warn('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Listen to auth state changes (sign in, sign out, token refresh)
 */
export function onAuthStateChange(
  callback: (session: Session | null, user: User | null) => void
) {
  const client = getSupabaseClient();
  if (!client) {
    callback(null, null);
    return { unsubscribe: () => {} };
  }

  const { data: authListener } = client.auth.onAuthStateChange(
    (_event, session) => {
      // Clean up OAuth hash tokens or ?code= from the address bar once captured
      cleanAuthUrl();
      callback(session, session?.user ?? null);
    }
  );

  return {
    unsubscribe: () => {
      authListener.subscription.unsubscribe();
    },
  };
}
