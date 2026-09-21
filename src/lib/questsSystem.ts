import { UserStats, DailyQuest, FriendsQuestData, WeekendQuestData, MonthlyChallengeData } from '../types';
import { getLocalAttempts } from './supabase';
import { loadSRData } from './spacedRepetition';

const QUEST_STORAGE_KEY = 'termy_quests_state_v2';

export interface QuestsState {
  date: string; // YYYY-MM-DD
  weekId: string; // YYYY-Www
  claimedQuestIds: string[];
  friendsQuest: FriendsQuestData;
  weekendQuest: WeekendQuestData;
  monthlyPoints: number;
}

/**
 * Format local date as YYYY-MM-DD
 */
function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Check if today is Weekend Sprint period (Friday 00:00 to Sunday 23:59)
 */
export function isWeekendSprintActive(): boolean {
  const day = new Date().getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  return day === 0 || day === 5 || day === 6;
}

/**
 * Calculate countdown until midnight local time (Daily reset)
 */
export function getTimeUntilMidnight(): { hours: number; minutes: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  return { hours, minutes, formatted: `${hours}h ${minutes}m left` };
}

/**
 * Load saved quests state from localStorage
 */
export function loadQuestsState(): QuestsState {
  const todayStr = getTodayDateString();
  const currentWeek = `${new Date().getFullYear()}-W${Math.ceil((new Date().getDate() + 6) / 7)}`;

  const defaultFriendsQuest: FriendsQuestData = {
    id: `fq_${currentWeek}`,
    partnerName: 'Kavindu Senanayake',
    partnerUsername: '@kavindu_royal',
    partnerSchool: 'Royal College • Colombo 07',
    objectiveTitle: 'Earn 1,200 Combined Team XP',
    objectiveDescription: 'Collaborate with your study partner to rack up past paper drill points before Sunday.',
    metricType: 'xp',
    currentTeamTotal: 480,
    targetTotal: 1200,
    userContribution: 160,
    partnerContribution: 320,
    completed: false,
    claimed: false,
    gemReward: 100,
    questPointsReward: 5,
    boostMinutes: 30,
    deadlineText: 'Ends Sunday midnight',
  };

  const defaultWeekendQuest: WeekendQuestData = {
    id: `wq_${todayStr}`,
    title: 'Weekend Logic Gate Monolith',
    description: 'Construct the ancient computing statue by completing 5 perfect MCQ drills with 100% accuracy.',
    statueName: 'Alan Turing Monolith',
    currentMilestone: 1,
    totalMilestones: 5,
    metricLabel: 'Perfect Drills',
    completed: false,
    claimed: false,
    gemReward: 100,
    boostMinutes: 30,
    questPointsReward: 3,
    isActive: isWeekendSprintActive(),
  };

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(QUEST_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If same day, retain claimed IDs; otherwise reset daily claims
        const claimed = parsed.date === todayStr ? (parsed.claimedQuestIds || []) : [];
        return {
          date: todayStr,
          weekId: currentWeek,
          claimedQuestIds: claimed,
          friendsQuest: parsed.friendsQuest || defaultFriendsQuest,
          weekendQuest: parsed.weekendQuest || defaultWeekendQuest,
          monthlyPoints: parsed.monthlyPoints || 0,
        };
      } catch (e) {
        console.warn('Error loading quests state:', e);
      }
    }
  }

  return {
    date: todayStr,
    weekId: currentWeek,
    claimedQuestIds: [],
    friendsQuest: defaultFriendsQuest,
    weekendQuest: defaultWeekendQuest,
    monthlyPoints: 0,
  };
}

/**
 * Save quests state to localStorage
 */
export function saveQuestsState(state: QuestsState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving quests state:', e);
    }
  }
}

/**
 * Generate the 3 Randomized Daily Quests split into Bronze, Silver, Gold tiers
 * dynamically scaled by the candidate's learning behavior.
 */
export function getThreeTierDailyQuests(userStats: UserStats): DailyQuest[] {
  const state = loadQuestsState();
  const attempts = getLocalAttempts();
  const srData = loadSRData();

  // Attempts today
  const todayStr = new Date().toDateString();
  const todayAttempts = attempts.filter(
    (att) => new Date(att.createdAt).toDateString() === todayStr
  );
  const todayCount = todayAttempts.length;
  const todayCorrect = todayAttempts.filter((a) => a.isCorrect).length;
  const todayXpEarned = todayCorrect * 20;

  // Perfect sessions today (drills with >= 5 questions and 100% correct)
  const perfectSessions = todayCount >= 5 && todayCorrect === todayCount ? 1 : Math.floor(todayCorrect / 5);

  // Spaced repetition review count
  const srReviewed = Object.values(srData).filter(
    (item) => item.lastReviewedAt && new Date(item.lastReviewedAt).toDateString() === todayStr
  ).length;

  // Dynamic difficulty scaling: Active learners get slightly higher targets
  const activityMultiplier = userStats.streakDays > 7 || userStats.xp > 500 ? 1.25 : 1.0;

  const bronzeTarget = Math.round(20 * activityMultiplier);
  const silverTarget = Math.round(50 * activityMultiplier);
  const goldTarget = Math.round(100 * activityMultiplier);

  // 1. Bronze Tier (Easy) - Target: 20 XP or 1 drill lesson
  const bronzeCompleted = todayXpEarned >= bronzeTarget || todayCount >= 3;
  const bronzeQuest: DailyQuest = {
    id: `dq_bronze_${state.date}`,
    tier: 'bronze',
    chestType: 'common',
    title: 'Bronze Tier: Daily Kickstarter',
    description: `Earn ${bronzeTarget} XP from syllabus drills today.`,
    unitTag: 'Tier 1 • Easy',
    current: Math.min(bronzeTarget, todayXpEarned),
    target: bronzeTarget,
    xpReward: 20,
    gemReward: 10,
    questPointsReward: 1,
    hasBoostReward: false,
    completed: bronzeCompleted,
    claimed: state.claimedQuestIds.includes(`dq_bronze_${state.date}`),
    icon: 'emoji_events',
  };

  // 2. Silver Tier (Medium) - Target: 50 XP, or 10 correct answers in a row
  const silverCurrent = Math.min(silverTarget, Math.max(todayXpEarned, todayCorrect * 5));
  const silverCompleted = silverCurrent >= silverTarget;
  const silverQuest: DailyQuest = {
    id: `dq_silver_${state.date}`,
    tier: 'silver',
    chestType: 'rare',
    title: 'Silver Tier: Logic Sharpener',
    description: `Accumulate ${silverTarget} XP or solve 10 correct A/L ICT MCQs today.`,
    unitTag: 'Tier 2 • Medium',
    current: silverCurrent,
    target: silverTarget,
    xpReward: 40,
    gemReward: 15,
    questPointsReward: 1,
    hasBoostReward: false,
    completed: silverCompleted,
    claimed: state.claimedQuestIds.includes(`dq_silver_${state.date}`),
    icon: 'military_tech',
  };

  // 3. Gold Tier (Hard) - Target: 100 XP, 3 perfect lessons, or 5 SR active recalls
  const goldCurrent = Math.min(goldTarget, todayXpEarned + srReviewed * 10);
  const goldCompleted = goldCurrent >= goldTarget || perfectSessions >= 2;
  const goldQuest: DailyQuest = {
    id: `dq_gold_${state.date}`,
    tier: 'gold',
    chestType: 'mega',
    title: 'Gold Tier: Distinction Mastery',
    description: `Earn ${goldTarget} XP or conquer 2 perfect drill runs without errors.`,
    unitTag: 'Tier 3 • Hard',
    current: goldCurrent,
    target: goldTarget,
    xpReward: 75,
    gemReward: 20,
    questPointsReward: 1,
    hasBoostReward: true, // Unlocks 15-min 2x XP Turbo Boost!
    completed: goldCompleted,
    claimed: state.claimedQuestIds.includes(`dq_gold_${state.date}`),
    icon: 'stars',
  };

  return [bronzeQuest, silverQuest, goldQuest];
}

/**
 * Get Monthly Challenge Metadata & Illustrated Mascot Badge
 */
export function getMonthlyChallenge(questPoints: number = 0): MonthlyChallengeData {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  // Monthly character & mascot cycle
  const MASCOTS = [
    { title: 'Ada Lovelace Algorithmic Pioneer', mascot: 'Ada Lovelace', icon: 'psychology' },
    { title: 'Alan Turing Enigma Breaker', mascot: 'Alan Turing', icon: 'memory' },
    { title: 'Claude Shannon Entropy Architect', mascot: 'Claude Shannon', icon: 'hub' },
    { title: 'Grace Hopper Compiler Vanguard', mascot: 'Grace Hopper', icon: 'terminal' },
    { title: 'John von Neumann Architecture Sage', mascot: 'Von Neumann', icon: 'developer_board' },
    { title: 'Tim Berners-Lee Hypertext Visionary', mascot: 'Berners-Lee', icon: 'language' },
  ];

  const mascot = MASCOTS[now.getMonth() % MASCOTS.length];
  const targetPoints = 30; // 30 Quest Points per month
  const completed = questPoints >= targetPoints;

  return {
    monthName,
    badgeTitle: mascot.title,
    badgeMascot: mascot.mascot,
    badgeIcon: mascot.icon,
    currentPoints: questPoints,
    targetPoints,
    completed,
    claimed: completed,
    description: `Complete Daily Quests (+1 pt), Weekend Quests (+3 pts), and Friends Quests (+5 pts) to unlock the permanent ${mascot.mascot} distinction badge on your Profile!`,
  };
}

/**
 * Claim a completed Daily Quest chest
 */
export function claimDailyQuest(
  questId: string,
  userStats: UserStats
): { updatedStats: UserStats; quest: DailyQuest } | null {
  const quests = getThreeTierDailyQuests(userStats);
  const quest = quests.find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) {
    return null;
  }

  const state = loadQuestsState();
  if (!state.claimedQuestIds.includes(questId)) {
    state.claimedQuestIds.push(questId);
    state.monthlyPoints = (state.monthlyPoints || 0) + quest.questPointsReward;
    saveQuestsState(state);
  }

  const nextXp = userStats.xp + quest.xpReward;
  const nextWeeklyXp = (userStats.weeklyXp || 0) + quest.xpReward;
  const nextGems = userStats.gems + quest.gemReward;
  const nextQuestPoints = (userStats.questPoints || 0) + quest.questPointsReward;

  let nextBoostUntil = userStats.boostActiveUntil;
  if (quest.hasBoostReward) {
    const baseTime = Math.max(Date.now(), userStats.boostActiveUntil || 0);
    nextBoostUntil = baseTime + 15 * 60 * 1000; // 15-minute 2x XP Turbo Boost
  }

  const updatedStats: UserStats = {
    ...userStats,
    xp: nextXp,
    weeklyXp: nextWeeklyXp,
    gems: nextGems,
    questPoints: nextQuestPoints,
    boostActiveUntil: nextBoostUntil,
  };

  return {
    updatedStats,
    quest: { ...quest, claimed: true },
  };
}

/**
 * Claim Friends Quest rewards (100 Gems, 30m 2x Boost, 5 Quest Points)
 */
export function claimFriendsQuest(
  userStats: UserStats
): { updatedStats: UserStats; friendsQuest: FriendsQuestData } | null {
  const state = loadQuestsState();
  if (state.friendsQuest.claimed) return null;

  state.friendsQuest.claimed = true;
  state.friendsQuest.completed = true;
  saveQuestsState(state);

  const baseTime = Math.max(Date.now(), userStats.boostActiveUntil || 0);
  const updatedStats: UserStats = {
    ...userStats,
    gems: userStats.gems + state.friendsQuest.gemReward,
    questPoints: (userStats.questPoints || 0) + state.friendsQuest.questPointsReward,
    boostActiveUntil: baseTime + state.friendsQuest.boostMinutes * 60 * 1000,
  };

  return {
    updatedStats,
    friendsQuest: state.friendsQuest,
  };
}

/**
 * Claim Weekend Quest rewards (100 Gems, 30m 2x Boost, 3 Quest Points)
 */
export function claimWeekendQuest(
  userStats: UserStats
): { updatedStats: UserStats; weekendQuest: WeekendQuestData } | null {
  const state = loadQuestsState();
  if (state.weekendQuest.claimed) return null;

  state.weekendQuest.claimed = true;
  state.weekendQuest.completed = true;
  saveQuestsState(state);

  const baseTime = Math.max(Date.now(), userStats.boostActiveUntil || 0);
  const updatedStats: UserStats = {
    ...userStats,
    gems: userStats.gems + state.weekendQuest.gemReward,
    questPoints: (userStats.questPoints || 0) + state.weekendQuest.questPointsReward,
    boostActiveUntil: baseTime + state.weekendQuest.boostMinutes * 60 * 1000,
  };

  return {
    updatedStats,
    weekendQuest: state.weekendQuest,
  };
}

/**
 * Send Free Motivational Nudge to Study Partner
 */
export function sendFriendNudge(): { success: boolean; message: string; partnerName: string } {
  const state = loadQuestsState();
  state.friendsQuest.lastNudgedAt = Date.now();
  // Simulate partner response / progress bump (+40 XP from study partner)
  if (state.friendsQuest.currentTeamTotal < state.friendsQuest.targetTotal) {
    state.friendsQuest.partnerContribution += 40;
    state.friendsQuest.currentTeamTotal = Math.min(
      state.friendsQuest.targetTotal,
      state.friendsQuest.userContribution + state.friendsQuest.partnerContribution
    );
    if (state.friendsQuest.currentTeamTotal >= state.friendsQuest.targetTotal) {
      state.friendsQuest.completed = true;
    }
  }
  saveQuestsState(state);

  return {
    success: true,
    message: `Sent a motivational nudge to ${state.friendsQuest.partnerName}: "You can do it! Let's conquer A/L ICT together!"`,
    partnerName: state.friendsQuest.partnerName,
  };
}

/**
 * Gift a 15-minute 2x XP Boost to Study Partner (Costs 20 Gems)
 */
export function sendFriendBoost(
  userStats: UserStats
): { success: boolean; updatedStats: UserStats; message: string } {
  if (userStats.gems < 20) {
    return {
      success: false,
      updatedStats: userStats,
      message: 'Not enough Gems! Sending an XP Boost requires 20 💎.',
    };
  }

  const state = loadQuestsState();
  // Partner activates boost and gains +120 XP for the shared objective
  state.friendsQuest.partnerContribution += 120;
  state.friendsQuest.currentTeamTotal = Math.min(
    state.friendsQuest.targetTotal,
    state.friendsQuest.userContribution + state.friendsQuest.partnerContribution
  );
  if (state.friendsQuest.currentTeamTotal >= state.friendsQuest.targetTotal) {
    state.friendsQuest.completed = true;
  }
  saveQuestsState(state);

  const updatedStats: UserStats = {
    ...userStats,
    gems: userStats.gems - 20,
  };

  return {
    success: true,
    updatedStats,
    message: `Gifted a 15-minute 2x XP Boost to ${state.friendsQuest.partnerName}! They activated it and earned +120 XP for your team goal!`,
  };
}

/**
 * Advance Weekend Statue Milestone (e.g. from perfect drills)
 */
export function advanceWeekendMilestone(
  milestonesToAdd: number = 1
): WeekendQuestData {
  const state = loadQuestsState();
  state.weekendQuest.currentMilestone = Math.min(
    state.weekendQuest.totalMilestones,
    state.weekendQuest.currentMilestone + milestonesToAdd
  );
  if (state.weekendQuest.currentMilestone >= state.weekendQuest.totalMilestones) {
    state.weekendQuest.completed = true;
  }
  saveQuestsState(state);
  return state.weekendQuest;
}

/**
 * Check remaining boost time
 */
export function getRemainingBoostTime(boostActiveUntil?: number): {
  isActive: boolean;
  minutesLeft: number;
  secondsLeft: number;
  formatted: string;
} {
  if (!boostActiveUntil || boostActiveUntil <= Date.now()) {
    return { isActive: false, minutesLeft: 0, secondsLeft: 0, formatted: 'Inactive' };
  }
  const diffMs = boostActiveUntil - Date.now();
  const minutesLeft = Math.floor(diffMs / (1000 * 60));
  const secondsLeft = Math.floor((diffMs / 1000) % 60);
  return {
    isActive: true,
    minutesLeft,
    secondsLeft,
    formatted: `${minutesLeft}m ${secondsLeft < 10 ? '0' : ''}${secondsLeft}s`,
  };
}
