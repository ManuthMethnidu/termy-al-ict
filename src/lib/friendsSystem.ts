import { FriendUser, FriendStreak, SocialActivity, UserStats } from '../types';
import { getSupabaseClient } from './supabase';
import { getLeagueById } from './leagueSystem';

const FOLLOWS_STORAGE_KEY = 'termy_user_follows_v1';
const BLOCKED_STORAGE_KEY = 'termy_blocked_users_v1';
const STREAKS_STORAGE_KEY = 'termy_friend_streaks_v1';
const FEED_STORAGE_KEY = 'termy_social_feed_v1';

// Seed directory of active Sri Lankan A/L ICT Candidates (Real users only)
export const SEED_CANDIDATES: FriendUser[] = [];

export interface FollowState {
  followingIds: string[];
  followerIds: string[];
}

/**
 * Load local follow relationships
 */
export function getLocalFollowState(): FollowState {
  if (typeof window === 'undefined') {
    return { followingIds: [], followerIds: [] };
  }
  try {
    const saved = localStorage.getItem(FOLLOWS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse follow state', e);
  }
  return { followingIds: [], followerIds: [] };
}

export function saveLocalFollowState(state: FollowState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save follow state', e);
    }
  }
}

/**
 * Load blocked user IDs
 */
export function getBlockedUserIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(BLOCKED_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveBlockedUserIds(ids: string[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BLOCKED_STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn('Failed to save blocked user IDs', e);
    }
  }
}

/**
 * Follow or Unfollow a user (Twitter/Instagram unilateral follow model)
 */
export async function toggleFollowUser(
  currentUser: UserStats,
  targetUser: FriendUser
): Promise<{ isFollowing: boolean; isMutual: boolean; followingCount: number }> {
  const followState = getLocalFollowState();
  const currentlyFollowing = followState.followingIds.includes(targetUser.id);
  const nextFollowing = !currentlyFollowing;

  if (nextFollowing) {
    followState.followingIds.push(targetUser.id);
  } else {
    followState.followingIds = followState.followingIds.filter((id) => id !== targetUser.id);
  }
  saveLocalFollowState(followState);

  const isMutual = nextFollowing && followState.followerIds.includes(targetUser.id);

  // Sync to Supabase if authenticated
  const client = getSupabaseClient();
  if (client && currentUser.id) {
    try {
      if (nextFollowing) {
        await client.from('user_follows').insert({
          follower_id: currentUser.id,
          following_id: targetUser.id,
        });
      } else {
        await client
          .from('user_follows')
          .delete()
          .match({ follower_id: currentUser.id, following_id: targetUser.id });
      }
    } catch (err) {
      console.warn('Supabase follow sync skipped:', err);
    }
  }

  return {
    isFollowing: nextFollowing,
    isMutual,
    followingCount: followState.followingIds.length,
  };
}

/**
 * Check if a user is currently followed
 */
export function isUserFollowed(targetUserId: string): boolean {
  const state = getLocalFollowState();
  return state.followingIds.includes(targetUserId);
}

/**
 * Check if a connection is mutual
 */
export function isUserMutual(targetUserId: string): boolean {
  const state = getLocalFollowState();
  return state.followingIds.includes(targetUserId) && state.followerIds.includes(targetUserId);
}

/**
 * Block a user (stops them from tracking you or appearing in your network)
 */
export async function blockUser(currentUserId: string, targetUserId: string): Promise<void> {
  const blocked = getBlockedUserIds();
  if (!blocked.includes(targetUserId)) {
    blocked.push(targetUserId);
    saveBlockedUserIds(blocked);
  }

  // Remove from follows
  const follows = getLocalFollowState();
  follows.followingIds = follows.followingIds.filter((id) => id !== targetUserId);
  follows.followerIds = follows.followerIds.filter((id) => id !== targetUserId);
  saveLocalFollowState(follows);

  const client = getSupabaseClient();
  if (client && currentUserId) {
    try {
      await client.from('blocked_users').insert({
        user_id: currentUserId,
        blocked_id: targetUserId,
      });
      await client
        .from('user_follows')
        .delete()
        .or(`follower_id.eq.${targetUserId},following_id.eq.${targetUserId}`);
    } catch (e) {
      console.warn('Supabase block error:', e);
    }
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(currentUserId: string, targetUserId: string): Promise<void> {
  const blocked = getBlockedUserIds().filter((id) => id !== targetUserId);
  saveBlockedUserIds(blocked);

  const client = getSupabaseClient();
  if (client && currentUserId) {
    try {
      await client
        .from('blocked_users')
        .delete()
        .match({ user_id: currentUserId, blocked_id: targetUserId });
    } catch (e) {
      console.warn('Supabase unblock error:', e);
    }
  }
}

/**
 * Fetch list of all candidates merged with current follow state
 */
export async function getAllFriendsList(
  currentUserId?: string
): Promise<{ following: FriendUser[]; followers: FriendUser[]; mutual: FriendUser[]; suggestions: FriendUser[] }> {
  const followState = getLocalFollowState();
  const blockedIds = getBlockedUserIds();
  const activeStreaksMap = new Map<string, number>();

  const client = getSupabaseClient();
  if (client && currentUserId) {
    try {
      const [followsRes, followersRes, blockedRes, streaksRes] = await Promise.all([
        client.from('user_follows').select('following_id').eq('follower_id', currentUserId),
        client.from('user_follows').select('follower_id').eq('following_id', currentUserId),
        client.from('blocked_users').select('blocked_id').eq('user_id', currentUserId),
        client.from('friend_streaks').select('*').or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`),
      ]);

      if (followsRes.data && followsRes.data.length > 0) {
        followState.followingIds = followsRes.data.map((r: any) => r.following_id);
      }
      if (followersRes.data && followersRes.data.length > 0) {
        followState.followerIds = followersRes.data.map((r: any) => r.follower_id);
      }
      if (blockedRes.data) {
        blockedRes.data.forEach((r: any) => {
          if (!blockedIds.includes(r.blocked_id)) blockedIds.push(r.blocked_id);
        });
      }
      saveLocalFollowState(followState);
      saveBlockedUserIds(blockedIds);

      if (streaksRes.data) {
        streaksRes.data.forEach((s: any) => {
          const friendId = s.user1_id === currentUserId ? s.user2_id : s.user1_id;
          activeStreaksMap.set(friendId, s.streak_days);
        });
      }
    } catch (e) {
      console.warn('Supabase relations sync error:', e);
    }
  }

  // Fetch real profiles from Supabase if available
  let pool = [...SEED_CANDIDATES];
  if (client) {
    try {
      const { data } = await client
        .from('profiles')
        .select('id, display_name, username, avatar_url, school, streak_days, xp, weekly_xp, league_id')
        .neq('id', currentUserId || '')
        .limit(30);

      if (data && data.length > 0) {
        const remoteCandidates: FriendUser[] = data.map((p) => {
          const lId = p.league_id || 1;
          return {
            id: p.id,
            name: p.display_name || 'Candidate',
            username: `@${p.username}`,
            avatarUrl: p.avatar_url,
            school: p.school || 'Physical Science & ICT Stream',
            streakDays: p.streak_days || 1,
            xp: p.xp || 50,
            weeklyXp: p.weekly_xp || 0,
            leagueId: lId,
            leagueName: getLeagueById(lId).name,
            isFollowing: false,
            isFollower: false,
            isMutual: false,
            completedLessonToday: true,
          };
        });

        // Merge without duplicate IDs
        const existingIds = new Set(pool.map((c) => c.id));
        remoteCandidates.forEach((rc) => {
          if (!existingIds.has(rc.id)) {
            pool.push(rc);
          } else {
            const idx = pool.findIndex((c) => c.id === rc.id);
            if (idx !== -1) pool[idx] = { ...pool[idx], ...rc };
          }
        });
      }
    } catch (e) {
      console.warn('Supabase profiles fetch for friends skipped:', e);
    }
  }

  // Filter out blocked users
  const activePool = pool.filter((u) => !blockedIds.includes(u.id));

  // Compute following, followers, and mutual flags
  const populated: FriendUser[] = activePool.map((user) => {
    const isFollowing = followState.followingIds.includes(user.id);
    const isFollower = followState.followerIds.includes(user.id);
    const isMutual = isFollowing && isFollower;
    const hasFriendStreak = isMutual && activeStreaksMap.has(user.id);
    const friendStreakDays = activeStreaksMap.get(user.id) ?? 0;

    return {
      ...user,
      isFollowing,
      isFollower,
      isMutual,
      hasFriendStreak,
      friendStreakDays,
    };
  });

  const following = populated.filter((u) => u.isFollowing);
  const followers = populated.filter((u) => u.isFollower);
  const mutual = populated.filter((u) => u.isMutual);
  const suggestions = populated.filter((u) => !u.isFollowing);

  return { following, followers, mutual, suggestions };
}

/**
 * Search users by username, display name, or school
 */
export async function searchUsers(query: string, currentUserId?: string): Promise<FriendUser[]> {
  const { following, suggestions } = await getAllFriendsList(currentUserId);
  const all = [...following, ...suggestions];
  const q = query.toLowerCase().trim().replace('@', '');
  if (!q) return all.slice(0, 8);

  return all.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.school.toLowerCase().includes(q)
  );
}

/**
 * Generate shareable invite link
 */
export function generateInviteLink(username: string): string {
  const cleanUsername = username.replace('@', '');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://termy.dpdns.org';
  return `${origin}/?ref=${cleanUsername}`;
}

/**
 * Friend Streaks: Up to 5 mutual friends
 */
export function getFriendStreaks(_currentUser: UserStats): FriendStreak[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STREAKS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse friend streaks', e);
      }
    }
  }

  return [];
}

export function saveFriendStreaks(streaks: FriendStreak[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STREAKS_STORAGE_KEY, JSON.stringify(streaks));
    } catch (e) {
      console.warn('Failed to save friend streaks', e);
    }
  }
}

/**
 * Fetch friend streaks from Supabase with fallback to local
 */
export async function fetchFriendStreaks(currentUser: UserStats): Promise<FriendStreak[]> {
  const client = getSupabaseClient();
  if (client && currentUser.id) {
    try {
      const { data, error } = await client
        .from('friend_streaks')
        .select('*')
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

      if (error) {
        console.warn('Error fetching friend streaks from Supabase:', error.message);
        return getFriendStreaks(currentUser);
      }

      if (data && data.length > 0) {
        const friendIds = data.map((r: any) => (r.user1_id === currentUser.id ? r.user2_id : r.user1_id));
        const { data: profiles } = await client
          .from('profiles')
          .select('id, display_name, username, avatar_url')
          .in('id', friendIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const streaks: FriendStreak[] = data.map((r: any) => {
          const isUser1 = r.user1_id === currentUser.id;
          const friendId = isUser1 ? r.user2_id : r.user1_id;
          const prof = profileMap.get(friendId);
          return {
            id: r.id,
            friendId,
            friendName: prof?.display_name || 'Study Partner',
            friendUsername: prof?.username ? `@${prof.username}` : '@buddy',
            friendAvatarUrl: prof?.avatar_url,
            streakDays: r.streak_days,
            userCompletedToday: isUser1 ? r.user1_completed_today : r.user2_completed_today,
            friendCompletedToday: isUser1 ? r.user2_completed_today : r.user1_completed_today,
            lastActiveDate: r.last_activity_date,
          };
        });
        saveFriendStreaks(streaks);
        return streaks;
      }
    } catch (e) {
      console.warn('Failed to fetch friend streaks from Supabase:', e);
    }
  }
  return getFriendStreaks(currentUser);
}

/**
 * Initiate a Friend Streak with a mutual friend (limit: 5)
 */
export async function startFriendStreak(
  currentUser: UserStats,
  friend: FriendUser
): Promise<{ success: boolean; message: string; streaks: FriendStreak[] }> {
  const streaks = getFriendStreaks(currentUser);

  if (streaks.some((s) => s.friendId === friend.id)) {
    return { success: false, message: `You already have an active Friend Streak with ${friend.name}!`, streaks };
  }

  if (streaks.length >= 5) {
    return {
      success: false,
      message: 'Maximum 5 active Friend Streaks reached! Complete drills together to keep your existing streaks burning 🔥',
      streaks,
    };
  }

  const newStreak: FriendStreak = {
    id: `fs_${friend.id}_${Date.now()}`,
    friendId: friend.id,
    friendName: friend.name,
    friendUsername: friend.username,
    friendAvatarUrl: friend.avatarUrl,
    streakDays: 1,
    userCompletedToday: true,
    friendCompletedToday: true,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };

  const nextStreaks = [...streaks, newStreak];
  saveFriendStreaks(nextStreaks);

  // Sync to Supabase
  const client = getSupabaseClient();
  if (client && currentUser.id && friend.id) {
    const [u1, u2] = currentUser.id < friend.id ? [currentUser.id, friend.id] : [friend.id, currentUser.id];
    const isUser1 = currentUser.id === u1;
    Promise.resolve(
      client
        .from('friend_streaks')
        .upsert(
          {
            user1_id: u1,
            user2_id: u2,
            streak_days: 1,
            user1_completed_today: isUser1,
            user2_completed_today: !isUser1,
            last_activity_date: new Date().toISOString().split('T')[0],
          },
          { onConflict: 'user1_id,user2_id' }
        )
    )
      .then((res: any) => {
        if (res?.error) console.warn('Supabase friend streak upsert error:', res.error.message);
      })
      .catch((err: any) => console.warn('Supabase friend streak exception:', err));
  }

  return {
    success: true,
    message: `🔥 Friend Streak initiated with ${friend.name}! Complete at least 1 lesson daily to keep this flame burning!`,
    streaks: nextStreaks,
  };
}

/**
 * Social Activity Feed & Celebration Reactions
 */
export function getSocialFeed(): SocialActivity[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(FEED_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse social feed', e);
      }
    }
  }

  return [];
}

export function saveSocialFeed(feed: SocialActivity[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feed));
    } catch (e) {
      console.warn('Failed to save social feed', e);
    }
  }
}

/**
 * Fetch live social timeline from Supabase with fallback to local
 */
export async function fetchSocialFeed(): Promise<SocialActivity[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('social_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) {
        console.warn('Error fetching social feed from Supabase:', error.message);
        return getSocialFeed();
      }

      if (data && data.length > 0) {
        const userIds = Array.from(new Set(data.map((r: any) => r.user_id)));
        const { data: profiles } = await client
          .from('profiles')
          .select('id, display_name, username, avatar_url')
          .in('id', userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const feed: SocialActivity[] = data.map((r: any) => {
          const prof = profileMap.get(r.user_id);
          const createdDate = new Date(r.created_at);
          const diffHours = Math.max(1, Math.round((Date.now() - createdDate.getTime()) / 3600000));
          return {
            id: r.id,
            userId: r.user_id,
            userName: prof?.display_name || 'ICT Candidate',
            userUsername: prof?.username ? `@${prof.username}` : '@candidate',
            userAvatarUrl: prof?.avatar_url,
            activityType: r.activity_type,
            title: r.title,
            description: r.description,
            timestamp: r.created_at,
            timeAgo: diffHours < 24 ? `${diffHours}h ago` : `${Math.floor(diffHours / 24)}d ago`,
            reactions: r.reactions || { highFive: 0, congrats: 0, celebrate: 0, letsGo: 0 },
          };
        });
        saveSocialFeed(feed);
        return feed;
      }
    } catch (e) {
      console.warn('Failed to fetch social feed from Supabase:', e);
    }
  }
  return getSocialFeed();
}

/**
 * Send celebration reaction (High Five 👋, Congrats 🎉, Celebrate 🚀, Let's Go 🔥)
 */
export function reactToActivity(
  activityId: string,
  reaction: 'highFive' | 'congrats' | 'celebrate' | 'letsGo'
): { feed: SocialActivity[]; activity: SocialActivity | null } {
  const feed = getSocialFeed();
  const idx = feed.findIndex((a) => a.id === activityId);
  if (idx === -1) return { feed, activity: null };

  const act = { ...feed[idx] };
  const prevReaction = act.userReaction;

  // Toggle or change reaction
  if (prevReaction === reaction) {
    // Untap
    act.reactions[reaction] = Math.max(0, act.reactions[reaction] - 1);
    delete act.userReaction;
  } else {
    if (prevReaction) {
      act.reactions[prevReaction] = Math.max(0, act.reactions[prevReaction] - 1);
    }
    act.reactions[reaction] = (act.reactions[reaction] || 0) + 1;
    act.userReaction = reaction;
  }

  feed[idx] = act;
  saveSocialFeed(feed);

  // Sync reaction update to Supabase in background
  const client = getSupabaseClient();
  if (client) {
    Promise.resolve(
      client
        .from('social_activities')
        .update({ reactions: act.reactions })
        .eq('id', activityId)
    )
      .then((res: any) => {
        if (res?.error) console.warn('Failed to sync reaction to Supabase:', res.error.message);
      })
      .catch((e: any) => console.warn('Reaction sync error:', e));
  }

  return { feed, activity: act };
}

/**
 * Eligible Quest Partners for Weekly Friends Quest (mutual follow + active this week)
 */
export async function getEligibleQuestPartners(currentUserId?: string): Promise<FriendUser[]> {
  const { mutual } = await getAllFriendsList(currentUserId);
  return mutual.filter((m) => (m.weeklyXp || 0) > 0 || m.completedLessonToday);
}
