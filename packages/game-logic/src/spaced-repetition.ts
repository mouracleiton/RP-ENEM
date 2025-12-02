/**
 * Spaced Repetition System (SRS)
 * Based on SM-2 algorithm with modifications for skill-based learning
 *
 * The system schedules reviews at increasing intervals based on performance:
 * - Good performance → longer intervals
 * - Poor performance → shorter intervals (more practice needed)
 */

export interface SkillReviewData {
  skillId: string;
  easeFactor: number; // 1.3 to 2.5, starts at 2.5
  interval: number; // days until next review
  repetitions: number; // successful consecutive reviews
  nextReviewDate: string; // ISO date string
  lastReviewDate: string | null;
  lastPerformance: number; // 0-5 quality rating
  totalReviews: number;
  averagePerformance: number;
}

export interface ReviewSession {
  skillId: string;
  date: string;
  performance: number; // 0-5
  timeSpent: number; // seconds
  quizScore?: number; // percentage
}

export interface StudySchedule {
  dueToday: SkillReviewData[];
  upcoming: SkillReviewData[];
  overdue: SkillReviewData[];
  newSkills: string[];
}

// Default values for new skills
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INITIAL_INTERVAL = 1; // 1 day

/**
 * Performance rating scale:
 * 0 - Complete blackout, didn't remember at all
 * 1 - Incorrect, but remembered after seeing the answer
 * 2 - Incorrect, but answer was easy to recall after seeing it
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect recall
 */

/**
 * Convert quiz percentage to performance rating (0-5)
 */
export function quizScoreToPerformance(percentage: number): number {
  if (percentage >= 100) return 5;
  if (percentage >= 90) return 4;
  if (percentage >= 70) return 3;
  if (percentage >= 50) return 2;
  if (percentage >= 25) return 1;
  return 0;
}

/**
 * Initialize review data for a new skill
 */
export function initializeSkillReview(skillId: string): SkillReviewData {
  const today = new Date();
  return {
    skillId,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: INITIAL_INTERVAL,
    repetitions: 0,
    nextReviewDate: today.toISOString().split('T')[0],
    lastReviewDate: null,
    lastPerformance: 0,
    totalReviews: 0,
    averagePerformance: 0,
  };
}

/**
 * Calculate the next review using SM-2 algorithm
 * Returns updated review data
 */
export function calculateNextReview(
  current: SkillReviewData,
  performance: number
): SkillReviewData {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Update average performance
  const newTotalReviews = current.totalReviews + 1;
  const newAveragePerformance =
    (current.averagePerformance * current.totalReviews + performance) / newTotalReviews;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
  let newEaseFactor = current.easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
  newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);

  let newInterval: number;
  let newRepetitions: number;

  if (performance < 3) {
    // Failed review - reset
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Successful review
    newRepetitions = current.repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(current.interval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    skillId: current.skillId,
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate: nextDate.toISOString().split('T')[0],
    lastReviewDate: todayStr,
    lastPerformance: performance,
    totalReviews: newTotalReviews,
    averagePerformance: newAveragePerformance,
  };
}

/**
 * Get study schedule based on review data
 */
export function getStudySchedule(
  reviewData: Map<string, SkillReviewData>,
  allSkillIds: string[]
): StudySchedule {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const dueToday: SkillReviewData[] = [];
  const upcoming: SkillReviewData[] = [];
  const overdue: SkillReviewData[] = [];
  const newSkills: string[] = [];

  // Check each skill
  allSkillIds.forEach((skillId) => {
    const data = reviewData.get(skillId);

    if (!data) {
      // New skill not yet started
      newSkills.push(skillId);
      return;
    }

    const reviewDate = new Date(data.nextReviewDate);
    const todayDate = new Date(todayStr);

    if (reviewDate < todayDate) {
      overdue.push(data);
    } else if (data.nextReviewDate === todayStr) {
      dueToday.push(data);
    } else {
      upcoming.push(data);
    }
  });

  // Sort by priority
  overdue.sort((a, b) =>
    new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
  );
  upcoming.sort((a, b) =>
    new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
  );

  return { dueToday, upcoming, overdue, newSkills };
}

/**
 * Get recommended daily study list
 */
export function getDailyStudyList(
  schedule: StudySchedule,
  maxItems: number = 20
): string[] {
  const studyList: string[] = [];

  // Priority 1: Overdue items (most overdue first)
  schedule.overdue.forEach((item) => {
    if (studyList.length < maxItems) {
      studyList.push(item.skillId);
    }
  });

  // Priority 2: Due today
  schedule.dueToday.forEach((item) => {
    if (studyList.length < maxItems) {
      studyList.push(item.skillId);
    }
  });

  // Priority 3: New skills (introduce gradually)
  const newSkillsToAdd = Math.min(3, maxItems - studyList.length);
  schedule.newSkills.slice(0, newSkillsToAdd).forEach((skillId) => {
    if (studyList.length < maxItems) {
      studyList.push(skillId);
    }
  });

  return studyList;
}

/**
 * Calculate retention estimate based on time since last review
 */
export function estimateRetention(data: SkillReviewData): number {
  if (!data.lastReviewDate) return 0;

  const today = new Date();
  const lastReview = new Date(data.lastReviewDate);
  const daysSinceReview = Math.floor(
    (today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Forgetting curve approximation
  // R = e^(-t/S) where S is stability (related to interval)
  const stability = data.interval * data.easeFactor;
  const retention = Math.exp(-daysSinceReview / stability) * 100;

  return Math.max(0, Math.min(100, retention));
}

/**
 * Get skill mastery level based on review history
 */
export function getSkillMasteryLevel(
  data: SkillReviewData
): 'new' | 'learning' | 'reviewing' | 'mastered' {
  if (data.totalReviews === 0) return 'new';
  if (data.repetitions < 2) return 'learning';
  if (data.interval < 21) return 'reviewing';
  return 'mastered';
}

/**
 * Calculate overall mastery percentage for a set of skills
 */
export function calculateOverallMastery(
  reviewData: Map<string, SkillReviewData>,
  skillIds: string[]
): number {
  if (skillIds.length === 0) return 0;

  let totalMastery = 0;

  skillIds.forEach((skillId) => {
    const data = reviewData.get(skillId);
    if (!data) return;

    const level = getSkillMasteryLevel(data);
    switch (level) {
      case 'new':
        totalMastery += 0;
        break;
      case 'learning':
        totalMastery += 25;
        break;
      case 'reviewing':
        totalMastery += 60;
        break;
      case 'mastered':
        totalMastery += 100;
        break;
    }
  });

  return Math.round(totalMastery / skillIds.length);
}

/**
 * Get study statistics
 */
export function getStudyStats(
  reviewData: Map<string, SkillReviewData>
): {
  totalSkills: number;
  masteredSkills: number;
  learningSkills: number;
  reviewingSkills: number;
  averageEaseFactor: number;
  totalReviews: number;
  streakDays: number;
} {
  let masteredSkills = 0;
  let learningSkills = 0;
  let reviewingSkills = 0;
  let totalEaseFactor = 0;
  let totalReviews = 0;
  let reviewDates = new Set<string>();

  reviewData.forEach((data) => {
    const level = getSkillMasteryLevel(data);
    switch (level) {
      case 'mastered':
        masteredSkills++;
        break;
      case 'reviewing':
        reviewingSkills++;
        break;
      case 'learning':
        learningSkills++;
        break;
    }

    totalEaseFactor += data.easeFactor;
    totalReviews += data.totalReviews;

    if (data.lastReviewDate) {
      reviewDates.add(data.lastReviewDate);
    }
  });

  // Calculate streak
  let streakDays = 0;
  const today = new Date();
  let checkDate = new Date(today);

  while (reviewDates.has(checkDate.toISOString().split('T')[0])) {
    streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    totalSkills: reviewData.size,
    masteredSkills,
    learningSkills,
    reviewingSkills,
    averageEaseFactor: reviewData.size > 0 ? totalEaseFactor / reviewData.size : DEFAULT_EASE_FACTOR,
    totalReviews,
    streakDays,
  };
}

/**
 * Export review data for backup
 */
export function exportReviewData(
  reviewData: Map<string, SkillReviewData>
): string {
  const data = Object.fromEntries(reviewData);
  return JSON.stringify(data, null, 2);
}

/**
 * Import review data from backup
 */
export function importReviewData(
  jsonString: string
): Map<string, SkillReviewData> {
  const data = JSON.parse(jsonString);
  return new Map(Object.entries(data));
}
