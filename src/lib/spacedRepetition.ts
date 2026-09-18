import { McqQuestion, SpacedRepetitionItem } from '../types';

const STORAGE_KEY = 'termy_spaced_repetition_v1';

export function loadSRData(): Record<string, SpacedRepetitionItem> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error loading SR data', e);
    return {};
  }
}

export function saveSRData(data: Record<string, SpacedRepetitionItem>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving SR data', e);
  }
}

/**
 * Update SM-2 spaced repetition values based on user response
 */
export function recordAnswer(
  questionId: string,
  isCorrect: boolean
): { updatedItem: SpacedRepetitionItem; nextReviewIn: string } {
  const currentData = loadSRData();
  const existing: SpacedRepetitionItem = currentData[questionId] || {
    questionId,
    intervalMinutes: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    dueDate: Date.now(),
    consecutiveCorrect: 0,
    totalAttempts: 0,
    incorrectCount: 0,
  };

  const now = Date.now();
  let nextIntervalMinutes = 1;
  let newRepetitionCount = existing.repetitionCount;
  let newEaseFactor = existing.easeFactor;
  let newConsecutive = existing.consecutiveCorrect;

  if (isCorrect) {
    newConsecutive += 1;
    newRepetitionCount += 1;

    // SM-2 Interval progression
    if (newRepetitionCount === 1) {
      nextIntervalMinutes = 10; // 10 minutes
    } else if (newRepetitionCount === 2) {
      nextIntervalMinutes = 24 * 60; // 1 day
    } else if (newRepetitionCount === 3) {
      nextIntervalMinutes = 3 * 24 * 60; // 3 days
    } else {
      nextIntervalMinutes = Math.round(existing.intervalMinutes * existing.easeFactor);
    }

    // Adjust ease factor
    newEaseFactor = Math.max(1.3, newEaseFactor + 0.1);
  } else {
    // Incorrect: immediate review needed!
    newConsecutive = 0;
    newRepetitionCount = 0;
    nextIntervalMinutes = 2; // Resurfaces in 2 minutes
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
  }

  const updatedItem: SpacedRepetitionItem = {
    ...existing,
    intervalMinutes: nextIntervalMinutes,
    repetitionCount: newRepetitionCount,
    easeFactor: newEaseFactor,
    dueDate: now + nextIntervalMinutes * 60 * 1000,
    consecutiveCorrect: newConsecutive,
    totalAttempts: existing.totalAttempts + 1,
    incorrectCount: isCorrect ? existing.incorrectCount : existing.incorrectCount + 1,
    lastReviewedAt: now,
  };

  currentData[questionId] = updatedItem;
  saveSRData(currentData);

  // Format human-friendly string
  let nextReviewIn = 'in 2 mins';
  if (nextIntervalMinutes >= 1440) {
    const days = Math.round(nextIntervalMinutes / 1440);
    nextReviewIn = `in ${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (nextIntervalMinutes >= 60) {
    const hours = Math.round(nextIntervalMinutes / 60);
    nextReviewIn = `in ${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  } else {
    nextReviewIn = `in ${nextIntervalMinutes} mins`;
  }

  return { updatedItem, nextReviewIn };
}

/**
 * Filter questions that are due for review or were missed
 */
export function getDueQuestions(allQuestions: McqQuestion[]): McqQuestion[] {
  const srData = loadSRData();
  const now = Date.now();

  return allQuestions.filter((q) => {
    const item = srData[q.id];
    if (!item) return false; // Not yet studied
    return item.dueDate <= now || item.incorrectCount > item.consecutiveCorrect;
  });
}

/**
 * Tricky questions that have been failed multiple times
 */
export function getTrickyQuestions(allQuestions: McqQuestion[]): McqQuestion[] {
  const srData = loadSRData();
  return allQuestions.filter((q) => {
    const item = srData[q.id];
    return item && item.incorrectCount > 0;
  });
}

/**
 * Overall SR Queue statistics
 */
export function getQueueStats(allQuestions: McqQuestion[]): {
  dueCount: number;
  masteredCount: number;
  learningCount: number;
  accuracyRate: number;
} {
  const srData = loadSRData();
  const now = Date.now();
  let due = 0;
  let mastered = 0;
  let learning = 0;
  let totalCorrect = 0;
  let totalAttempts = 0;

  Object.values(srData).forEach((item) => {
    totalAttempts += item.totalAttempts;
    totalCorrect += Math.max(0, item.totalAttempts - item.incorrectCount);

    if (item.dueDate <= now) {
      due += 1;
    }
    if (item.consecutiveCorrect >= 3) {
      mastered += 1;
    } else {
      learning += 1;
    }
  });

  const accuracyRate =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

  return {
    dueCount: Math.max(due, Object.keys(srData).length === 0 ? Math.min(3, allQuestions.length) : due),
    masteredCount: mastered,
    learningCount: Math.max(learning, 1),
    accuracyRate,
  };
}
