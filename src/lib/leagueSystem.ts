import { UserStats, LeaderboardEntry } from '../types';

export interface LeagueDefinition {
  id: number;
  name: string;
  order: number;
  tierLabel: string;
  icon: string;
  color: string;
  gradient: string;
  badgeBg: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  description: string;
  minPromoteRank: number; // Top N promote (e.g. 7, or 10 in Diamond for Tournament)
  maxDemoteRank: number;  // Bottom N demote (e.g. 26-30, 0 for Bronze)
  baseXpRange: [number, number];
}

/**
 * The 10 Official Termy A/L ICT Leagues in strict order
 */
export const LEAGUES: LeagueDefinition[] = [
  {
    id: 1,
    name: 'Bronze',
    order: 1,
    tierLabel: 'Tier I',
    icon: 'shield',
    color: '#CD7F32',
    gradient: 'from-[#2b1810] to-[#1a0f0a]',
    badgeBg: 'bg-amber-900/30',
    borderColor: 'border-amber-700/60',
    glowColor: 'rgba(205, 127, 50, 0.4)',
    textColor: 'text-amber-500',
    description: 'Where every A/L ICT candidate begins their active recall journey. No demotion.',
    minPromoteRank: 7,
    maxDemoteRank: 0, // No demotion in Bronze
    baseXpRange: [80, 450],
  },
  {
    id: 2,
    name: 'Silver',
    order: 2,
    tierLabel: 'Tier II',
    icon: 'military_tech',
    color: '#C0C0C0',
    gradient: 'from-[#20272c] to-[#12171a]',
    badgeBg: 'bg-slate-500/20',
    borderColor: 'border-slate-400/60',
    glowColor: 'rgba(192, 192, 192, 0.4)',
    textColor: 'text-slate-300',
    description: 'Steady study habits form as candidates tackle Unit 2 and Unit 3 fundamentals.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [250, 750],
  },
  {
    id: 3,
    name: 'Gold',
    order: 3,
    tierLabel: 'Tier III',
    icon: 'workspace_premium',
    color: '#FFD700',
    gradient: 'from-[#2c240a] to-[#181404]',
    badgeBg: 'bg-yellow-500/20',
    borderColor: 'border-yellow-400/60',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    textColor: 'text-yellow-400',
    description: 'Consistent high performers mastering Karnaugh maps, De Morgan laws, and gates.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [500, 1200],
  },
  {
    id: 4,
    name: 'Sapphire',
    order: 4,
    tierLabel: 'Tier IV',
    icon: 'diamond',
    color: '#2563EB',
    gradient: 'from-[#0d1e38] to-[#070f1d]',
    badgeBg: 'bg-blue-600/20',
    borderColor: 'border-blue-500/60',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    textColor: 'text-blue-400',
    description: 'Entering the upper ranks. Deep mastery of operating systems and memory hierarchies.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [900, 1800],
  },
  {
    id: 5,
    name: 'Ruby',
    order: 5,
    tierLabel: 'Tier V',
    icon: 'diamond',
    color: '#E11D48',
    gradient: 'from-[#330c18] to-[#1b050b]',
    badgeBg: 'bg-rose-600/20',
    borderColor: 'border-rose-500/60',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    textColor: 'text-rose-400',
    description: 'Vigorous problem solvers slicing through SQL normalization and IP networking drills.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [1400, 2600],
  },
  {
    id: 6,
    name: 'Emerald',
    order: 6,
    tierLabel: 'Tier VI',
    icon: 'verified',
    color: '#10B981',
    gradient: 'from-[#092b1d] to-[#04150e]',
    badgeBg: 'bg-emerald-600/20',
    borderColor: 'border-emerald-500/60',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    textColor: 'text-emerald-400',
    description: 'Flawless recall precision. Rapid Past Paper MCQ execution across all syllabus areas.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [2000, 3600],
  },
  {
    id: 7,
    name: 'Amethyst',
    order: 7,
    tierLabel: 'Tier VII',
    icon: 'auto_awesome',
    color: '#9333EA',
    gradient: 'from-[#250d38] to-[#13061d]',
    badgeBg: 'bg-purple-600/20',
    borderColor: 'border-purple-500/60',
    glowColor: 'rgba(147, 51, 234, 0.4)',
    textColor: 'text-purple-400',
    description: 'Distinction-grade analytical ability with almost zero repeat errors.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [2800, 4800],
  },
  {
    id: 8,
    name: 'Pearl',
    order: 8,
    tierLabel: 'Tier VIII',
    icon: 'brightness_7',
    color: '#F1F5F9',
    gradient: 'from-[#1e2530] to-[#0f141a]',
    badgeBg: 'bg-slate-200/20',
    borderColor: 'border-slate-300/60',
    glowColor: 'rgba(241, 245, 249, 0.4)',
    textColor: 'text-slate-100',
    description: 'Rare national elite. Candidates consistently scoring in the top 5% across Sri Lanka.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [3800, 6200],
  },
  {
    id: 9,
    name: 'Obsidian',
    order: 9,
    tierLabel: 'Tier IX',
    icon: 'dark_mode',
    color: '#818CF8',
    gradient: 'from-[#171438] to-[#0a081a]',
    badgeBg: 'bg-indigo-950/40',
    borderColor: 'border-indigo-500/60',
    glowColor: 'rgba(129, 140, 248, 0.5)',
    textColor: 'text-indigo-300',
    description: 'The final crucible before the summit. Only the most disciplined students endure.',
    minPromoteRank: 7,
    maxDemoteRank: 26,
    baseXpRange: [5200, 8500],
  },
  {
    id: 10,
    name: 'Diamond',
    order: 10,
    tierLabel: 'Tier X',
    icon: 'trophy',
    color: '#38BDF8',
    gradient: 'from-[#0e2c38] to-[#05131a]',
    badgeBg: 'bg-cyan-500/20',
    borderColor: 'border-cyan-400/70',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    textColor: 'text-cyan-300',
    description: 'The pinnacle of G.C.E. A/L ICT. Top 10 qualify for the prestigious multi-week Diamond Tournament!',
    minPromoteRank: 10, // Qualifies for Diamond Tournament
    maxDemoteRank: 26,  // Drops to Obsidian
    baseXpRange: [6800, 11500],
  },
];

/**
 * Look up league by ID (1 to 10, defaults to 1 Bronze)
 */
export function getLeagueById(id: number): LeagueDefinition {
  const found = LEAGUES.find((l) => l.id === id);
  return found || LEAGUES[0];
}

/**
 * Look up league by Name (e.g. 'Diamond', 'Bronze League', defaults to 1 Bronze)
 */
export function getLeagueByName(name?: string): LeagueDefinition {
  if (!name) return LEAGUES[0];
  const clean = name.toLowerCase().replace(/league/g, '').trim();
  const found = LEAGUES.find((l) => l.name.toLowerCase() === clean);
  return found || LEAGUES[0];
}

/**
 * Compute current UTC ISO Week identifier (e.g. '2026-W38')
 */
export function getCurrentWeekId(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Calculate precise countdown to next Sunday 23:59:59 UTC weekly reset
 */
export function getTimeUntilWeeklyReset(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday...
  const daysUntilSunday = (7 - dayOfWeek) % 7;

  const resetTime = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilSunday,
      23,
      59,
      59,
      999
    )
  );

  const diffMs = Math.max(0, resetTime.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m left`;
  } else {
    formatted = `${minutes}m ${seconds}s left`;
  }

  return { days, hours, minutes, seconds, formatted };
}

/**
 * Assemble division group for the user's league using real registered candidates.
 * Places candidates at their exact dynamic rank based on weekly XP.
 */
export function generateLeagueCohort(
  _leagueId: number,
  _groupNumber: number,
  currentUser: UserStats,
  realProfiles: any[] = []
): LeaderboardEntry[] {
  const userWeeklyXp = currentUser.weeklyXp ?? currentUser.xp ?? 0;

  // Map real registered profiles from Supabase
  const realEntries: LeaderboardEntry[] = realProfiles
    .filter(
      (p) =>
        p.id !== currentUser.id &&
        p.username !== currentUser.username.replace('@', '')
    )
    .map((p, idx) => ({
      rank: 0,
      id: p.id,
      name: p.display_name || p.username || 'Candidate',
      username: p.username
        ? p.username.startsWith('@')
          ? p.username
          : `@${p.username}`
        : `@user_${idx}`,
      avatarUrl: p.avatar_url,
      school: p.school || 'Physical Science & ICT Stream',
      level: `L${Math.max(1, Math.floor((p.xp || 0) / 400) + 1)}`,
      streak: p.streak_days || 0,
      xp: p.weekly_xp ?? p.xp ?? 0,
      isCurrentUser: false,
    }));

  // Current user entry
  const currentUserEntry: LeaderboardEntry = {
    rank: 0,
    id: currentUser.id || 'local_user',
    name: currentUser.name,
    username: currentUser.username,
    avatarUrl: currentUser.avatarUrl,
    school: currentUser.school,
    level: `L${currentUser.level || 1}`,
    streak: currentUser.streakDays || 0,
    xp: userWeeklyXp,
    isCurrentUser: true,
  };

  const allEntries = [...realEntries, currentUserEntry];

  // Sort descending by weekly XP (or total XP if equal)
  allEntries.sort((a, b) => b.xp - a.xp);

  // Assign ranks 1, 2, 3...
  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Check if a weekly reset has passed. If so, compute promotion / demotion and reset weekly XP.
 */
export function checkAndApplyWeeklyReset(userStats: UserStats): {
  updatedStats: UserStats;
  resetOccurred: boolean;
  message?: string;
  previousRank?: number;
  newLeague?: LeagueDefinition;
} {
  const currentWeek = getCurrentWeekId();
  const lastActive = userStats.lastActiveWeek;

  // If first time or week is identical, no reset needed
  if (!lastActive || lastActive === currentWeek) {
    return {
      updatedStats: {
        ...userStats,
        lastActiveWeek: currentWeek,
        weeklyXp: userStats.weeklyXp ?? 0,
        leagueId: userStats.leagueId ?? 1,
        league: userStats.league || LEAGUES[(userStats.leagueId ?? 1) - 1].name + ' League',
        leagueGroupNumber: userStats.leagueGroupNumber ?? 1,
      },
      resetOccurred: false,
    };
  }

  // A weekly reset has happened!
  const currentLeagueId = userStats.leagueId || 1;
  const currentRank = userStats.leagueRank || 15;
  const leagueDef = getLeagueById(currentLeagueId);

  let newLeagueId = currentLeagueId;
  let statusMessage = '';
  let tournamentStage = userStats.tournamentStage || 'none';

  if (currentRank <= leagueDef.minPromoteRank) {
    if (currentLeagueId === 10) {
      // In Diamond League -> Qualify for Diamond Tournament!
      tournamentStage = tournamentStage === 'none' ? 'quarter_finals' : tournamentStage;
      statusMessage = `Outstanding! You finished Rank ${currentRank} in Diamond League and qualified for the Diamond Tournament!`;
    } else {
      // Promoted to next league!
      newLeagueId = Math.min(10, currentLeagueId + 1);
      const targetLeague = getLeagueById(newLeagueId);
      statusMessage = `Congratulations! You finished Rank ${currentRank} and were PROMOTED to the ${targetLeague.name} League!`;
    }
  } else if (leagueDef.maxDemoteRank > 0 && currentRank >= leagueDef.maxDemoteRank) {
    // Demoted to previous league
    newLeagueId = Math.max(1, currentLeagueId - 1);
    const targetLeague = getLeagueById(newLeagueId);
    statusMessage = `Weekly competition ended. You finished in the demotion zone (Rank ${currentRank}) and were moved to ${targetLeague.name} League. Keep practicing!`;
  } else {
    // Maintained safe zone
    statusMessage = `Weekly competition reset. You safely held your place in the ${leagueDef.name} League (Rank ${currentRank}).`;
  }

  const updatedLeagueDef = getLeagueById(newLeagueId);

  const nextStats: UserStats = {
    ...userStats,
    leagueId: newLeagueId,
    league: `${updatedLeagueDef.name} League`,
    weeklyXp: 0, // Weekly XP resets back to 0!
    lastActiveWeek: currentWeek,
    leagueRank: 15,
    tournamentStage,
  };

  return {
    updatedStats: nextStats,
    resetOccurred: true,
    message: statusMessage,
    previousRank: currentRank,
    newLeague: updatedLeagueDef,
  };
}

/**
 * Multi-Week Diamond Tournament Rounds structure
 */
export const DIAMOND_TOURNAMENT_ROUNDS = [
  {
    stage: 'quarter_finals',
    title: 'Round 1: Quarter-Finals',
    week: 'Week 1',
    description: 'Top 10 out of 30 contenders advance to the National Semi-Finals.',
    cutoffText: 'Finish in Top 10 to Advance',
    reward: '+100 Bits & Diamond Quartz',
  },
  {
    stage: 'semi_finals',
    title: 'Round 2: Semi-Finals',
    week: 'Week 2',
    description: 'Top 5 master candidates advance to the Sri Lanka Distinction Finals.',
    cutoffText: 'Finish in Top 5 to Advance',
    reward: '+250 Bits & Silver Crown',
  },
  {
    stage: 'finals',
    title: 'Round 3: National Finals',
    week: 'Week 3',
    description: 'The ultimate showdown for national A/L ICT Distinction Hall of Fame.',
    cutoffText: 'Top 3 Win Diamond Champion Cup',
    reward: '+500 Bits & Gold Distinction Trophy',
  },
];
