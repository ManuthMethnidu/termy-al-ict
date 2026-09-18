import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import { UserStats } from '../types';

export interface AuthProfile {
  id: string;
  email?: string;
  name: string;
  username: string;
  avatarUrl?: string;
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
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
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
      gems: data.gems || 100,
      hearts: data.hearts || 5,
      isPro: data.is_pro || false,
      targetExamYear: data.target_exam_year || 2025,
      authProvider: 'google',
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
      callback(session, session?.user ?? null);
    }
  );

  return {
    unsubscribe: () => {
      authListener.subscription.unsubscribe();
    },
  };
}
