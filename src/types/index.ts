export type NavTab =
  | 'learn'
  | 'questions'
  | 'practice'
  | 'leaderboards'
  | 'quests'
  | 'friends'
  | 'shop'
  | 'profile'
  | 'more'
  | 'settings'
  | 'privacy'
  | 'terms'
  | 'admin';

export interface McqOption {
  id: number;
  text: string;
  isLatex?: boolean;
}

export interface McqQuestion {
  id: string;
  unit: number;
  unitTitle: string;
  pastPaperYear?: number;
  pastPaperNumber?: number;
  question: string;
  isQuestionLatex?: boolean;
  diagramType?: 'xor_gate' | 'kmap' | 'truth_table' | 'code_snippet' | 'circuit_diagram' | 'network';
  diagramData?: any;
  options: McqOption[];
  correctOption: number; // 1, 2, 3, or 4
  explanation: string;
  latexFormula?: string;
  trapInsight?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface SpacedRepetitionItem {
  questionId: string;
  intervalMinutes: number; // SM-2 interval
  repetitionCount: number;
  easeFactor: number;
  dueDate: number; // timestamp ms
  consecutiveCorrect: number;
  totalAttempts: number;
  incorrectCount: number;
  lastReviewedAt?: number;
}

export interface UserStats {
  id?: string;
  email?: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'email' | 'guest';
  name: string;
  username: string;
  batch: string;
  stream: string;
  school: string;
  streakDays: number;
  gems: number; // bits / diamonds
  hearts: number; // max 5
  maxHearts: number;
  livesMode?: 'hearts' | 'energy'; // Option A: Legacy Hearts (5) vs Option B: Energy Battery (25)
  energyUnits?: number; // current battery capacity (max 25)
  maxEnergyUnits?: number; // max 25
  lastHeartRegenTime?: number; // timestamp ms of last passive heart regen
  lastEnergyRegenTime?: number; // timestamp ms of last passive energy regen
  lastFreeRefillTime?: number; // timestamp ms of last 4-hour free refill claim
  streakMilestonesClaimed?: number[]; // list of milestone day numbers claimed
  streakFreezesCount?: number; // equipped streak freezes in inventory (max 2)
  xp: number; // Total lifetime experience points
  weeklyXp?: number; // Experience points earned in current week's league competition
  level: number;
  leagueId?: number; // 1 (Bronze) to 10 (Diamond)
  league: string; // e.g. "Bronze League", "Diamond League"
  leagueRank: number;
  leagueGroupNumber?: number; // division of up to 30 active learners
  lastActiveWeek?: string; // e.g. "2026-W38"
  tournamentStage?: 'none' | 'quarter_finals' | 'semi_finals' | 'finals' | 'champion';
  questPoints?: number;
  boostActiveUntil?: number; // timestamp in ms for 2x XP boost
  storedBoosts?: number; // count of saved 15m / 30m boosts in inventory
  followingCount?: number;
  followersCount?: number;
  friendsQuestsEnabled?: boolean; // toggle in Settings (default true)
  blockedUserIds?: string[];
  isPro: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  dailyGoalMinutes: number;
  targetExamYear: number;
  completedLessons: string[];
  reviewedQuestionIds: string[];
}

export interface FriendUser {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  school: string;
  streakDays: number;
  xp: number;
  weeklyXp: number;
  leagueId: number;
  leagueName: string;
  isFollowing: boolean;
  isFollower: boolean;
  isMutual: boolean;
  hasFriendStreak?: boolean;
  friendStreakDays?: number;
  completedLessonToday?: boolean;
}

export interface FriendStreak {
  id: string;
  friendId: string;
  friendName: string;
  friendUsername: string;
  friendAvatarUrl?: string;
  streakDays: number;
  userCompletedToday: boolean;
  friendCompletedToday: boolean;
  lastActiveDate: string;
}

export interface SocialActivity {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatarUrl?: string;
  activityType: 'streak_milestone' | 'unit_mastered' | 'league_promoted' | 'drill_perfect';
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  reactions: {
    highFive: number; // 👋
    congrats: number; // 🎉
    celebrate: number; // 🚀
    letsGo: number; // 🔥
  };
  userReaction?: 'highFive' | 'congrats' | 'celebrate' | 'letsGo';
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  unitTag?: string;
  tier: 'bronze' | 'silver' | 'gold';
  chestType: 'common' | 'rare' | 'mega';
  current: number;
  target: number;
  xpReward: number;
  gemReward: number;
  questPointsReward: number;
  hasBoostReward?: boolean;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface FriendsQuestData {
  id: string;
  partnerName: string;
  partnerUsername: string;
  partnerSchool: string;
  partnerAvatarUrl?: string;
  objectiveTitle: string;
  objectiveDescription: string;
  metricType: 'xp' | 'lessons';
  currentTeamTotal: number;
  targetTotal: number;
  userContribution: number;
  partnerContribution: number;
  completed: boolean;
  claimed: boolean;
  gemReward: number;
  questPointsReward: number;
  boostMinutes: number;
  deadlineText: string;
  lastNudgedAt?: number;
}

export interface WeekendQuestData {
  id: string;
  title: string;
  description: string;
  statueName: string;
  currentMilestone: number;
  totalMilestones: number;
  metricLabel: string;
  completed: boolean;
  claimed: boolean;
  gemReward: number;
  boostMinutes: number;
  questPointsReward: number;
  isActive: boolean;
}

export interface MonthlyChallengeData {
  monthName: string;
  badgeTitle: string;
  badgeMascot: string;
  badgeIcon: string;
  currentPoints: number;
  targetPoints: number;
  completed: boolean;
  claimed: boolean;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  id?: string;
  name: string;
  username: string;
  avatarUrl?: string;
  school: string;
  level: string;
  streak: number;
  xp: number;
  isCurrentUser?: boolean;
  zone?: 'promote' | 'safe' | 'demote' | 'tournament';
}

export interface PowerUpItem {
  id: string;
  name: string;
  description: string;
  category: 'hearts' | 'streak' | 'boost' | 'cosmetics';
  costGems: number;
  icon: string;
  badge?: string;
  disabled?: boolean;
}
