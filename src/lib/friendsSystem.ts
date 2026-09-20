import { FriendUser, FriendStreak, SocialActivity, UserStats } from '../types';
import { getSupabaseClient } from './supabase';
import { getLeagueById } from './leagueSystem';

const FOLLOWS_STORAGE_KEY = 'termy_user_follows_v1';
const BLOCKED_STORAGE_KEY = 'termy_blocked_users_v1';
const STREAKS_STORAGE_KEY = 'termy_friend_streaks_v1';
const FEED_STORAGE_KEY = 'termy_social_feed_v1';

// Seed directory of active Sri Lankan A/L ICT Candidates
export const SEED_CANDIDATES: FriendUser[] = [
  {
    id: 'user_kavindu_01',
    name: 'Kavindu Senanayake',
    username: '@kavindu_royal',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    school: 'Royal College • Colombo 07',
    streakDays: 48,
    xp: 2840,
    weeklyXp: 720,
    leagueId: 10,
    leagueName: 'Diamond League',
    isFollowing: true,
    isFollower: true,
    isMutual: true,
    hasFriendStreak: true,
    friendStreakDays: 14,
    completedLessonToday: true,
  },
  {
    id: 'user_hansi_02',
    name: 'Hansi Perera',
    username: '@hansi_visakha',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    school: 'Visakha Vidyalaya • Colombo 04',
    streakDays: 35,
    xp: 2190,
    weeklyXp: 540,
    leagueId: 9,
    leagueName: 'Obsidian League',
    isFollowing: true,
    isFollower: true,
    isMutual: true,
    hasFriendStreak: true,
    friendStreakDays: 7,
    completedLessonToday: true,
  },
  {
    id: 'user_dineth_03',
    name: 'Dineth Jayasuriya',
    username: '@dineth_ananda',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    school: 'Ananda College • Colombo 10',
    streakDays: 22,
    xp: 1780,
    weeklyXp: 410,
    leagueId: 8,
    leagueName: 'Pearl League',
    isFollowing: false,
    isFollower: true,
    isMutual: false,
    hasFriendStreak: false,
    completedLessonToday: false,
  },
  {
    id: 'user_shenaya_04',
    name: 'Shenaya Fernando',
    username: '@shenaya_mew',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    school: 'Musaeus College • Colombo 07',
    streakDays: 19,
    xp: 1450,
    weeklyXp: 380,
    leagueId: 7,
    leagueName: 'Amethyst League',
    isFollowing: true,
    isFollower: false,
    isMutual: false,
    hasFriendStreak: false,
    completedLessonToday: true,
  },
  {
    id: 'user_tharindu_05',
    name: 'Tharindu Wickrama',
    username: '@tharindu_mahinda',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    school: 'Mahinda College • Galle',
    streakDays: 14,
    xp: 1210,
    weeklyXp: 290,
    leagueId: 6,
    leagueName: 'Emerald League',
    isFollowing: false,
    isFollower: false,
    isMutual: false,
    hasFriendStreak: false,
    completedLessonToday: false,
  },
  {
    id: 'user_nethmi_06',
    name: 'Nethmi Rathnayake',
    username: '@nethmi_devi',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    school: 'Devi Balika Vidyalaya • Colombo 08',
    streakDays: 11,
    xp: 940,
    weeklyXp: 260,
    leagueId: 5,
    leagueName: 'Ruby League',
    isFollowing: false,
    isFollower: false,
    isMutual: false,
    hasFriendStreak: false,
    completedLessonToday: false,
  },
];

export interface FollowState {
  followingIds: string[];
  followerIds: string[];
}

/**
 * Load local follow relationships
 */
export function getLocalFollowState(): FollowState {
  if (typeof window === 'undefined') {
    return { followingIds: ['user_kavindu_01', 'user_hansi_02', 'user_shenaya_04'], followerIds: ['user_kavindu_01', 'user_hansi_02', 'user_dineth_03'] };
  }
  try {
    const saved = localStorage.getItem(FOLLOWS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse follow state', e);
  }
  // Default sample network: following Kavindu, Hansi, Shenaya; followed by Kavindu, Hansi, Dineth
  return {
    followingIds: ['user_kavindu_01', 'user_hansi_02', 'user_shenaya_04'],
    followerIds: ['user_kavindu_01', 'user_hansi_02', 'user_dineth_03'],
  };
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

  // Fetch real profiles from Supabase if available
  let pool = [...SEED_CANDIDATES];
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client
        .from('profiles')
        .select('id, display_name, username, avatar_url, school, streak_days, xp, weekly_xp, league_id')
        .neq('id', currentUserId || '')
        .limit(25);

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

    return {
      ...user,
      isFollowing,
      isFollower,
      isMutual,
      hasFriendStreak: isMutual && (user.id === 'user_kavindu_01' || user.id === 'user_hansi_02'),
      friendStreakDays: user.id === 'user_kavindu_01' ? 14 : user.id === 'user_hansi_02' ? 7 : 0,
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
export function getFriendStreaks(currentUser: UserStats): FriendStreak[] {
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

  // Default initial friend streaks with mutual study partners
  const defaultStreaks: FriendStreak[] = [
    {
      id: 'fs_kavindu',
      friendId: 'user_kavindu_01',
      friendName: 'Kavindu Senanayake',
      friendUsername: '@kavindu_royal',
      friendAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      streakDays: 14,
      userCompletedToday: (currentUser.streakDays || 0) > 0,
      friendCompletedToday: true,
      lastActiveDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'fs_hansi',
      friendId: 'user_hansi_02',
      friendName: 'Hansi Perera',
      friendUsername: '@hansi_visakha',
      friendAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      streakDays: 7,
      userCompletedToday: (currentUser.streakDays || 0) > 0,
      friendCompletedToday: true,
      lastActiveDate: new Date().toISOString().split('T')[0],
    },
  ];

  return defaultStreaks;
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

  // Pre-populated realistic milestone activities from people you follow
  const defaultFeed: SocialActivity[] = [
    {
      id: 'act_01',
      userId: 'user_kavindu_01',
      userName: 'Kavindu Senanayake',
      userUsername: '@kavindu_royal',
      userAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      activityType: 'league_promoted',
      title: 'Promoted to Diamond League! 💎',
      description: 'Finished in the top 3 of the national division with 2,840 XP this week.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      timeAgo: '2h ago',
      reactions: { highFive: 6, congrats: 12, celebrate: 8, letsGo: 15 },
    },
    {
      id: 'act_02',
      userId: 'user_hansi_02',
      userName: 'Hansi Perera',
      userUsername: '@hansi_visakha',
      userAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      activityType: 'streak_milestone',
      title: 'Hit a 35-Day Study Streak! 🔥',
      description: 'Studying A/L ICT every single day without breaking the chain.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      timeAgo: '5h ago',
      reactions: { highFive: 9, congrats: 14, celebrate: 5, letsGo: 11 },
    },
    {
      id: 'act_03',
      userId: 'user_shenaya_04',
      userName: 'Shenaya Fernando',
      userUsername: '@shenaya_mew',
      userAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      activityType: 'unit_mastered',
      title: 'Mastered Unit 3: Digital Electronics! ⚡',
      description: 'Completed 15 De Morgan & Karnaugh map drills with 100% accuracy.',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      timeAgo: '12h ago',
      reactions: { highFive: 4, congrats: 7, celebrate: 10, letsGo: 6 },
    },
    {
      id: 'act_04',
      userId: 'user_dineth_03',
      userName: 'Dineth Jayasuriya',
      userUsername: '@dineth_ananda',
      userAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      activityType: 'drill_perfect',
      title: 'Scored 100% in 2024 Past Paper Drill! 🎯',
      description: 'Flawless 10-question sprint through Python loops & SQL queries.',
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
      timeAgo: '20h ago',
      reactions: { highFive: 5, congrats: 8, celebrate: 4, letsGo: 7 },
    },
  ];

  return defaultFeed;
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

  return { feed, activity: act };
}

/**
 * Eligible Quest Partners for Weekly Friends Quest (mutual follow + active this week)
 */
export async function getEligibleQuestPartners(currentUserId?: string): Promise<FriendUser[]> {
  const { mutual } = await getAllFriendsList(currentUserId);
  return mutual.filter((m) => (m.weeklyXp || 0) > 0 || m.completedLessonToday);
}
