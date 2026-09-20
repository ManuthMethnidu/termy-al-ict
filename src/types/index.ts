export type NavTab =
  | 'learn'
  | 'questions'
  | 'practice'
  | 'leaderboards'
  | 'quests'
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
  xp: number; // Total lifetime experience points
  weeklyXp?: number; // Experience points earned in current week's league competition
  level: number;
  leagueId?: number; // 1 (Bronze) to 10 (Diamond)
  league: string; // e.g. "Bronze League", "Diamond League"
  leagueRank: number;
  leagueGroupNumber?: number; // division of up to 30 active learners
  lastActiveWeek?: string; // e.g. "2026-W38"
  tournamentStage?: 'none' | 'quarter_finals' | 'semi_finals' | 'finals' | 'champion';
  isPro: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  dailyGoalMinutes: number;
  targetExamYear: number;
  completedLessons: string[];
  reviewedQuestionIds: string[];
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  unitTag?: string;
  current: number;
  target: number;
  xpReward: number;
  gemReward: number;
  completed: boolean;
  icon: string;
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
