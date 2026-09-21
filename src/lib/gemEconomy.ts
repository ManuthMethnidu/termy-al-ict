import { UserStats } from '../types';

/**
 * Gem Economy & Lives System Configurations
 * Tailored for Termy A/L ICT with cheaper, student-friendly pricing.
 */

export interface GemPackTier {
  id: 'handful' | 'pocketful' | 'wagon';
  name: string;
  gemQuantity: number;
  costUsd: number;
  costLkr: number;
  bestFor: string;
  badge?: string;
  popular?: boolean;
  duoComparison: string; // Shows how much cheaper it is compared to Duolingo ($3.99, $6.99, $9.99)
  icon: string;
}

export const GEM_PACK_TIERS: GemPackTier[] = [
  {
    id: 'handful',
    name: 'Handful of Gems',
    gemQuantity: 1200,
    costUsd: 0.99,
    costLkr: 290,
    bestFor: 'Quick emergency legendary test / timer boost',
    duoComparison: 'Save 75% vs Duolingo ($3.99)',
    icon: '💎',
  },
  {
    id: 'pocketful',
    name: 'Pocketful of Gems',
    gemQuantity: 3000,
    costUsd: 1.99,
    costLkr: 590,
    bestFor: 'Buying a couple of Streak Freezes & heart refills',
    badge: 'MOST POPULAR',
    popular: true,
    duoComparison: 'Save 72% vs Duolingo ($6.99)',
    icon: '💎💎',
  },
  {
    id: 'wagon',
    name: 'Wagon of Gems',
    gemQuantity: 6500,
    costUsd: 3.49,
    costLkr: 990,
    bestFor: 'Heavy exam preparation usage without monthly sub',
    badge: 'BEST VALUE',
    duoComparison: 'Save 65% vs Duolingo ($9.99)',
    icon: '💎💎💎',
  },
];

/**
 * Power-ups & Gem spending costs - Made cheaper for students
 */
export const ECONOMY_PRICES = {
  STREAK_FREEZE: 50, // Duolingo is 200, Termy was 150 -> Now 50
  FULL_HEARTS_REFILL: 50, // Duolingo is 450, Termy was 200 -> Now 50
  SINGLE_HEART_REFILL: 15,
  FULL_ENERGY_REFILL: 50, // Duolingo is 450 -> Now 50
  SINGLE_ENERGY_REFILL: 10,
  TIMER_BOOST: 20, // Duolingo is 20-50, Termy was 100 -> Now 20
  LEGENDARY_CHALLENGE: 25, // Duolingo is 100 -> Now 25
  MAX_STREAK_FREEZES: 2,
};

/**
 * Streak Milestones (25-day cycle as in Duolingo: 25d = 25, 50d = 250, 75d = 375, plus early rewards)
 */
export interface StreakMilestone {
  days: number;
  gemsReward: number;
  label: string;
  title: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, gemsReward: 10, label: '7-Day Kickoff', title: '1-Week Habit Builder' },
  { days: 14, gemsReward: 15, label: '14-Day Fortnight', title: '2-Week Discipline' },
  { days: 25, gemsReward: 25, label: '25-Day Milestone', title: 'Bronze Quarter Cycle' },
  { days: 50, gemsReward: 250, label: '50-Day Milestone', title: 'Silver Half Century' },
  { days: 75, gemsReward: 375, label: '75-Day Milestone', title: 'Gold Triple Quarter' },
  { days: 100, gemsReward: 500, label: '100-Day Century', title: 'Centurion Distinction' },
  { days: 125, gemsReward: 25, label: '125-Day Cycle 2', title: 'Relentless Revision' },
  { days: 150, gemsReward: 250, label: '150-Day Cycle 2', title: 'Mastery Titan' },
  { days: 175, gemsReward: 375, label: '175-Day Cycle 2', title: 'National Hall of Fame' },
];

/**
 * Weekly Top 3 League Gem Payouts (Bronze to Diamond)
 */
export const LEAGUE_TOP3_GEM_PAYOUTS: Record<number, [number, number, number]> = {
  1: [60, 40, 25], // Bronze
  2: [80, 55, 35], // Silver
  3: [100, 70, 45], // Gold
  4: [130, 90, 60], // Sapphire
  5: [160, 110, 75], // Ruby
  6: [200, 140, 95], // Emerald
  7: [240, 170, 115], // Amethyst
  8: [290, 200, 135], // Pearl
  9: [350, 240, 160], // Obsidian
  10: [500, 350, 250], // Diamond
};

export function getLeagueTop3Prizes(leagueId: number = 1): [number, number, number] {
  return LEAGUE_TOP3_GEM_PAYOUTS[leagueId] || LEAGUE_TOP3_GEM_PAYOUTS[1];
}

/**
 * Regeneration intervals in milliseconds:
 * - Hearts: 1 heart every 5 hours (18,000,000 ms)
 * - Energy: 1 energy unit every 42 minutes (2,520,000 ms)
 * - Free shop refill button: Every 4 hours (14,400,000 ms)
 */
export const HEART_REGEN_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 hours
export const ENERGY_REGEN_INTERVAL_MS = 42 * 60 * 1000; // 42 minutes
export const SHOP_FREE_REFILL_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Calculate passive regeneration for Hearts and Energy
 */
export function calculatePassiveRegen(userStats: UserStats): {
  updatedStats: UserStats;
  heartsRegened: number;
  energyRegened: number;
} {
  const now = Date.now();
  let heartsRegened = 0;
  let energyRegened = 0;

  let currentHearts = userStats.hearts ?? 5;
  const maxHearts = userStats.maxHearts ?? 5;
  let lastHeartRegen = userStats.lastHeartRegenTime || now;

  // Hearts passive regeneration (1 per 5 hours)
  if (currentHearts < maxHearts) {
    const elapsed = now - lastHeartRegen;
    if (elapsed >= HEART_REGEN_INTERVAL_MS) {
      const unitsToAdd = Math.floor(elapsed / HEART_REGEN_INTERVAL_MS);
      heartsRegened = Math.min(unitsToAdd, maxHearts - currentHearts);
      currentHearts += heartsRegened;
      // Advance lastHeartRegen timestamp by the consumed intervals
      lastHeartRegen = lastHeartRegen + unitsToAdd * HEART_REGEN_INTERVAL_MS;
      if (currentHearts >= maxHearts) {
        lastHeartRegen = now;
      }
    }
  } else {
    lastHeartRegen = now;
  }

  // Energy passive regeneration (1 per 42 minutes)
  let currentEnergy = userStats.energyUnits ?? 25;
  const maxEnergy = userStats.maxEnergyUnits ?? 25;
  let lastEnergyRegen = userStats.lastEnergyRegenTime || now;

  if (currentEnergy < maxEnergy) {
    const elapsed = now - lastEnergyRegen;
    if (elapsed >= ENERGY_REGEN_INTERVAL_MS) {
      const unitsToAdd = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);
      energyRegened = Math.min(unitsToAdd, maxEnergy - currentEnergy);
      currentEnergy += energyRegened;
      lastEnergyRegen = lastEnergyRegen + unitsToAdd * ENERGY_REGEN_INTERVAL_MS;
      if (currentEnergy >= maxEnergy) {
        lastEnergyRegen = now;
      }
    }
  } else {
    lastEnergyRegen = now;
  }

  const updatedStats: UserStats = {
    ...userStats,
    hearts: currentHearts,
    maxHearts,
    lastHeartRegenTime: lastHeartRegen,
    energyUnits: currentEnergy,
    maxEnergyUnits: maxEnergy,
    lastEnergyRegenTime: lastEnergyRegen,
    livesMode: userStats.livesMode || 'hearts',
  };

  return {
    updatedStats,
    heartsRegened,
    energyRegened,
  };
}

/**
 * Time remaining until next Heart passive regen
 */
export function getTimeUntilNextHeart(lastHeartRegenTime: number = Date.now()): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const nextTime = lastHeartRegenTime + HEART_REGEN_INTERVAL_MS;
  const diff = Math.max(0, nextTime - Date.now());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  return { hours, minutes, seconds, formatted };
}

/**
 * Time remaining until next Energy passive regen
 */
export function getTimeUntilNextEnergy(lastEnergyRegenTime: number = Date.now()): {
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const nextTime = lastEnergyRegenTime + ENERGY_REGEN_INTERVAL_MS;
  const diff = Math.max(0, nextTime - Date.now());
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff / 1000) % 60);
  const formatted = `${minutes}m ${seconds}s`;
  return { minutes, seconds, formatted };
}

/**
 * Time remaining until free 4-hour shop recharge is available
 */
export function getTimeUntilFreeRefill(lastFreeRefillTime: number = 0): {
  isAvailable: boolean;
  formatted: string;
} {
  const nextAvailable = (lastFreeRefillTime || 0) + SHOP_FREE_REFILL_COOLDOWN_MS;
  const diff = Math.max(0, nextAvailable - Date.now());
  if (diff <= 0) {
    return { isAvailable: true, formatted: 'Ready Now!' };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { isAvailable: false, formatted: `${hours}h ${minutes}m left` };
}

/**
 * Get available streak milestone to claim if eligible
 */
export function getClaimableMilestones(userStats: UserStats): StreakMilestone[] {
  const streak = userStats.streakDays || 0;
  const claimed = userStats.streakMilestonesClaimed || [];
  return STREAK_MILESTONES.filter((m) => streak >= m.days && !claimed.includes(m.days));
}
