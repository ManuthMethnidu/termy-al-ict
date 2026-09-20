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
  xp: number;
  level: number;
  league: string; // "Diamond League"
  leagueRank: number;
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
